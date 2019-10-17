import os
from dotenv import load_dotenv


load_dotenv()
load_dotenv(verbose=True, dotenv_path='.env')

BP_USER = os.getenv("BP_USER")
BP_PASS = os.getenv("BP_PASS")
BP_HOST = os.getenv("BP_HOST")
BP_PORT = os.getenv("BP_PORT")
BP_DB = os.getenv("BP_DB")