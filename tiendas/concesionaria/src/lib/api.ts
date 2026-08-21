/**
 * Cliente de la API publica.
 *
 * Las rutas son relativas a proposito: en dev las toma el proxy de Vite y en
 * produccion las sirve nginx desde el mismo dominio. En los dos casos el
 * backend recibe el Host de la tienda y resuelve el tenant solo, asi que el
 * front no tiene que saber a que tienda pertenece.
 */

export type Attribute = {
  label: string;
  value: string;
};

export type Image = {
  url: string;
  alt: string | null;
};

export type Producto = {
  id: number;
  category_id: number | null;
  name: string;
  description: string | null;
  price: string;
  sort_order: number;
  attributes: Attribute[];
  images: Image[];
};

export type Categoria = {
  id: number;
  name: string;
  description: string | null;
  sort_order: number;
};

export type Perfil = {
  business_name: string;
  description: string | null;
  phone: string | null;
  address: string | null;
  logo_url: string | null;
  whatsapp: string | null;
};

async function pedir<T>(ruta: string): Promise<T> {
  const r = await fetch(ruta, { headers: { Accept: "application/json" } });
  if (!r.ok) {
    throw new Error(`${ruta} respondio ${r.status}`);
  }
  return r.json() as Promise<T>;
}

export const api = {
  // El perfil puede no estar cargado todavia (404) y la tienda igual tiene que
  // abrir, asi que ese caso se trata como "sin datos" y no como error.
  perfil: () => pedir<Perfil>("/store/profile").catch(() => null),
  categorias: () => pedir<Categoria[]>("/store/categories"),
  productos: () => pedir<Producto[]>("/store/products"),
};
