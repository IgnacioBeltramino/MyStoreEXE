"""Cubre la tienda publica: que entre sin login, que no filtre datos de otra
tienda y que nunca muestre lo dado de baja."""
import pytest


@pytest.fixture
def catalogo(client, headers):
    """Arma en tienda-a: perfil, una categoria visible, una dada de baja,
    un producto activo, uno inactivo. Y en tienda-b, lo suyo aparte."""
    a = headers("tienda-a.test")
    b = headers("tienda-b.test")

    client.put("/admin/profile", json={"business_name": "Tienda A", "phone": "1122"}, headers=a)
    client.put("/admin/profile", json={"business_name": "Tienda B"}, headers=b)

    visible = client.post("/admin/categories", json={"name": "Visible"}, headers=a).json()
    oculta = client.post("/admin/categories", json={"name": "Oculta"}, headers=a).json()

    activo = client.post(
        "/admin/products",
        json={"name": "Activo", "price": "10.00", "category_id": visible["id"]},
        headers=a,
    ).json()
    inactivo = client.post("/admin/products", json={"name": "Inactivo", "price": "20.00"}, headers=a).json()
    ajeno = client.post("/admin/products", json={"name": "De B", "price": "30.00"}, headers=b).json()

    client.delete(f"/admin/categories/{oculta['id']}", headers=a)
    client.delete(f"/admin/products/{inactivo['id']}", headers=a)

    return {"visible": visible, "oculta": oculta, "activo": activo, "inactivo": inactivo, "ajeno": ajeno}


PUBLIC = {"Host": "tienda-a.test"}


def test_los_endpoints_publicos_no_piden_login(client, catalogo):
    for path in ("/store/profile", "/store/categories", "/store/products"):
        assert client.get(path, headers=PUBLIC).status_code == 200


def test_el_perfil_no_expone_datos_internos(client, catalogo):
    body = client.get("/store/profile", headers=PUBLIC).json()
    assert body["business_name"] == "Tienda A"
    assert "tenant_id" not in body
    assert "id" not in body


def test_dominio_sin_tienda_devuelve_404(client, catalogo):
    assert client.get("/store/products", headers={"Host": "no-existe.test"}).status_code == 404


def test_tienda_sin_perfil_devuelve_404(client):
    assert client.get("/store/profile", headers=PUBLIC).status_code == 404


def test_solo_se_listan_categorias_activas(client, catalogo):
    ids = [c["id"] for c in client.get("/store/categories", headers=PUBLIC).json()]
    assert catalogo["visible"]["id"] in ids
    assert catalogo["oculta"]["id"] not in ids


def test_solo_se_listan_productos_activos_de_la_tienda(client, catalogo):
    nombres = [p["name"] for p in client.get("/store/products", headers=PUBLIC).json()]
    assert nombres == ["Activo"]


def test_los_productos_no_exponen_datos_internos(client, catalogo):
    producto = client.get("/store/products", headers=PUBLIC).json()[0]
    assert "tenant_id" not in producto
    assert "is_active" not in producto


def test_filtrar_por_categoria_propia(client, catalogo):
    r = client.get(f"/store/products?category_id={catalogo['visible']['id']}", headers=PUBLIC)
    assert r.status_code == 200
    assert [p["name"] for p in r.json()] == ["Activo"]


def test_filtrar_por_categoria_dada_de_baja_devuelve_404(client, catalogo):
    r = client.get(f"/store/products?category_id={catalogo['oculta']['id']}", headers=PUBLIC)
    assert r.status_code == 404


def test_no_se_pueden_ver_productos_por_categoria_de_otra_tienda(client, client_b_categoria):
    r = client.get(f"/store/products?category_id={client_b_categoria}", headers=PUBLIC)
    assert r.status_code == 404


@pytest.fixture
def client_b_categoria(client, headers):
    return client.post("/admin/categories", json={"name": "Solo de B"}, headers=headers("tienda-b.test")).json()["id"]
