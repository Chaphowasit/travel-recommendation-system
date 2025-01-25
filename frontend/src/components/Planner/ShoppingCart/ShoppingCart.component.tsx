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
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InformationSection from "../Suggestions/InformationSection.component";

interface BusinessHour {
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
}

interface Activity {
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

interface FlattenedShoppingCartItem {
  item: Accommodation | Activity;
  zone: { date: string; startTime: string; endTime: string; stayTime: string };
}

interface ShoppingCartProps {
  shoppingCartItems: ShoppingCartItem[];
  setShoppingCartItems: (items: ShoppingCartItem[]) => void;
  selectedDates: { startDate: Date | null; endDate: Date | null };
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
  shoppingCartItems,
  setShoppingCartItems,
  selectedDates,
}) => {
  const [grouping, setGrouping] = useState<"place" | "date">("place");
  const [selectedItem, setSelectedItem] = useState<ShoppingCartItem | FlattenedShoppingCartItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleGroupChange = (
    event: React.MouseEvent<HTMLElement>,
    newGrouping: "place" | "date"
  ) => {
    if (newGrouping) {
      setGrouping(newGrouping);
    }
  };

  const handleCardClick = (item: ShoppingCartItem | FlattenedShoppingCartItem) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedItem(null);
  };

  const groupedByDateMap = shoppingCartItems.reduce((acc, cartItem) => {
    cartItem.zones.forEach((zone) => {
      const date = zone.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push({ item: cartItem.item, zone });
    });

    // Sort each date's items by start time
    Object.keys(acc).forEach((date) => {
      acc[date] = acc[date].sort(
        (a, b) => parseInt(a.zone.startTime, 10) - parseInt(b.zone.startTime, 10)
      );
    });

    return acc;
  }, {} as Record<string, FlattenedShoppingCartItem[]>);

  return (
    <Box sx={{ width: "100%", padding: "20px" }}>
      {/* Group Toggle */}
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

      {grouping === "date" ? (
        Object.keys(groupedByDateMap).map((date) => (
          <Accordion key={date} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{`Date: ${date}`}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {groupedByDateMap[date].map((groupedItem, index) => (
                  <Grid key={index} size={{ xs: 12 }}>
                    <Card
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                        boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
                        overflow: "hidden",
                      }}
                      onClick={() => handleCardClick(groupedItem)}
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
          {shoppingCartItems.map((item, index) => (
            <Grid key={index} size={{ xs: 12 }}>
              <Card
                sx={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
                  overflow: "hidden",
                }}
                onClick={() => handleCardClick(item)}
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
      )}

      {/* Information Section Dialog */}
      {selectedItem && (
        <Dialog
          open={dialogOpen}
          onClose={handleDialogClose}
          fullWidth
          maxWidth="md"
        >
          <InformationSection
            data={selectedItem.item}
            selectedDates={selectedDates}
            shoppingCartItem={shoppingCartItems}
            setShoppingCartItem={setShoppingCartItems}
          />
        </Dialog>
      )}
    </Box>
  );
};

export default ShoppingCart;
