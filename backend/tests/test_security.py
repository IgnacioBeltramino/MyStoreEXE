from datetime import datetime, timezone

from app.core.security import create_access_token, decode_access_token, hash_password, verify_password
from app.models.base import utcnow


def test_hash_y_verify():
    h = hash_password("hola")
    assert verify_password("hola", h)
    assert not verify_password("chau", h)


def test_password_larga_no_explota():
    """bcrypt >= 4 lanza ValueError con mas de 72 bytes si no se trunca."""
    larga = "x" * 200
    assert verify_password(larga, hash_password(larga))


def test_hash_invalido_devuelve_false():
    assert not verify_password("hola", "no-es-un-hash")


def test_token_ida_y_vuelta():
    assert decode_access_token(create_access_token(42)) == 42


def test_token_basura():
    assert decode_access_token("no.es.un.token") is None


def test_utcnow_es_aware():
    ahora = utcnow()
    assert ahora.tzinfo is not None
    assert abs((datetime.now(timezone.utc) - ahora).total_seconds()) < 5
