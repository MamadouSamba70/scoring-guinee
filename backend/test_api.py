import asyncio
import httpx

async def test():
    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            # Login
            login_res = await client.post("http://127.0.0.1:8000/api/v1/auth/login", json={
                "identifier": "admin@scoring-guinee.gn",
                "password": "Admin2024!"
            })
            print(f"Login Status: {login_res.status_code}")
            if login_res.status_code != 200:
                print(f"Login Error: {login_res.text}")
                return
            token = login_res.json()["access_token"]
            print(f"Token OK: {token[:30]}...")

            # History
            history_res = await client.get(
                "http://127.0.0.1:8000/api/v1/scoring/history",
                headers={"Authorization": f"Bearer {token}"}
            )
            print(f"History Status: {history_res.status_code}")
            data = history_res.json()
            print(f"History Count: {len(data) if isinstance(data, list) else data}")
            if isinstance(data, list) and len(data) > 0:
                print(f"First item: {data[0]}")
        except Exception as e:
            print(f"Error: {type(e).__name__}: {e}")

if __name__ == "__main__":
    asyncio.run(test())
