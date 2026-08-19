def test_stats_vacio(client, headers):
    r = client.get("/admin/stats", headers=headers("tienda-a.test"))
    assert r.status_code == 200
    assert r.json() == {
        "active_products": 0,
        "active_categories": 0,
        "uncategorized_products": 0,
        "profile_complete": False,
        "store_name": None,
    }


def test_stats_cuenta_solo_lo_activo(client, headers):
    h = headers("tienda-a.test")
    cat = client.post("/admin/categories", json={"name": "Ropa"}, headers=h).json()
    client.post("/admin/products", json={"name": "Remera", "price": "100", "category_id": cat["id"]}, headers=h)
    client.post("/admin/products", json={"name": "Suelto", "price": "50"}, headers=h)
    borrado = client.post("/admin/products", json={"name": "Borrado", "price": "10"}, headers=h).json()
    client.delete(f"/admin/products/{borrado['id']}", headers=h)

    s = client.get("/admin/stats", headers=h).json()
    assert s["active_products"] == 2          # el borrado no cuenta
    assert s["active_categories"] == 1
    assert s["uncategorized_products"] == 1   # "Suelto"


def test_stats_no_mezcla_tenants(client, headers):
    client.post("/admin/categories", json={"name": "De B"}, headers=headers("tienda-b.test"))
    assert client.get("/admin/stats", headers=headers("tienda-a.test")).json()["active_categories"] == 0
    assert client.get("/admin/stats", headers=headers("tienda-b.test")).json()["active_categories"] == 1


def test_profile_complete_requiere_nombre_y_descripcion(client, headers):
    h = headers("tienda-a.test")
    client.put("/admin/profile", json={"business_name": "Mi Tienda"}, headers=h)
    s = client.get("/admin/stats", headers=h).json()
    assert s["store_name"] == "Mi Tienda"
    assert s["profile_complete"] is False

    client.put("/admin/profile", json={"business_name": "Mi Tienda", "description": "Vendemos ropa"}, headers=h)
    assert client.get("/admin/stats", headers=h).json()["profile_complete"] is True


def test_stats_requiere_auth(client, headers):
    assert client.get("/admin/stats", headers=headers("tienda-a.test", authenticated=False)).status_code == 401
