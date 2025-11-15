import type {
  RegisterShopRequest,
  RegisterShopResponse,
  Shop,
  UpdateShopRequest,
  UpdateShopResponse,
} from '@/types/shop-service.types';
import type { AxiosRequestConfig } from 'axios';
import axiosClient from './axios-client';

import { API_HOST_PREFIX } from './service-helpers';

const api = `${API_HOST_PREFIX}/shops`;

export async function registerShop(
  data: RegisterShopRequest,
): Promise<RegisterShopResponse> {
  const config: AxiosRequestConfig = {
    headers: { 'Content-Type': 'application/json' },
    url: `${api}/register`,
    method: 'POST',
    data,
  };

  const res = await axiosClient<RegisterShopResponse>(config);
  return res.data;
}

export async function getShopById(shopId: number): Promise<Shop> {
  const config: AxiosRequestConfig = {
    headers: { 'Content-Type': 'application/json' },
    url: `${api}/${shopId}`,
    method: 'GET',
  };

  const res = await axiosClient<Shop>(config);
  return res.data;
}

export async function getMyShops(): Promise<Shop[]> {
  const config: AxiosRequestConfig = {
    headers: { 'Content-Type': 'application/json' },
    url: `${api}/my-shops`,
    method: 'GET',
  };

  const res = await axiosClient<Shop[]>(config);
  return Array.isArray(res.data) ? res.data : [];
}

export async function getMyShop(): Promise<Shop> {
  const config: AxiosRequestConfig = {
    headers: { 'Content-Type': 'application/json' },
    url: `${api}/my-shop`,
    method: 'GET',
  };

  const res = await axiosClient<Shop>(config);
  return res.data;
}

export async function updateShop(
  shopId: number,
  data: UpdateShopRequest,
): Promise<UpdateShopResponse> {
  const config: AxiosRequestConfig = {
    headers: { 'Content-Type': 'application/json' },
    url: `${api}/${shopId}`,
    method: 'PUT',
    data,
  };

  const res = await axiosClient<UpdateShopResponse>(config);
  return res.data;
}

