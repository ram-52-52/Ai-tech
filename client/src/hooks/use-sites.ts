import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { api } from "@shared/routes";
import type { ExternalSite, InsertExternalSite, ScheduledPost, InsertScheduledPost } from "@shared/schema";

export function useSites() {
  return useQuery({
    queryKey: [api.externalSites.list.path],
    queryFn: async () => apiRequest<ExternalSite[]>(api.externalSites.list.path, {}),
  });
}

export function useCreateSite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertExternalSite) =>
      apiRequest<ExternalSite>(api.externalSites.create.path, { method: "POST", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.externalSites.list.path] });
    },
  });
}

export function useUpdateSite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertExternalSite> }) =>
      apiRequest<ExternalSite>(api.externalSites.update.path.replace(":id", String(id)), {
        method: "PUT",
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.externalSites.list.path] });
    },
  });
}

export function useDeleteSite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) =>
      apiRequest<void>(api.externalSites.delete.path.replace(":id", String(id)), {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.externalSites.list.path] });
    },
  });
}

export function useScheduledPosts() {
  return useQuery({
    queryKey: [api.scheduledPosts.list.path],
    queryFn: async () => apiRequest<ScheduledPost[]>(api.scheduledPosts.list.path, {}),
  });
}

export function useCreateScheduledPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertScheduledPost) =>
      apiRequest<ScheduledPost>(api.scheduledPosts.create.path, { method: "POST", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.scheduledPosts.list.path] });
    },
  });
}

export function useDeleteScheduledPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) =>
      apiRequest<void>(api.scheduledPosts.delete.path.replace(":id", String(id)), {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.scheduledPosts.list.path] });
    },
  });
}
