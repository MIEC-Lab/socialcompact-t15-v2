# Authorship: Yuhao Ye (E) owns the local simulation fallback used by the web backend.
# Scope: Generates local/demo matches when the public Arena stack is unavailable.

import random
from uuid import uuid4

from app.schemas import MatchResultResponse, PlayerResult, RoundLog, StartMatchRequest


DEFAULT_PLAYER_NAMES = [
    "Aisha",
    "Benjamin",
    "Chen",
    "Devika",
    "Emmanuel",
    "Fortuna",
    "Gabriel",
    "Helen",
]


def build_match_id(game: str) -> str:
    slug = game.lower().replace(" ", "-")
    return f"match-{slug}-{uuid4().hex[:8]}"


def normalize_players(payload: StartMatchRequest) -> list[str]:
    raw_players = [player.strip() for player in payload.players if player.strip()]
    players: list[str] = []
    seen: dict[str, int] = {}
    for player in raw_players:
        seen[player] = seen.get(player, 0) + 1
        players.append(player if seen[player] == 1 else f"{player} {seen[player]}")

    if not players:
        players = DEFAULT_PLAYER_NAMES[:4]
    if len(players) == 1:
        players.append("Player 2")
    return players


def run_local_match(
    payload: StartMatchRequest,
    match_id: str,
    source: str = "local-simulation",
    note: str | None = None,
) -> MatchResultResponse:
    players = normalize_players(payload)
    if payload.game != "Survivor":
        return _rank_by_seed(payload, match_id, players, source, note)
    return _run_survivor(payload, match_id, players, source, note)


def _run_survivor(
    payload: StartMatchRequest,
    match_id: str,
    players: list[str],
    source: str,
    note: str | None,
) -> MatchResultResponse:
    rounds = max(payload.rounds, 1)
    rng = random.Random(f"{match_id}:{payload.game}:{','.join(players)}:{rounds}")
    lives = {player: 3 for player in players}
    scores = {player: 0 for player in players}
    eliminated: set[str] = set()
    round_logs: list[RoundLog] = []

    for round_number in range(1, rounds + 1):
        active_players = [player for player in players if player not in eliminated]
        if len(active_players) <= 1:
            break

        events: list[str] = []
        for attacker in active_players:
            targets = [player for player in active_players if player != attacker]
            if not targets:
                continue
            target = rng.choice(targets)
            damage = rng.choice([1, 1, 2])
            lives[target] -= damage
            events.append(f"{attacker} attacks {target} for {damage} damage.")

            if lives[target] <= 0 and target not in eliminated:
                eliminated.add(target)
                events.append(f"{target} is eliminated.")

        for player in players:
            if player not in eliminated:
                scores[player] = len(eliminated)

        remaining_players = [player for player in players if player not in eliminated]
        round_logs.append(
            RoundLog(
                round=round_number,
                events=events,
                remaining_players=remaining_players,
            )
        )

    winner = max(players, key=lambda player: (scores[player], lives[player]))
    player_results = [
        PlayerResult(
            name=player,
            score=scores[player],
            status=_player_status(player, winner, eliminated),
        )
        for player in sorted(players, key=lambda player: (-scores[player], player))
    ]

    summary = (
        f"{winner} wins the local Survivor simulation after "
        f"{len(round_logs)} round{'s' if len(round_logs) != 1 else ''}."
    )
    if note:
        summary = f"{summary} {note}"

    return MatchResultResponse(
        match_id=match_id,
        game=payload.game,
        rounds=len(round_logs),
        winner=winner,
        players=player_results,
        summary=summary,
        source=source,
        status="completed",
        round_logs=round_logs,
    )


def _rank_by_seed(
    payload: StartMatchRequest,
    match_id: str,
    players: list[str],
    source: str,
    note: str | None,
) -> MatchResultResponse:
    rng = random.Random(f"{match_id}:{payload.game}")
    scores = {player: rng.randint(1, 12) for player in players}
    winner = max(players, key=lambda player: scores[player])
    player_results = [
        PlayerResult(
            name=player,
            score=scores[player],
            status="winner" if player == winner else "finished",
        )
        for player in sorted(players, key=lambda player: (-scores[player], player))
    ]
    summary = f"{winner} finishes with the highest score in the local simulation."
    if note:
        summary = f"{summary} {note}"
    return MatchResultResponse(
        match_id=match_id,
        game=payload.game,
        rounds=max(payload.rounds, 1),
        winner=winner,
        players=player_results,
        summary=summary,
        source=source,
        status="completed",
        round_logs=[],
    )


def _player_status(player: str, winner: str, eliminated: set[str]) -> str:
    if player == winner:
        return "winner"
    if player in eliminated:
        return "eliminated"
    return "survived"
