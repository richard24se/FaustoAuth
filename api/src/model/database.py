from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker


def createConnectionDB(conf):
    engine = create_engine(
        "postgresql://"
        + conf["user"]
        + ":"
        + conf["pass"]
        + "@"
        + conf["host"]
        + ":"
        + conf["port"]
        + "/"
        + conf["dbname"],
        pool_size=3000,
        max_overflow=1,
    )
    session_factory = sessionmaker(bind=engine)
    Session = scoped_session(session_factory)
    return Session
