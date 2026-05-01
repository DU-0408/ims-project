from motor.motor_asyncio import AsyncIOMotorClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from redis.asyncio import Redis
from app.core.config import settings

# --- PostgreSQL ---
engine = create_async_engine(settings.POSTGRES_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

# --- MongoDB ---
mongo_client = AsyncIOMotorClient(settings.MONGO_URL)
mongo_db = mongo_client[settings.MONGO_DB]
signals_collection = mongo_db["raw_signals"]

# --- Redis ---
redis_client = Redis.from_url(settings.REDIS_URL, decode_responses=True)