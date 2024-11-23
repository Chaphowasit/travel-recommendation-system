import { Box, Divider, Typography, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import TimeSlider from "./TimeSlider.component";
import DragAndDropContainer from "./DragAndDropContainer.component";
import React, { useState } from "react";

interface PlanningSectionProps {
    selectedDates: { startDate: Date | null; endDate: Date | null };
}

const PlanningSection: React.FC<PlanningSectionProps> = ({ selectedDates }) => {
    const calculateDays = (startDate: Date | null, endDate: Date | null): number => {
        if (!startDate || !endDate) return 0;
        const diffInTime = endDate.getTime() - startDate.getTime();
        return Math.max(Math.ceil(diffInTime / (1000 * 60 * 60 * 24)) + 1, 1); // Include the end date
    };

    const getDateForDay = (startDate: Date | null, dayOffset: number): string => {
        if (!startDate) return "";
        const date = new Date(startDate);
        date.setDate(date.getDate() + dayOffset);
        return date.toDateString(); // Formats as "Wed Nov 20 2024"
    };

    const numberOfDays = calculateDays(selectedDates.startDate, selectedDates.endDate);

    // State to store sleep hours for each day
    const [sleepHours, setSleepHours] = useState<number[]>(Array(numberOfDays - 1).fill(8)); // Default: 8 hours

    const handleSleepChange = (dayIndex: number, value: number) => {
        setSleepHours((prev) =>
            prev.map((hours, index) => (index === dayIndex ? value : hours))
        );
    };

    return (
        <Box
            p={10}
            overflow={"auto"}
            sx={{ backgroundColor: "#f5f5f5", height: "100%", borderRadius: "12px" }}
        >
            {/* Accommodation Selection Section */}
            <Box
                mb={4}
                sx={{
                    backgroundColor: "white",
                    p: 3,
                    borderRadius: "12px",
                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                }}
            >
                <Typography variant="h6" gutterBottom>
                    Select Accommodation
                </Typography>
                <DragAndDropContainer acceptType="ACCOMMODATION_CARD" maxItems={1}/>
            </Box>

            {/* Day-by-Day Planning Section */}
            {Array.from({ length: numberOfDays }, (_, index) => (
                <React.Fragment key={index}>
                    <Box
                        mb={2}
                        sx={{
                            backgroundColor: "white",
                            p: 3,
                            borderRadius: "12px",
                            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                        }}
                    >
                        <Typography variant="h6" gutterBottom>
                            {getDateForDay(selectedDates.startDate, index)}
                        </Typography>
                        <TimeSlider />
                        <DragAndDropContainer acceptType="ACTIVITY_CARD" />
                    </Box>

                    {/* Add sleep dropdown only between days */}
                    {index < numberOfDays - 1 && (
                        <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            mb={4}
                            mt={4}
                        >
                            <Divider
                                sx={{
                                    flexGrow: 1,
                                    height: 1,
                                    borderColor: "#ccc",
                                    mx: 2,
                                }}
                            />
                            <FormControl
                                sx={{
                                    width: 200,
                                    backgroundColor: "white",
                                    borderRadius: "12px",
                                    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
                                }}
                            >
                                <InputLabel id={`sleep-hours-label-${index}`}>
                                    Sleep Hours
                                </InputLabel>
                                <Select
                                    labelId={`sleep-hours-label-${index}`}
                                    value={sleepHours[index]}
                                    label="Sleep Hours"
                                    onChange={(e) =>
                                        handleSleepChange(index, Number(e.target.value))
                                    }
                                >
                                    {Array.from({ length: 13 }, (_, i) => i + 4).map((hours) => (
                                        <MenuItem key={hours} value={hours}>
                                            {hours} Hours
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Divider
                                sx={{
                                    flexGrow: 1,
                                    height: 1,
                                    borderColor: "#ccc",
                                    mx: 2,
                                }}
                            />
                        </Box>
                    )}
                </React.Fragment>
            ))}
        </Box>
    );
};

export default PlanningSection;
