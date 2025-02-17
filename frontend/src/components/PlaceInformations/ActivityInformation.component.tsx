import {
  Typography,
  Box,
  Grid2 as Grid,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import React, { useEffect, useState } from "react";
import { Activity } from "../../utils/DataType/place";
import { ActivityShoppingCartItem, ActivityZone } from "../../utils/DataType/shoppingCart";
import { dayjsStartDate, formatTime, generateDateRange } from "../../utils/time";
import MultiRangeSelectBar from "../utils/MultiRangeSelectBar";
import DeleteIcon from "@mui/icons-material/Delete";


interface ActivityInformationProps {
  data: Activity | null;
  selectedDates: { startDate: Date | null; endDate: Date | null };
  shoppingCartItem: ActivityShoppingCartItem[]; // Initial shopping cart data
  setShoppingCartItem:  React.Dispatch<React.SetStateAction<ActivityShoppingCartItem[]>>; // Function to update the shopping cart
  handleFinished: () => void;
}

const ActivityInformation: React.FC<ActivityInformationProps> = ({
  data,
  selectedDates,
  shoppingCartItem,
  setShoppingCartItem,
  handleFinished,
}) => {
  if (data === null) return;

  const [zones, setZones] = useState<ActivityZone[]>([]);
  const [stayHours, setStayHours] = useState<number>(8); // Default stay time

  useEffect(() => {
    const existingItem = shoppingCartItem.find((cartItem) => cartItem.item.id === data.id);

    if (existingItem) {
      // If item already in the cart, directly use its zones
      setZones(existingItem.zones); 
      setStayHours(existingItem.stayTime); // Set the stay time from cart item
    } else if (selectedDates.startDate && selectedDates.endDate) {
      // Generate zones based on selected date range if no existing item in cart
      const newZones = generateDateRange(selectedDates.startDate, selectedDates.endDate).map(date => ({
        date: dayjsStartDate(date).toDate(),
        ranges: [{ start: data.business_hour.start, end: data.business_hour.end }], // Store initial range
        stayTime: data.duration
      }));
      setZones(newZones);
    }
  }, [shoppingCartItem, data.id, selectedDates]);

  const handleRangeChange = (index: number, newRanges: { start: number; end: number }[]) => {
    setZones((prevZones) => {
      const updatedZones = prevZones.map((zone, i) =>
        i === index ? { ...zone, ranges: newRanges } : zone
      );

      // Ensure Stay Hours is less than or equal to the minimum range duration
      const minRangeDuration = getMinRangeDuration(updatedZones);
      if (stayHours > minRangeDuration) {
        setStayHours(minRangeDuration);
      }

      return updatedZones;
    });
  };

  // Calculate the minimum range duration, only if zones are populated
  const getMinRangeDuration = (zonesToCheck: ActivityZone[] = zones) => {
    if (zonesToCheck.length === 0) return 0; // Return 0 if zones are not populated yet

    const durations = zonesToCheck.map((zone) =>
      zone.ranges.map((range) => range.end - range.start)
    ).flat();

    return Math.min(...durations);
  };

  const handleStayHoursChange = (value: number) => {
    setStayHours(value);
  };

  const handleAddToCartClick = () => {

    const updatedCart = shoppingCartItem.filter((cartItem) => cartItem.item.id !== data.id);
    updatedCart.push({ item: data, zones, stayTime: stayHours });

    setShoppingCartItem(updatedCart);
    handleFinished();
  };

  const handleRemoveFromCartClick = () => {
    setShoppingCartItem((oldItem) => {
      return oldItem.filter((item) => {
        item.item.id !== data.id
      })
    });
    handleFinished();
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
              height: "250px",
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
            <Typography variant="body2" color="text.secondary" sx={{ marginBottom: "10px" }}>
              <strong>Business Hour:</strong> {formatTime(data.business_hour.start)} - {formatTime(data.business_hour.end)}
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
          return (
            <Box key={index} sx={{ marginBottom: "20px" }}>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, sm: 2 }}>
                  <Typography variant="body1">
                    {dayjsStartDate(zone.date).format("YYYY-MM-DD")}
                  </Typography>
                </Grid>

                <Grid
                  size={{ xs: 12, sm: 10 }}
                  sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}
                >
                  <MultiRangeSelectBar
                    totalSlots={96}
                    range={zone.ranges}
                    setRange={(newRanges: { start: number; end: number }[]) => handleRangeChange(index, newRanges)}
                    displayFormat={(value) => formatTime(value)}
                  />
                </Grid>
              </Grid>
            </Box>
          );
        })}
      </Box>

      {/* Stay Hours Select */}
      <Box sx={{ marginTop: "20px" }}>
        <Typography variant="h6" sx={{ marginBottom: "10px" }}>
          Stay Hours
        </Typography>
        <FormControl fullWidth>
          <InputLabel>Stay Hours</InputLabel>
          <Select
            value={stayHours}
            onChange={(e) => handleStayHoursChange(Number(e.target.value))}
            label="Stay Hours"
          >
            {[...Array(getMinRangeDuration())].map((_, index) => (
              <MenuItem key={index + 1} value={index + 1}>
                {formatTime(index + 1)} hrs
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCartClick}
          color="primary"
          variant="contained"
          startIcon={<AddShoppingCartIcon />}
        >
          Save
        </Button>
        {shoppingCartItem.some((item) => item.item.id === data.id) && (
          <Button onClick={handleRemoveFromCartClick} color="error" variant="contained" startIcon={<DeleteIcon />}>
            Remove
          </Button>
        )}
      </Box>

    </Box>
  );
};

export default ActivityInformation;
