import {
  Typography,
  Box,
  Grid2 as Grid,
  MenuItem,
  Select,
  Dialog,
  Button,
  FormControl,
  InputLabel,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import React, { useEffect, useState } from "react";
import { Accommodation } from "../../utils/DataType/place";
import { AccommodationShoppingCartItem } from "../../utils/DataType/shoppingCart";
import { dayjsStartDate, formatTime } from "../../utils/time";


interface AccommodationInformationProps {
  data: Accommodation;
  selectedDates: { startDate: Date; endDate: Date };
  shoppingCartItem: AccommodationShoppingCartItem | null; // Initial shopping cart data
  setShoppingCartItem: (items: AccommodationShoppingCartItem) => void; // Function to update the shopping cart
  switchPanel: (panel: "cart" | "shopping") => void
}

const generateDateRange = (startDate: Date, endDate: Date) => {
  const dates: string[] = [];
  let currentDate = dayjsStartDate(startDate);

  while (currentDate.isBefore(dayjsStartDate(endDate)) || currentDate.isSame(endDate, "day")) {
    dates.push(currentDate.format("YYYY-MM-DD")); // Fix: Display date-only without timezone shift
    currentDate = currentDate.add(1, "day");
  }

  return dates;
};


const AccommodationInformation: React.FC<AccommodationInformationProps> = ({
  data,
  selectedDates,
  shoppingCartItem,
  setShoppingCartItem,
  switchPanel,
}) => {
  const [zones, setZones] = useState<{ date: Date; morning: number; evening: number; sleepTime: number }[]>([]);
  const [cartDialogOpen, setCartDialogOpen] = useState(false);
  const handleClose = (action: "cart" | "shopping") => {
    switchPanel(action)
    setCartDialogOpen(false); // Close the dialog
  };

  const timeOptions = Array.from({ length: 97 }, (_, i) => ({
    value: i,
    label: formatTime(i),
  }));

  const generatesleepTimeOptions = (morning: number, evening: number) => {
    const maxsleepTime = evening - morning;
    return Array.from({ length: maxsleepTime - 2 + 1 }, (_, i) => i + 2).map((value) => ({
      value,
      label: `${Math.floor(value / 4)}h ${(value % 4) * 15}m`,
    }));
  };

  const availableDates =
    selectedDates.startDate && selectedDates.endDate
      ? generateDateRange(selectedDates.startDate, selectedDates.endDate)
      : [];

  useEffect(() => {
    if (shoppingCartItem && shoppingCartItem.item.id === data.id) {
      setZones(shoppingCartItem.zones);
    } else {
      const dates = generateDateRange(selectedDates.startDate, selectedDates.endDate);
      const defaultZones = dates.map((date) => ({
        date: dayjsStartDate(date).toDate(),
        morning: 24, // Default morning time (6:00 AM)
        evening: 72, // Default evening time (6:00 PM)
        sleepTime: 32,    // Default sleep duration (8 hours)
      }));

      setZones(defaultZones);
    }
  }, [shoppingCartItem, data.id]);

  const [errorMessage, setErrorMessage] = useState<string>(""); // State to store error message

  const handleAddToCartClick = () => {
    // Validate that all dropdowns are filled before adding to the cart
    const allFieldsFilled = zones.every(
      (zone) => zone.date && zone.morning && zone.evening && zone.sleepTime
    );

    if (!allFieldsFilled) {
      setErrorMessage("Please fill out all fields before saving."); // Set error message
      return;
    }

    setErrorMessage(""); // Clear error message if validation passes

    // Update or add the current item in the shopping cart
    setShoppingCartItem({
      item: data,  // Keep the accommodation item reference
      zones: zones // Use the updated zones
    });
    setCartDialogOpen(true);
  };
  // Update zone with auto-sorting
  const updateZone = (index: number, field: "date" | "morning" | "evening" | "sleepTime", value: string) => {
    const newZones = [...zones];
    const currentZone = newZones[index];

    if (field === "morning") {
      const startValue = parseInt(value, 10);
      const endValue = currentZone.evening || 96;

      if (startValue >= endValue - 2) {
        currentZone.evening = startValue + 2;
      }

      currentZone.morning = startValue
    } else if (field === "evening") {
      const endValue = parseInt(value, 10);
      const startValue = currentZone.morning || 0;

      if (endValue <= startValue + 2) {
        currentZone.morning = endValue - 2;
      }

      currentZone.evening = endValue
    } else if (field === "date") {
      currentZone.date = dayjsStartDate(value).toDate();
    } else {
      currentZone.sleepTime = parseInt(value, 10);
    }

    setZones(newZones);
  };

  const handleCartDialogClose = () => {
    setCartDialogOpen(false);
  };

  const getFilteredTimeOptions = (min: number, max: number) => {
    return timeOptions.filter((option) => option.value >= min && option.value <= max);
  };

  return (
    <Box sx={{ width: "100%", padding: "20px", marginTop: "10px" }}>
      <Grid container spacing={2} alignItems="flex-start">
        {/* Image  */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            component="img"
            src={data.image}
            alt={data.name}
            sx={{
              width: "100%",
              height: "auto",
              objectFit: "cover",
              borderRadius: "4px",
            }}
          />
        </Grid>

        {/* Info  */}
        <Grid size={{ xs: 12, md: 6 }} sx={{ position: "relative" }}>
          <Box>
            <Typography
              variant="h4"
              component="div"
              sx={{
                fontWeight: "bold",
                marginBottom: "10px",
                marginTop: { xs: "10px", md: "0" },
              }}
            >
              {data.name}
            </Typography>
            <Box
              sx={{
                maxHeight: "150px",
                overflowY: "auto",
                marginBottom: "10px",
                paddingRight: "10px",
              }}
            >
              <Typography variant="body1">{data.description}</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ marginBottom: "10px" }}>
              <strong>Tag:</strong> {data.tag}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Preferred Visit Time  */}
      <Box sx={{ marginTop: "20px" }}>
        <Typography variant="h6" sx={{ marginBottom: "10px" }}>
          Preferred Visit Time
        </Typography>

        {zones.map((zone, index) => {
          const morning = zone.morning || 0;
          const evening = zone.evening || 96;

          return (
            <Box key={index} sx={{ marginBottom: "20px" }}>
              <Grid container spacing={1} alignItems="center">
                <Grid size={{ xs: 12, md: 10 }} container spacing={2}>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <FormControl fullWidth>
                      <InputLabel>Select Date</InputLabel>
                      <Select
                        fullWidth
                        value={dayjsStartDate(zone.date).format("YYYY-MM-DD")}
                        onChange={(e) => updateZone(index, "date", e.target.value)}
                        disabled
                      >
                        {availableDates.map((date) => (
                          <MenuItem key={date} value={dayjsStartDate(date).format("YYYY-MM-DD")}>
                            {dayjsStartDate(date).format("YYYY-MM-DD")}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 6, sm: 3 }}>
                    <FormControl fullWidth>
                      <InputLabel>Morning</InputLabel>
                      <Select
                        fullWidth
                        value={zone.morning.toString()}
                        onChange={(e) => updateZone(index, "morning", e.target.value)}
                      >
                        {getFilteredTimeOptions(0, evening - 2).map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 6, sm: 3 }}>
                    <FormControl fullWidth>
                      <InputLabel>Evening</InputLabel>
                      <Select
                        fullWidth
                        value={zone.evening.toString()}
                        onChange={(e) => updateZone(index, "evening", e.target.value)}
                      >
                        {getFilteredTimeOptions(morning + 2, 96).map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 3 }}>
                    <FormControl fullWidth>
                      <InputLabel>Sleep Time</InputLabel>
                      <Select
                        fullWidth
                        value={zone.sleepTime.toString()}
                        onChange={(e) => updateZone(index, "sleepTime", e.target.value)}
                      >
                        {generatesleepTimeOptions(morning, evening).map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          );
        })}
      </Box>

      <Box
        sx={{
          marginTop: "20px",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center", // Align error message and button vertically
          gap: "10px", // Add spacing between error message and button
        }}
      >
        {/* Display error message if any */}
        {errorMessage && (
          <Typography
            variant="body2"
            color="error"
            sx={{ textAlign: "right" }}
          >
            {errorMessage}
          </Typography>
        )}

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCartClick}
          color="primary"
          variant="contained"
          startIcon={<AddShoppingCartIcon />}
        >
          Add to Cart
        </Button>
      </Box>


      <Dialog open={cartDialogOpen} onClose={handleCartDialogClose}>
        <DialogTitle>
          <Typography variant="h6">Added to Cart</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Your item has been successfully added to the cart.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => handleClose("cart")}
          >
            Go to Cart
          </Button>

          <Button
            variant="outlined"
            onClick={() => handleClose("shopping")}
          >
            Select Next
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AccommodationInformation;
