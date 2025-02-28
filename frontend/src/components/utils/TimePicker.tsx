import React, { useState, useEffect } from "react";
import { FormControl, Select, MenuItem, Typography } from "@mui/material";

type Range = {
  start: number; // 0..96, represents quarter-hour index
  end: number;   // 0..96, represents quarter-hour index
};

type TimePickerProps = {
  time: number;
  setTime: (value: number) => void;
  range?: Range;
};

/** Converts a quarter-hour index (0..96) to 24-hour format. */
function fromQuarterHourIndex(value: number) {
  const totalMinutes = value * 15;
  const hour24 = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;

  return { hour24, minute };
}

/** Converts 24-hour time to a quarter-hour index (0..96). */
function toQuarterHourIndex(hour24: number, minute: number) {
  const totalMinutes = hour24 * 60 + minute;
  return Math.floor(totalMinutes / 15);
}

const TimePicker: React.FC<TimePickerProps> = ({
  time,
  setTime,
  range = { start: 0, end: 96 },
}) => {
  const [hour, setHour] = useState<number>(0);
  const [minute, setMinute] = useState<number>(0);

  useEffect(() => {
    const { hour24, minute } = fromQuarterHourIndex(time);
    setHour(hour24);
    setMinute(minute);
  }, [time]);

  const validHours = Array.from(
    new Set(
      Array.from({ length: range.end - range.start + 1 }, (_, i) =>
        fromQuarterHourIndex(range.start + i).hour24
      )
    )
  );

  const validMinutesForHour = (selectedHour: number) => {
    const minutes = Array.from({ length: range.end - range.start + 1 }, (_, i) =>
      fromQuarterHourIndex(range.start + i)
    )
      .filter((t) => t.hour24 === selectedHour)
      .map((t) => t.minute);

    return Array.from(new Set(minutes));
  };

  const updateTime = (newHour: number, newMinute: number) => {
    let quarterIndex = toQuarterHourIndex(newHour, newMinute);

    if (quarterIndex < range.start) quarterIndex = range.start;
    if (quarterIndex > range.end) quarterIndex = range.end;

    setTime(quarterIndex);
  };

  const handleHourChange = (newHour: number) => {
    const availableMinutes = validMinutesForHour(newHour);
    const newMinute = availableMinutes.includes(minute) ? minute : availableMinutes[0];
    setHour(newHour);
    setMinute(newMinute);
    updateTime(newHour, newMinute);
  };

  const handleMinuteChange = (newMinute: number) => {
    setMinute(newMinute);
    updateTime(hour, newMinute);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Typography>Hour</Typography>
      <FormControl size="small">
        <Select value={hour} onChange={(e) => handleHourChange(e.target.value as number)}>
          {validHours.map((h) => (
            <MenuItem key={h} value={h}>
              {h.toString().padStart(2, "0")}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Typography>:</Typography>

      <Typography>Minute</Typography>
      <FormControl size="small">
        <Select value={minute} onChange={(e) => handleMinuteChange(e.target.value as number)}>
          {validMinutesForHour(hour).map((m) => (
            <MenuItem key={m} value={m}>
              {m.toString().padStart(2, "0")}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default TimePicker;