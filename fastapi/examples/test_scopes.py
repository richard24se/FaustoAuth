import asyncio
import httpx
import logging
import jwt

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

BASE_URL = "http://localhost:9024"
# Using the test user created/modified earlier
USERNAME = "test@faustoauth.app"
PASSWORD = "1234567" 

async def main():
    async with httpx.AsyncClient(base_url=BASE_URL) as client:
        # 1. Login to get token with scopes
        logging.info("--- 1. Login to get Scoped Token ---")
        login_response = await client.post(
            "/auth/login",
            json={"username": USERNAME, "password": PASSWORD}
        )
        
        if login_response.status_code != 200:
            logging.error(f"Login failed: {login_response.text}")
            return

        data = login_response.json()["data"]
        access_token = data["access_token"]
        
        # 2. Decode token to verify 'scope' claim
        logging.info("\n--- 2. Inspect Token Scopes ---")
        # specific secret/algo don't matter just for decoding payload to see
        decoded = jwt.decode(access_token, options={"verify_signature": False})
        logging.info(f"Full Decoded Payload: {decoded}")
        logging.info(f"Raw Scope Claim: '{decoded.get('scope')}'")
        
        # 3. Test a protected endpoint (e.g. User List)
        # Note: We need to know what permissions 'test@faustoauth.app' has.
        # Assuming it has generic user permissions.
        logging.info("\n--- 3. Test Protected Endpoint ---")
        headers = {"Authorization": f"Bearer {access_token}"}
        resp = await client.get("/user/", headers=headers)
        logging.info(f"Response ({resp.status_code}): {resp.json().get('message')}")

if __name__ == "__main__":
    asyncio.run(main())
