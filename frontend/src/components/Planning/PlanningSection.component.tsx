import React, { useState, useEffect } from "react";
import {
    Typography,
    Box,
    Divider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
} from "@mui/material";
import TimeSlider from "./TimeSlider.component";
import DragAndDropContainer from "./DragAndDropContainer.component";
import { generateRoute } from "../../api";

interface BusinessHour {
    start: number;
    end: number;
  }
  
  interface Accommodation {
    id: string;
    name: string;
    description: string;
    tag: string;
    business_hour: BusinessHour;
    image: string;
  }
  
  interface Activity {
    id: string;
    name: string;
    description: string;
    tag: string;
    business_hour: BusinessHour;
    image: string;
  }
  
  interface DragItem extends Accommodation, Activity {
    uniqueKey: string; // Unique key for item identification
  }

  interface RouteItem {
    arrival_time: number;
    departure_time: number;
    index: number;
    node: string;
    travel_time: number;
    waiting_time: number;
  }
  
  interface RouteData {
    routes: RouteItem[][];
    total_time: number;
    total_waiting_time: number;
  }
  

interface PlanningSectionProps {
    selectedDates: { startDate: Date | null; endDate: Date | null };
    handleFinishedRouteFinding: (routeData: RouteData) => void;
}

interface DayPlanning {
    date: string;
    timeSliderValue: number[]; // Start and end time in a 96-block time scale
    activities: DragItem[]; // Replace `any` with the specific type of data if possible
    sleepHours: number; // Duration of sleep in 96-block time scale
}

const PlanningSection: React.FC<PlanningSectionProps> = ({
    selectedDates,
    handleFinishedRouteFinding
}) => {
    const [selectedAccommodation, setSelectedAccommodation] = useState<DragItem>()
    const [planningData, setPlanningData] = useState<DayPlanning[]>([]);

    const recalculatePlanningData = (startDate: Date | null, endDate: Date | null) => {
        if (!startDate || !endDate) {
            setPlanningData([]);
            return;
        }
    
        const duration = Math.ceil(
            (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) + 1
        );
    
        setPlanningData((prevPlanningData) => {
            const newPlanningData: DayPlanning[] = [];
    
            for (let i = 0; i < duration; i++) {
                const currentDate = new Date(startDate);
                currentDate.setDate(startDate.getDate() + i);
    
                // Check if this date already exists in the previous data
                const existingDay = prevPlanningData.find(
                    (day) => day.date === currentDate.toDateString()
                );
    
                newPlanningData.push(
                    existingDay || {
                        date: currentDate.toDateString(),
                        timeSliderValue: [32, 64], // Default: 8 AM to 4 PM
                        activities: [], // Default empty activities
                        sleepHours: 32, // Default: 8 hours
                    }
                );
            }
    
            return newPlanningData;
        });
    };
    

    useEffect(() => {
        recalculatePlanningData(selectedDates.startDate, selectedDates.endDate);
    }, [selectedDates]);

    const handleTimeSliderChange = (dayIndex: number, value: number[]) => {
        setPlanningData((prev) =>
            prev.map((day, index) =>
                index === dayIndex ? { ...day, timeSliderValue: value } : day
            )
        );
    };

    const handleSleepChange = (dayIndex: number, value: number) => {
        setPlanningData((prev) =>
            prev.map((day, index) =>
                index === dayIndex ? { ...day, sleepHours: value } : day
            )
        );
    };

    const handleActivitiesChange = (dayIndex: number, activities: any[]) => {
        setPlanningData((prev) =>
            prev.map((day, index) =>
                index === dayIndex ? { ...day, activities } : day
            )
        );
    };

    const handleGenerateRoute = async () => {
        try {
            // Collect distinct place IDs (accommodation + activities)
            const placeIds = new Set<string>();
            
            // Add selected accommodation to the set
            if (selectedAccommodation?.id) {
                placeIds.add(selectedAccommodation.id);
            } else {
                alert("You cannot generate a route for without selecting accommodation");
                return;
            }
            
            // Add all activity IDs from planning data to the set
            planningData.forEach((day) => {
                day.activities.forEach((activity) => {
                    placeIds.add(activity.id);
                });
            });
    
            // Check if the number of distinct places exceeds 25
            if (placeIds.size > 25) {
                alert("You cannot generate a route for more than 25 distinct places.");
                return;
            }
    
            // Transform planningData into the required format
            const routeRequestData = {
                accommodation: selectedAccommodation?.id,
                activities: planningData.map((day) => {
                    // Group activities by their ID and accumulate visit_time
                    const placeMap = new Map();
                    day.activities.forEach((activity) => {
                        if (!placeMap.has(activity.id)) {
                            placeMap.set(activity.id, { id: activity.id, visit_time: [] });
                        }
                        placeMap.get(activity.id).visit_time.push(activity.business_hour);
                    });
    
                    return {
                        place: Array.from(placeMap.values()),
                        time_anchor: {
                            morning: day.timeSliderValue[0],
                            evening: day.timeSliderValue[1],
                        },
                        sleep_hour: day.sleepHours,
                    };
                }),
            };
    
            console.log(routeRequestData);
    
            // Send the formatted data to the API
            const response = await generateRoute(routeRequestData);
            const routeData = response.data;
            console.log(routeData);
    
            // Navigate to the next page with the response data
            handleFinishedRouteFinding(routeData);
        } catch (error) {
            console.error("Error generating route:", error);
        }
    };
    
    

    return (
        <Box sx={{ height: "100%", overflow: "hidden" }}>
            {/* Planning Section */}
            <Box
                p={4}
                overflow="auto"
                sx={{ backgroundColor: "#f5f5f5", height: "calc(100% - 64px)", borderRadius: "12px" }}
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
                    <DragAndDropContainer acceptType="ACCOMMODATION_CARD" maxItems={1} onChange={(item: DragItem[]) => setSelectedAccommodation(item[0])} />
                </Box>

                {/* Day-by-Day Planning Section */}
                {planningData.map((day, index) => (
                    <React.Fragment key={day.date}>
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
                                {day.date}
                            </Typography>
                            {/* Time Slider */}
                            <TimeSlider
                                value={day.timeSliderValue} // Controlled component behavior
                                onValueChange={(value) => handleTimeSliderChange(index, value)}
                            />
                            {/* Drag-and-Drop Container */}
                            <DragAndDropContainer
                                acceptType="ACTIVITY_CARD"
                                items={day.activities}
                                onChange={(activities) => handleActivitiesChange(index, activities)}
                            />
                        </Box>

                        {/* Sleep Hours Dropdown */}
                        {index < planningData.length - 1 && (
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
                                        value={day.sleepHours}
                                        label="Sleep Hours"
                                        onChange={(e) =>
                                            handleSleepChange(index, Number(e.target.value))
                                        }
                                    >
                                        {Array.from(
                                            { length: Math.max(
                                                0,
                                                (96 -
                                                    planningData[index].timeSliderValue[1] +
                                                    planningData[index + 1].timeSliderValue[0]) /
                                                2
                                            ) },
                                            (_, i) => (i + 1) / 2
                                        ).map((hours) => (
                                            <MenuItem key={hours} value={hours * 4}>
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

                {/* Generate Route Button */}
                <Box display="flex" justifyContent="center" mt={4}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleGenerateRoute}
                    >
                        Generate Route
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default PlanningSection;
