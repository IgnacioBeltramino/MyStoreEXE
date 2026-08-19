import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { statsKey } from "@/hooks/useStats";
import type { Category } from "@/lib/types";

export const categoriesKey = ["categories"] as const;

export interface CategoryInput {
  name: string;
  description: string | null;
  sort_order: number;
}

export function useCategories() {
  return useQuery({
    queryKey: categoriesKey,
    queryFn: async () => (await api.get<Category[]>("/admin/categories")).data,
  });
}

/** Refresca el listado y los contadores del dashboard tras cada cambio. */
function useInvalidar() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: categoriesKey });
    qc.invalidateQueries({ queryKey: statsKey });
  };
}

export function useCreateCategory() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: async (data: CategoryInput) =>
      (await api.post<Category>("/admin/categories", data)).data,
    onSuccess: invalidar,
  });
}

export function useUpdateCategory() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: async ({ id, ...data }: CategoryInput & { id: number }) =>
      (await api.put<Category>(`/admin/categories/${id}`, data)).data,
    onSuccess: invalidar,
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/categories/${id}`);
    },
    onSuccess: () => {
      invalidar();
      // Un producto puede quedar apuntando a la categoria dada de baja.
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
