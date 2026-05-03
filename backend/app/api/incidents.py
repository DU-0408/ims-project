from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from pydantic import BaseModel
from datetime import datetime
from app.core.database import get_db, redis_client, signals_collection
from app.models.postgres_models import WorkItem, RCA, StatusEnum
from app.workflow.state_machine import get_next_status
from app.core.websocket_manager import manager
import json
import uuid

router = APIRouter()

# --- Pydantic Schemas ---
class RCAPayload(BaseModel):
    incident_start: datetime
    incident_end: datetime
    root_cause_category: str
    fix_applied: str
    prevention_steps: str

class StatusUpdatePayload(BaseModel):
    status: str

# --- Helper: serialize work item to dict ---
def serialize_work_item(w: WorkItem) -> dict:
    return {
        "id": str(w.id),
        "component_id": w.component_id,
        "status": w.status.value,
        "priority": w.priority.value,
        "signal_count": w.signal_count,
        "start_time": w.start_time.isoformat() if w.start_time else None,
        "updated_at": w.updated_at.isoformat() if w.updated_at else None,
        "mttr_minutes": w.mttr_minutes,
    }

# --- GET /incidents --- List all incidents (Redis cache first)
@router.get("/incidents")
async def list_incidents(db: AsyncSession = Depends(get_db)):
    cached = await redis_client.get("dashboard:incidents")
    if cached:
        return json.loads(cached)

    result = await db.execute(select(WorkItem).order_by(WorkItem.priority))
    work_items = result.scalars().all()
    data = [serialize_work_item(w) for w in work_items]

    # Cache for 10 seconds
    await redis_client.setex("dashboard:incidents", 10, json.dumps(data))
    return data

# --- GET /incidents/{id} --- Get single incident + raw signals
@router.get("/incidents/{incident_id}")
async def get_incident(incident_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(WorkItem).where(WorkItem.id == incident_id))
    work_item = result.scalar_one_or_none()

    if not work_item:
        raise HTTPException(status_code=404, detail="Incident not found")

    # Fetch raw signals from MongoDB
    signals = await signals_collection.find(
        {"work_item_id": incident_id}
    ).to_list(length=100)

    for s in signals:
        s["_id"] = str(s["_id"])  # MongoDB ObjectId not JSON serializable

    return {
        **serialize_work_item(work_item),
        "signals": signals
    }

# --- PATCH /incidents/{id}/status --- Transition state
@router.patch("/incidents/{incident_id}/status")
async def update_status(
    incident_id: str,
    payload: StatusUpdatePayload,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(WorkItem).where(WorkItem.id == incident_id))
    work_item = result.scalar_one_or_none()

    if not work_item:
        raise HTTPException(status_code=404, detail="Incident not found")

    # Fetch RCA if exists (needed for CLOSED validation)
    rca_result = await db.execute(select(RCA).where(RCA.work_item_id == incident_id).limit(1))
    rca = rca_result.scalar_one_or_none()
    rca_dict = {
        "root_cause_category": rca.root_cause_category,
        "fix_applied": rca.fix_applied
    } if rca else None

    try:
        next_status = get_next_status(work_item.status.value, rca_dict)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    await db.execute(
        update(WorkItem)
        .where(WorkItem.id == incident_id)
        .values(status=next_status, updated_at=datetime.utcnow())
    )
    await db.commit()

    # Invalidate cache
    await redis_client.delete("dashboard:incidents")

    # Broadcast status change
    await manager.broadcast({
        "type": "STATUS_UPDATED",
        "incident_id": incident_id,
        "new_status": next_status
    })

    return {"id": incident_id, "new_status": next_status}

# --- POST /incidents/{id}/rca --- Submit RCA
@router.post("/incidents/{incident_id}/rca")
async def submit_rca(
    incident_id: str,
    payload: RCAPayload,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(WorkItem).where(WorkItem.id == incident_id))
    work_item = result.scalar_one_or_none()

    if not work_item:
        raise HTTPException(status_code=404, detail="Incident not found")

    # Validate all fields are non-empty
    if not payload.root_cause_category or not payload.fix_applied or not payload.prevention_steps:
        raise HTTPException(status_code=400, detail="RCA is incomplete. All fields are required.")

    # Calculate MTTR
    mttr_minutes = (payload.incident_end.replace(tzinfo=None) - payload.incident_start.replace(tzinfo=None)).total_seconds() / 60

    # Save RCA
    rca = RCA(
        id=uuid.uuid4(),
        work_item_id=incident_id,
        incident_start=payload.incident_start.replace(tzinfo=None),
        incident_end=payload.incident_end.replace(tzinfo=None),
        root_cause_category=payload.root_cause_category,
        fix_applied=payload.fix_applied,
        prevention_steps=payload.prevention_steps,
    )
    db.add(rca)

    # Update MTTR on work item
    await db.execute(
        update(WorkItem)
        .where(WorkItem.id == incident_id)
        .values(mttr_minutes=mttr_minutes, updated_at=datetime.utcnow())
    )
    await db.commit()

    # Invalidate cache
    await redis_client.delete("dashboard:incidents")

    return {
        "status": "RCA submitted successfully",
        "mttr_minutes": round(mttr_minutes, 2)
    }