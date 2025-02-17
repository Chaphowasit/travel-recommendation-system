import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid2 as Grid,
  Avatar,
  ToggleButtonGroup,
  ToggleButton,
  Dialog,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  DialogContent,
  IconButton
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";
import ActivityInformation from "../PlaceInformations/ActivityInformation.component";
import AccommodationInformation from "../PlaceInformations/AccommodationInformation.component";
import { Accommodation, Activity } from "../../utils/DataType/place";
import { CALL_ACCOMMODATION, CALL_ACTIVITY, GENERATE_ROUTE } from "../../utils/DataType/message";
import { ActivityShoppingCartItem, AccommodationShoppingCartItem } from "../../utils/DataType/shoppingCart";

interface FlattenedShoppingCartItem {
  item: Activity;
  zone: { date: Date; start: number; end: number; stayTime: number };
}

interface ShoppingCartProps {
  activityShoppingCartItem: ActivityShoppingCartItem[];
  setActivityShoppingCartItem: React.Dispatch<React.SetStateAction<ActivityShoppingCartItem[]>>;
  accommodationShoppingCartItem: AccommodationShoppingCartItem;
  setAccommodationShoppingCartItem: (item: AccommodationShoppingCartItem) => void;
  selectedDates: { startDate: Date; endDate: Date };
  requestCall: (request: CALL_ACCOMMODATION | CALL_ACTIVITY | GENERATE_ROUTE) => void;
}

const formatTime = (value: string | number): string => {
  const quarters = typeof value === "string" ? parseInt(value, 10) : value;
  const hours = Math.floor(quarters / 4);
  const minutes = (quarters % 4) * 15;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
};

const ShoppingCart: React.FC<ShoppingCartProps> = ({
  activityShoppingCartItem,
  setActivityShoppingCartItem,
  accommodationShoppingCartItem,
  setAccommodationShoppingCartItem,
  selectedDates,
  requestCall
}) => {
  const [grouping, setGrouping] = useState<"place" | "date">("place");

  const handleGroupChange = (
    _: React.MouseEvent<HTMLElement>,
    newGrouping: "place" | "date"
  ) => {
    if (newGrouping) {
      setGrouping(newGrouping);
    }
  };

  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [accommodationDialogOpen, setAccommodationDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedAccommodation, setSelectedAccommodation] = useState<Accommodation | null>(null);

  const handleCloseActivityDialog = () => {
    setActivityDialogOpen(false);
    setSelectedActivity(null);
  };

  const handleCloseAccommodationDialog = () => {
    setAccommodationDialogOpen(false);
    setSelectedAccommodation(null);
  };

  const handleSelectActivity = (activity: Activity) => {
    setActivityDialogOpen(true);
    setSelectedActivity(activity);
    handleCloseAccommodationDialog()
  };

  const handleSelectAccommodation = (accommodation: Accommodation) => {
    setAccommodationDialogOpen(true);
    setSelectedAccommodation(accommodation);
    handleCloseActivityDialog()
  };


  const groupedActivitiesByDate = activityShoppingCartItem.reduce(
    (acc, cartItem) => {
      cartItem.zones.forEach((zone) => {
        const dateStr = zone.date.toISOString().split("T")[0];

        // Iterate through all ranges for the current zone and display them all
        zone.ranges.forEach((range) => {
          const flattenedZone = {
            date: zone.date,
            start: range.start,
            end: range.end,
            stayTime: cartItem.stayTime,
          };

          if (!acc[dateStr]) acc[dateStr] = [];
          acc[dateStr].push({ item: cartItem.item, zone: flattenedZone });
        });
      });

      // Sort by start time, then end time, then name
      Object.keys(acc).forEach((dateStr) => {
        acc[dateStr].sort((a, b) => {
          // Compare start time
          if (a.zone.start !== b.zone.start) {
            return a.zone.start - b.zone.start;
          }
          // If start times are equal, compare end time
          if (a.zone.end !== b.zone.end) {
            return a.zone.end - b.zone.end;
          }
          // If both start and end times are equal, compare by name
          return a.item.name.localeCompare(b.item.name);
        });
      });

      return acc;
    },
    {} as Record<string, FlattenedShoppingCartItem[]>
  );

  return (
    <Box sx={{ width: "100%", height: "100%", padding: "20px"}}>
        {/* Toggle between grouping */}
      <Box sx={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
        <ToggleButtonGroup
          value={grouping}
          exclusive
          onChange={handleGroupChange}
          aria-label="grouping"
        >
          <ToggleButton value="place" aria-label="group by place">
            Group by Place
          </ToggleButton>
          <ToggleButton value="date" aria-label="group by date">
            Group by Date
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Accommodation Section */}
      <Typography variant="h5" sx={{ marginBottom: "15px", fontWeight: "bold" }}>
        Accommodation
      </Typography>
      <Grid container spacing={2}>
        {accommodationShoppingCartItem && accommodationShoppingCartItem.item.id !== "-1" ? (
          <Grid size={{ xs: 12 }}>
            <Card
              sx={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
                overflow: "hidden",
              }}
              onClick={() => handleSelectAccommodation(accommodationShoppingCartItem.item)}
            >
              <Avatar
                src={accommodationShoppingCartItem.item.image}
                alt={accommodationShoppingCartItem.item.name}
                sx={{ width: 64, height: 64, margin: "10px" }}
              />
              <CardContent
                sx={{
                  paddingLeft: "10px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  flex: 1,
                }}
              >
                <Typography variant="h6" noWrap>
                  {accommodationShoppingCartItem.item.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {accommodationShoppingCartItem.item.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          <Grid size={{ xs: 12 }}>
            <Box sx={{ padding: "10px", textAlign: "center", border: "1px solid #ddd" }}>
              <Typography variant="body2" color="text.secondary">
                No accommodation selected.
              </Typography>
              <Button
                variant="outlined"
                sx={{ marginTop: "10px" }}
                onClick={() => requestCall(CALL_ACCOMMODATION)}
              >
                Select Accommodation
              </Button>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Activities Section */}
      <Typography variant="h5" sx={{ marginTop: "30px", marginBottom: "15px", fontWeight: "bold" }}>
        Activities
      </Typography>
      {activityShoppingCartItem.length > 0 ? (
        grouping === "date" ? (
          Object.keys(groupedActivitiesByDate).map((date) => (
            <Accordion key={date} defaultExpanded sx={{ marginBottom: "10px" }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">{`Date: ${date}`}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {groupedActivitiesByDate[date].map((groupedItem, index) => (
                    <Grid key={index} size={{ xs: 12 }}>
                      <Card
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          cursor: "pointer",
                          boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
                          overflow: "hidden",
                        }}
                        onClick={() => handleSelectActivity(groupedItem.item)}
                      >
                        <Avatar
                          src={groupedItem.item.image}
                          alt={groupedItem.item.name}
                          sx={{ width: 64, height: 64, margin: "10px" }}
                        />
                        <CardContent
                          sx={{
                            paddingLeft: "10px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            flex: 1,
                          }}
                        >
                          <Typography variant="h6" noWrap>
                            {groupedItem.item.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {`Time: ${formatTime(groupedItem.zone.start)} - ${formatTime(
                              groupedItem.zone.end
                            )}`}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))
        ) : (
          <Grid container spacing={2}>
            {activityShoppingCartItem.map((item, index) => (
              <Grid key={index} size={{ xs: 12 }}>
                <Card
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
                    overflow: "hidden",
                  }}
                  onClick={() => handleSelectActivity(item.item)}
                >
                  <Avatar
                    src={item.item.image}
                    alt={item.item.name}
                    sx={{ width: 64, height: 64, margin: "10px" }}
                  />
                  <CardContent
                    sx={{
                      paddingLeft: "10px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      flex: 1,
                    }}
                  >
                    <Typography variant="h6" noWrap>
                      {item.item.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.item.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )
      ) : (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Box sx={{ padding: "10px", textAlign: "center", border: "1px solid #ddd" }}>
              <Typography variant="body2" color="text.secondary">
                No activities selected.
              </Typography>
              <Button variant="outlined" sx={{ marginTop: "10px" }} onClick={() => requestCall(CALL_ACTIVITY)}>
                Select Activities
              </Button>
            </Box>
          </Grid>
        </Grid>
      )}

      

<Box
        sx={{
          position: 'sticky',
          bottom: 0,
          width: '100%',
          padding: '20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            requestCall(GENERATE_ROUTE)
          }}
          sx={{
            width: '200px',
            padding: '10px 20px',
            fontSize: '16px',
          }}
        >
          Checkout
        </Button>
      </Box>



      {/* Information Dialog */}
      {/* activity dialog */}
      <Dialog open={activityDialogOpen} onClose={handleCloseActivityDialog} fullWidth maxWidth="md">
        <DialogContent>
          {/* Close Button */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: -2 }}>
            <IconButton onClick={handleCloseActivityDialog} sx={{ color: "#000", padding: 0 }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Title based on Type */}
          <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
            Activity Details
          </Typography>

          {/* Information Section */}
          <ActivityInformation
            data={selectedActivity}
            selectedDates={selectedDates}
            shoppingCartItem={activityShoppingCartItem}  // Correct for activities
            setShoppingCartItem={setActivityShoppingCartItem}
            handleFinished={handleCloseActivityDialog}
          />


        </DialogContent>
      </Dialog>

      {/* activity dialog */}
      <Dialog open={accommodationDialogOpen} onClose={handleCloseAccommodationDialog} fullWidth maxWidth="md">
        <DialogContent>
          {/* Close Button */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: -2 }}>
            <IconButton onClick={handleCloseAccommodationDialog} sx={{ color: "#000", padding: 0 }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Title based on Type */}
          <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
            Accommodation Details
          </Typography>

          {/* Information Section */}
          <AccommodationInformation
            data={selectedAccommodation}
            selectedDates={selectedDates} // Pass correct dates
            shoppingCartItem={accommodationShoppingCartItem}  // Correct prop for accommodations
            setShoppingCartItem={setAccommodationShoppingCartItem}
            handleFinished={handleCloseAccommodationDialog}
          />

        </DialogContent>
      </Dialog>

      

    </Box>
  );
};

export default ShoppingCart;
