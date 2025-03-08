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
import { dayjsStartDate, formatTime } from "../../utils/time";

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
    handleCloseAccommodationDialog();
  };

  const handleSelectAccommodation = (accommodation: Accommodation) => {
    setAccommodationDialogOpen(true);
    setSelectedAccommodation(accommodation);
    handleCloseActivityDialog();
  };

  // Updated grouping logic:
  // If zone.range.end > 95, split into two entries: one for the current day and one for the next day.
  const groupedActivitiesByDate = activityShoppingCartItem.reduce(
    (acc, cartItem) => {
      cartItem.zones.forEach((zone) => {
        const processZone = (date: Date, start: number, end: number) => {
          const dateStr = dayjsStartDate(date).format("YYYY-MM-DD");
          const flattenedZone = {
            date,
            start,
            end,
            stayTime: cartItem.stayTime,
          };
          if (!acc[dateStr]) acc[dateStr] = [];
          acc[dateStr].push({ item: cartItem.item, zone: flattenedZone });
        };

        // Split if the range ends after 95 (indicating it spills into the next day)
        if (zone.range.end > 96) {
          // Current day: from original start until 95
          processZone(zone.date, zone.range.start, 96);
          // Next day: from 0 until the remaining time (zone.range.end - 95)
          const nextDay = new Date(zone.date);
          nextDay.setDate(nextDay.getDate() + 1);
          processZone(nextDay, 0, zone.range.end - 96);
        } else {
          processZone(zone.date, zone.range.start, zone.range.end);
        }
      });

      // Sort entries for each date
      Object.keys(acc).forEach((dateStr) => {
        acc[dateStr].sort((a, b) => {
          if (a.zone.start !== b.zone.start) {
            return a.zone.start - b.zone.start;
          }
          if (a.zone.end !== b.zone.end) {
            return a.zone.end - b.zone.end;
          }
          return a.item.name.localeCompare(b.item.name);
        });
      });

      return acc;
    },
    {} as Record<string, FlattenedShoppingCartItem[]>
  );

  return (
    <Box sx={{ width: "100%", height: "100%", padding: "20px" }}>
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
          Object.keys(groupedActivitiesByDate).sort((a, b) => new Date(a).getTime() - new Date(b).getTime()).map((date) => (
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
            {[...activityShoppingCartItem]
              .sort((a, b) => a.item.name.localeCompare(b.item.name))
              .map((item, index) => (
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

      {accommodationShoppingCartItem.item.id !== "-1" && activityShoppingCartItem.length > 0 && (
        <Box
          sx={{
            position: "sticky",
            bottom: 0,
            width: "100%",
            padding: "20px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              requestCall(GENERATE_ROUTE);
            }}
            sx={{
              width: "200px",
              padding: "10px 20px",
              fontSize: "16px",
            }}
          >
            Checkout
          </Button>
        </Box>
      )}

      {/* Activity Information Dialog */}
      <Dialog open={activityDialogOpen} onClose={handleCloseActivityDialog} fullWidth maxWidth="md">
        <DialogContent>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: -2 }}>
            <IconButton onClick={handleCloseActivityDialog} sx={{ color: "#000", padding: 0 }}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
            Activity Details
          </Typography>
          <ActivityInformation
            data={selectedActivity}
            selectedDates={selectedDates}
            shoppingCartItem={activityShoppingCartItem}
            setShoppingCartItem={setActivityShoppingCartItem}
            handleFinished={handleCloseActivityDialog}
          />
        </DialogContent>
      </Dialog>

      {/* Accommodation Information Dialog */}
      <Dialog open={accommodationDialogOpen} onClose={handleCloseAccommodationDialog} fullWidth maxWidth="md">
        <DialogContent>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: -2 }}>
            <IconButton onClick={handleCloseAccommodationDialog} sx={{ color: "#000", padding: 0 }}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
            Accommodation Details
          </Typography>
          <AccommodationInformation
            data={selectedAccommodation}
            selectedDates={selectedDates}
            shoppingCartItem={accommodationShoppingCartItem}
            setShoppingCartItem={setAccommodationShoppingCartItem}
            handleFinished={handleCloseAccommodationDialog}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ShoppingCart;
