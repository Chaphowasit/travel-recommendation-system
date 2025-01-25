import React from "react";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";

interface TimeSliderProps {
  value: number[]; // Controlled value passed from the parent component
  onValueChange: (value: number[]) => void; // Callback to notify parent of value changes
}

// Convert slider value to a readable 24-hour time format
function valuetext(value: number): string {
  const hours = Math.floor(value / 4); // Each step represents 15 minutes
  const minutes = (value % 4) * 15; // Convert to 15-minute increments
  const formattedHours = hours < 10 ? `0${hours}` : hours; // Two-digit hour
  const formattedMinutes = minutes === 0 ? "00" : minutes.toString(); // Format minutes
  return `${formattedHours}:${formattedMinutes}`;
}

const minDistance = 2; // Minimum distance between handles (30 minutes)

const TimeSlider: React.FC<TimeSliderProps> = ({ value, onValueChange }) => {
  const handleChange = (_event: Event, newValue: number | number[], activeThumb: number) => {
    if (!Array.isArray(newValue)) return;

    const sortedValues = [...newValue];

    // Prevent overlapping and ensure minimum distance
    if (activeThumb === 0) {
      sortedValues[0] = Math.min(sortedValues[0], sortedValues[1] - minDistance);
    } else {
      sortedValues[1] = Math.max(sortedValues[1], sortedValues[0] + minDistance);
    }

    // Notify parent about the updated values
    onValueChange(sortedValues);
  };

  const marks = [
    { value: 0, label: "00:00" },
    { value: 24, label: "06:00" },
    { value: 48, label: "12:00" },
    { value: 72, label: "18:00" },
    { value: 96, label: "24:00" }
  ];

  return (
    <Box sx={{ width: "100%", display: "flex", alignItems: "center" }}>
      <Typography variant="h6">Travel Time:</Typography>
      <Box paddingX={2} width="100%">
        <Slider
          value={value} // Controlled value
          onChange={handleChange}
          valueLabelDisplay="on" // Show value label
          getAriaValueText={(val) => valuetext(val)} // Accessible text
          valueLabelFormat={(val) => valuetext(val as number)} // Format numeric value for display
          step={2} // 15-minute increments (1 step = 15 minutes)
          min={0} // Start time: 00:00
          max={96} // End time: 23:45 (96 steps for 15-minute increments in 24 hours)
          marks={marks} // Add quarter-hour labels if needed
          disableSwap
        />
      </Box>
    </Box>
  );
};

export default TimeSlider;
