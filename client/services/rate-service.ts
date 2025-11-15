import type {
  CreateRateRequest,
  CreateRateResponse,
  Rate,
} from '@/types/rate-service.types';
import type { AxiosRequestConfig } from 'axios';
import axiosClient from './axios-client';

import { API_HOST_PREFIX } from './service-helpers';

const api = `${API_HOST_PREFIX}/shops`;

export async function getShopRates(shopId: number): Promise<Rate[]> {
  const config: AxiosRequestConfig = {
    headers: { 'Content-Type': 'application/json' },
    url: `${api}/${shopId}/rates`,
    method: 'GET',
  };

  const res = await axiosClient<Rate[]>(config);
  // Backend returns array directly
  return Array.isArray(res.data) ? res.data : [];
}

export async function createOrUpdateRate(
  shopId: number,
  data: CreateRateRequest,
): Promise<CreateRateResponse> {
  const config: AxiosRequestConfig = {
    headers: { 'Content-Type': 'application/json' },
    url: `${api}/${shopId}/rates`,
    method: 'POST',
    data,
  };

  const res = await axiosClient<CreateRateResponse>(config);
  return res.data;
}

