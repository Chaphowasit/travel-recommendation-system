import { Activity, Accommodation, Range } from "./place";

export interface Zone { 
  date: Date; 
  range: Range; 
}

export interface ActivityShoppingCartItem {
  item: Activity;
  zones: Zone[];
  stayTime: number;
  must: boolean;
  advance: boolean;
  selectDateIndexes?: number[];
  selectTimeIndexes?: number[];
}

export interface AccommodationShoppingCartItem {
  item: Accommodation;
  zones: Zone[];
}

export interface OptimizeRouteData {
  accommodation: {
    place_id: string;
    sleep_times: Range[];
  };
  activities: {
    place_id: string;
    stay_time: number;
    visit_range: Range[];
    must: boolean
  }[]
  
}