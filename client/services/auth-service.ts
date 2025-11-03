import type { LoginResponse } from "@/types/auth-service.types";
import type { AxiosRequestConfig } from "axios";
import axiosClient from "./axios-client";

import { API_HOST_PREFIX } from "./service-helpers";

const api = `${API_HOST_PREFIX}/auth`;

export async function signInWithGoogle(idToken: string) {
  const config: AxiosRequestConfig = {
    headers: { "Content-Type": "application/json" },
    url: `${api}/login`,
    method: "POST",
    data: idToken,
  };

  const res = await axiosClient<LoginResponse>(config);

  return res;
}
