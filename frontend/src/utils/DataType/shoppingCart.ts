import { randomInt } from "crypto";
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

  // Fisher-Yates shuffle to randomize array order
  const shuffleArray = <T>(array: T[]): T[] => {
    let shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]; // Swap elements
    }
    return shuffledArray;
  };

  // Create a copy of the activityShoppingCartItems array to work on.
  const updatedActivityShoppingCartItems = activityShoppingCartItems.map(item => ({
    ...item,
    zones: [...item.zones],  // Make a copy of the zones array as well
  }));

  // =================== random method 1 =========================

  // updatedActivityShoppingCartItems.forEach((item) => {
  //   if (!item.advance) {
  //     // Shuffle the zones array to randomize the order
  //     item.zones = shuffleArray(item.zones);

  //     // Calculate deletion probability based on the number of remaining zones
  //     const totalZones = item.zones.length;

  //     item.zones = item.zones.filter((zone, index) => {
  //       // Calculate the probability of deleting the zone
  //       const remainingZones = totalZones - index; // Zones left to process
  //       const deletionProbability = 1 / remainingZones; // Inverse proportion to remaining zones

  //       // Randomly delete the zone based on the calculated probability
  //       const rand = Math.random(); // Generates a number between 0 and 1
  //       return rand <= deletionProbability; // Zone gets deleted if rand is less than deletionProbability
  //     });
  //   }
  // });

  // =================== random method 2 =========================

  // updatedActivityShoppingCartItems.forEach((item) => {
  //   if (!item.advance) {
  //     // Shuffle the zones array to randomize the order
  //     item.zones = shuffleArray(item.zones);

  //     // Apply random deletion with a uniform 50% chance
  //     item.zones = item.zones.filter(() => Math.random() < 0.5);  // 50% chance to keep each zone
  //   }
  // });

  // =================== random method 3 =========================

  updatedActivityShoppingCartItems.forEach((item) => {
    if (!item.advance) {
      let zonesLeft = item.zones.length;

      // Shuffle the zones array to randomize the order initially
      item.zones = shuffleArray(item.zones);

      // Apply random deletion with a uniform 50% chance until there are zones left
      do {
        // Apply 50% chance of keeping each zone
        item.zones = item.zones.filter(() => Math.random() < 0.5);

        // If no zones are left, re-shuffle and try again
        zonesLeft = item.zones.length;
        if (zonesLeft === 0) {
          item.zones = shuffleArray(item.zones);  // Re-randomize the zones
        }
      } while (zonesLeft === 0);  // Repeat if no zones are left
    }
  });


  console.log({
    accommodation: {
      place_id: accommodationShoppingCartItem.item.id,
      sleep_times: adjustZonesToRanges(accommodationShoppingCartItem.zones),
    },
    activities: updatedActivityShoppingCartItems.map(activityItem => ({
      place_id: activityItem.item.id,
      stay_time: activityItem.stayTime,
      visit_range: adjustZonesToRanges(activityItem.zones),
      must: activityItem.must,
    })),
  })

  return {
    accommodation: {
      place_id: accommodationShoppingCartItem.item.id,
      sleep_times: adjustZonesToRanges(accommodationShoppingCartItem.zones),
    },
    activities: updatedActivityShoppingCartItems.map(activityItem => ({
      place_id: activityItem.item.id,
      stay_time: activityItem.stayTime,
      visit_range: adjustZonesToRanges(activityItem.zones),
      must: activityItem.must,
    })),
  };
};