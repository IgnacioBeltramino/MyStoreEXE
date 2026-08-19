from datetime import datetime, timezone

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


def utcnow() -> datetime:
    """Reemplazo de datetime.utcnow(), deprecado desde Python 3.12.

    utcnow() devolvia un datetime *naive* (sin zona), asi que comparar contra
    un datetime *aware* -como el exp de los JWT- lanzaba TypeError.
    """
    return datetime.now(timezone.utc)
