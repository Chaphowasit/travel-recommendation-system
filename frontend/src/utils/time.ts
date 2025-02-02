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
    const hours = Math.floor(value / 4);
    const minutes = (value % 4) * 15;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};