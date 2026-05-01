import asyncio

# This is the heart of your backpressure mechanism
# Signals go INTO this queue immediately on API hit
# A background worker drains it at DB speed
signal_queue: asyncio.Queue = asyncio.Queue(maxsize=50000)

async def enqueue_signal(signal: dict):
    try:
        signal_queue.put_nowait(signal)
    except asyncio.QueueFull:
        # Drop with a log rather than crash — this is intentional
        print("[WARN] Signal queue full, dropping signal")