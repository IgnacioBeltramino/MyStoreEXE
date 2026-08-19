from tests.conftest import PASSWORD


def test_login_ok(client, headers):
    r = client.post(
        "/auth/login",
        json={"email": "admin@tienda-a.com", "password": PASSWORD},
        headers=headers("tienda-a.test", authenticated=False),
    )
    assert r.status_code == 200
    assert r.json()["token_type"] == "bearer"


def test_admin_no_entra_por_el_dominio_de_otro_tenant(client, headers):
    r = client.post(
        "/auth/login",
        json={"email": "admin@tienda-a.com", "password": PASSWORD},
        headers=headers("tienda-b.test", authenticated=False),
    )
    assert r.status_code == 401


def test_password_incorrecta(client, headers):
    r = client.post(
        "/auth/login",
        json={"email": "admin@tienda-a.com", "password": "mala"},
        headers=headers("tienda-a.test", authenticated=False),
    )
    assert r.status_code == 401


def test_dominio_desconocido(client, headers):
    r = client.post(
        "/auth/login",
        json={"email": "admin@tienda-a.com", "password": PASSWORD},
        headers=headers("nope.test", authenticated=False),
    )
    assert r.status_code == 404


def test_token_de_un_tenant_no_sirve_en_otro(client, headers):
    token = headers("tienda-b.test")["Authorization"]
    r = client.get("/admin/products", headers={"Host": "tienda-a.test", "Authorization": token})
    assert r.status_code == 401


def test_sin_token(client, headers):
    r = client.get("/admin/products", headers=headers("tienda-a.test", authenticated=False))
    assert r.status_code == 401
