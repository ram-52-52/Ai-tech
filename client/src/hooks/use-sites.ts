import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { api } from "@shared/routes";
import type { ExternalSite, InsertExternalSite, ScheduledPost, InsertScheduledPost } from "@shared/schema";

export function useSites() {
  return useQuery<ExternalSite[]>({
    queryKey: [api.externalSites.list.path],
    queryFn: async () => {
      const res = await apiRequest("GET", api.externalSites.list.path);
      return res.json();
    },
  });
}

export function useCreateSite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertExternalSite) => {
      const res = await apiRequest("POST", api.externalSites.create.path, data);
      return res.json() as Promise<ExternalSite>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.externalSites.list.path] });
    },
  });
}

export function useUpdateSite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertExternalSite> }) => {
      const res = await apiRequest(
        "PUT",
        api.externalSites.update.path.replace(":id", String(id)),
        data
      );
      return res.json() as Promise<ExternalSite>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.externalSites.list.path] });
    },
  });
}

export function useDeleteSite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", api.externalSites.delete.path.replace(":id", String(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.externalSites.list.path] });
    },
  });
}

export function useScheduledPosts() {
  return useQuery<ScheduledPost[]>({
    queryKey: [api.scheduledPosts.list.path],
    queryFn: async () => {
      const res = await apiRequest("GET", api.scheduledPosts.list.path);
      return res.json();
    },
  });
}

export function useCreateScheduledPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertScheduledPost) => {
      const res = await apiRequest("POST", api.scheduledPosts.create.path, data);
      return res.json() as Promise<ScheduledPost>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.scheduledPosts.list.path] });
    },
  });
}

export function useDeleteScheduledPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", api.scheduledPosts.delete.path.replace(":id", String(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.scheduledPosts.list.path] });
    },
  });
}
