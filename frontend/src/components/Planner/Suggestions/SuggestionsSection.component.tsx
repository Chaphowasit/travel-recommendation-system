import {
  Box,
  Typography,
  IconButton,
  Card,
  CardContent,
  CardMedia,
  Grid2 as Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogContent,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";
import React, { useState } from "react";
import InformationSection from "./InformationSection.component";

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

interface SuggestionsSectionProps {
  recommendAccommodations: Accommodation[];
  recommendActivities: Activity[];
  selectedDates: { startDate: Date | null; endDate: Date | null };
  shoppingCartItem: ShoppingCartItem[]; // Initial shopping cart data
  setShoppingCartItem: (items: ShoppingCartItem[]) => void; // Function to update the shopping cart
}

const SuggestionsSection: React.FC<SuggestionsSectionProps> = ({
  recommendAccommodations,
  recommendActivities,
  selectedDates,
  shoppingCartItem,
  setShoppingCartItem,
}) => {
  const [selectedItem, setSelectedItem] = useState<Accommodation | Activity | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCardClick = (item: Accommodation | Activity) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedItem(null);
  };

  return (
    <Box
      sx={{
        padding: "10px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f7f7f7",
      }}
    >
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Recommended Accommodations</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2} justifyContent="center">
            {recommendAccommodations.map((accommodation) => (
              <Grid
                key={accommodation.id}
                size={{ md: 12, lg: 6 }}
                sx={{ display: "flex", justifyContent: "center" }}
              >
                <Card
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                    maxWidth: "350px",
                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                    height: "280px",
                    transition: "transform 0.3s, background-color 0.3s",
                    ":hover": {
                      backgroundColor: "#e0e0e0",
                      transform: "scale(1.05)",
                      cursor: "pointer",
                    },
                  }}
                  onClick={() => handleCardClick(accommodation)}
                >
                  <CardMedia
                    component="img"
                    image={accommodation.image}
                    alt={accommodation.name}
                    sx={{ height: "120px", objectFit: "cover" }}
                  />
                  <CardContent>
                    <Typography variant="h6" sx={{ fontSize: "1rem", fontWeight: "bold" }}>
                      {accommodation.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {accommodation.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Recommended Activities</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2} justifyContent="center">
            {recommendActivities.map((activity) => (
              <Grid
                key={activity.id}
                size={{ md: 12, lg: 6 }}
                sx={{ display: "flex", justifyContent: "center" }}
              >
                <Card
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                    maxWidth: "350px",
                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                    height: "280px",
                    transition: "transform 0.3s, background-color 0.3s",
                    ":hover": {
                      backgroundColor: "#e0e0e0",
                      transform: "scale(1.05)",
                      cursor: "pointer",
                    },
                  }}
                  onClick={() => handleCardClick(activity)}
                >
                  <CardMedia
                    component="img"
                    image={activity.image}
                    alt={activity.name}
                    sx={{ height: "120px", objectFit: "cover" }}
                  />
                  <CardContent>
                    <Typography variant="h6" sx={{ fontSize: "1rem", fontWeight: "bold" }}>
                      {activity.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {activity.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Dialog for Selected Item Information */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogContent>
          {/* Close Button */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: -2 }}>
            <IconButton onClick={handleCloseDialog} sx={{ color: "#000", padding: 0 }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Information Section */}
          {selectedItem && <InformationSection data={selectedItem} selectedDates={selectedDates} shoppingCartItem={shoppingCartItem} setShoppingCartItem={setShoppingCartItem}/>}
        </DialogContent>
      </Dialog>


    </Box>
  );
};

export default SuggestionsSection;
