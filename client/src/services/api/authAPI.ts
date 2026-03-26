import { API_ENDPOINTS } from "../../constants/apiConstants";
import { axiosInstance, handleApiCall, ApiResponse } from "../../helper/apiFunction";

export async function handleLogin(data: any): Promise<ApiResponse> {
  return handleApiCall(() => axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, data));
}

export async function handleLogout(): Promise<ApiResponse> {
  return handleApiCall(() => axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT));
}

export async function handleGetCurrentUser(): Promise<ApiResponse> {
  return handleApiCall(() => axiosInstance.get(API_ENDPOINTS.AUTH.ME));
}

export async function handleRegister(data: any): Promise<ApiResponse> {
  return handleApiCall(() => axiosInstance.post(API_ENDPOINTS.AUTH.REGISTER, data));
}
