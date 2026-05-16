# web-backend

FastAPI backend for the SocialCOMPACT web demo.

The default path runs a local Survivor simulation and saves the result to
`sample-data/`. If Arena and player agents are running, the same endpoint can
try the real A2A Arena flow.

## Setup

```powershell
cd web-backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

## Start The Backend

```powershell
uvicorn app.main:app --reload
```

Default URL: `http://127.0.0.1:8000`

## Main Endpoints

- `GET /health`
- `GET /api/health`
- `GET /api/games`
- `POST /api/matches`
- `GET /api/matches/{match_id}`
- `GET /api/results/{match_id}`
- `GET /api/results/source/files`

## Start A Local Simulation

```powershell
curl -X POST http://127.0.0.1:8000/api/matches `
  -H "Content-Type: application/json" `
  -d "{\"game\":\"Survivor\",\"players\":[\"Alice\",\"Bob\",\"Carol\"],\"rounds\":3}"
```

The response includes a `match_id`. Open:

```text
http://127.0.0.1:8000/api/results/{match_id}
```

## Optional Arena Mode

Copy `.env.example` values into your shell or deployment environment:

```powershell
$env:SOCIALCOMPACT_ARENA_URL="http://127.0.0.1:9009"
$env:SOCIALCOMPACT_PLAYER_URLS="http://127.0.0.1:9018,http://127.0.0.1:9019"
$env:SOCIALCOMPACT_USE_ARENA="true"
```

Then start the Arena and player agent services from `agentbeats/`.

When Arena mode is requested but unavailable, the backend falls back to the
local simulation and marks the result source as `local-fallback`.

## Public Backend Deployment

For the V2 public demo, deploy only this `web-backend` directory as a public
FastAPI service. Then set the Vercel frontend environment variable:

```text
NEXT_PUBLIC_API_BASE_URL=https://your-public-backend-url
```

Recommended deployment settings:

```text
Root Directory:
web-backend

Build Command:
pip install -r requirements.txt

Start Command:
uvicorn app.main:app --host 0.0.0.0 --port $PORT

Health Check Path:
/api/health
```

See `docs/V2_PUBLIC_BACKEND_DEPLOYMENT.md` for the step-by-step Chinese guide.
