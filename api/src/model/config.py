from .database import createConnectionDB
from config.databases import *

# conf = {
#     'user': BP_USER,
#     'pass': BP_PASS,
#     'host': BP_HOST,
#     'port': BP_PORT,
#     'dbname': BP_DB
# }
conf = {
    'user': 'root',
    'pass': 'faustoauthdb24$',
    'host': 'auth_db_postgres',
    'port': '5432',
    'dbname': 'Fausto'
}
SQLALCH_AUTH = createConnectionDB(conf)