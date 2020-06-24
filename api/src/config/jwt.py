import os
from dotenv import load_dotenv


load_dotenv()
load_dotenv(verbose=True, dotenv_path='.env')

JWT_KEY = os.getenv("JWT_KEY",'super-secret')