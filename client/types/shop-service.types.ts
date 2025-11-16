export interface Shop {
  id: number;
  name: string;
  contact: string | null;
  hours: string | null;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  verified: boolean;
  dateCreated: string;
  dateModified: string;
}

export interface RegisterShopRequest {
  token: string;
  shopName: string;
  contact?: string;
  hours?: string;
}

export interface RegisterShopResponse {
  id: number;
  name: string;
  contact: string | null;
  hours: string | null;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  verified: boolean;
  dateCreated: string;
}

export interface UpdateShopRequest {
  name?: string;
  contact?: string;
  hours?: string;
}

export interface UpdateShopResponse extends Shop {}

export interface NearbyShopRate {
  fromCurrency: string;
  toCurrency: string;
  buyRate: number;
  sellRate: number;
  rateAge: number; // in days
}

export interface NearbyShop {
  id: number;
  name: string;
  contact: string | null;
  hours: string | null;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  distance: number; // in meters
  rates: NearbyShopRate;
}

export interface NearbyShopsQuery {
  lat: number;
  lng: number;
  radius?: number; // in kilometers, default 5, max 20
  fromCurrency: string;
  toCurrency: string;
}

