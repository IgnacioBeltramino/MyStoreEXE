import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Stats } from "@/lib/types";

export const statsKey = ["stats"] as const;

export function useStats() {
  return useQuery({
    queryKey: statsKey,
    queryFn: async () => (await api.get<Stats>("/admin/stats")).data,
  });
}
