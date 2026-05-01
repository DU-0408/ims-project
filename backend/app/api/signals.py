from fastapi import APIRouter, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from pydantic import BaseModel
from app.ingestion.queue import enqueue_signal
from datetime import datetime
import uuid

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

class SignalPayload(BaseModel):
    component_id: str
    component_type: str  # RDBMS, API, MCP, QUEUE, CACHE, NOSQL
    error_message: str
    severity: str = "HIGH"
    metadata: dict = {}

@router.post("/signals")
@limiter.limit("1000/minute")
async def ingest_signal(request: Request, payload: SignalPayload):
    signal = {
        "signal_id": str(uuid.uuid4()),
        "component_id": payload.component_id,
        "component_type": payload.component_type,
        "error_message": payload.error_message,
        "severity": payload.severity,
        "metadata": payload.metadata,
        "timestamp": datetime.utcnow().isoformat(),
    }
    await enqueue_signal(signal)
    return {"status": "accepted", "signal_id": signal["signal_id"]}