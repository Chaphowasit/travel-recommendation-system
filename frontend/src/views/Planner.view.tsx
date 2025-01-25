import * as React from "react";
import Grid from "@mui/material/Grid2";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Typography from "@mui/material/Typography";
import { useMediaQuery } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import SuggestionsSection from "../components/Planner/Suggestions/SuggestionsSection.component";
import ChatSection from "../components/Planner/Chat/ChatSection.component";
import ShoppingCart from "../components/Planner/ShoppingCart/ShoppingCart.component";
import { useState } from "react";

interface BusinessHour {
  start: number; // 0-96 format
  end: number; // 0-96 format
  start: number; // 0-96 format
  end: number; // 0-96 format
}


interface Accommodation {
  id: string;
  name: string;
  description: string;
  tag: string;
  business_hour: BusinessHour;
  image: string;
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
  id: string;
  name: string;
  description: string;
  tag: string;
  business_hour: BusinessHour;
  image: string;
}

interface ShoppingCartItem {
  item: Accommodation | Activity; // Reference to the item (Accommodation or Activity)
  zones: { date: string; startTime: string; endTime: string; stayTime: string }[]; // List of time zones
}

interface PlannerViewProps {
  selectedDates: { startDate: Date ; endDate: Date };
  setSelectedDates: (startDate: Date, endDate: Date) => void;
}

const PlannerView: React.FC<PlannerViewProps> = ({ selectedDates, setSelectedDates }) => {
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

  const [shoppingCartItem, setShoppingCartItem] = useState<ShoppingCartItem[]>([]);


  const handleDateChange = (key: "startDate" | "endDate", value: Dayjs | null) => {
    if (key === "startDate") {
      setSelectedDates(value?.toDate() || new Date(), selectedDates.endDate || new Date());
    } else if (key === "endDate") {
      setSelectedDates(selectedDates.startDate || new Date(), value?.toDate() || new Date());
    }
  };

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
                  height: "64px", // Fixed height for the left header
                  boxSizing: "border-box",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    gap: "16px",
                    alignItems: "center",
                    flexGrow: 1,
                  }}
                >
                  <DatePicker
                    label="Start Date"
                    value={dayjs(selectedDates.startDate)}
                    onChange={(newValue) => handleDateChange("startDate", newValue)}
                    sx={{
                      "& .MuiInputBase-input": {
                        fontSize: "0.8rem", // Smaller font size
                      },
                    }}
                  />
                  <DatePicker
                    label="End Date"
                    value={dayjs(selectedDates.endDate)}
                    onChange={(newValue) => handleDateChange("endDate", newValue)}
                    sx={{
                      "& .MuiInputBase-input": {
                        fontSize: "0.8rem", // Smaller font size
                      },
                    }}
                  />
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
                <ShoppingCart
                  shoppingCartItems={shoppingCartItem}
                  setShoppingCartItems={setShoppingCartItem}
                  selectedDates={selectedDates}
                />
              ) : (
                <SuggestionsSection
                  recommendAccommodations={recommendAccommodations}
                  recommendActivities={recommendActivities}
                  selectedDates={selectedDates}
                  shoppingCartItem={shoppingCartItem}
                  setShoppingCartItem={setShoppingCartItem}
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
