import asyncio
import httpx
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

BASE_URL = "http://localhost:9024"
USERNAME = "test@faustoauth.app"
PASSWORD = "1234567"  # Ensure this matches your local admin password

async def main():
    async with httpx.AsyncClient(base_url=BASE_URL) as client:
        logging.info("--- 1. Login ---")
        login_response = await client.post(
            "/auth/login",
            json={"username": USERNAME, "password": PASSWORD},
            params={"refresh": True}
        )
        
        if login_response.status_code != 200:
            logging.error(f"Login failed: {login_response.text}")
            return

        data = login_response.json()["data"]
        access_token = data["access_token"]
        refresh_token = data["refresh_token"]
        logging.info(f"Got Access Token: {access_token[:20]}...")
        logging.info(f"Got Refresh Token: {refresh_token[:20]}...")

        # Set auth header
        headers = {"Authorization": f"Bearer {access_token}"}

        logging.info("\n--- 2. Validate Token ---")
        validate_response = await client.get("/auth/token/validate", headers=headers)
        logging.info(f"Validation Response: {validate_response.json()}")

        logging.info("\n--- 3. Refresh Token ---")
        refresh_response = await client.post(
            "/auth/token/refresh", 
            headers={"Authorization": f"Bearer {refresh_token}"}
        )
        if refresh_response.status_code == 200:
            new_access_token = refresh_response.json()["data"]["access_token"]
            logging.info(f"Refreshed Access Token: {new_access_token[:20]}...")
        else:
            logging.error(f"Refresh failed: {refresh_response.text}")

        logging.info("\n--- 4. Logout ---")
        logout_response = await client.post("/auth/logout", headers=headers)
        logging.info(f"Logout Response: {logout_response.json()}")
        
        # Verify logout (Validation should fail)
        logging.info("\n--- 5. Verify Logout (Expect Failure) ---")
        val_fail = await client.get("/auth/token/validate", headers=headers)
        logging.info(f"Validation after logout (Status {val_fail.status_code}): {val_fail.json()}")

if __name__ == "__main__":
    asyncio.run(main())
