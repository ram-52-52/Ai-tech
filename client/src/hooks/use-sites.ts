import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import type { ExternalSite, InsertExternalSite, ScheduledPost, InsertScheduledPost } from "@shared/schema";
import { 
  handleGetExternalSites, 
  handleCreateSite, 
  handleUpdateSite, 
  handleDeleteSite, 
  handleGetScheduledPosts, 
  handleCreateScheduledPost, 
  handleDeleteScheduledPost 
} from "@/services/api/settingsAPI";

export function useSites() {
  return useQuery<ExternalSite[]>({
    queryKey: [api.externalSites.list.path],
    queryFn: async () => {
      const res = await handleGetExternalSites();
      if (!res.success) throw new Error(res.error || "Failed to fetch sites");
      return res.data;
    },
  });
}

export function useCreateSite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertExternalSite) => {
      const res = await handleCreateSite(data);
      if (!res.success) throw new Error(res.error || "Failed to create site");
      return res.data as ExternalSite;
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
      const res = await handleUpdateSite(id, data);
      if (!res.success) throw new Error(res.error || "Failed to update site");
      return res.data as ExternalSite;
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
      const res = await handleDeleteSite(id);
      if (!res.success) throw new Error(res.error || "Failed to delete site");
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
      const res = await handleGetScheduledPosts();
      if (!res.success) throw new Error(res.error || "Failed to fetch scheduled posts");
      return res.data;
    },
  });
}

export function useCreateScheduledPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertScheduledPost) => {
      const res = await handleCreateScheduledPost(data);
      if (!res.success) throw new Error(res.error || "Failed to schedule post");
      return res.data as ScheduledPost;
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
      const res = await handleDeleteScheduledPost(id);
      if (!res.success) throw new Error(res.error || "Failed to delete scheduled post");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.scheduledPosts.list.path] });
    },
  });
}
