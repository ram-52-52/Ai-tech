import axios, { AxiosInstance, AxiosResponse } from "axios";

export const axiosInstance: AxiosInstance = axios.create({
  withCredentials: true,
});

export type ApiResponse<T = any> = {
  success: boolean;
  data: T | null;
  error: string | null;
};

export async function handleApiCall<T = any>(
  apiFunc: () => Promise<AxiosResponse<T>>,
): Promise<ApiResponse<T>> {
  try {
    const response = await apiFunc();
    return {
      success: true,
      data: response.data,
      error: null,
    };
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || error.message || "An unexpected error occurred";
    return {
      success: false,
      data: null,
      error: errorMessage,
    };
  }
}
