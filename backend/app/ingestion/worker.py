import asyncio
from datetime import datetime
from app.ingestion.queue import signal_queue
from app.core.database import signals_collection, redis_client, AsyncSessionLocal
from app.models.postgres_models import WorkItem, PriorityEnum
from app.workflow.alerting import AlertContext, get_strategy
from sqlalchemy import update
from app.core.retry import with_retry
from pymongo.errors import ServerSelectionTimeoutError, AutoReconnect
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

@with_retry(max_attempts=3, base_delay=0.5, exceptions=(ServerSelectionTimeoutError, AutoReconnect))
async def _save_signal_to_mongo(signal: dict):
    await signals_collection.insert_one(signal)

@with_retry(max_attempts=3, base_delay=0.5, exceptions=(ServerSelectionTimeoutError, AutoReconnect))
async def _create_work_item_in_postgres(work_item: WorkItem):
    async with AsyncSessionLocal() as session:
        session.add(work_item)
        await session.commit()

@with_retry(max_attempts=3, base_delay=0.5, exceptions=(ServerSelectionTimeoutError, AutoReconnect))
async def _increment_signal_count(work_item_id: str):
    async with AsyncSessionLocal() as session:
        await session.execute(
            update(WorkItem)
            .where(WorkItem.id == work_item_id)
            .values(signal_count=WorkItem.signal_count + 1)
        )
        await session.commit()

async def process_signal(signal: dict):
    component_id = signal["component_id"]
    signal_counter["count"] += 1

    # --- Save raw signal to MongoDB (always) ---
    initial_signal = {**signal, "received_at": datetime.utcnow()}
    await _save_signal_to_mongo(initial_signal)

    # --- Debounce logic using Redis ---
    debounce_key = f"debounce:{component_id}"
    existing_work_item_id = await redis_client.get(debounce_key)

    if existing_work_item_id:
        signal["work_item_id"] = existing_work_item_id
        await _save_signal_to_mongo(signal)
        await _increment_signal_count(existing_work_item_id)
        return

    # --- No existing work item — create one in PostgreSQL ---
    component_type = signal.get("component_type", "API")
    priority = PRIORITY_MAP.get(component_type, PriorityEnum.P1)
    work_item_id = str(uuid.uuid4())

    work_item = WorkItem(
        id=work_item_id,
        component_id=component_id,
        priority=priority,
        signal_count=1,
        start_time=datetime.utcnow()
    )
    await _create_work_item_in_postgres(work_item)

    # Set debounce key with 10 second TTL
    await redis_client.setex(debounce_key, 10, work_item_id)

    # Insert first signal into MongoDB WITH work_item_id already set
    signal["work_item_id"] = work_item_id
    await _save_signal_to_mongo(signal)

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
        except ServerSelectionTimeoutError as e:
            print(f"[WORKER ERROR] MongoDB unavailable after all retries: Connection refused")
        except Exception as e:
            print(f"[WORKER ERROR] {e}")


async def metrics_loop():
    while True:
        await asyncio.sleep(5)
        rate = signal_counter["count"] / 5
        print(f"[METRICS] Throughput: {rate:.2f} signals/sec | Queue size: {signal_queue.qsize()}")
        signal_counter["count"] = 0