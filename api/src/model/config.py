from .database import createConnectionDB
from config.databases import *

conf = {
    'user': BP_USER,
    'pass': BP_PASS,
    'host': BP_HOST,
    'port': BP_PORT,
    'dbname': BP_DB
}
SQLACL_BALLOTPAPER = createConnectionDB(conf)