export interface Rate {
  id: number;
  shopId: number;
  fromCurrency: string;
  toCurrency: string;
  buyRate: number;
  sellRate: number;
  createdAt: string;
}

export interface CreateRateRequest {
  fromCurrency: string;
  toCurrency: string;
  buyRate: number;
  sellRate: number;
}

export interface CreateRateResponse extends Rate {}

export interface RatesResponse {
  data: Rate[];
}

