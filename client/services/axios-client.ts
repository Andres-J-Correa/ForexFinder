import type { LoginResponse } from "@/types/auth-service.types";
import { handleError } from "@/utils/error-handler";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_HOST_PREFIX } from "./service-helpers";
import { getAccessToken, getRefreshToken, saveTokens } from "./token-storage";

const axiosClient = axios.create();

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

/**
 * Internal function to refresh tokens using a direct axios call
 * (not using axiosClient to avoid interceptor loops)
 */
async function refreshTokensInternal(refreshToken: string): Promise<LoginResponse> {
  const api = `${API_HOST_PREFIX}/auth`;
  const response = await axios.post<LoginResponse>(
    `${api}/refresh`,
    {},
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refreshToken}`,
      },
    }
  );

  // Save new tokens after successful refresh
  if (response.data?.accessToken && response.data?.refreshToken) {
    await saveTokens(response.data.accessToken, response.data.refreshToken);
  }

  return response.data;
}

// Request interceptor: Add access token to all requests
axiosClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    handleError(
      error,
      "axios-client.requestInterceptor",
      "Request configuration failed"
    );
    return Promise.reject(error);
  }
);

// Response interceptor: Handle token refresh on 401 errors
axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers && token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const tokenData = await refreshTokensInternal(refreshToken);
        const newAccessToken = tokenData?.accessToken;

        if (newAccessToken && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        processQueue(null, newAccessToken);
        isRefreshing = false;

        return axiosClient(originalRequest);
      } catch (refreshError) {
        handleError(
          refreshError,
          "axios-client.tokenRefresh",
          "Token refresh failed"
        );
        processQueue(refreshError as AxiosError, null);
        isRefreshing = false;
        return Promise.reject(refreshError);
      }
    }

    // Log non-401 errors or 401 errors that can't be retried
    if (error.response?.status !== 401 || originalRequest._retry) {
      handleError(
        error,
        "axios-client.responseInterceptor",
        "API request failed"
      );
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
