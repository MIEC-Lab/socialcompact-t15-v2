# Authorship: Yuhao Ye (E) owns backend state structures for the public V2 flow.
# Scope: In-memory stores that support match results and logs.

from app.schemas import GameLogEvent, MatchResultResponse, PlayerResult


MATCH_RESULTS: dict[str, MatchResultResponse] = {
    "mock-match-001": MatchResultResponse(
        match_id="mock-match-001",
        game="Survivor",
        rounds=3,
        winner="Alice",
        players=[
            PlayerResult(name="Alice", score=10, status="alive"),
            PlayerResult(name="Bob", score=8, status="eliminated"),
            PlayerResult(name="Carol", score=6, status="eliminated"),
        ],
        summary="Alice survives to the end and wins the mock match.",
    )
}

MATCH_LOGS: dict[str, list[GameLogEvent]] = {
    "mock-match-001": [
        GameLogEvent(
            id="mock-match-001-system-1",
            match_id="mock-match-001",
            round=0,
            phase="system",
            message="Mock Survivor match loaded for frontend preview.",
            timestamp="2026-01-01T00:00:00Z",
        ),
        GameLogEvent(
            id="mock-match-001-chat-1",
            match_id="mock-match-001",
            round=1,
            phase="chat",
            actor="Alice",
            target="Bob",
            message="I think we should keep the alliance stable this round.",
            timestamp="2026-01-01T00:00:01Z",
        ),
    ]
}
