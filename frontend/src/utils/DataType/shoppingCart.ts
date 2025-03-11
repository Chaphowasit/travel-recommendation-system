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

export const validatePayload = (
  activityShoppingCartItem: ActivityShoppingCartItem[],
  accommodationShoppingCartItem: AccommodationShoppingCartItem
): { result: boolean; reason: string } => {
  if (activityShoppingCartItem.length === 0) {
    return {
      result: false,
      reason: "Please select at least one activity before proceeding.",
    };
  }
  if (activityShoppingCartItem.length > 24) {
    return {
      result: false,
      reason:
        "Activities exceed the limit! You can select activities for a maximum of 24 places.",
    };
  }
  if (accommodationShoppingCartItem.item.id === "-1") {
    return {
      result: false,
      reason: "Please select an accommodation before proceeding.",
    };
  }
  return { result: true, reason: "" };
};
