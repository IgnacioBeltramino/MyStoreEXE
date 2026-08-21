"""Cubre la ficha tecnica y la galeria de fotos.

Los dos son listas que se mandan enteras en cada alta o edicion, asi que lo
importante es que el orden se respete y que reemplazar la lista no deje
huerfanos ni borre lo que no se toco.
"""
AUTO = {
    "name": "Corolla XEI 2019",
    "price": "18500000.00",
    "attributes": [
        {"label": "Año", "value": "2019"},
        {"label": "Kilometros", "value": "80.000"},
        {"label": "Combustible", "value": "Nafta"},
    ],
    "images": [
        {"url": "https://ejemplo.com/frente.jpg", "alt": "Frente"},
        {"url": "https://ejemplo.com/interior.jpg"},
        {"url": "https://ejemplo.com/motor.jpg"},
    ],
}


def crear_auto(client, headers, **cambios):
    body = {**AUTO, **cambios}
    r = client.post("/admin/products", json=body, headers=headers("tienda-a.test"))
    assert r.status_code == 201, r.text
    return r.json()


def test_se_guardan_ficha_y_galeria(client, headers):
    auto = crear_auto(client, headers)
    assert [a["label"] for a in auto["attributes"]] == ["Año", "Kilometros", "Combustible"]
    assert len(auto["images"]) == 3


def test_el_orden_de_la_galeria_se_respeta(client, headers):
    """La portada es la primera foto, asi que el orden no es un detalle."""
    auto = crear_auto(client, headers)
    assert [i["sort_order"] for i in auto["images"]] == [0, 1, 2]
    assert auto["images"][0]["url"].endswith("frente.jpg")
    assert auto["images"][0]["alt"] == "Frente"
    assert auto["images"][1]["alt"] is None


def test_un_producto_sin_ficha_ni_fotos_es_valido(client, headers):
    r = client.post(
        "/admin/products",
        json={"name": "Simple", "price": "100.00"},
        headers=headers("tienda-a.test"),
    )
    assert r.status_code == 201
    assert r.json()["attributes"] == []
    assert r.json()["images"] == []


def test_reemplazar_la_galeria_borra_las_fotos_viejas(client, headers):
    auto = crear_auto(client, headers)
    r = client.put(
        f"/admin/products/{auto['id']}",
        json={"images": [{"url": "https://ejemplo.com/nueva.jpg"}]},
        headers=headers("tienda-a.test"),
    )
    assert r.status_code == 200
    assert len(r.json()["images"]) == 1
    assert r.json()["images"][0]["url"].endswith("nueva.jpg")


def test_editar_el_precio_no_toca_la_galeria(client, headers):
    """Un PUT parcial no tiene por que borrar las fotos que no se mencionaron."""
    auto = crear_auto(client, headers)
    r = client.put(
        f"/admin/products/{auto['id']}",
        json={"price": "17000000.00"},
        headers=headers("tienda-a.test"),
    )
    assert r.status_code == 200
    assert len(r.json()["images"]) == 3
    assert len(r.json()["attributes"]) == 3


def test_se_puede_vaciar_la_galeria_mandando_lista_vacia(client, headers):
    auto = crear_auto(client, headers)
    r = client.put(
        f"/admin/products/{auto['id']}",
        json={"images": []},
        headers=headers("tienda-a.test"),
    )
    assert r.status_code == 200
    assert r.json()["images"] == []


def test_la_ficha_rechaza_filas_vacias(client, headers):
    r = client.post(
        "/admin/products",
        json={"name": "X", "price": "1.00", "attributes": [{"label": "", "value": "2019"}]},
        headers=headers("tienda-a.test"),
    )
    assert r.status_code == 422


def test_la_tienda_publica_muestra_ficha_y_fotos(client, headers):
    crear_auto(client, headers)
    publicado = client.get("/store/products", headers={"Host": "tienda-a.test"}).json()[0]
    assert [a["value"] for a in publicado["attributes"]] == ["2019", "80.000", "Nafta"]
    assert publicado["images"][0]["url"].endswith("frente.jpg")
    # Sigue sin filtrar nada interno.
    assert "tenant_id" not in publicado
    assert "is_active" not in publicado


def test_el_whatsapp_llega_a_la_tienda_publica(client, headers):
    client.put(
        "/admin/profile",
        json={"business_name": "Concesionaria", "whatsapp": "5491155555555"},
        headers=headers("tienda-a.test"),
    )
    perfil = client.get("/store/profile", headers={"Host": "tienda-a.test"}).json()
    assert perfil["whatsapp"] == "5491155555555"
