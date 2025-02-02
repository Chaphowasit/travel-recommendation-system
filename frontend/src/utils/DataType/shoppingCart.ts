import { Activity, Accommodation } from "./place";

export interface ActivityShoppingCartItem {
  item: Activity;
  zones: { date: Date; startTime: number; endTime: number; stayTime: number }[];
}

export interface AccommodationShoppingCartItem {
  item: Accommodation;
  zones: { date: Date; morning: number; evening: number; sleepTime: number }[];
}
