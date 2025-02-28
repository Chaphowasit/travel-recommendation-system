import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Enable timezone support in Dayjs
dayjs.extend(utc);
dayjs.extend(timezone);
export const localTimezone = dayjs.tz.guess(); // Automatically detect user's local timezone


// ======================== dayjs ===========================

export const dayjsLocalTimezone = (date?: Date | string | Dayjs) => {
    return dayjs(date).tz(localTimezone);
}

export const dayjsStartDate = (date?: Date | string | Dayjs) => {
    return dayjsLocalTimezone(date).startOf("day");
}

// ======================== time format ===========================

export const formatTime = (value: number) => {
    const totalMinutes = value % 96 * 15;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};


// ======================== Date range ============================

export const generateDateRange = (startDate: Date, endDate: Date) => {
  const dates: string[] = [];
  let currentDate = dayjsStartDate(startDate);

  while (currentDate.isBefore(dayjsStartDate(endDate)) || currentDate.isSame(endDate, "day")) {
    dates.push(currentDate.format("YYYY-MM-DD")); // Fix: Display date-only without timezone shift
    currentDate = currentDate.add(1, "day");
  }

  return dates;
};
