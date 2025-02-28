import { Activity, Accommodation } from "./place";

export interface Range {
  start: number;
  end: number;
}

export interface ActivityZone { 
  date: Date; 
  range: Range; 
}

export interface ActivityShoppingCartItem {
  item: Activity;
  zones: ActivityZone[];
  stayTime: number;
  advance: boolean;
  selectDateIndexes?: number[];
  selectTimeIndexes?: number[];
}

export interface AccommodationZone { 
  date: Date; 
  ranges: Range[]; 
  sleepTime: number;
}

export interface AccommodationShoppingCartItem {
  item: Accommodation;
  zones: AccommodationZone[];
}
