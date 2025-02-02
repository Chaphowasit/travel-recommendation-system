import {
  Typography,
  Box,
  Grid2 as Grid,
  IconButton,
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
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import React, { useEffect, useState } from "react";
import { Activity } from "../../utils/DataType/place";
import { ActivityShoppingCartItem } from "../../utils/DataType/shoppingCart";
import { dayjsStartDate } from "../../utils/time";

interface ActivityInformationProps {
  data: Activity;
  selectedDates: { startDate: Date | null; endDate: Date | null };
  shoppingCartItem: ActivityShoppingCartItem[]; // Initial shopping cart data
  setShoppingCartItem: (items: ActivityShoppingCartItem[]) => void; // Function to update the shopping cart
  switchPanel: (panel: "cart" | "shopping") => void
}

const formatTime = (value: number) => {
  const hours = Math.floor(value / 4);
  const minutes = (value % 4) * 15;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};

const generateDateRange = (startDate: Date, endDate: Date) => {
  const dates: string[] = [];
  let currentDate = dayjsStartDate(startDate);

  while (currentDate.isBefore(dayjsStartDate(endDate)) || currentDate.isSame(endDate, "day")) {
    dates.push(currentDate.format("YYYY-MM-DD")); // Fix: Display date-only without timezone shift
    currentDate = currentDate.add(1, "day");
  }

  return dates;
};


const ActivityInformation: React.FC<ActivityInformationProps> = ({
  data,
  selectedDates,
  shoppingCartItem,
  setShoppingCartItem,
  switchPanel,
}) => {
  const [zones, setZones] = useState<{ date: Date; startTime: number; endTime: number; stayTime: number }[]>([
    { date: dayjsStartDate().toDate(), startTime: data.business_hour.start, endTime: data.business_hour.end, stayTime: 2 },
  ]);
  const [cartDialogOpen, setCartDialogOpen] = useState(false);
  const handleClose = (action: "cart" | "shopping") => {
      switchPanel(action)
      setCartDialogOpen(false); // Close the dialog
  };

  const timeOptions = Array.from({ length: 97 }, (_, i) => ({
    value: i,
    label: formatTime(i),
  }));

  const generateStayTimeOptions = (startTime: number, endTime: number) => {
    const maxStayTime = endTime - startTime;
    return Array.from({ length: maxStayTime - 2 + 1 }, (_, i) => i + 2).map((value) => ({
      value,
      label: `${Math.floor(value / 4)}h ${(value % 4) * 15}m`,
    }));
  };

  const availableDates =
    selectedDates.startDate && selectedDates.endDate
      ? generateDateRange(selectedDates.startDate, selectedDates.endDate)
      : [];

  useEffect(() => {
    // Use existing shoppingCartItem data if available for the current item
    const existingItem = shoppingCartItem.find((cartItem) => cartItem.item.id === data.id);
    if (existingItem) {
      setZones(existingItem.zones);
    }
  }, [shoppingCartItem, data.id]);

  const [errorMessage, setErrorMessage] = useState<string>(""); // State to store error message

  const handleAddToCartClick = () => {
    // Validate that all dropdowns are filled before adding to the cart
    const allFieldsFilled = zones.every(
      (zone) => zone.date && zone.startTime && zone.endTime && zone.stayTime
    );

    if (!allFieldsFilled) {
      setErrorMessage("Please fill out all fields before saving."); // Set error message
      return;
    }

    setErrorMessage(""); // Clear error message if validation passes

    // Update or add the current item in the shopping cart
    const updatedCart = shoppingCartItem.filter((cartItem) => cartItem.item.id !== data.id);
    updatedCart.push({ item: data, zones });
    setShoppingCartItem(updatedCart); // Update the cart with the new data
    setCartDialogOpen(true);
  };
  // Update zone with auto-sorting
  const updateZone = (index: number, field: "date" | "startTime" | "endTime" | "stayTime", value: string) => {
    const newZones = [...zones];
    const currentZone = newZones[index];

    if (field === "startTime") {
      const startValue = parseInt(value, 10);
      const endValue = currentZone.endTime || 96;

      if (startValue >= endValue - 2) {
        currentZone.endTime = startValue + 2;
      }

      currentZone.startTime = startValue;
    } else if (field === "endTime") {
      const endValue = parseInt(value, 10);
      const startValue = currentZone.startTime || 0;

      if (endValue <= startValue + 2) {
        currentZone.startTime = endValue - 2;
      }

      currentZone.endTime = endValue;
    } else if (field === "date") {
      currentZone.date = dayjsStartDate(value).toDate();
    } else {
      currentZone[field] = parseInt(value, 10);
    }

    setZones(newZones);
  };

  const handleCartDialogClose = () => {
    setCartDialogOpen(false);
  };

  const addZone = () => {
    setZones([...zones, { date: dayjsStartDate().toDate(), startTime: data.business_hour.start, endTime: data.business_hour.end, stayTime: 2 }]);
  };

  const deleteZone = (index: number) => {
    const newZones = zones.filter((_, i) => i !== index);
    setZones(newZones);
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
          const startTime = zone.startTime || 0;
          const endTime = zone.endTime || 96;

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
                      <InputLabel>Start Time</InputLabel>
                      <Select
                        fullWidth
                        value={zone.startTime.toString()}
                        onChange={(e) => updateZone(index, "startTime", e.target.value)}
                      >
                        {getFilteredTimeOptions(0, endTime - 2).map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 6, sm: 3 }}>
                    <FormControl fullWidth>
                      <InputLabel>End Time</InputLabel>
                      <Select
                        fullWidth
                        value={zone.endTime.toString()}
                        onChange={(e) => updateZone(index, "endTime", e.target.value)}
                      >
                        {getFilteredTimeOptions(startTime + 2, 96).map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 3 }}>
                    <FormControl fullWidth>
                      <InputLabel>Stay Time</InputLabel>
                      <Select
                        fullWidth
                        value={zone.stayTime.toString()}
                        onChange={(e) => updateZone(index, "stayTime", e.target.value)}
                      >
                        {generateStayTimeOptions(startTime, endTime).map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Grid
                  size={{ xs: 12, md: 2 }}
                  sx={{
                    display: "flex",
                    justifyContent: { xs: "center", md: "flex-end" },
                    marginTop: { xs: "10px", md: "0" },
                  }}
                >
                  <IconButton onClick={addZone} color="primary">
                    <AddIcon />
                  </IconButton>
                  {zones.length > 1 && (
                    <IconButton onClick={() => deleteZone(index)} color="secondary">
                      <DeleteIcon />
                    </IconButton>
                  )}
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

export default ActivityInformation;
