import React from "react";
import { Dialog, DialogContent, Box, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ActivityInformation from "./ActivityInformation.component";
import AccommodationInformation from "./AccommodationInformation.component";
import { Activity, Accommodation } from "../../utils/DataType/place";
import { ActivityShoppingCartItem, AccommodationShoppingCartItem } from "../../utils/DataType/shoppingCart";

interface DetailsDialogProps {
  open: boolean;
  onClose: () => void;
  type: "accommodation" | "activity";
  selectedItem: Accommodation | Activity | null;
  selectedDates: { startDate: Date; endDate: Date };
  activityShoppingCartItem: ActivityShoppingCartItem[];
  setActivityShoppingCartItem: (items: ActivityShoppingCartItem[]) => void;
  accommodationShoppingCartItem: AccommodationShoppingCartItem | null;
  setAccommodationShoppingCartItem: (items: AccommodationShoppingCartItem) => void;
  switchPanel: (panel: "cart" | "shopping") => void;
}

const DetailsDialog: React.FC<DetailsDialogProps> = ({
  open,
  onClose,
  type,
  selectedItem,
  selectedDates,
  activityShoppingCartItem,
  setActivityShoppingCartItem,
  accommodationShoppingCartItem,
  setAccommodationShoppingCartItem,
  switchPanel,
}) => {
  if (!selectedItem) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogContent>
        {/* Close Button */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: -2 }}>
          <IconButton onClick={onClose} sx={{ color: "#000", padding: 0 }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Title based on Type */}
        <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
          {type === "accommodation" ? "Accommodation Details" : "Activity Details"}
        </Typography>

        {/* Information Section */}
        {type === "activity" ? (
          <ActivityInformation
            data={selectedItem}
            selectedDates={selectedDates}
            shoppingCartItem={activityShoppingCartItem}  // Correct for activities
            setShoppingCartItem={setActivityShoppingCartItem}
            switchPanel={switchPanel}
          />
        ) : (
          <AccommodationInformation
            data={selectedItem}
            selectedDates={selectedDates} // Pass correct dates
            shoppingCartItem={accommodationShoppingCartItem}  // Correct prop for accommodations
            setShoppingCartItem={setAccommodationShoppingCartItem}
            switchPanel={switchPanel}
          />
        )}

      </DialogContent>
    </Dialog>
  );
};

export default DetailsDialog;
