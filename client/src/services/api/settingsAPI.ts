import { axiosInstance, handleApiCall, ApiResponse } from "../../helper/apiFunction";
import { API_ENDPOINTS } from "../../constants/apiConstants";

export async function handleGetExternalSites(): Promise<ApiResponse> {
  return handleApiCall(() => axiosInstance.get(API_ENDPOINTS.SETTINGS.EXTERNAL_SITES));
}

export async function handleCreateSite(data: any): Promise<ApiResponse> {
  return handleApiCall(() => axiosInstance.post(API_ENDPOINTS.SETTINGS.EXTERNAL_SITES, data));
}

export async function handleUpdateSite(id: string | number, data: any): Promise<ApiResponse> {
  return handleApiCall(() => axiosInstance.put(API_ENDPOINTS.SETTINGS.EXTERNAL_SITES_CRUD(id), data));
}

export async function handleDeleteSite(id: string | number): Promise<ApiResponse> {
  return handleApiCall(() => axiosInstance.delete(API_ENDPOINTS.SETTINGS.EXTERNAL_SITES_CRUD(id)));
}

export async function handleGetScheduledPosts(): Promise<ApiResponse> {
  return handleApiCall(() => axiosInstance.get(API_ENDPOINTS.SETTINGS.SCHEDULE_POST));
}

export async function handleCreateScheduledPost(data: any): Promise<ApiResponse> {
  return handleApiCall(() => axiosInstance.post(API_ENDPOINTS.SETTINGS.SCHEDULE_POST, data));
}

export async function handleDeleteScheduledPost(id: string | number): Promise<ApiResponse> {
  return handleApiCall(() => axiosInstance.delete(API_ENDPOINTS.SETTINGS.SCHEDULE_POST_CRUD(id)));
}

export async function handleTestConnection(id: string | number): Promise<ApiResponse> {
  return handleApiCall(() => axiosInstance.post(API_ENDPOINTS.SETTINGS.TEST_CONNECTION(id)));
}
