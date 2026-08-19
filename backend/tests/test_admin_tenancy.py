"""Cubre los bugs de aislamiento entre tiendas y el borrado logico."""
import pytest


@pytest.fixture
def categorias(client, headers):
    a = client.post("/admin/categories", json={"name": "Cat de A"}, headers=headers("tienda-a.test")).json()
    b = client.post("/admin/categories", json={"name": "Cat de B"}, headers=headers("tienda-b.test")).json()
    return a["id"], b["id"]


def test_no_se_puede_crear_producto_con_categoria_ajena(client, headers, categorias):
    _, cat_b = categorias
    r = client.post(
        "/admin/products",
        json={"name": "Fuga", "price": "10.00", "category_id": cat_b},
        headers=headers("tienda-a.test"),
    )
    assert r.status_code == 422


def test_no_se_puede_mover_producto_a_categoria_ajena(client, headers, categorias):
    cat_a, cat_b = categorias
    prod = client.post(
        "/admin/products",
        json={"name": "Legit", "price": "99.90", "category_id": cat_a},
        headers=headers("tienda-a.test"),
    ).json()
    r = client.put(f"/admin/products/{prod['id']}", json={"category_id": cat_b}, headers=headers("tienda-a.test"))
    assert r.status_code == 422


def test_producto_sin_categoria_sigue_permitido(client, headers, categorias):
    cat_a, _ = categorias
    prod = client.post(
        "/admin/products",
        json={"name": "Legit", "price": "99.90", "category_id": cat_a},
        headers=headers("tienda-a.test"),
    ).json()
    r = client.put(f"/admin/products/{prod['id']}", json={"category_id": None}, headers=headers("tienda-a.test"))
    assert r.status_code == 200
    assert r.json()["category_id"] is None


def test_categoria_borrada_no_aparece_en_el_listado(client, headers, categorias):
    cat_a, _ = categorias
    assert client.delete(f"/admin/categories/{cat_a}", headers=headers("tienda-a.test")).status_code == 204

    visibles = client.get("/admin/categories", headers=headers("tienda-a.test")).json()
    assert all(c["id"] != cat_a for c in visibles)

    todas = client.get("/admin/categories?include_inactive=true", headers=headers("tienda-a.test")).json()
    assert any(c["id"] == cat_a and c["is_active"] is False for c in todas)


def test_producto_borrado_no_aparece_en_el_listado(client, headers):
    prod = client.post(
        "/admin/products", json={"name": "Temporal", "price": "5.00"}, headers=headers("tienda-a.test")
    ).json()
    client.delete(f"/admin/products/{prod['id']}", headers=headers("tienda-a.test"))

    visibles = client.get("/admin/products", headers=headers("tienda-a.test")).json()
    assert all(p["id"] != prod["id"] for p in visibles)

    todos = client.get("/admin/products?include_inactive=true", headers=headers("tienda-a.test")).json()
    assert any(p["id"] == prod["id"] for p in todos)


def test_cada_tienda_ve_solo_lo_suyo(client, headers, categorias):
    _, cat_b = categorias
    de_b = client.get("/admin/categories", headers=headers("tienda-b.test")).json()
    assert [c["id"] for c in de_b] == [cat_b]


def test_no_se_puede_editar_categoria_de_otra_tienda(client, headers, categorias):
    _, cat_b = categorias
    r = client.put(f"/admin/categories/{cat_b}", json={"name": "hackeada"}, headers=headers("tienda-a.test"))
    assert r.status_code == 404
