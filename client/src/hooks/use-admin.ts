import { useQuery } from "@tanstack/react-query";
import { handleGetGlobalStats } from "@/services/api/superAdminAPI";
import { API_ENDPOINTS } from "@/constants/apiConstants";

export function useGlobalStats(enabled = true) {
  return useQuery({
    queryKey: [API_ENDPOINTS.ADMIN.GLOBAL_STATS],
    queryFn: async () => {
      const res = await handleGetGlobalStats();
      if (!res.success) throw new Error(res.error || "Failed to fetch global stats");
      return res.data;
    },
    enabled
  });
}
