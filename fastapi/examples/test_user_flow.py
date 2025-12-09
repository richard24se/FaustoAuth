import asyncio
import httpx
import logging
import random
import string

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

BASE_URL = "http://localhost:8000"
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "adminpassword"

def random_string(length=8):
    return ''.join(random.choices(string.ascii_lowercase, k=length))

async def main():
    async with httpx.AsyncClient(base_url=BASE_URL) as client:
        # A. Login as Admin
        logging.info("--- 0. Login as Admin ---")
        login_resp = await client.post(
            "/auth/login",
            json={"username": ADMIN_USERNAME, "password": ADMIN_PASSWORD}
        )
        if login_resp.status_code != 200:
            logging.error(f"Login failed: {login_resp.text}")
            return
        
        access_token = login_resp.json()["data"]["access_token"]
        headers = {"Authorization": f"Bearer {access_token}"}

        # B. Define new user data
        new_username = f"user_{random_string()}"
        new_user = {
            "username": new_username,
            "password": "Password123!",
            "names": "Test",
            "surnames": "User",
            "id_role": 1,  # Assuming Role 1 exists (e.g. User or Admin)
            "tenant_id": 1 # Assuming Tenant 1 exists
        }

        # C. Create User
        logging.info(f"\n--- 1. Create User ({new_username}) ---")
        create_resp = await client.post("/user/", json=new_user, headers=headers)
        logging.info(f"Create Response ({create_resp.status_code}): {create_resp.json()}")
        
        if create_resp.status_code != 201:
            logging.error("Creation failed, aborting flow.")
            return
            
        user_id = create_resp.json()["data"]["id"]

        # D. Get User
        logging.info(f"\n--- 2. Get User (ID: {user_id}) ---")
        get_resp = await client.get(f"/user/{user_id}", headers=headers)
        logging.info(f"Get Response: {get_resp.json()}")

        # E. Update User
        logging.info(f"\n--- 3. Update User ---")
        update_data = {"names": "Updated Name", "surnames": "Updated Surname"}
        update_resp = await client.put(f"/user/{user_id}", json=update_data, headers=headers)
        logging.info(f"Update Response: {update_resp.json()}")

        # F. Delete User
        logging.info(f"\n--- 4. Delete User ---")
        del_resp = await client.delete(f"/user/{user_id}", headers=headers)
        logging.info(f"Delete Response: {del_resp.json()}")

        # G. Verify Deletion
        logging.info(f"\n--- 5. Verify Deletion ---")
        verify_resp = await client.get(f"/user/{user_id}", headers=headers)
        logging.info(f"Get after delete (Status {verify_resp.status_code}): {verify_resp.json()}")

if __name__ == "__main__":
    asyncio.run(main())
