import * as React from "react";
import Grid from "@mui/material/Grid2";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Typography from "@mui/material/Typography";
import { Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, useMediaQuery } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import SuggestionsSection from "../components/Suggestions/SuggestionsSection.component";
import ChatSection from "../components/Chat/ChatSection.component";
import ShoppingCart from "../components/ShoppingCart/ShoppingCart.component";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Accommodation, Activity } from "../utils/DataType/place";
import { AccommodationShoppingCartItem, ActivityShoppingCartItem } from "../utils/DataType/shoppingCart";
import { dayjsStartDate } from "../utils/time";

interface PlannerViewProps {
  isSelectedDates: boolean,
  selectedDates: { startDate: Date; endDate: Date };
  setSelectedDates: (startDate: Date, endDate: Date) => void;
}

const PlannerView: React.FC<PlannerViewProps> = ({ isSelectedDates, selectedDates, setSelectedDates }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // If no date is selected, navigate to /preference
    if (!isSelectedDates) {
      navigate('/preference');
    }
  }, [isSelectedDates, navigate]);

  const [isChatOpen, setIsChatOpen] = useState<boolean>(true); // Default to showing chat
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false); // Toggle between suggestions and cart
  const isXs = useMediaQuery("(max-width:600px)");
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [recommendAccommodations, setRecommendAccommodations] = useState<Accommodation[]>([
    {
      id: "1",
      name: "Cozy Mountain Cabin",
      description: "A serene mountain retreat with stunning views and cozy interiors.",
      tag: "Cabin",
      business_hour: { start: 8, end: 20 },
      image: "https://picsum.photos/300/200?random=1",
    },
    {
      id: "2",
      name: "Beachfront Villa",
      description: "Luxurious villa by the beach with private access and premium amenities.",
      tag: "Villa",
      business_hour: { start: 9, end: 22 },
      image: "https://picsum.photos/300/200?random=2",
    },
    {
      id: "3",
      name: "Urban City Apartment",
      description: "Modern apartment in the heart of the city, close to attractions.",
      tag: "Apartment",
      business_hour: { start: 6, end: 23 },
      image: "https://picsum.photos/300/200?random=3",
    },
  ]);

  const [recommendActivities, setRecommendActivities] = useState<Activity[]>([
    {
      id: "4",
      name: "Hiking Adventure",
      description: "Explore scenic trails with guided hiking tours.",
      tag: "Outdoor",
      business_hour: { start: 6, end: 18 },
      image: "https://picsum.photos/300/200?random=4",
    },
    {
      id: "5",
      name: "Scuba Diving",
      description: "Discover underwater wonders with professional instructors.",
      tag: "Water Activity",
      business_hour: { start: 8, end: 17 },
      image: "https://picsum.photos/300/200?random=5",
    },
    {
      id: "6",
      name: "City Walking Tour",
      description: "Learn the history of the city with an experienced guide.",
      tag: "Tour",
      business_hour: { start: 10, end: 16 },
      image: "https://picsum.photos/300/200?random=6",
    },
  ]);

  const [accommodationShoppingCartItem, setAccommodationShoppingCartItem] = useState<AccommodationShoppingCartItem | null>(null);
  const [activityShoppingCartItem, setActivityShoppingCartItem] = useState<ActivityShoppingCartItem[]>([]);
  const sortZones = (zones: { date: Date; startTime: number; endTime: number; stayTime: number }[]) => {
    return zones.sort((a, b) => {
      const dateComparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (dateComparison !== 0) return dateComparison;

      const startTimeComparison = a.startTime - b.startTime;
      if (startTimeComparison !== 0) return startTimeComparison;

      const endTimeComparison = a.endTime - b.endTime;
      if (endTimeComparison !== 0) return endTimeComparison;

      return a.stayTime - b.stayTime;
    });
  };

  const generateDateRange = (startDate: Date, endDate: Date) => {
    const dates: string[] = [];
    let currentDate = dayjsStartDate(startDate);

    while (currentDate.isBefore(dayjsStartDate(endDate)) || currentDate.isSame(endDate, "day")) {
      dates.push(currentDate.format("YYYY-MM-DD")); // Fix: Display date-only without timezone shift
      currentDate = currentDate.add(1, "day");
    }

    return dates;
  };

  // Helper function to remove duplicate zones
  const distinctZones = (
    zones: { date: Date; startTime: number; endTime: number; stayTime: number }[]
  ) => {
    return zones.filter((zone, index, self) =>
      index === self.findIndex(
        (z) =>
          z.date.toISOString() === zone.date.toISOString() &&
          z.startTime === zone.startTime &&
          z.endTime === zone.endTime &&
          z.stayTime === zone.stayTime
      )
    );
  };

  const updateShoppingCart = (newItems: ActivityShoppingCartItem[]) => {
    const sortedItems = newItems.map((item) => ({
      ...item,
      zones: distinctZones(sortZones(item.zones)),
    }));
    setActivityShoppingCartItem(sortedItems);
  };


  const handleDateChange = (key: "startDate" | "endDate", value?: Date) => {
    let newStartDate = selectedDates.startDate;
    let newEndDate = selectedDates.endDate;

    // Get current duration
    const duration = Math.round(
      (selectedDates.endDate.getTime() - selectedDates.startDate.getTime()) / (24 * 60 * 60 * 1000)
    ) + 1;

    if (key === "startDate") {
      // Convert to local timezone, remove time (set to 00:00:00)
      newStartDate = dayjsStartDate(value).toDate();
      newEndDate = dayjsStartDate(newStartDate).add(duration - 1, "day").toDate();
    } else if (key === "endDate") {
      newEndDate = dayjsStartDate(value).toDate();
    }

    // Update selected dates
    setSelectedDates(newStartDate, newEndDate);

    const updatedActivityCart = activityShoppingCartItem
      .map((cartItem) => ({
        ...cartItem,
        zones: cartItem.zones.filter((zone) => {
          const zoneDate = new Date(zone.date);
          return zoneDate >= newStartDate && zoneDate <= newEndDate;
        }),
      }))
      .filter((cartItem) => cartItem.zones.length > 0);

    updateShoppingCart(updatedActivityCart);

    if (accommodationShoppingCartItem) {
      // Generate the complete date range
      const dates = generateDateRange(newStartDate, newEndDate);

      // Build the full zones array by keeping existing zones and creating new ones where needed
      const updatedAccommodationZones = dates.map((date) => {
        const existingZone = accommodationShoppingCartItem.zones.find(
          (zone) => dayjsStartDate(zone.date).isSame(dayjsStartDate(date))
        );

        if (existingZone) {
          // Keep the existing zone
          return existingZone;
        }

        return {
          date: dayjsStartDate(date).toDate(),
          morning: 24, // Use business_hour start for morning time
          evening: 72,   // Use business_hour end for evening time
          sleepTime: 32,  // Default sleep time (8 hours)
        };
      });

      // Update accommodation shopping cart
      const updatedAccommodationCart = {
        ...accommodationShoppingCartItem,
        zones: updatedAccommodationZones,
      };

      setAccommodationShoppingCartItem(updatedAccommodationCart);
    }
  };

  const [duration, setDuration] = useState(1); // Default to 1


  const handleDurationChange = (event: SelectChangeEvent<number>) => {
    const newDuration = parseInt(event.target.value as string, 10);

    if (newDuration < 1 || newDuration > 5) return; // Ensure valid duration range (1-5)

    // Update the state for duration (if you have it)
    setDuration(newDuration);

    // Ensure endDate is at the end of the last selected day
    const newEndDate = dayjsStartDate(selectedDates.startDate)
      .add(newDuration - 1, "day")
      .toDate();

    // Update selected dates while keeping startDate unchanged
    setSelectedDates(selectedDates.startDate, newEndDate);

    // Correct cart filtering: Ensure it does not remove items from the last valid day
    const updatedActivityCart = activityShoppingCartItem
      .map((cartItem) => ({
        ...cartItem,
        zones: cartItem.zones.filter((zone) => {
          const zoneDate = new Date(zone.date);
          return (
            zoneDate >= selectedDates.startDate &&
            zoneDate <= newEndDate // ✅ Fix: Include full last day
          );
        }),
      }))
      .filter((cartItem) => cartItem.zones.length > 0); // ✅ Only keep items with valid zones

    updateShoppingCart(updatedActivityCart);

    if (accommodationShoppingCartItem) {
      // Generate the complete date range
      const dates = generateDateRange(selectedDates.startDate, newEndDate);

      // Build the full zones array by keeping existing zones and creating new ones where needed
      const updatedAccommodationZones = dates.map((date) => {
        const existingZone = accommodationShoppingCartItem.zones.find(
          (zone) => dayjsStartDate(zone.date).isSame(dayjsStartDate(date))
        );

        if (existingZone) {
          // Keep the existing zone
          return existingZone;
        }

        return {
          date: dayjsStartDate(date).toDate(),
          morning: 24, // Use business_hour start for morning time
          evening: 72,   // Use business_hour end for evening time
          sleepTime: 32,  // Default sleep time (8 hours)
        };
      });

      // Update accommodation shopping cart
      const updatedAccommodationCart = {
        ...accommodationShoppingCartItem,
        zones: updatedAccommodationZones,
      };

      setAccommodationShoppingCartItem(updatedAccommodationCart);
    }
  };




  React.useEffect(() => {
    if (!isXs) {
      setIsChatOpen(true);
    }
  }, [isXs]);

  const switchPanel = (panel: "shopping" | "cart") => {
    switch (panel) {
      case "cart": setIsCartOpen(true); break;
      case "shopping": setIsCartOpen(false); break;
    }

  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Grid container sx={{ width: "100%", height: "100vh" }}>
        {/* Chat Section */}
        {((isXs && isChatOpen) || !isXs) && (
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 8,
            }}
            sx={{
              backgroundColor: "#f9f9f9",
            }}
            height="100%"
          >
            <Box display="flex" flexDirection="column" height="100%">
              {isXs && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    padding: "8px",
                  }}
                >
                  <IconButton onClick={() => setIsChatOpen(false)}>
                    <CloseIcon />
                  </IconButton>
                </Box>
              )}
              {/* Date Header Section */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px",
                  backgroundColor: "#f0f0f0",
                  height: "auto", // Allow dynamic height for responsive layout
                  boxSizing: "border-box",
                  flexWrap: "wrap", // Wrap content on smaller screens
                  gap: isXs ? "8px" : "16px", // Adjust gap for smaller screens
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    gap: "16px",
                    alignItems: "center",
                    flexDirection: isXs ? "column" : "row", // Stack on smaller screens
                    flexGrow: 1,
                    width: "100%", // Ensure it takes full width on smaller screens
                  }}
                >
                  {/* Start Date Picker */}
                  <DatePicker
                    label="Start Date"
                    value={dayjsStartDate(selectedDates.startDate)}
                    onChange={(newValue) => handleDateChange("startDate", newValue?.toDate())}
                    minDate={dayjsStartDate()} // Restricts selection to today and future dates
                    sx={{
                      width: isXs ? "100%" : "auto",
                      "& .MuiInputBase-root": {
                        height: "40px", // Ensures consistent height with the dropdown
                      },
                    }}
                  />



                  {/* Duration Dropdown */}
                  <FormControl
                    sx={{
                      minWidth: 120,
                      width: isXs ? "100%" : "auto",
                    }}
                  >
                    <InputLabel>Days</InputLabel>
                    <Select
                      value={duration}
                      onChange={handleDurationChange}
                      sx={{
                        height: "40px",
                      }}
                    >
                      {[1, 2, 3, 4, 5].map((dayCount) => (
                        <MenuItem key={dayCount} value={dayCount}>
                          {dayCount} {dayCount === 1 ? "Day" : "Days"}
                        </MenuItem>
                      ))}
                    </Select>

                  </FormControl>
                  {JSON.stringify(selectedDates)}
                </Box>
              </Box>

              <Box
                sx={{
                  flex: 1,
                }}
              >
                <ChatSection
                  messages={messages}
                  setMessages={setMessages}
                  setRecommendAccommodations={(newAccommodations) =>
                    setRecommendAccommodations((prev) =>
                      [...newAccommodations, ...prev].slice(0, 8)
                    )
                  }
                  setRecommendActivities={(newActivities) =>
                    setRecommendActivities((prev) =>
                      [...newActivities, ...prev].slice(0, 8)
                    )
                  }
                />
              </Box>
            </Box>

          </Grid>
        )}

        {/* Main Content Area */}
        {(!isXs || !isChatOpen) && (
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 4,
            }}
            height="100%"
          >
            <Box display="flex" flexDirection="column" height="100%">
              {/* Header Section */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px",
                  borderBottom: "1px solid #ddd",
                  flexWrap: "wrap",
                  gap: "8px",
                  height: "64px", // Match the height of the left grid header
                }}
              >
                <Typography variant="h6" sx={{ marginRight: "auto" }}>
                  {isCartOpen ? "Shopping Cart" : "Suggestions"}
                </Typography>
                <Box sx={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <IconButton onClick={() => setIsCartOpen(!isCartOpen)}>
                    <ShoppingCartIcon />
                  </IconButton>
                  {isXs && (
                    <IconButton onClick={() => setIsChatOpen(!isChatOpen)}>
                      <ChatIcon />
                    </IconButton>
                  )}
                </Box>
              </Box>
              <Box
                sx={{
                  flex: 1,
                  overflow: "auto",
                }}
              >
                {isCartOpen ? (
                  <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    {/* ShoppingCart content area */}
                    <Box sx={{ flex: 1, overflow: "auto" }}>
                      <ShoppingCart
                        activityShoppingCartItem={activityShoppingCartItem}
                        setActivityShoppingCartItem={updateShoppingCart}
                        accommodationShoppingCartItem={accommodationShoppingCartItem}
                        setAccommodationShoppingCartItem={setAccommodationShoppingCartItem}
                        selectedDates={selectedDates}
                        switchPanel={switchPanel}
                      />
                    </Box>

                    {/* Checkout button always at the bottom */}
                    {activityShoppingCartItem.length > 0 && accommodationShoppingCartItem && (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          mt: "auto", // pushes this Box to the bottom of the flex container
                          p: 2,
                        }}
                      >
                        <Box sx={{ width: 220 }}>
                          <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            onClick={() => navigate("/your-target-page")} // Replace with your route
                            sx={{
                              borderRadius: "12px",
                              py: 1,
                            }}
                          >
                            Proceed to Checkout
                          </Button>
                        </Box>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <SuggestionsSection
                    recommendAccommodations={recommendAccommodations}
                    recommendActivities={recommendActivities}
                    selectedDates={selectedDates}
                    switchPanel={switchPanel}
                    activityShoppingCartItem={activityShoppingCartItem}
                    setActivityShoppingCartItem={updateShoppingCart}
                    accommodationShoppingCartItem={accommodationShoppingCartItem}
                    setAccommodationShoppingCartItem={setAccommodationShoppingCartItem}
                  />
                )}

              </Box>
            </Box>
          </Grid>
        )}
      </Grid>
    </LocalizationProvider>
  );
};

export default PlannerView;
