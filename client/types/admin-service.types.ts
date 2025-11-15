export interface LocationToken {
  id: number;
  latitude: number;
  longitude: number;
  expiresAt: string;
  usedAt: string | null;
  shopId: number | null;
  shop?: {
    id: number;
    name: string;
  } | null;
  createdAt: string;
}

export interface GenerateTokenRequest {
  latitude: number;
  longitude: number;
  expirationDays?: number;
}

export interface GenerateTokenResponse {
  token: string;
  expiresAt: string;
  latitude: number;
  longitude: number;
}


