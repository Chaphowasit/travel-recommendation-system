import React, { useState } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid2 as Grid
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AccommodationCard from "./AccommodationCard.component";
import ActivityCard from "./ActivityCard.component";
import DetailsDialog from "./DetailsDialog.component";
import { Activity, Accommodation } from "../../utils/DataType/place";
import { ActivityShoppingCartItem, AccommodationShoppingCartItem } from "../../utils/DataType/shoppingCart";

interface SuggestionsSectionProps {
  recommendAccommodations: Accommodation[];
  recommendActivities: Activity[];
  selectedDates: { startDate: Date; endDate: Date};
  activityShoppingCartItem: ActivityShoppingCartItem[]; // Initial shopping cart data
  setActivityShoppingCartItem: (items: ActivityShoppingCartItem[]) => void; // Function to update the shopping cart
  accommodationShoppingCartItem: AccommodationShoppingCartItem | null; // Initial shopping cart data
  setAccommodationShoppingCartItem: (items: AccommodationShoppingCartItem) => void; // Function to update the shopping cart
  switchPanel: (panel: "cart" | "shopping") => void;
}

const SuggestionsSection: React.FC<SuggestionsSectionProps> = ({
  recommendAccommodations,
  recommendActivities,
  selectedDates,
  activityShoppingCartItem,
  setActivityShoppingCartItem,
  accommodationShoppingCartItem,
  setAccommodationShoppingCartItem,
  switchPanel,
}) => {
  const [selectedItem, setSelectedItem] = useState<Accommodation | Activity | null>(null);
  const [dialogType, setDialogType] = useState<"accommodation" | "activity" | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCardClick = (item: Accommodation | Activity, type: "accommodation" | "activity") => {
    setSelectedItem(item);
    setDialogType(type);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedItem(null);
    setDialogType(null);
  };

  const switchPanel_close_dialog = (panel: "shopping" | "cart") => {
    handleCloseDialog();
    switchPanel(panel);
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
    {/* Recommended Accommodations */}
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">Recommended Accommodations</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2} justifyContent="center">
          {recommendAccommodations.map((accommodation) => (
            <Grid key={accommodation.id} size={{ md: 12, lg: 6 }} sx={{ display: "flex", justifyContent: "center" }}>
              <AccommodationCard
                accommodation={accommodation}
                onClick={() => handleCardClick(accommodation, "accommodation")}
              />
            </Grid>
          ))}
        </Grid>
      </AccordionDetails>
    </Accordion>

    {/* Recommended Activities */}
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">Recommended Activities</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2} justifyContent="center">
          {recommendActivities.map((activity) => (
            <Grid key={activity.id} size={{ md: 12, lg: 6 }} sx={{ display: "flex", justifyContent: "center" }}>
              <ActivityCard
                activity={activity}
                onClick={() => handleCardClick(activity, "activity")}
              />
            </Grid>
          ))}
        </Grid>
      </AccordionDetails>
    </Accordion>

    {/* Item Dialog for Both Accommodations and Activities */}
    {dialogType && (
      <DetailsDialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          type={dialogType}
          selectedItem={selectedItem}
          selectedDates={selectedDates}
          activityShoppingCartItem={activityShoppingCartItem}
          setActivityShoppingCartItem={setActivityShoppingCartItem}
          accommodationShoppingCartItem={accommodationShoppingCartItem}
          setAccommodationShoppingCartItem={setAccommodationShoppingCartItem}
          switchPanel={switchPanel_close_dialog} />
    )}
  </Box>
  );
};

export default SuggestionsSection;
