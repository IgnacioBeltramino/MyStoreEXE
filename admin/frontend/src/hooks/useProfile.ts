import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import api from "@/lib/api";
import { statsKey } from "@/hooks/useStats";
import type { StoreProfile, StoreProfileInput } from "@/lib/types";

export const profileKey = ["profile"] as const;

export function useProfile() {
  return useQuery({
    queryKey: profileKey,
    queryFn: async () => {
      try {
        return (await api.get<StoreProfile>("/admin/profile")).data;
      } catch (error) {
        // 404 = la tienda todavia no configuro su perfil. No es un error:
        // mostramos el formulario vacio para que lo complete.
        if ((error as AxiosError).response?.status === 404) return null;
        throw error;
      }
    },
  });
}

export function useSaveProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: StoreProfileInput) =>
      (await api.put<StoreProfile>("/admin/profile", data)).data,
    onSuccess: (saved) => {
      qc.setQueryData(profileKey, saved);
      qc.invalidateQueries({ queryKey: statsKey });
    },
  });
}
