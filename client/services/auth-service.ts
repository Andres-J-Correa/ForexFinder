import type {
  CurrentUserResponse,
  LoginResponse,
} from "@/types/auth-service.types";
import type { AxiosRequestConfig } from "axios";
import axiosClient from "./axios-client";

import { API_HOST_PREFIX } from "./service-helpers";
import { saveTokens } from "./token-storage";

const api = `${API_HOST_PREFIX}/auth`;

export async function signInWithGoogle(idToken: string) {
  const config: AxiosRequestConfig = {
    headers: { "Content-Type": "application/json" },
    url: `${api}/login`,
    method: "POST",
    data: { idToken },
  };

  const res = await axiosClient<LoginResponse>(config);

  // Save tokens after successful login
  if (res.data?.accessToken && res.data?.refreshToken) {
    await saveTokens(res.data.accessToken, res.data.refreshToken);
  }

  return res;
}

export async function refreshTokens(refreshToken: string) {
  const config: AxiosRequestConfig = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${refreshToken}`,
    },
    url: `${api}/refresh`,
    method: "POST",
  };

  const res = await axiosClient<LoginResponse>(config);

  // Save new tokens after successful refresh
  if (res.data?.accessToken && res.data?.refreshToken) {
    await saveTokens(res.data.accessToken, res.data.refreshToken);
  }

  return res;
}

export async function getCurrentUser() {
  const config: AxiosRequestConfig = {
    headers: { "Content-Type": "application/json" },
    url: `${api}/current`,
    method: "GET",
  };

  const res = await axiosClient<CurrentUserResponse>(config);

  return res;
}
