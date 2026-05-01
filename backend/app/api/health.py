from fastapi import APIRouter
from app.core.database import redis_client, mongo_db, engine
from sqlalchemy import text

router = APIRouter()

@router.get("/health")
async def health_check():
    status = {"postgres": "ok", "mongodb": "ok", "redis": "ok"}

    # Check PostgreSQL
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
    except Exception as e:
        status["postgres"] = f"error: {str(e)}"

    # Check MongoDB
    try:
        await mongo_db.command("ping")
    except Exception as e:
        status["mongodb"] = f"error: {str(e)}"

    # Check Redis
    try:
        await redis_client.ping()
    except Exception as e:
        status["redis"] = f"error: {str(e)}"

    overall = "ok" if all(v == "ok" for v in status.values()) else "degraded"
    return {"status": overall, "services": status}