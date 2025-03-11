import * as React from "react";
import Grid from "@mui/material/Grid2";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import {
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import ChatSection from "../components/Chat/ChatSection.component";
import ShoppingCart from "../components/ShoppingCart/ShoppingCart.component";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AccommodationShoppingCartItem,
  ActivityShoppingCartItem,
  validatePayload,
} from "../utils/DataType/shoppingCart";
import { dayjsStartDate, generateDateRange } from "../utils/time";
import { CALL_ACCOMMODATION, CALL_ACTIVITY, GENERATE_ROUTE, Message } from "../utils/DataType/message";

interface PlannerViewProps {
  isSelectedDates: boolean;
  selectedDates: { startDate: Date; endDate: Date };
  setSelectedDates: (startDate: Date, endDate: Date) => void;
}

const PlannerView: React.FC<PlannerViewProps> = ({
  isSelectedDates,
  selectedDates,
  setSelectedDates,
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    // If no date is selected, navigate to /preference
    if (!isSelectedDates) {
      navigate("/preference");
    }
  }, [isSelectedDates, navigate]);

  const [isChatOpen, setIsChatOpen] = useState<boolean>(true); // Default to showing chat
  const isXs = useMediaQuery("(max-width:600px)");
  const [messages, setMessages] = useState<Message[]>([{ sender: 'bot', text: "### 🌴 Welcome to the Phuket Travel Assistant! 🌊  \n\nNeed recommendations for **accommodations** or **activities**? Just ask! 🏝️  \nYou can also plan your trip **efficiently** by selecting your favorite places. 🚗✨  \n\n#### 💡 Try asking:  \n- What are some **beachfront hotels** in Phuket? \n- Recommend **fun activities** to do in Phuket.  \n- **(After selecting places)** Plan me a travel route! 🗺️ " }]);

  const [accommodationShoppingCartItem, setAccommodationShoppingCartItem] =
    useState<AccommodationShoppingCartItem>({
      item: {
        id: "-1",
        name: "0",
        description: "0",
        tag: "0",
        business_hour: { start: 0, end: 0 },
        image: "0",
      },
      zones: [],
    });
  const [activityShoppingCartItem, setActivityShoppingCartItem] = useState<
    ActivityShoppingCartItem[]
  >([]);

  const handleDateChange = (key: "startDate" | "endDate", value?: Date) => {
    let newStartDate = selectedDates.startDate;
    let newEndDate = selectedDates.endDate;

    // Get current duration
    const duration =
      Math.round(
        (selectedDates.endDate.getTime() - selectedDates.startDate.getTime()) /
        (24 * 60 * 60 * 1000)
      ) + 1;

    if (key === "startDate") {
      newStartDate = dayjsStartDate(value).toDate();
      newEndDate = dayjsStartDate(newStartDate).add(duration - 1, "day").toDate();
    } else if (key === "endDate") {
      newEndDate = dayjsStartDate(value).toDate();
    }

    // Update selected dates
    setSelectedDates(newStartDate, newEndDate);

    setAccommodationShoppingCartItem({
      item: {
        id: "-1",
        name: "0",
        description: "0",
        tag: "0",
        business_hour: { start: 0, end: 0 },
        image: "0",
      },
      zones: [],
    })

    setActivityShoppingCartItem([]);

    setMessages([{ sender: 'bot', text: "### 🌴 Welcome to the Phuket Travel Assistant! 🌊  \n\nNeed recommendations for **accommodations** or **activities**? Just ask! 🏝️  \nYou can also plan your trip **efficiently** by selecting your favorite places. 🚗✨  \n\n#### 💡 Try asking:  \n- What are some **beachfront hotels** in Phuket? \n- Recommend **fun activities** to do in Phuket.  \n- **(After selecting places)** Plan me a travel route! 🗺️ " }])

  };

  const [duration, setDuration] = useState<number>(
    (selectedDates.endDate.getTime() - selectedDates.startDate.getTime()) /
    (24 * 60 * 60 * 1000) +
    1
  );

  const handleDurationChange = (event: SelectChangeEvent<number>) => {
    setAccommodationShoppingCartItem({
      item: {
        id: "-1",
        name: "0",
        description: "0",
        tag: "0",
        business_hour: { start: 0, end: 0 },
        image: "0",
      },
      zones: [],
    })

    setActivityShoppingCartItem([]);
    setDuration(event.target.value as number);
    setMessages([{ sender: 'bot', text: "### 🌴 Welcome to the Phuket Travel Assistant! 🌊  \n\nNeed recommendations for **accommodations** or **activities**? Just ask! 🏝️  \nYou can also plan your trip **efficiently** by selecting your favorite places. 🚗✨  \n\n#### 💡 Try asking:  \n- What are some **beachfront hotels** in Phuket? \n- Recommend **fun activities** to do in Phuket.  \n- **(After selecting places)** Plan me a travel route! 🗺️ " }]
    )
  };

  const [requestCallValue, setRequestCallValue] = useState<
    CALL_ACCOMMODATION | CALL_ACTIVITY | GENERATE_ROUTE | null
  >(null);

  React.useEffect(() => {
    if (!isXs) {
      setIsChatOpen(true);
    }
  }, [isXs]);

  // Call your validation function
  const validationResult = validatePayload(
    activityShoppingCartItem,
    accommodationShoppingCartItem
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Grid container sx={{ width: "100%", height: "100vh", backgroundColor: "#f0f0f0" }}>
        {/* Chat Section */}
        {((isXs && isChatOpen) || !isXs) && (
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 9,
            }}
            sx={{
              backgroundColor: "#fafafa",
              borderRight: "1px solid #ddd",
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
                  padding: 2,
                  background: "linear-gradient(45deg, #67c1f5, #67c1f5, #67c1f5, #4a90e2);",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  flexWrap: "wrap",
                  gap: isXs ? "8px" : "16px",
                  color: "white",
                  borderRadius: "16px",
                  margin: 1
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    gap: "16px",
                    alignItems: "center",
                    flexDirection: isXs ? "column" : "row",
                    flexGrow: 1,
                    width: "100%",
                    color: "white"
                  }}
                >
                  {/* Start Date Picker */}
                  <DatePicker
                    label="Start Date"
                    value={dayjsStartDate(selectedDates.startDate)}
                    onChange={(newValue) =>
                      handleDateChange("startDate", newValue?.toDate())
                    }
                    minDate={dayjsStartDate()}
                    sx={{
                      width: isXs ? "100%" : "auto",
                      "& .MuiInputBase-root": {
                        height: "40px",
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
                  flex: 1,
                  overflowY: "auto",
                  scrollbarWidth: "thin",
                  scrollbarColor: "#ccc #f0f0f0",
                  "&::-webkit-scrollbar": {
                    width: "6px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "#ccc",
                    borderRadius: "4px",
                  },
                  "&::-webkit-scrollbar-track": {
                    backgroundColor: "#f0f0f0",
                  },
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
                  clearRequestCallValue={() => {
                    setRequestCallValue(null);
                  }}
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
        backgroundColor: "#fafafa",
        flexWrap: "wrap",
        gap: "8px",
        height: "64px",
      }}
    >
      <Typography variant="h6" sx={{ marginRight: "auto", color: "#333" }}>
        Place Notes
      </Typography>
      <Tooltip title={!validationResult.result ? validationResult.reason : ""}>
        <Chip
          label={validationResult.result ? "Able to Find Route" : "Unable to Find Route"}
          color={validationResult.result ? "success" : "error"}
        />
      </Tooltip>
    </Box>
              <Box
                sx={{
                  flex: 1,
                  overflowY: "auto",
                  backgroundColor: "#fafafa",
                  scrollbarWidth: "thin",
                  scrollbarColor: "#ccc #f0f0f0",
                  "&::-webkit-scrollbar": {
                    width: "6px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "#ccc",
                    borderRadius: "4px",
                  },
                  "&::-webkit-scrollbar-track": {
                    backgroundColor: "#f0f0f0",
                  },
                }}
              >
                <ShoppingCart
                  activityShoppingCartItem={activityShoppingCartItem}
                  setActivityShoppingCartItem={setActivityShoppingCartItem}
                  accommodationShoppingCartItem={accommodationShoppingCartItem}
                  setAccommodationShoppingCartItem={setAccommodationShoppingCartItem}
                  selectedDates={selectedDates}
                  requestCall={(requestCall) => {
                    setRequestCallValue(requestCall);
                  }}
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
