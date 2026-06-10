# Authorship: Yuhao Ye (E) owns backend persistence helpers.
# Scope: Saves and loads public match results and logs.

import json
from pathlib import Path

from app.schemas import GameLogEvent, MatchResultResponse


BASE_DIR = Path(__file__).resolve().parent.parent
SAMPLE_DATA_DIR = BASE_DIR / "sample-data"


# Author: Yuhao Ye (E) - filesystem storage helpers for public match snapshots and logs.
def ensure_sample_data_dir() -> None:
    SAMPLE_DATA_DIR.mkdir(parents=True, exist_ok=True)


# Author: Yuhao Ye (E) - filesystem storage helpers for public match snapshots and logs.
def get_sample_result_path(match_id: str) -> Path:
    return SAMPLE_DATA_DIR / f"{match_id}.json"


# Author: Yuhao Ye (E) - filesystem storage helpers for public match snapshots and logs.
def get_match_logs_path(match_id: str) -> Path:
    return SAMPLE_DATA_DIR / f"{match_id}.logs.json"


# Author: Yuhao Ye (E) - filesystem storage helpers for public match snapshots and logs.
def save_match_result(result: MatchResultResponse) -> None:
    ensure_sample_data_dir()
    path = get_sample_result_path(result.match_id)
    path.write_text(result.model_dump_json(indent=2), encoding="utf-8")


# Author: Yuhao Ye (E) - filesystem storage helpers for public match snapshots and logs.
def load_match_result(match_id: str) -> MatchResultResponse | None:
    path = get_sample_result_path(match_id)
    if not path.exists():
        return None
    return MatchResultResponse.model_validate(json.loads(path.read_text(encoding="utf-8")))


# Author: Yuhao Ye (E) - filesystem storage helpers for public match snapshots and logs.
def save_match_logs(match_id: str, logs: list[GameLogEvent]) -> None:
    ensure_sample_data_dir()
    path = get_match_logs_path(match_id)
    payload = [event.model_dump() for event in logs]
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")


# Author: Yuhao Ye (E) - filesystem storage helpers for public match snapshots and logs.
def load_match_logs(match_id: str) -> list[GameLogEvent]:
    path = get_match_logs_path(match_id)
    if not path.exists():
        return []
    payload = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(payload, list):
        return []
    return [GameLogEvent.model_validate(item) for item in payload]


# Author: Yuhao Ye (E) - filesystem storage helpers for public match snapshots and logs.
def list_saved_match_ids() -> list[str]:
    ensure_sample_data_dir()
    return sorted(path.stem for path in SAMPLE_DATA_DIR.glob("*.json") if not path.name.endswith(".logs.json"))
