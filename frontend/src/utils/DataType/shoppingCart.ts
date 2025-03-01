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
  must: boolean;
  advance: boolean;
  selectDateIndexes?: number[];
  selectTimeIndexes?: number[];
}

export interface AccommodationZone { 
  date: Date; 
  ranges: Range;
}

export interface AccommodationShoppingCartItem {
  item: Accommodation;
  zones: AccommodationZone[];
}
