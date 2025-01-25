import React, { useState } from "react";
import { Box, Button, Typography, TextField, MenuItem } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useNavigate } from "react-router-dom";

interface PreferenceViewProps {
    onDateChange: (startDate: Date , endDate: Date ) => void;
}

const PreferenceView: React.FC<PreferenceViewProps> = ({ onDateChange }) => {
    const [startDate, setStartDate] = useState<Date | null>(new Date());
    const [duration, setDuration] = useState<number>(1);
    const navigate = useNavigate();

    const [state, setState] = useState<Range[]>([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: 'selection',
        },
    ]);

    const handleSelect = (ranges: RangeKeyDict) => {
        const selectionRange: Range = ranges.selection;
        setState([selectionRange]);
    
        // Adjust the dates by adding 7 hours for the timezone
        const adjustedStartDate = selectionRange.startDate
            ? new Date(selectionRange.startDate.getTime() + 7 * 60 * 60 * 1000)
            : new Date();
    
        const adjustedEndDate = selectionRange.endDate
            ? new Date(selectionRange.endDate.getTime() + 7 * 60 * 60 * 1000)
            : new Date();
    
        // Call the onDateChange callback with the adjusted dates
        onDateChange(adjustedStartDate, adjustedEndDate);
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

            </Box>
        </LocalizationProvider>
    );
};

export default PreferenceView;
