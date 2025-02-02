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
  AccordionDetails} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ActivityInformation from "../Suggestions/ActivityInformation.component";
import AccommodationInformation from "../Suggestions/AccommodationInformation.component";
import { Activity } from "../../utils/DataType/place";
import { ActivityShoppingCartItem, AccommodationShoppingCartItem } from "../../utils/DataType/shoppingCart";

interface FlattenedShoppingCartItem {
  item: Activity;
  zone: { date: Date; startTime: number; endTime: number; stayTime: number };
}

interface ShoppingCartProps {
  activityShoppingCartItem: ActivityShoppingCartItem[];
  setActivityShoppingCartItem: (items: ActivityShoppingCartItem[]) => void;
  accommodationShoppingCartItem: AccommodationShoppingCartItem | null;
  setAccommodationShoppingCartItem: (item: AccommodationShoppingCartItem) => void;
  selectedDates: { startDate: Date; endDate: Date };
  switchPanel: (panel: "cart" | "shopping") => void;
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
  switchPanel,
}) => {
  const [grouping, setGrouping] = useState<"place" | "date">("place");
  const [selectedItem, setSelectedItem] = useState<
    ActivityShoppingCartItem | AccommodationShoppingCartItem | null
  >(null);
  const [selectedType, setSelectedType] = useState<"accommodation" | "activity">("accommodation")
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleGroupChange = (
    _: React.MouseEvent<HTMLElement>,
    newGrouping: "place" | "date"
  ) => {
    if (newGrouping) {
      setGrouping(newGrouping);
    }
  };

  const handleCardClick = (
    item_id: string,
    type: "activity" | "accommodation"
  ) => {
    setSelectedType(type)
    if (type === "accommodation") {
      setSelectedItem(accommodationShoppingCartItem);
    } else {
      let item = activityShoppingCartItem.find((item) => item.item.id === item_id)
      if (item) setSelectedItem(item);
    }

    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedItem(null);
  };

  // Group activities by date
  const groupedActivitiesByDate = activityShoppingCartItem.reduce(
    (acc, cartItem) => {
      cartItem.zones.forEach((zone) => {
        const date = zone.date.toISOString().split("T")[0];
        if (!acc[date]) acc[date] = [];
        acc[date].push({ item: cartItem.item, zone });
      });
      return acc;
    },
    {} as Record<string, FlattenedShoppingCartItem[]>
  );

  return (
    <Box sx={{ width: "100%", padding: "20px" }}>
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
        {accommodationShoppingCartItem ? (
          <Grid size={{ xs: 12 }}>
            <Card
              sx={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
                overflow: "hidden",
              }}
              onClick={() => handleCardClick(accommodationShoppingCartItem.item.id, "accommodation")}
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
                onClick={() => switchPanel("shopping")}
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
                        onClick={() => handleCardClick(groupedItem.item.id, "activity")}
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
                            {`Time: ${formatTime(groupedItem.zone.startTime)} - ${formatTime(
                              groupedItem.zone.endTime
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
                  onClick={() => handleCardClick(item.item.id, "activity")}
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
              <Button variant="outlined" sx={{ marginTop: "10px" }} onClick={() => switchPanel("shopping")}>
                Select Activities
              </Button>
            </Box>
          </Grid>
        </Grid>
      )}

      {/* Information Dialog */}
      {selectedItem && (
        <Dialog open={dialogOpen} onClose={handleDialogClose} fullWidth maxWidth="md">
          {selectedType === "activity" ? (
            <ActivityInformation
              data={selectedItem.item}
              selectedDates={selectedDates}
              shoppingCartItem={activityShoppingCartItem}
              setShoppingCartItem={setActivityShoppingCartItem}
              switchPanel={switchPanel}
            />
          ) : (
            <AccommodationInformation
              data={selectedItem.item}
              shoppingCartItem={accommodationShoppingCartItem}
              setShoppingCartItem={setAccommodationShoppingCartItem}
              switchPanel={switchPanel}
              selectedDates={selectedDates}
            />
          )}
        </Dialog>
      )}
    </Box>
  );
};

export default ShoppingCart;
