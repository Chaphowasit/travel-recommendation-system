import { generateDateRange, dayjsStartDate } from "../time";
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
    must: boolean;
    isAdvance: boolean;
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

export const convertToVrpPayload = (
  activityShoppingCartItems: ActivityShoppingCartItem[],
  accommodationShoppingCartItem: AccommodationShoppingCartItem,
  selectedDates: { startDate: Date; endDate: Date }
): OptimizeRouteData => {
  // Adjust zone ranges to account for the selected date range.
  const adjustZonesToRanges = (zones: Zone[]): Range[] => {
    if (!zones || zones.length === 0) return [];

    const days = generateDateRange(selectedDates.startDate, selectedDates.endDate);
    const adjustedRanges: Range[] = [];
    const sortedZones = [...zones].sort((a, b) => a.date.getTime() - b.date.getTime());

    for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
      const dayStr = days[dayIndex];
      const zonesForDay = sortedZones.filter(zone => dayjsStartDate(zone.date).format("YYYY-MM-DD") === dayStr);

      zonesForDay.forEach(zone => {
        adjustedRanges.push({
          start: zone.range.start + 96 * dayIndex,
          end: zone.range.end + 96 * dayIndex,
        });
      });
    }

    return adjustedRanges;
  };

  return {
    accommodation: {
      place_id: accommodationShoppingCartItem.item.id,
      sleep_times: adjustZonesToRanges(accommodationShoppingCartItem.zones),
    },
    activities: activityShoppingCartItems.map(activityItem => ({
      place_id: activityItem.item.id,
      stay_time: activityItem.stayTime,
      visit_range: adjustZonesToRanges(activityItem.zones),
      must: activityItem.must,
      isAdvance: activityItem.advance,
    })),
  };
};