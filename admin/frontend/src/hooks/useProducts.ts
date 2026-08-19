import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { statsKey } from "@/hooks/useStats";
import type { Product } from "@/lib/types";

export const productsKey = ["products"] as const;

export interface ProductInput {
  name: string;
  description: string | null;
  price: string;
  category_id: number | null;
  image_url: string | null;
  sort_order: number;
}

export function useProducts(categoryId: number | null) {
  return useQuery({
    queryKey: [...productsKey, { categoryId }],
    queryFn: async () => {
      const params = categoryId === null ? undefined : { category_id: categoryId };
      return (await api.get<Product[]>("/admin/products", { params })).data;
    },
  });
}

function useInvalidar() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: productsKey });
    qc.invalidateQueries({ queryKey: statsKey });
  };
}

export function useCreateProduct() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: async (data: ProductInput) => (await api.post<Product>("/admin/products", data)).data,
    onSuccess: invalidar,
  });
}

export function useUpdateProduct() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: async ({ id, ...data }: ProductInput & { id: number }) =>
      (await api.put<Product>(`/admin/products/${id}`, data)).data,
    onSuccess: invalidar,
  });
}

export function useDeleteProduct() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/products/${id}`);
    },
    onSuccess: invalidar,
  });
}
