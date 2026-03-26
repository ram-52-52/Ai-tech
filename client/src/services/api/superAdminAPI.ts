import { API_ENDPOINTS } from "../../constants/apiConstants";
import { axiosInstance, handleApiCall, ApiResponse } from "../../helper/apiFunction";

export async function handleGetAllUsers(): Promise<ApiResponse> {
  return handleApiCall(() => axiosInstance.get(API_ENDPOINTS.ADMIN.USERS));
}

export async function handleGetGlobalStats(): Promise<ApiResponse> {
  return handleApiCall(() => axiosInstance.get(API_ENDPOINTS.ADMIN.GLOBAL_STATS));
}

export async function handleCreateUser(data: any): Promise<ApiResponse> {
  return handleApiCall(() => axiosInstance.post(API_ENDPOINTS.ADMIN.USERS, data));
}

export async function handleImpersonate(id: string | number): Promise<ApiResponse> {
  return handleApiCall(() => axiosInstance.post(API_ENDPOINTS.ADMIN.IMPERSONATE(id)));
}

export async function handleSendCredentials(id: string | number, data: any): Promise<ApiResponse> {
  return handleApiCall(() => axiosInstance.post(API_ENDPOINTS.ADMIN.SEND_CREDENTIALS(id), data));
}
