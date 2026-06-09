# Authorship: Yuhao Ye (E) owns result and log polling endpoints.
# Scope: Serves match result snapshots and live log payloads.

from fastapi import APIRouter, HTTPException

from app.schemas import (
    DataSourceResponse,
    MatchResultResponse,
    MatchCreateResponse,
    StartMatchRequest,
)
from app.services import create_match, get_match_result_by_id
from app.storage import list_saved_match_ids


router = APIRouter(prefix="/api/results", tags=["results"])


@router.get("/mock", response_model=MatchResultResponse)
def get_mock_result() -> MatchResultResponse:
    result = get_match_result_by_id("mock-match-001")
    if result is None:
        raise HTTPException(status_code=404, detail="Match result not found")
    return result


@router.get("/source/files", response_model=DataSourceResponse)
def list_file_results() -> DataSourceResponse:
    match_ids = list_saved_match_ids()
    return DataSourceResponse(
        source="sample-data",
        match_count=len(match_ids),
        matches=match_ids,
    )


@router.get("/{match_id}", response_model=MatchResultResponse)
def get_match_result(match_id: str) -> MatchResultResponse:
    result = get_match_result_by_id(match_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Match result not found")
    return result


@router.post("/start", response_model=MatchCreateResponse)
async def start_match(payload: StartMatchRequest) -> MatchCreateResponse:
    return await create_match(payload)
