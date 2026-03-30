import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type InsertBlog } from "@shared/schema";
import { 
  handleGetBlogs, 
  handleGetBlogById, 
  handleCreateBlog, 
  handleUpdateBlog, 
  handleDeleteBlog, 
  handleGenerateBlog, 
  handleGetTrends, 
  handleRefreshTrends 
} from "@/services/api/blogAPI";

// ============================================
// BLOG HOOKS
// ============================================

export function useBlogs() {
  return useQuery({
    queryKey: [api.blogs.list.path],
    queryFn: async () => {
      const res = await handleGetBlogs();
      if (!res.success) throw new Error(res.error || "Failed to fetch blogs");
      return api.blogs.list.responses[200].parse(res.data);
    },
  });
}

export function useBlog(id: number) {
  return useQuery({
    queryKey: [api.blogs.get.path, id],
    queryFn: async () => {
      const res = await handleGetBlogById(id);
      if (res.error?.includes("404")) return null;
      if (!res.success) throw new Error(res.error || "Failed to fetch blog");
      return api.blogs.get.responses[200].parse(res.data);
    },
    enabled: !!id,
  });
}

export function useCreateBlog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertBlog) => {
      // Bypassing strict Zod parse to prevent string/Date ISO format collisions
      const res = await handleCreateBlog(data);
      if (!res.success) throw new Error(res.error || "Failed to create blog");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.blogs.list.path] });
    },
  });
}

export function useUpdateBlog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertBlog>) => {
      // Bypassing strict Zod parse to prevent string/Date ISO format collisions
      // e.g. scheduledAt string from an input field
      const res = await handleUpdateBlog(id, updates);
      if (!res.success) throw new Error(res.error || "Failed to update blog");
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.blogs.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.blogs.get.path, variables.id] });
    },
  });
}

export function useDeleteBlog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await handleDeleteBlog(id);
      if (!res.success) throw new Error(res.error || "Failed to delete blog");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.blogs.list.path] });
    },
  });
}

export function useGenerateBlog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { topic?: string } = {}) => {
      const res = await handleGenerateBlog(data);
      if (!res.success) throw new Error(res.error || "Failed to generate blog");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.blogs.list.path] });
    },
  });
}

// ============================================
// TREND HOOKS
// ============================================

export function useTrends() {
  return useQuery({
    queryKey: [api.trends.list.path],
    queryFn: async () => {
      const res = await handleGetTrends();
      if (!res.success) throw new Error(res.error || "Failed to fetch trends");
      return api.trends.list.responses[200].parse(res.data);
    },
  });
}

export function useRefreshTrends() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await handleRefreshTrends();
      if (!res.success) throw new Error(res.error || "Failed to refresh trends");
      return api.trends.refresh.responses[200].parse(res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.trends.list.path] });
    },
  });
}
