/** Espejo de los schemas de Pydantic en backend/app/schemas/admin.py */

export interface StoreProfile {
  id: number;
  tenant_id: number;
  business_name: string;
  description: string | null;
  phone: string | null;
  address: string | null;
  logo_url: string | null;
}

export type StoreProfileInput = Omit<StoreProfile, "id" | "tenant_id">;

export interface Category {
  id: number;
  tenant_id: number;
  name: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface Product {
  id: number;
  tenant_id: number;
  category_id: number | null;
  name: string;
  /** El backend serializa Numeric(10,2) como string para no perder precision. */
  price: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface Stats {
  active_products: number;
  active_categories: number;
  uncategorized_products: number;
  profile_complete: boolean;
  store_name: string | null;
}
