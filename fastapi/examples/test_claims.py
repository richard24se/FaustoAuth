import asyncio
import httpx
import logging
import jwt

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

BASE_URL = "http://localhost:9024"
USERNAME = "test@faustoauth.app"
PASSWORD = "1234567" 

async def main():
    async with httpx.AsyncClient(base_url=BASE_URL) as client:
        # 1. Login to get enriched Token
        logging.info("--- 1. Login to get Enriched Token ---")
        login_response = await client.post(
            "/auth/login",
            json={"username": USERNAME, "password": PASSWORD}
        )
        
        if login_response.status_code != 200:
            logging.error(f"Login failed: {login_response.text}")
            return

        data = login_response.json()["data"]
        access_token = data["access_token"]
        
        # 2. Decode token to verify new claims
        logging.info("\n--- 2. Inspect Token Claims ---")
        # specific secret/algo don't matter just for decoding payload to see
        decoded = jwt.decode(access_token, options={"verify_signature": False})
        
        logging.info(f"Full Decoded Payload: {decoded}")
        
        logging.info("\n--- 3. Verifying Specific Claims ---")
        claims_to_check = ["sub", "tenant_id", "role", "name"]
        for claim in claims_to_check:
            val = decoded.get(claim)
            status = "OK" if val is not None else "MISSING"
            logging.info(f"Claim '{claim}': {val} [{status}]")

if __name__ == "__main__":
    asyncio.run(main())
