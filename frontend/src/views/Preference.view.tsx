import { Box, Button, Typography, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, useMediaQuery } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { dayjsStartDate } from "../utils/time";
import { Dayjs } from "dayjs";

interface PreferenceViewProps {
    onDateChange: (startDate: Date, endDate: Date) => void;
    setIsSelectedDate: React.Dispatch<React.SetStateAction<boolean>>;
}

const PreferenceView: React.FC<PreferenceViewProps> = ({ onDateChange, setIsSelectedDate }) => {
    const navigate = useNavigate();
    const isSmallScreen = useMediaQuery("(max-width:600px)"); // Detect screen size

    // State for startDate and duration
    const [startDate, setStartDate] = useState<Dayjs>(dayjsStartDate());
    const [duration, setDuration] = useState<number>(1); // Default duration of 1 day

    // Handle the change of startDate and duration
    const handleStartDateChange = (newValue: Dayjs | null) => {
        if (newValue) {
            // Ensure the new date is in local timezone and remove time (set to 00:00:00)
            const localDate = dayjsStartDate(newValue);
            setStartDate(localDate);
        }
    };
    
    const handleSubmit = () => {
        // Convert startDate to local timezone and remove time (set to 00:00:00)
        const adjustedStartDate = dayjsStartDate(startDate).toDate();
        const adjustedEndDate = dayjsStartDate(startDate)
            .add(duration - 1, "day")
            .toDate();
    
        // Trigger the callback with the selected dates
        onDateChange(adjustedStartDate, adjustedEndDate);
    
        // Navigate to the next page
        navigate("/planner");
    };
    

    const handleDurationChange = (event: SelectChangeEvent<number>) => {
        setDuration(parseInt(event.target.value as string, 10));
    };

    useEffect(() => {
        // Set isSelectedDate to true when the component is mounted
        setIsSelectedDate(true);
    }, [setIsSelectedDate]);

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    width: "100%",
                    height: "100%",
                    padding: 2,
                }}
            >
                <Typography variant="h3" sx={{ mb: 2, textAlign: "center" }}>
                    What date do you want to travel?
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: isSmallScreen ? "column" : "row", // Adjust layout for small screens
                        alignItems: "center",
                        gap: 2,
                        width: "100%",
                        maxWidth: 600,
                    }}
                >
                    {/* Start Date Picker */}
                    <DatePicker
                        label="Start Date"
                        value={startDate}
                        onChange={(newValue) => handleStartDateChange(newValue)}
                        minDate={dayjsStartDate()} // Restricts selection to today and future dates
                        sx={{
                            flex: 1, // Allow the picker to expand in the row layout
                            width: isSmallScreen ? "100%" : "auto",
                        }}
                    />

                    {/* Duration Dropdown */}
                    <FormControl
                        sx={{
                            minWidth: 200,
                            flex: 1, // Expandable in row layout
                            width: isSmallScreen ? "100%" : "auto",
                        }}
                    >
                        <InputLabel>Duration</InputLabel>
                        <Select
                            value={duration} // Ensure value is a string for the Select component
                            onChange={handleDurationChange}
                            sx={{
                                height: 56, // Standard height for Material-UI input fields
                            }}
                        >
                            {[1, 2, 3, 4, 5].map((dayCount) => (
                                <MenuItem key={dayCount} value={dayCount}>
                                    {dayCount} {dayCount === 1 ? "Day" : "Days"}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Submit Button */}
                    <Button
                        variant="contained"
                        sx={{
                            height: 56, // Matches the height of the dropdown (Select)
                            width: isSmallScreen ? "100%" : 130,
                        }}
                        onClick={handleSubmit}
                    >
                        Submit
                    </Button>
                </Box>
            </Box>
        </LocalizationProvider>
    );
};

export default PreferenceView;
