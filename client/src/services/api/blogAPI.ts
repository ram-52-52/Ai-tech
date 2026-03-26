import { axiosInstance, handleApiCall, ApiResponse } from "../../helper/apiFunction";
import { API_ENDPOINTS } from "../../constants/apiConstants";

export async function handleGetBlogs(): Promise<ApiResponse> {
  return handleApiCall(() => axiosInstance.get(API_ENDPOINTS.BLOG.BASE));
}

export async function handleGetBlogById(id: string | number): Promise<ApiResponse> {
  return handleApiCall(() => axiosInstance.get(API_ENDPOINTS.BLOG.BY_ID(id)));
}

export async function handleGetBlogView(id: string | number): Promise<ApiResponse> {
  return handleApiCall(() => axiosInstance.get(API_ENDPOINTS.BLOG.VIEW_BY_ID(id)));
}

export async function handleCreateBlog(data: any): Promise<ApiResponse> {
  return handleApiCall(() => axiosInstance.post(API_ENDPOINTS.BLOG.BASE, data));
}

export async function handleUpdateBlog(id: string | number, data: any): Promise<ApiResponse> {
  return handleApiCall(() => axiosInstance.put(API_ENDPOINTS.BLOG.BY_ID(id), data));
}

export async function handleDeleteBlog(id: string | number): Promise<ApiResponse> {
  return handleApiCall(() => axiosInstance.delete(API_ENDPOINTS.BLOG.BY_ID(id)));
}

export async function handleGenerateBlog(data: any): Promise<ApiResponse> {
  return handleApiCall(() => axiosInstance.post(API_ENDPOINTS.BLOG.GENERATE, data));
}

export async function handleGetTrends(): Promise<ApiResponse> {
  return handleApiCall(() => axiosInstance.get(API_ENDPOINTS.TRENDS.GET));
}

export async function handleRefreshTrends(): Promise<ApiResponse> {
  return handleApiCall(() => axiosInstance.post(API_ENDPOINTS.TRENDS.REFRESH));
}

export async function handleRegenerateImage(id: string | number, title: string): Promise<ApiResponse> {
  return handleApiCall(() => axiosInstance.post(API_ENDPOINTS.BLOG.REGENERATE_IMAGE(id), { title }));
}

export async function handleRegenerateFull(id: string | number, title: string): Promise<ApiResponse> {
  return handleApiCall(() => axiosInstance.post(API_ENDPOINTS.BLOG.REGENERATE_FULL(id), { title }));
}
