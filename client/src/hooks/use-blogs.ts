import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertBlog, type Blog, type Trend } from "@shared/schema";
import { z } from "zod";

// ============================================
// BLOG HOOKS
// ============================================

export function useBlogs() {
  return useQuery({
    queryKey: [api.blogs.list.path],
    queryFn: async () => {
      const res = await fetch(api.blogs.list.path);
      if (!res.ok) throw new Error("Failed to fetch blogs");
      return api.blogs.list.responses[200].parse(await res.json());
    },
  });
}

export function useBlog(id: number) {
  return useQuery({
    queryKey: [api.blogs.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.blogs.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch blog");
      return api.blogs.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateBlog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertBlog) => {
      const validated = api.blogs.create.input.parse(data);
      const res = await fetch(api.blogs.create.path, {
        method: api.blogs.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });
      if (!res.ok) {
        if (res.status === 400) throw new Error("Validation failed");
        throw new Error("Failed to create blog");
      }
      return api.blogs.create.responses[201].parse(await res.json());
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
      const validated = api.blogs.update.input.parse(updates);
      const url = buildUrl(api.blogs.update.path, { id });
      const res = await fetch(url, {
        method: api.blogs.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });
      if (!res.ok) throw new Error("Failed to update blog");
      return api.blogs.update.responses[200].parse(await res.json());
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
      const url = buildUrl(api.blogs.delete.path, { id });
      const res = await fetch(url, { method: api.blogs.delete.method });
      if (!res.ok) throw new Error("Failed to delete blog");
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
      const validated = api.blogs.generate.input.parse(data);
      const res = await fetch(api.blogs.generate.path, {
        method: api.blogs.generate.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });
      if (!res.ok) throw new Error("Failed to generate blog");
      return api.blogs.generate.responses[201].parse(await res.json());
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
      const res = await fetch(api.trends.list.path);
      if (!res.ok) throw new Error("Failed to fetch trends");
      return api.trends.list.responses[200].parse(await res.json());
    },
  });
}

export function useRefreshTrends() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.trends.refresh.path, { method: api.trends.refresh.method });
      if (!res.ok) throw new Error("Failed to refresh trends");
      return api.trends.refresh.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.trends.list.path] });
    },
  });
}
