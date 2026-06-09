# Authorship: Yuhao Ye (E) owns match-creation endpoints.
# Scope: Starts matches and returns public match IDs.

from fastapi import APIRouter, HTTPException

from app.schemas import MatchCreateResponse, MatchLogsResponse, MatchResultResponse, StartMatchRequest
from app.services import (
    create_match as create_match_service,
    get_match_logs_by_id,
    get_match_result_by_id,
)


router = APIRouter(prefix="/api/matches", tags=["matches"])


@router.post("", response_model=MatchCreateResponse)
async def create_match(payload: StartMatchRequest) -> MatchCreateResponse:
    return await create_match_service(payload)


@router.get("/{match_id}", response_model=MatchResultResponse)
def get_match(match_id: str) -> MatchResultResponse:
    result = get_match_result_by_id(match_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Match result not found")
    return result


@router.get("/{match_id}/logs", response_model=MatchLogsResponse)
def get_match_logs(match_id: str) -> MatchLogsResponse:
    result = get_match_result_by_id(match_id)
    logs = get_match_logs_by_id(match_id)

    if result is None and not logs:
        raise HTTPException(status_code=404, detail="Match logs not found")

    return MatchLogsResponse(
        match_id=match_id,
        status=result.status if result is not None else "unknown",
        source=result.source if result is not None else "unknown",
        event_count=len(logs),
        events=logs,
    )
