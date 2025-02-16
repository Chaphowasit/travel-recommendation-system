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
import { AccommodationShoppingCartItem, AccommodationZone, Range } from "../../utils/DataType/shoppingCart";
import { dayjsStartDate, formatTime, generateDateRange } from "../../utils/time";
import DualRangeSelectBar from "../utils/DualRangeSelectBar";

// Define the props
interface AccommodationInformationProps {
  data: Accommodation;
  selectedDates: { startDate: Date; endDate: Date };
  shoppingCartItem: AccommodationShoppingCartItem | null; // Initial shopping cart data
  setShoppingCartItem: (items: AccommodationShoppingCartItem) => void; // Function to update the shopping cart
  switchPanel: (panel: "cart" | "shopping") => void;
}

const AccommodationInformation: React.FC<AccommodationInformationProps> = ({
  data,
  selectedDates,
  shoppingCartItem,
  setShoppingCartItem,
  switchPanel,
}) => {
  const [zones, setZones] = useState<AccommodationZone[]>([]);
  const [cartDialogOpen, setCartDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleClose = (action: "cart" | "shopping") => {
    switchPanel(action);
    setCartDialogOpen(false); // Close the dialog
  };

  useEffect(() => {
    if (shoppingCartItem && shoppingCartItem.item.id === data.id) {
      setZones(shoppingCartItem.zones);
    } else {
      const dates = generateDateRange(selectedDates.startDate, selectedDates.endDate);
      
      const defaultZones = dates.map((date) => ({
        date: dayjsStartDate(date).toDate(),
        ranges: [{ start: 0, end: 24 }, { start: 72, end: 96 }],
        sleepTime: 32, // Default sleep duration (8 hours)
      }));

      for (let i = 0; i < defaultZones.length; i++) {
        const currentRange = defaultZones[i].ranges;
        const nextRange = defaultZones[i+1] ? defaultZones[i+1].ranges : [{ start: 0, end: 0 }, { start: 0, end: 0 }];
        const rangeStart = currentRange[1].end - currentRange[1].start;
        const rangeEnd = nextRange[0].end - nextRange[0].start;

        const maxSleep = rangeStart + rangeEnd;
        if (defaultZones[i].sleepTime > maxSleep) {
          defaultZones[i].sleepTime = maxSleep; // Adjust sleepTime if it exceeds max sleep hours
        }
      }

      setZones(defaultZones);
    }
  }, [shoppingCartItem, data.id, selectedDates]);

  const calculateMaxSleepHours = (index: number, range?: Range[]) => {
    const currentRange = range || zones[index]?.ranges || [{ start: 0, end: 0 }, { start: 0, end: 0 }];
    const rangeStart = currentRange[1].end - currentRange[1].start;
    const rangeEnd = zones[index + 1] ? zones[index + 1].ranges[0].end - zones[index + 1].ranges[0].start : 0;
    return rangeStart + rangeEnd - 1; // Subtract 1 to prevent the overlap
  };

  const handleAddToCartClick = () => {
    const allFieldsFilled = zones.every(
      (zone) =>
        zone.date &&
        zone.ranges[0] &&
        zone.ranges[1] &&
        zone.sleepTime !== undefined
    );

    if (!allFieldsFilled) {
      setErrorMessage("Please fill out all fields before saving.");
      return;
    }

    setErrorMessage(""); // Clear error message if validation passes

    setShoppingCartItem({
      item: data,
      zones: zones,
    });
    setCartDialogOpen(true);
  };

  const handleCartDialogClose = () => {
    setCartDialogOpen(false);
  };

  // Handle range changes and sleep time updates
  const handleRangeChange = (newRange: Range[], index: number) => {
    // Get the previous, current, and next ranges
    const prevRange = zones[index - 1] ? zones[index - 1].ranges : [{ start: 0, end: 0 }, { start: 0, end: 0 }];
    const currentRange = newRange;
    const nextRange = zones[index + 1] ? zones[index + 1].ranges : [{ start: 0, end: 0 }, { start: 0, end: 0 }];
  
    const prevRangeStart = prevRange[1].end - prevRange[1].start;
    const prevRangeEnd = currentRange[0].end - currentRange[0].start;
    const currRangeStart = currentRange[1].end - currentRange[1].start;
    const currRangeEnd = nextRange[0].end - nextRange[0].start;
  
    const prevMaxSleep = prevRangeStart + prevRangeEnd;
    const currMaxSleep = currRangeStart + currRangeEnd;
  
    // Update the range
    setZones((prevZones) =>
      prevZones.map((zone, i) =>
        i === index ? { ...zone, ranges: currentRange } : zone
      )
    );
  
    // If current zone exceeds max sleep, 
    if (zones[index].sleepTime > currMaxSleep) {
      // Update current zone's sleep time
      setZones((prevZones) =>
        prevZones.map((zone, i) =>
          i === index ? { ...zone, sleepTime: currMaxSleep } : zone
        )
      );
    }

    // update the previous and current zones
    if (zones[index-1] && zones[index-1].sleepTime > prevMaxSleep) {
      // Update previous zone's sleep time if needed
      setZones((prevZones) =>
        prevZones.map((zone, i) =>
          i === index - 1 ? { ...zone, sleepTime: prevMaxSleep } : zone
        )
      );
    }
  };
  

  const handleSleepHoursChange = (newSleepHours: number, index: number) => {
    setZones((prevZones) =>
      prevZones.map((zone, i) =>
        i === index ? { ...zone, sleepTime: newSleepHours } : zone
      )
    );
  };

  return (
    <Box sx={{ width: "100%", padding: "20px", marginTop: "10px" }}>
      <Grid container spacing={2} alignItems="flex-start">
        {/* Image */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            component="img"
            src={data.image}
            alt={data.name}
            sx={{
              width: "100%",
              height: "250px",
              objectFit: "cover",
              borderRadius: "4px",
            }}
          />
        </Grid>

        {/* Info */}
        <Grid size={{ xs: 12, md: 6 }} sx={{ position: "relative" }}>
          <Box>
            <Typography variant="h4" component="div" sx={{ fontWeight: "bold", marginBottom: "10px" }}>
              {data.name}
            </Typography>
            <Box sx={{ maxHeight: "150px", overflowY: "auto", marginBottom: "10px", paddingRight: "10px" }}>
              <Typography variant="body1">{data.description}</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ marginBottom: "10px" }}>
              <strong>Tag:</strong> {data.tag}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Preferred Visit Time */}
      <Box sx={{ marginTop: "20px" }}>
        <Typography variant="h6" sx={{ marginBottom: "10px" }}>
          Preferred Visit Time
        </Typography>

        {zones.map((zone, index) => (
          <Box key={index} sx={{ marginBottom: "20px" }}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, sm: 2 }}>
                <Typography variant="body1">{dayjsStartDate(zone.date).format("YYYY-MM-DD")}</Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 8 }} sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
                <DualRangeSelectBar
                  totalSlots={96}
                  range={zone.ranges}
                  default_range={[{ start: 0, end: 24 }, { start: 72, end: 96 }]}
                  setRange={(newRanges: Range[]) => {
                    handleRangeChange(newRanges, index);
                  }}
                  displayFormat={(value) => formatTime(value)}
                />
              </Grid>

              {/* Sleep Hour Selector */}
              <Grid size={{ xs: 12, sm: 2 }}>
                {index != zones.length - 1 && (
                  <FormControl fullWidth>
                  <InputLabel>Sleep Hours</InputLabel>
                  <Select
                    value={zone.sleepTime}
                    label="Sleep Hours"
                    onChange={(e) => handleSleepHoursChange(Number(e.target.value), index)}
                    disabled={index === zones.length - 1} // Disable the last zone to prevent editing
                  >
                    {/* Dynamically calculate the available sleep hours */}
                    {[...Array(calculateMaxSleepHours(index))].map((_, i) => (
                      <MenuItem key={i} value={i + 2}>
                        {formatTime(i + 2)} hrs
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                )}
                
              </Grid>
            </Grid>
          </Box>
        ))}
      </Box>

      {/* Error and Add to Cart */}
      <Box sx={{ marginTop: "20px", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "10px" }}>
        {errorMessage && (
          <Typography variant="body2" color="error" sx={{ textAlign: "right" }}>
            {errorMessage}
          </Typography>
        )}

        <Button onClick={handleAddToCartClick} color="primary" variant="contained" startIcon={<AddShoppingCartIcon />}>
          Add to Cart
        </Button>
      </Box>

      <Dialog open={cartDialogOpen} onClose={handleCartDialogClose}>
        <DialogTitle>Added to Cart</DialogTitle>
        <DialogContent>
          <Typography variant="body1">Your item has been successfully added to the cart.</Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => handleClose("cart")}>Go to Cart</Button>
          <Button variant="outlined" onClick={() => handleClose("shopping")}>Select Next</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AccommodationInformation;
