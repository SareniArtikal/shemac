export type TourSettings = {
  id: number;
  max_points: number;
  max_people: number;
  start_fee: number;
  per_distance_rate: number;
  distance_unit: 'km' | 'miles';
  currency_code: string;
  max_distance_radius: number;
  distance_radius_unit: 'km' | 'miles';
  created_at: string;
  updated_at: string;
};

export type PredefinedTour = {
  id: string;
  name: string;
  description: string;
  route_coordinates: [number, number][]; // [lat, lng] pairs
  display_price: number | null;
  display_duration: string | null;
  created_at: string;
  updated_at: string;
};

export type MarkerPoint = {
  id: number;
  position: [number, number]; // [lat, lng]
};

export interface TourBuildState {
  points: MarkerPoint[];
  people: number;
  totalDistance: number;
}