import type {
  GenerateTokenRequest,
  GenerateTokenResponse,
  LocationTokensResponse,
} from '@/types/admin-service.types';
import type { AxiosRequestConfig } from 'axios';
import axiosClient from './axios-client';

import { API_HOST_PREFIX } from './service-helpers';

const api = `${API_HOST_PREFIX}/admin/location-tokens`;

export async function generateLocationToken(
  data: GenerateTokenRequest,
): Promise<GenerateTokenResponse> {
  const config: AxiosRequestConfig = {
    headers: { 'Content-Type': 'application/json' },
    url: api,
    method: 'POST',
    data,
  };

  const res = await axiosClient<GenerateTokenResponse>(config);
  return res.data;
}

export async function getLocationTokens(): Promise<LocationToken[]> {
  const config: AxiosRequestConfig = {
    headers: { 'Content-Type': 'application/json' },
    url: api,
    method: 'GET',
  };

  const res = await axiosClient<LocationTokensResponse>(config);
  return res.data.data || [];
}

