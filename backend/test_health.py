import asyncio
import httpx

async def test():
    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            res = await client.get("http://localhost:5175/health")
            print(f"Health Status: {res.status_code}")
            print(f"Health Data: {res.json()}")
        except Exception as e:
            print(f"Health Error: {e}")

if __name__ == "__main__":
    asyncio.run(test())
