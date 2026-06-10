# Authorship: Yuhao Ye (E) owns the FastAPI application entry point.
# Scope: Bootstraps the public backend service.

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.games import router as games_router
from app.routers.matches import router as matches_router
from app.routers.results import router as results_router
from app.schemas import HealthResponse

API_VERSION = "1.0.0"

app = FastAPI(
    title="SocialCOMPACT Web Backend",
    description="Minimal backend API for the SocialCOMPACT web frontend.",
    version=API_VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Author: Yuhao Ye (E) - FastAPI entrypoint and health endpoints for the public V2 backend.
@app.get("/")
def root() -> dict[str, str]:
    return {"message": "SocialCOMPACT backend is running"}


# Author: Yuhao Ye (E) - FastAPI entrypoint and health endpoints for the public V2 backend.
@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok", service="web-backend", version=API_VERSION)


# Author: Yuhao Ye (E) - FastAPI entrypoint and health endpoints for the public V2 backend.
@app.get("/api/health", response_model=HealthResponse)
def api_health() -> HealthResponse:
    return HealthResponse(status="ok", service="web-backend", version=API_VERSION)


app.include_router(games_router)
app.include_router(matches_router)
app.include_router(results_router)
