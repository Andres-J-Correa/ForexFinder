export interface NearbyShop {
  id: number;
  name: string;
  contact: string;
  hours: string;
  latitude: number;
  longitude: number;
  distance: number; // in km
  buyRate: string;
  sellRate: string;
  rateAge: number; // in days
  buyScore: number;
  sellScore: number;
}
