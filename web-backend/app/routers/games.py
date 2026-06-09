# Authorship: Yuhao Ye (E) owns backend game metadata endpoints.
# Scope: Exposes supported games to the frontend.

from fastapi import APIRouter

from app.schemas import GameListResponse


router = APIRouter(prefix="/api/games", tags=["games"])


@router.get("", response_model=GameListResponse)
def list_games() -> GameListResponse:
    return GameListResponse(
        games=[
            "Survivor",
            "Tragedy of the Commons",
            "Coalition",
            "Scheduler",
            "HUPI",
        ]
    )

