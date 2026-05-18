import json
import os
import asyncio
from typing import Any
from datetime import UTC, datetime
from uuid import uuid4
from collections.abc import Callable
from urllib.parse import urljoin

from app.schemas import GameLogEvent, MatchResultResponse, PlayerResult, RoundLog, StartMatchRequest
from app.simulator import normalize_players, run_local_match


class ArenaUnavailableError(RuntimeError):
    """Raised when the external Arena stack is not ready for a real match."""


BACKGROUND_ARENA_TASKS: set[asyncio.Task[None]] = set()
LogAppender = Callable[[str, str, str, int, str | None, str | None], GameLogEvent]
LogReplacer = Callable[[str, list[GameLogEvent]], None]


def should_use_arena(payload: StartMatchRequest) -> bool:
    env_value = os.getenv("SOCIALCOMPACT_USE_ARENA", "").lower()
    return payload.use_arena or env_value in {"1", "true", "yes", "on"}


async def start_arena_match(
    payload: StartMatchRequest,
    match_id: str,
) -> MatchResultResponse:
    arena_url, participants = await _prepare_arena_request(payload)
    return await _run_arena_stream(payload, match_id, arena_url, participants)


async def start_arena_match_background(
    payload: StartMatchRequest,
    match_id: str,
    update_result: Callable[[MatchResultResponse], None],
    append_log: LogAppender | None = None,
    replace_logs: LogReplacer | None = None,
) -> MatchResultResponse:
    participants = _preview_participants(payload)
    pending = _pending_arena_result(payload, match_id, participants)
    print(f"[arena] queued {match_id}; service checks will run in background")
    if append_log is not None:
        append_log(
            match_id,
            "system",
            "Arena match queued. The backend will check Render Arena and Agent services in the background.",
            0,
            None,
            None,
        )

    async def runner() -> None:
        try:
            if append_log is not None:
                append_log(
                    match_id,
                    "system",
                    "Checking Arena and Agent service cards. Sleeping Render services may need time to wake up.",
                    0,
                    None,
                    None,
                )
            arena_url, prepared_participants = await _prepare_arena_request(payload)
            if append_log is not None:
                append_log(
                    match_id,
                    "system",
                    f"Arena services are reachable. Starting the A2A stream with {len(prepared_participants)} participant(s).",
                    0,
                    None,
                    None,
                )
            result = await _run_arena_stream(
                payload,
                match_id,
                arena_url,
                prepared_participants,
                append_log,
                replace_logs,
            )
            if result.status == "running":
                detail = "Arena stream ended before a final result artifact was emitted."
                print(f"[arena] {match_id} incomplete: {detail}")
                if append_log is not None:
                    append_log(
                        match_id,
                        "system",
                        f"{detail} Falling back to local simulation so the demo can finish.",
                        0,
                        None,
                        None,
                    )
                result = run_local_match(
                    payload,
                    match_id,
                    source="local-fallback",
                    note=detail,
                )
        except ArenaUnavailableError as exc:
            print(f"[arena] {match_id} unavailable: {exc}")
            if append_log is not None:
                append_log(
                    match_id,
                    "system",
                    f"Arena unavailable after background checks. Falling back to local simulation: {exc}",
                    0,
                    None,
                    None,
                )
            result = run_local_match(
                payload,
                match_id,
                source="local-fallback",
                note=f"Arena was unavailable: {exc}",
            )
        except Exception as exc:
            print(f"[arena] {match_id} failed: {exc}")
            if append_log is not None:
                append_log(
                    match_id,
                    "system",
                    f"Arena run failed. Falling back to local simulation: {exc}",
                    0,
                    None,
                    None,
                )
            result = run_local_match(
                payload,
                match_id,
                source="local-fallback",
                note=f"Arena run failed: {exc}",
            )
        else:
            print(f"[arena] {match_id} finished with source={result.source} status={result.status}")
            if append_log is not None:
                message = (
                    f"Arena stream finished with status={result.status}."
                    if result.source == "arena"
                    else f"Background run finished with source={result.source} and status={result.status}."
                )
                append_log(
                    match_id,
                    "system",
                    message,
                    0,
                    None,
                    None,
                )
        update_result(result)

    task = asyncio.create_task(runner())
    BACKGROUND_ARENA_TASKS.add(task)
    task.add_done_callback(BACKGROUND_ARENA_TASKS.discard)
    return pending


def _preview_participants(payload: StartMatchRequest) -> dict[str, str]:
    players = normalize_players(payload)
    player_urls = _configured_player_urls(payload)

    if len(player_urls) < 2:
        return {
            player: (
                player_urls[index]
                if index < len(player_urls)
                else "configured-by-backend"
            )
            for index, player in enumerate(players)
        }

    return {
        players[index] if index < len(players) else f"Player{index + 1}": url
        for index, url in enumerate(player_urls)
    }


async def _prepare_arena_request(
    payload: StartMatchRequest,
) -> tuple[str, dict[str, str]]:
    arena_url = _normalize_service_url(
        os.getenv("SOCIALCOMPACT_ARENA_URL", "http://127.0.0.1:9009")
    )
    player_urls = _configured_player_urls(payload)
    players = normalize_players(payload)

    if len(player_urls) < 2:
        raise ArenaUnavailableError(
            "Arena mode needs at least two player agent URLs."
        )

    participants = {
        players[index] if index < len(players) else f"Player{index + 1}": url
        for index, url in enumerate(player_urls)
    }

    await _check_agent_card("Arena", arena_url)
    for name, url in participants.items():
        await _check_agent_card(name, url)

    return arena_url, participants


async def _run_arena_stream(
    payload: StartMatchRequest,
    match_id: str,
    arena_url: str,
    participants: dict[str, str],
    append_log: LogAppender | None = None,
    replace_logs: LogReplacer | None = None,
) -> MatchResultResponse:
    try:
        import httpx
        from a2a.client import A2AClient
        from a2a.types import MessageSendParams, SendStreamingMessageRequest
    except ImportError as exc:
        raise ArenaUnavailableError(
            "Install a2a-sdk and httpx to enable Arena mode."
        ) from exc

    json_message = {
        "participants": participants,
        "config": {
            "games": [payload.game],
            "scenarios": [1],
            "min_size": len(participants),
            "max_size": len(participants),
            "max_runs": 1,
            "max_turns": max(payload.rounds, 1),
        },
    }
    if append_log is not None:
        append_log(
            match_id,
            "system",
            f"Sent Arena config: game={payload.game}, max_turns={max(payload.rounds, 1)}.",
            0,
            None,
            None,
        )
    send_message_payload = {
        "message": {
            "role": "user",
            "parts": [{"kind": "text", "text": json.dumps(json_message)}],
            "messageId": uuid4().hex,
        }
    }
    request = SendStreamingMessageRequest(
        id=str(uuid4()),
        params=MessageSendParams(**send_message_payload),
    )

    latest_data: dict[str, Any] | None = None
    async with httpx.AsyncClient(timeout=None) as httpx_client:
        a2a_client = A2AClient(httpx_client=httpx_client, url=arena_url)
        async for response in a2a_client.send_message_streaming(
            request,
            http_kwargs={"timeout": None},
        ):
            latest_data = response.model_dump(mode="json", exclude_none=True)
            print(f"[arena] {match_id} stream event received")

            game_log = _find_game_log(latest_data)
            if game_log is not None and replace_logs is not None:
                replace_logs(match_id, _convert_game_log_to_events(match_id, game_log))

            live_events = _find_live_events(latest_data)
            for live_event in live_events:
                if append_log is not None:
                    event = _convert_live_event_to_event(match_id, live_event)
                    append_log(
                        event.match_id,
                        event.phase,
                        event.message,
                        event.round,
                        event.actor,
                        event.target,
                    )

            live_rounds = _find_live_round_logs(latest_data)
            for live_round in live_rounds:
                if append_log is not None:
                    for event in _convert_live_round_to_events(match_id, live_round):
                        append_log(
                            event.match_id,
                            event.phase,
                            event.message,
                            event.round,
                            event.actor,
                            event.target,
                        )
            if append_log is not None and game_log is None and not live_events and not live_rounds:
                append_log(match_id, "system", "Arena stream event received.", 0, None, None)
            result = _convert_arena_response(payload, match_id, latest_data)
            if result is not None and result.status == "completed":
                return result

    result = _convert_arena_response(payload, match_id, latest_data or {})
    if result is not None:
        return result
    return _pending_arena_result(payload, match_id, participants)


def _configured_player_urls(payload: StartMatchRequest) -> list[str]:
    if payload.player_urls:
        return [_normalize_service_url(url) for url in payload.player_urls if url.strip()]

    numbered_urls = [
        os.getenv(f"SOCIALCOMPACT_PLAYER_URL_{index}", "").strip()
        for index in range(1, 9)
    ]
    configured_urls = [_normalize_service_url(url) for url in numbered_urls if url]
    if configured_urls:
        return configured_urls

    env_urls = os.getenv("SOCIALCOMPACT_PLAYER_URLS", "")
    return [_normalize_service_url(url) for url in env_urls.split(",") if url.strip()]


def _normalize_service_url(value: str) -> str:
    url = value.strip()
    if not url:
        return url
    if url.startswith(("http://", "https://")):
        return url.rstrip("/")
    return f"http://{url.rstrip('/')}"


async def _check_agent_card(name: str, address: str) -> None:
    try:
        import httpx
    except ImportError as exc:
        raise ArenaUnavailableError("Install httpx to check Arena services.") from exc

    timeout_seconds = float(os.getenv("SOCIALCOMPACT_SERVICE_CHECK_TIMEOUT", "20"))
    retry_attempts = int(os.getenv("SOCIALCOMPACT_SERVICE_CHECK_ATTEMPTS", "3"))
    retry_delay_seconds = float(os.getenv("SOCIALCOMPACT_SERVICE_CHECK_DELAY", "2"))
    card_url = urljoin(address, "/.well-known/agent-card.json")
    last_error: Exception | None = None

    # Render free services can sleep after inactivity. The first request often
    # wakes the service but may time out, so retry before falling back.
    for attempt in range(1, retry_attempts + 1):
        try:
            async with httpx.AsyncClient(timeout=timeout_seconds) as client:
                response = await client.get(card_url)
                response.raise_for_status()
                return
        except Exception as exc:
            last_error = exc
            if attempt < retry_attempts:
                await asyncio.sleep(retry_delay_seconds)

    try:
        raise last_error or RuntimeError("service check failed")
    except Exception as exc:
        raise ArenaUnavailableError(
            f"{name} is not reachable at {address} after {retry_attempts} attempt(s)."
        ) from exc


def _pending_arena_result(
    payload: StartMatchRequest,
    match_id: str,
    participants: dict[str, str],
) -> MatchResultResponse:
    players = [
        PlayerResult(name=name, score=0, status="running")
        for name in participants.keys()
    ]
    return MatchResultResponse(
        match_id=match_id,
        game=payload.game,
        rounds=0,
        winner="Pending",
        players=players,
        summary="Arena accepted the match request, but final artifacts were not returned synchronously.",
        source="arena",
        status="running",
        round_logs=[],
    )


def _failed_arena_result(
    payload: StartMatchRequest,
    match_id: str,
    participants: dict[str, str],
    detail: str,
) -> MatchResultResponse:
    players = [
        PlayerResult(name=name, score=0, status="failed")
        for name in participants.keys()
    ]
    return MatchResultResponse(
        match_id=match_id,
        game=payload.game,
        rounds=0,
        winner="Unavailable",
        players=players,
        summary=f"Arena match did not complete: {detail}",
        source="arena",
        status="failed",
        round_logs=[],
    )


def _convert_arena_response(
    payload: StartMatchRequest,
    match_id: str,
    response_data: dict[str, Any],
) -> MatchResultResponse | None:
    game_log = _find_game_log(response_data)
    if game_log is not None:
        return _convert_game_log(payload, match_id, game_log)

    results = _find_key(response_data, "results")
    if isinstance(results, list) and results:
        return _convert_results_table(payload, match_id, results)

    return None


def _convert_game_log(
    payload: StartMatchRequest,
    match_id: str,
    game_log: dict[str, Any],
) -> MatchResultResponse:
    scores = game_log.get("Scores") or {}
    participants = game_log.get("Participants") or {}
    winner_agent = max(scores, key=scores.get) if scores else None
    winner = participants.get(winner_agent, winner_agent or "Unknown")

    players = [
        PlayerResult(
            name=participants.get(agent, agent),
            score=int(score),
            status="winner" if agent == winner_agent else "finished",
        )
        for agent, score in sorted(scores.items(), key=lambda item: (-item[1], item[0]))
    ]
    round_logs = _convert_round_logs(game_log.get("Rounds") or [])

    return MatchResultResponse(
        match_id=match_id,
        game=str(game_log.get("Game") or payload.game),
        rounds=len(round_logs),
        winner=str(winner),
        players=players,
        summary=f"{winner} wins the Arena match.",
        source="arena",
        status="completed" if game_log.get("Completed") else "running",
        round_logs=round_logs,
    )


def _convert_results_table(
    payload: StartMatchRequest,
    match_id: str,
    results: list[dict[str, Any]],
) -> MatchResultResponse:
    sorted_rows = sorted(results, key=lambda row: row.get("score", 0), reverse=True)
    winner_row = sorted_rows[0]
    players = [
        PlayerResult(
            name=str(row.get("name") or row.get("agent") or "Unknown"),
            score=int(row.get("score") or 0),
            status="winner" if row is winner_row else "finished",
        )
        for row in sorted_rows
    ]
    winner = players[0].name

    return MatchResultResponse(
        match_id=match_id,
        game=str(winner_row.get("game") or payload.game),
        rounds=max(payload.rounds, 1),
        winner=winner,
        players=players,
        summary=f"{winner} wins the Arena match.",
        source="arena",
        status="completed",
        round_logs=[],
    )


def _convert_round_logs(rounds: list[Any]) -> list[RoundLog]:
    round_logs: list[RoundLog] = []
    for index, item in enumerate(rounds, start=1):
        if not isinstance(item, dict):
            continue
        observations = item.get("Observations") or {}
        events = []
        if isinstance(observations, dict):
            events = [str(value) for value in observations.values() if value]
        elif observations:
            events = [str(observations)]

        states = item.get("NewStates")
        remaining = []
        if isinstance(states, dict):
            remaining = list(states.keys())

        round_logs.append(
            RoundLog(
                round=int(item.get("Round") or index),
                events=events,
                remaining_players=remaining,
            )
        )
    return round_logs


def _convert_game_log_to_events(
    match_id: str,
    game_log: dict[str, Any],
) -> list[GameLogEvent]:
    events: list[GameLogEvent] = []
    participants = game_log.get("Participants") or {}

    def add(
        phase: str,
        message: str,
        round_number: int = 0,
        actor: str | None = None,
        target: str | None = None,
    ) -> None:
        events.append(
            GameLogEvent(
                id=f"{match_id}-{uuid4().hex[:10]}",
                match_id=match_id,
                round=round_number,
                phase=phase,
                actor=actor,
                target=target,
                message=message,
                timestamp=datetime.now(UTC).isoformat(),
            )
        )

    add(
        "system",
        f"Arena started {game_log.get('Game', 'Survivor')} with {game_log.get('NumPlayers', len(participants))} player(s).",
    )

    for round_item in game_log.get("Rounds") or []:
        if not isinstance(round_item, dict):
            continue
        round_number = int(round_item.get("Round") or 0)
        add("system", f"Round {round_number} started.", round_number)

        chats = round_item.get("Chats") or {}
        if isinstance(chats, dict):
            for pair_chats in chats.values():
                if not isinstance(pair_chats, list):
                    continue
                for chat in pair_chats:
                    if not isinstance(chat, dict):
                        continue
                    actor = _display_name(chat.get("from"), participants)
                    target = _display_name(chat.get("to"), participants)
                    message = str(chat.get("message") or "").strip()
                    if message:
                        add("chat", message, round_number, actor, target)

        predictions = round_item.get("Predictions") or {}
        if isinstance(predictions, dict):
            for player, player_predictions in predictions.items():
                actor = _display_name(player, participants)
                if not isinstance(player_predictions, dict):
                    continue
                for target_name, prediction_data in player_predictions.items():
                    target = _display_name(target_name, participants)
                    if isinstance(prediction_data, dict):
                        prediction = prediction_data.get("prediction")
                        reasoning = prediction_data.get("reasoning")
                        if reasoning:
                            add("reasoning", str(reasoning), round_number, actor, target)
                        if prediction is not None:
                            add("prediction", json.dumps(prediction, ensure_ascii=False), round_number, actor, target)

        actions = round_item.get("Actions") or {}
        if isinstance(actions, dict):
            for player, action_data in actions.items():
                actor = _display_name(player, participants)
                if isinstance(action_data, dict):
                    reasoning = action_data.get("reasoning")
                    action = action_data.get("action")
                    if reasoning:
                        add("reasoning", str(reasoning), round_number, actor)
                    if action is not None:
                        add("decision", json.dumps(action, ensure_ascii=False), round_number, actor)

        observations = round_item.get("Observations") or {}
        if isinstance(observations, dict):
            for player, observation in observations.items():
                message = str(observation or "").strip()
                if message:
                    add("observation", message, round_number, _display_name(player, participants))
        elif observations:
            add("observation", str(observations), round_number)

    scores = game_log.get("Scores") or {}
    if scores:
        winner_agent = max(scores, key=scores.get)
        add("system", f"Match completed. Winner: {_display_name(winner_agent, participants)}.")

    return events


def _convert_live_round_to_events(
    match_id: str,
    live_round: dict[str, Any],
) -> list[GameLogEvent]:
    game_log = {
        "Participants": live_round.get("Participants") or {},
        "Rounds": [live_round],
    }
    return _convert_game_log_to_events(match_id, game_log)


def _convert_live_event_to_event(
    match_id: str,
    live_event: dict[str, Any],
) -> GameLogEvent:
    return GameLogEvent(
        id=f"{match_id}-{uuid4().hex[:10]}",
        match_id=match_id,
        round=int(live_event.get("Round") or live_event.get("round") or 0),
        phase=str(live_event.get("Phase") or live_event.get("phase") or "event"),
        actor=_optional_string(live_event.get("Actor") or live_event.get("actor")),
        target=_optional_string(live_event.get("Target") or live_event.get("target")),
        message=str(live_event.get("Message") or live_event.get("message") or "").strip(),
        timestamp=str(
            live_event.get("Timestamp")
            or live_event.get("timestamp")
            or datetime.now(UTC).isoformat()
        ),
    )


def _optional_string(value: Any) -> str | None:
    if value is None:
        return None
    return str(value)


def _display_name(value: Any, participants: dict[str, Any]) -> str | None:
    if value is None:
        return None
    text = str(value)
    return str(participants.get(text, text))


def _find_live_events(data: Any) -> list[dict[str, Any]]:
    found: list[dict[str, Any]] = []
    if isinstance(data, dict):
        live_event = data.get("LiveEvent") or data.get("live_event")
        if isinstance(live_event, dict):
            found.append(live_event)
        for value in data.values():
            found.extend(_find_live_events(value))
    elif isinstance(data, list):
        for item in data:
            found.extend(_find_live_events(item))
    return found


def _find_live_round_logs(data: Any) -> list[dict[str, Any]]:
    found: list[dict[str, Any]] = []
    if isinstance(data, dict):
        live_round = data.get("LiveRound") or data.get("live_round")
        if isinstance(live_round, dict):
            found.append(live_round)
        for value in data.values():
            found.extend(_find_live_round_logs(value))
    elif isinstance(data, list):
        for item in data:
            found.extend(_find_live_round_logs(item))
    return found


def _find_game_log(data: Any) -> dict[str, Any] | None:
    if isinstance(data, dict):
        if {"Game", "Scores", "Participants"}.issubset(data.keys()):
            return data
        for value in data.values():
            found = _find_game_log(value)
            if found is not None:
                return found
    elif isinstance(data, list):
        for item in data:
            found = _find_game_log(item)
            if found is not None:
                return found
    return None


def _find_key(data: Any, target_key: str) -> Any:
    if isinstance(data, dict):
        if target_key in data:
            return data[target_key]
        for value in data.values():
            found = _find_key(value, target_key)
            if found is not None:
                return found
    elif isinstance(data, list):
        for item in data:
            found = _find_key(item, target_key)
            if found is not None:
                return found
    return None
