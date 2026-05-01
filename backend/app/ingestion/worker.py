import asyncio
from datetime import datetime
from app.ingestion.queue import signal_queue
from app.core.database import signals_collection, redis_client, AsyncSessionLocal
from app.models.postgres_models import WorkItem, PriorityEnum
from app.workflow.alerting import AlertContext, get_strategy
import uuid

# Throughput counter
signal_counter = {"count": 0}

PRIORITY_MAP = {
    "RDBMS": PriorityEnum.P0,
    "API": PriorityEnum.P0,
    "MCP": PriorityEnum.P1,
    "QUEUE": PriorityEnum.P1,
    "CACHE": PriorityEnum.P2,
    "NOSQL": PriorityEnum.P2,
}

async def process_signal(signal: dict):
    component_id = signal["component_id"]
    signal_counter["count"] += 1

    # --- Save raw signal to MongoDB (always) ---
    await signals_collection.insert_one({**signal, "received_at": datetime.utcnow()})

    # --- Debounce logic using Redis ---
    debounce_key = f"debounce:{component_id}"
    existing_work_item_id = await redis_client.get(debounce_key)

    if existing_work_item_id:
        # Already have a work item — just increment signal count
        await signals_collection.update_one(
            {"work_item_id": existing_work_item_id},
            {"$inc": {"signal_count": 1}}
        )
        return

    # --- No existing work item — create one in PostgreSQL ---
    component_type = signal.get("component_type", "API")
    priority = PRIORITY_MAP.get(component_type, PriorityEnum.P1)
    work_item_id = str(uuid.uuid4())

    async with AsyncSessionLocal() as session:
        work_item = WorkItem(
            id=work_item_id,
            component_id=component_id,
            priority=priority,
            signal_count=1,
            start_time=datetime.utcnow()
        )
        session.add(work_item)
        await session.commit()

    # Set debounce key with 10 second TTL
    await redis_client.setex(debounce_key, 10, work_item_id)

    # Update signal in MongoDB with work_item_id
    await signals_collection.update_one(
        {"_id": signal.get("_id")},
        {"$set": {"work_item_id": work_item_id}}
    )

    # Fire alert strategy
    strategy = get_strategy(priority)
    AlertContext(strategy).execute({"id": work_item_id, "component_id": component_id, "priority": priority})

    # Invalidate Redis dashboard cache
    await redis_client.delete("dashboard:incidents")


async def worker_loop():
    print("[WORKER] Background signal worker started")
    while True:
        try:
            signal = await signal_queue.get()
            await process_signal(signal)
            signal_queue.task_done()
        except Exception as e:
            print(f"[WORKER ERROR] {e}")


async def metrics_loop():
    while True:
        await asyncio.sleep(5)
        rate = signal_counter["count"] / 5
        print(f"[METRICS] Throughput: {rate:.2f} signals/sec | Queue size: {signal_queue.qsize()}")
        signal_counter["count"] = 0