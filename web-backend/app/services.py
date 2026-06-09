# Authorship: Yuhao Ye (E) owns backend orchestration, match lifecycle, and fallback logic.
# Scope: Coordinates live Arena runs, local fallback, and stored results.

from datetime import UTC, datetime
from uuid import uuid4

from app.arena_client import (
    ArenaUnavailableError,
    should_use_arena,
    start_arena_match_background,
)
from app.data import MATCH_LOGS, MATCH_RESULTS
from app.schemas import GameLogEvent, MatchCreateResponse, MatchResultResponse, StartMatchRequest
from app.simulator import build_match_id, normalize_players, run_local_match
from app.storage import load_match_logs, load_match_result, save_match_logs, save_match_result


def get_match_result_by_id(match_id: str) -> MatchResultResponse | None:
    result = MATCH_RESULTS.get(match_id)
    if result is None:
        result = load_match_result(match_id)
    return result


def get_match_logs_by_id(match_id: str) -> list[GameLogEvent]:
    logs = MATCH_LOGS.get(match_id)
    if logs is None:
        logs = load_match_logs(match_id)
        if logs:
            MATCH_LOGS[match_id] = logs
    return logs or []


async def create_match(payload: StartMatchRequest) -> MatchCreateResponse:
    match_id = build_match_id(payload.game)
    players = normalize_players(payload)
    reset_match_logs(match_id)
    append_match_log(
        match_id,
        "system",
        f"Match created for {payload.game} with {len(players)} player(s) and max {payload.rounds} round(s).",
    )

    if should_use_arena(payload):
        try:
            append_match_log(match_id, "system", "Arena mode requested. Queueing real Agent run.")
            result = await start_arena_match_background(
                payload,
                match_id,
                _store_match_result,
                append_match_log,
                replace_match_logs,
            )
        except ArenaUnavailableError as exc:
            append_match_log(match_id, "system", f"Arena unavailable. Falling back to local simulation: {exc}")
            result = run_local_match(
                payload,
                match_id,
                source="local-fallback",
                note=f"Arena was unavailable: {exc}",
            )
    else:
        append_match_log(match_id, "system", "Local simulation mode started.")
        result = run_local_match(payload, match_id)

    _store_match_result(result)

    return MatchCreateResponse(
        id=match_id,
        game=result.game,
        rounds=result.rounds,
        player_count=len(result.players) or len(players),
        status=result.status,
        message=_create_message(result),
        source=result.source,
        result=result,
    )


def create_mock_match(payload: StartMatchRequest) -> MatchCreateResponse:
    result = run_local_match(payload, build_match_id(payload.game))
    _store_match_result(result)

    return MatchCreateResponse(
        id=result.match_id,
        game=result.game,
        rounds=result.rounds,
        player_count=len(result.players),
        status=result.status,
        message=_create_message(result),
        source=result.source,
        result=result,
    )


def _store_match_result(result: MatchResultResponse) -> None:
    MATCH_RESULTS[result.match_id] = result
    save_match_result(result)
    if result.status != "running":
        replace_match_logs(result.match_id, build_logs_from_result(result, keep_existing=True))


def reset_match_logs(match_id: str) -> None:
    MATCH_LOGS[match_id] = []
    save_match_logs(match_id, MATCH_LOGS[match_id])


def append_match_log(
    match_id: str,
    phase: str,
    message: str,
    round_number: int = 0,
    actor: str | None = None,
    target: str | None = None,
) -> GameLogEvent:
    logs = MATCH_LOGS.setdefault(match_id, [])
    key = (phase, round_number, actor, target, message)
    for existing in logs:
        existing_key = (
            existing.phase,
            existing.round,
            existing.actor,
            existing.target,
            existing.message,
        )
        if existing_key == key:
            return existing

    event = GameLogEvent(
        id=f"{match_id}-{uuid4().hex[:10]}",
        match_id=match_id,
        round=round_number,
        phase=phase,
        actor=actor,
        target=target,
        message=message,
        timestamp=datetime.now(UTC).isoformat(),
    )
    logs.append(event)
    save_match_logs(match_id, logs)
    return event


def replace_match_logs(match_id: str, logs: list[GameLogEvent]) -> None:
    MATCH_LOGS[match_id] = logs
    save_match_logs(match_id, logs)


def build_logs_from_result(
    result: MatchResultResponse,
    keep_existing: bool,
) -> list[GameLogEvent]:
    logs = list(get_match_logs_by_id(result.match_id)) if keep_existing else []
    seen = {(event.phase, event.round, event.actor, event.target, event.message) for event in logs}

    def add_event(
        phase: str,
        message: str,
        round_number: int = 0,
        actor: str | None = None,
        target: str | None = None,
    ) -> None:
        key = (phase, round_number, actor, target, message)
        if key in seen:
            return
        seen.add(key)
        logs.append(
            GameLogEvent(
                id=f"{result.match_id}-{uuid4().hex[:10]}",
                match_id=result.match_id,
                round=round_number,
                phase=phase,
                actor=actor,
                target=target,
                message=message,
                timestamp=datetime.now(UTC).isoformat(),
            )
        )

    add_event("system", result.summary)
    for round_log in result.round_logs:
        if round_log.remaining_players:
            add_event(
                "observation",
                f"Remaining players: {', '.join(round_log.remaining_players)}",
                round_log.round,
            )
        for event in round_log.events:
            add_event("observation", event, round_log.round)

    if result.status == "completed":
        add_event("system", f"Match completed. Winner: {result.winner}.")
    elif result.status == "failed":
        add_event("system", "Match failed before completion.")

    return logs


def _create_message(result: MatchResultResponse) -> str:
    if result.status == "running":
        return "Arena match was queued. The results page will keep polling while Render services wake and the Agent run continues."
    if result.source == "local-fallback":
        return "Arena was unavailable, so a local simulation result was created."
    if result.source == "arena":
        return "Arena match completed successfully."
    return "Local match simulation completed successfully."
