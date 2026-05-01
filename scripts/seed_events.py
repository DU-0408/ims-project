import asyncio
import httpx
import random

BASE_URL = "http://localhost:8000/api/v1"

RDBMS_SIGNALS = [
    "Connection timeout",
    "Max connections reached",
    "Deadlock detected",
    "Replication lag exceeded threshold",
    "Query execution time exceeded 30s",
]

MCP_SIGNALS = [
    "MCP Host unreachable",
    "MCP context window overflow",
    "MCP tool call timeout",
    "MCP response parsing failed",
]

async def send_signal(client, component_id, component_type, error_message):
    try:
        response = await client.post(f"{BASE_URL}/signals", json={
            "component_id": component_id,
            "component_type": component_type,
            "error_message": error_message,
            "severity": "CRITICAL" if component_type == "RDBMS" else "HIGH",
            "metadata": {"source": "seed_script", "simulated": True}
        })
        return response.status_code
    except Exception as e:
        print(f"[ERROR] Failed to send signal: {e}")
        return None

async def simulate_rdbms_outage(client):
    print("\n[SEED] Simulating RDBMS outage — sending 150 signals for POSTGRES_PRIMARY...")
    tasks = []
    for i in range(150):
        error = random.choice(RDBMS_SIGNALS)
        tasks.append(send_signal(client, "POSTGRES_PRIMARY", "RDBMS", error))
        if i % 10 == 0:
            await asyncio.sleep(0.1)  # slight throttle to avoid overwhelming
    results = await asyncio.gather(*tasks)
    success = results.count(200)
    print(f"[SEED] RDBMS outage simulation complete — {success}/150 signals accepted")

async def simulate_mcp_failure(client):
    print("\n[SEED] Simulating MCP Host failure — sending 50 signals for MCP_HOST_01...")
    success = 0
    for i in range(50):
        error = random.choice(MCP_SIGNALS)
        status = await send_signal(client, "MCP_HOST_01", "MCP", error)
        if status == 200:
            success += 1
        await asyncio.sleep(0.05)
    print(f"[SEED] MCP failure simulation complete — {success}/50 signals accepted")

async def main():
    print("=" * 50)
    print("  IMS Seed Script — Failure Event Simulator")
    print("=" * 50)

    async with httpx.AsyncClient(timeout=30.0) as client:
        # Check backend is reachable
        try:
            res = await client.get("http://localhost:8000/health")
            health = res.json()
            print(f"\n[SEED] Backend health: {health['status']}")
        except Exception:
            print("[ERROR] Backend is not reachable. Make sure it is running.")
            return

        # Simulate RDBMS outage
        await simulate_rdbms_outage(client)

        # Wait 15 seconds so debounce TTL expires before MCP simulation
        print("\n[SEED] Waiting 12 seconds for debounce TTL to reset...")
        await asyncio.sleep(12)

        # Simulate MCP failure
        await simulate_mcp_failure(client)

        # Summary
        print("\n[SEED] Fetching created incidents...")
        res = await client.get(f"{BASE_URL}/incidents")
        incidents = res.json()
        print(f"\n{'='*50}")
        print(f"  {len(incidents)} Work Item(s) created:")
        for inc in incidents:
            print(f"  [{inc['priority']}] {inc['component_id']} — {inc['status']} — {inc['signal_count']} signals")
        print("=" * 50)

if __name__ == "__main__":
    asyncio.run(main())