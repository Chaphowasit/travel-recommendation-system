import * as React from "react";
import Grid from "@mui/material/Grid2";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, useMediaQuery } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import ChatSection from "../components/Chat/ChatSection.component";
import ShoppingCart from "../components/ShoppingCart/ShoppingCart.component";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AccommodationShoppingCartItem, ActivityShoppingCartItem } from "../utils/DataType/shoppingCart";
import { dayjsStartDate, generateDateRange } from "../utils/time";
import { CALL_ACCOMMODATION, CALL_ACTIVITY, GENERATE_ROUTE, Message } from "../utils/DataType/message";

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
  const isXs = useMediaQuery("(max-width:600px)");
  const [messages, setMessages] = useState<Message[]>([]);

  const [accommodationShoppingCartItem, setAccommodationShoppingCartItem] = useState<AccommodationShoppingCartItem>({
    item: {id: "-1", name: "0", description: "0", tag: "0", business_hour: {start: 0, end: 0}, image: "0" },
    zones: []
  });
  const [activityShoppingCartItem, setActivityShoppingCartItem] = useState<ActivityShoppingCartItem[]>([]);

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

    setActivityShoppingCartItem(updatedActivityCart);

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
          ranges: [
            {
              start: 0,
              end: 24, // Use business_hour start for morning time
            }, {
              start: 72,   // Use business_hour end for evening time
              end: 96,   // Use business_hour end for evening time
            }
          ],
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

  const [duration, setDuration] = useState<number>((selectedDates.endDate.getTime() - selectedDates.startDate.getTime()) / (24 * 60 * 60 * 1000) + 1);


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

    setActivityShoppingCartItem(updatedActivityCart);

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
          ranges: [
            {
              start: 0,
              end: 24, // Use business_hour start for morning time
            }, {
              start: 72,   // Use business_hour end for evening time
              end: 96,   // Use business_hour end for evening time
            }
          ],
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

  const [requestCallValue, setRequestCallValue] = useState<CALL_ACCOMMODATION | CALL_ACTIVITY | GENERATE_ROUTE | null>(null)


  React.useEffect(() => {
    if (!isXs) {
      setIsChatOpen(true);
    }
  }, [isXs]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Grid container sx={{ width: "100%", height: "100vh" }}>
        {/* Chat Section */}
        {((isXs && isChatOpen) || !isXs) && (
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 9,
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
                </Box>
              </Box>

              <Box
                sx={{
                  flex: 1, // Ensures the ChatSection takes the remaining available space
                  overflow: "hidden", // Prevent content from overflowing the parent
                }}
              >
                <Box
                  sx={{
                    height: "100%",
                    overflowY: "auto", // Enable scrolling inside the chat section when content overflows
                  }}
                >
                  <ChatSection
                    messages={messages}
                    setMessages={setMessages}
                    selectedDates={selectedDates}
                    activityShoppingCartItem={activityShoppingCartItem}
                    setActivityShoppingCartItem={setActivityShoppingCartItem}
                    accommodationShoppingCartItem={accommodationShoppingCartItem}
                    setAccommodationShoppingCartItem={setAccommodationShoppingCartItem}
                    requestCallValue={requestCallValue}
                    clearRequestCallValue={() => {setRequestCallValue(null)}}
                  />
                </Box>
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
              md: 3,
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
                  Place Notes
                </Typography>
              </Box>
              <Box
                sx={{
                  flex: 1,
                  overflow: "auto",
                }}
              >
                <ShoppingCart
                  activityShoppingCartItem={activityShoppingCartItem}
                  setActivityShoppingCartItem={setActivityShoppingCartItem}
                  accommodationShoppingCartItem={accommodationShoppingCartItem}
                  setAccommodationShoppingCartItem={setAccommodationShoppingCartItem}
                  selectedDates={selectedDates}
                  requestCall={(requestCall) => { setRequestCallValue(requestCall) }}
                />
                
              </Box>
            </Box>
          </Grid>
        )}
      </Grid>
    </LocalizationProvider>
  );
};

export default PlannerView;
