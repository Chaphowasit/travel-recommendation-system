import React, { useState } from "react";
import { Box, Button, Typography, TextField, MenuItem } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useNavigate } from "react-router-dom";

interface PreferenceViewProps {
    onDateChange: (startDate: Date | undefined, endDate: Date | undefined) => void;
}

const PreferenceView: React.FC<PreferenceViewProps> = ({ onDateChange }) => {
    const [startDate, setStartDate] = useState<Date | null>(new Date());
    const [duration, setDuration] = useState<number>(1);
    const navigate = useNavigate();

    const handleSubmit = () => {
        if (startDate) {
            // Calculate the end date based on duration
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + duration - 1);

            // Pass start and end dates to parent handler
            onDateChange(startDate, endDate);

            // Navigate to the planner view
            navigate("/planner");
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    width: "100%",
                    height: "100%",
                }}
            >
                <Typography variant="h4" sx={{ mb: 3 }}>
                    On what date would you like to begin your trip?
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                    {/* Date Picker for Start Date */}
                    <DatePicker
                        label="Start Date"
                        value={startDate}
                        onChange={(newValue) => setStartDate(newValue)}
                        minDate={new Date()} // Prevent selecting past dates
                        slotProps={{
                            textField: { fullWidth: true },
                        }}
                    />
                    {/* Dropdown for Duration */}
                    <TextField
                        select
                        label="Duration (Days)"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        sx={{ width: 150 }}
                    >
                        {[1, 2, 3, 4, 5].map((day) => (
                            <MenuItem key={day} value={day}>
                                {day} {day === 1 ? "Day" : "Days"}
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>
                {/* Submit Button */}
                <Button variant="contained" onClick={handleSubmit} disabled={!startDate}>
                    Submit
                </Button>
            </Box>
        </LocalizationProvider>
    );
};

export default PreferenceView;
