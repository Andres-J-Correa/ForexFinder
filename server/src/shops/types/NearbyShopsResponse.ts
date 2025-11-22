export interface NearbyShopsResponse {
  id: number;
  name: string;
  contact: string;
  hours: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  distance: number; // in meters
  rates: {
    fromCurrency: string;
    toCurrency: string;
    buyRate: number;
    sellRate: number;
    rateAge: number; // in days
  };
}
