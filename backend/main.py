import asyncio
from fastapi import Depends
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from contextlib import asynccontextmanager
from app.core.dependencies import get_current_user
from app.core.database import engine, Base
from app.ingestion.worker import worker_loop, metrics_loop
from app.api import signals, incidents, health, auth

limiter = Limiter(key_func=get_remote_address)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create DB tables on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Start background tasks
    asyncio.create_task(worker_loop())
    asyncio.create_task(metrics_loop())
    print("[STARTUP] IMS Backend started")
    yield
    print("[SHUTDOWN] IMS Backend shutting down")

app = FastAPI(
    title="Incident Management System",
    lifespan=lifespan,
    swagger_ui_init_oauth={
        "usePkceWithAuthorizationCodeGrant": False,
        "clientId": "",
    },
    swagger_ui_parameters={"persistAuthorization": True},
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(
    signals.router,
    prefix="/api/v1",
    dependencies=[Depends(get_current_user)]
)
app.include_router(
    incidents.router,
    prefix="/api/v1",
    dependencies=[Depends(get_current_user)]
)