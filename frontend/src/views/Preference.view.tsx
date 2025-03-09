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
    const isSmallScreen = useMediaQuery("(max-width:600px)");

    // State for startDate and duration
    const [startDate, setStartDate] = useState<Dayjs>(dayjsStartDate());
    const [duration, setDuration] = useState<number>(1);

    const handleStartDateChange = (newValue: Dayjs | null) => {
        if (newValue) {
            const localDate = dayjsStartDate(newValue);
            setStartDate(localDate);
        }
    };
    
    const handleSubmit = () => {
        const adjustedStartDate = dayjsStartDate(startDate).toDate();
        const adjustedEndDate = dayjsStartDate(startDate)
            .add(duration - 1, "day")
            .toDate();
    
        onDateChange(adjustedStartDate, adjustedEndDate);
        navigate("/planner");
    };
    
    const handleDurationChange = (event: SelectChangeEvent<number>) => {
        setDuration(parseInt(event.target.value as string, 10));
    };

    useEffect(() => {
        setIsSelectedDate(true);
    }, [setIsSelectedDate]);

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    height: "100%",
                    padding: 2,
                    backgroundColor: "#fafafa",
                }}
            >
                <Typography variant="h3" sx={{ mb: 2, textAlign: "center", color: "#333" }}>
                    What date do you want to travel?
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: isSmallScreen ? "column" : "row",
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
                        minDate={dayjsStartDate()}
                        sx={{
                            flex: 1,
                            width: isSmallScreen ? "100%" : "auto",
                        }}
                    />

                    {/* Duration Dropdown */}
                    <FormControl
                        sx={{
                            minWidth: 200,
                            flex: 1,
                            width: isSmallScreen ? "100%" : "auto",
                        }}
                    >
                        <InputLabel>Duration</InputLabel>
                        <Select
                            value={duration}
                            onChange={handleDurationChange}
                            sx={{
                                height: 56,
                                color: "#333",
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
                        onClick={handleSubmit}
                        sx={{
                            height: 56,
                            width: isSmallScreen ? "100%" : 130,
                            background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                            boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)",
                            fontWeight: "bold",
                            borderRadius: "8px",
                            textTransform: "none",
                            padding: "8px 16px",
                            transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                            "&:hover": {
                                transform: "scale(1.05)",
                                boxShadow: "0 5px 8px 3px rgba(33, 203, 243, .3)",
                            },
                        }}
                    >
                        Submit
                    </Button>
                </Box>
            </Box>
        </LocalizationProvider>
    );
};

export default PreferenceView;
