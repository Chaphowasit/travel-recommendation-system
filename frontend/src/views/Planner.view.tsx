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
import { dayjsStartDate, generateDateRange } from "../utils/time";

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
      "business_hour": {
        "end": 96,
        "start": 0
      },
      "description": "By The Sea is a highly-rated hotel in Cape Panwa, Phuket, with a 4.5/5 rating based on 505 reviews, making it the second-best hotel in the Wichit area. The hotel combines value, comfort, and convenience, offering amenities like free Wi-Fi, air conditioning, flat-screen TVs, and a refrigerator in guest rooms. Guests can enjoy a pool, free breakfast, and access to room service and concierge services. Additional conveniences include free parking and proximity to local Indian restaurants. The property features a fitness center, private beach, and various room types, including ocean view and family rooms, all in a peaceful setting.",
      "id": "H0036",
      "image": "https://www.bytheseaphuket.com/images/1258.jpg",
      "name": "By The Sea Phuket Beach Resort",
      "tag": "hotel, restaurant, beach"
    },
    {
      "business_hour": {
        "end": 96,
        "start": 0
      },
      "description": "\"See Sea\" boutique hotel in Kalim, Phuket, offers a peaceful retreat just minutes from Patong beach. Rated 3.5 out of 5 based on 58 reviews, the hotel features spacious, ocean-view suites inspired by Shino-Portuguese architecture. Amenities include free parking, high-speed WiFi, a pool, hot tub, free breakfast, a bar, and a restaurant. The hotel is recognized for its cleanliness and value, making it a solid choice for visitors seeking a blend of tranquility and accessibility to local attractions.",
      "id": "H0418",
      "image": "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/02/57/3f/94/see-sea-phuket.jpg",
      "name": "See Sea Phuket",
      "tag": "boutique hotel, beach, restaurant"
    }
  ]);



  const [recommendActivities, setRecommendActivities] = useState<Activity[]>([
    {
      "business_hour": {
        "end": 96,
        "start": 0
      },
      "description": "Friendship Beach, located in Rawai on Phuket's southeastern coast, is a serene and picturesque destination ideal for relaxation. Known for its tranquil atmosphere, it provides a peaceful escape from busier tourist areas. Although swimming is not recommended due to shallow tides, visitors can enjoy leisurely walks, yoga, and stunning views of Chalong Bay. The beach hosts wellness retreats, cozy resorts, and beachside restaurants serving delicious Thai cuisine, making it a hidden gem for those seeking tranquility in Phuket.",
      "duration": 8,
      "id": "A2103",
      "image": "https://cf.bstatic.com/xdata/images/hotel/max1024x768/229825375.jpg?k=9f96592ae1c2a9f5143a6f5060dca932a848f6b2d8675a04f73addcb813b5826&o=&hp=1",
      "name": "Friendship Beach",
      "tag": "beach, wellness retreat, restaurant"
    },
    {
      "business_hour": {
        "end": 96,
        "start": 0
      },
      "description": "Ban Nam Khem Tsunami Memorial Park, located 7 kilometers from Takua Pa District in Phuket, Thailand, spans 8,000 square meters and features five main areas: Resting Area, Health Area, Playground Area, and the Tsunami Memorial Area, which highlights a curved concrete wall symbolizing the tsunami opposite a damaged fishing boat. A clay wall inscribed with over 1,400 names of tsunami victims adds to the memorial aspect. The park also includes a royal statue, a Buddha Image worshipped by fishermen, seafood restaurants, tourist information, and local souvenirs. Adjacent to a beautiful beach with white sand and clear water, the park serves as both a poignant reminder of the tragedy and a pleasant spot for family picnics. It is open 24/7, with the exhibition building operating from 8:00 AM to 5:00 PM.",
      "duration": 8,
      "id": "A2004",
      "image": "https://www.thegopinivasgrand.com/wp-content/uploads/2022/12/Tsunami-Memorial-Park-Kanyakumari.jpg",
      "name": "Tsunami Memorial Park",
      "tag": "memorial park, beach, seafood restaurants"
    },
    {
      "business_hour": {
        "end": 96,
        "start": 0
      },
      "description": "Nai Harn Beach is a tranquil seaside resort in Phuket, characterized by a village atmosphere and a relaxed, slightly hippy vibe. It features simple shops offering beachwear and Thai crafts, along with casual restaurants serving local cuisine. Visitors can explore the serene grounds of the nearby Wat Nai Harn monastery and enjoy jogging and paddleboating at the tree-lined Nai Harn Lake. The beach is renowned for its fine sand.",
      "duration": 8,
      "id": "A0206",
      "image": "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/17/48/24/64/img-20190411-110938-largejpg.jpg",
      "name": "Nai Harn Beach",
      "tag": "beach, restaurant, monastery"
    },
    {
      "business_hour": {
        "end": 96,
        "start": 0
      },
      "description": "A serene massage and wellness center in Phuket, Thailand, known for its tranquil atmosphere and professional services, offering a variety of treatments to relax the body and rejuvenate the mind.",
      "duration": 1,
      "id": "A0193",
      "image": "https://media-cdn.tripadvisor.com/media/photo-s/09/b8/e4/8c/carpe-diem-massage-phuket.jpg",
      "name": "Carpe Diem Massage Phuket",
      "tag": "wellness center, massage therapy, relaxation treatments"
    }
  ]);

  const handleSetRecommendAccommodations = (newAccommodations: Accommodation[]) => {
    setRecommendAccommodations((prev) => {
      // Use new accommodations as the base list
      const updatedList = [...newAccommodations];

      // Append old accommodations only if their ID is not already in the new list
      for (const oldAccommodation of prev) {
        if (!newAccommodations.some((newItem) => newItem.id === oldAccommodation.id)) {
          updatedList.push(oldAccommodation);
        }
      }

      // Return only the first 8 items
      return updatedList.slice(0, 8);
    });
  };

  const handleSetRecommendActivities = (newActivities: Activity[]) => {
    setRecommendActivities((prev) => {
      // Use new activities as the base list
      const updatedList = [...newActivities];

      // Append old activities only if their ID is not already in the new list
      for (const oldActivity of prev) {
        if (!newActivities.some((newItem) => newItem.id === oldActivity.id)) {
          updatedList.push(oldActivity);
        }
      }

      // Return only the first 8 items
      return updatedList.slice(0, 8);
    });
  };


  const [accommodationShoppingCartItem, setAccommodationShoppingCartItem] = useState<AccommodationShoppingCartItem | null>(null);
  const [activityShoppingCartItem, setActivityShoppingCartItem] = useState<ActivityShoppingCartItem[]>([]);

  const updateShoppingCart = (newItems: ActivityShoppingCartItem[]) => {
    setActivityShoppingCartItem(newItems);
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
                    setRecommendAccommodations={(newAccommodations) =>
                      handleSetRecommendAccommodations(newAccommodations)
                    }
                    setRecommendActivities={(newActivities) =>
                      handleSetRecommendActivities(newActivities)
                    }
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
