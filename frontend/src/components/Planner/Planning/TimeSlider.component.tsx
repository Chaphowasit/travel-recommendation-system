import React from "react";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";

// Convert slider value to a readable 24-hour time format
function valuetext(value: number): string {
  const hours = Math.floor(value / 2); // Each step represents 30 minutes
  const minutes = value % 2 === 0 ? "00" : "30"; // Even = :00, Odd = :30
  const formattedHours = hours < 10 ? `0${hours}` : hours; // Two-digit hour
  return `${formattedHours}:${minutes}`;
}

const minDistance = 2; // Minimum 1-hour distance

export default function TimeSlider() {
  const [value, setValue] = React.useState<number[]>([16, 32]); // Default values with 2 knobs

  const handleChange = (_event: Event, newValue: number | number[], activeThumb: number) => {
    if (!Array.isArray(newValue)) return;

    const sortedValues = [...newValue];

    // Prevent overlapping and ensure minimum distance
    if (activeThumb === 0) {
      sortedValues[0] = Math.min(sortedValues[0], sortedValues[1] - minDistance);
    } else {
      sortedValues[1] = Math.max(sortedValues[1], sortedValues[0] + minDistance);
    }

    setValue(sortedValues);
  };

  return (
    <Box sx={{ width: "100%", display: "flex" }}>
      <Box>
        <Typography variant="h6">Travel Time:</Typography>
      </Box>
      <Box paddingX={2} width="100%">
        <Slider
          value={value} // Two knobs for range
          onChange={handleChange}
          valueLabelDisplay="on" // Show value label
          getAriaValueText={(val) => valuetext(val)} // Accessible text
          valueLabelFormat={(val) => valuetext(val as number)} // Format numeric value for display
          step={1} // 30-minute increments
          min={0} // Start time: 00:00
          max={48} // End time: 23:30
          marks
          disableSwap
        />
      </Box>
    </Box>
  );
}
