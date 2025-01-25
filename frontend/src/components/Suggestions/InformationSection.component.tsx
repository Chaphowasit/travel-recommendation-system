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
} from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import React, { useEffect, useState } from "react";

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

interface InformationSectionProps {
  data: Accommodation | Activity;
  selectedDates: { startDate: Date | null; endDate: Date | null };
  shoppingCartItem: ShoppingCartItem[]; // Initial shopping cart data
  setShoppingCartItem: (items: ShoppingCartItem[]) => void; // Function to update the shopping cart
}

const formatTime = (value: number) => {
  const hours = Math.floor(value / 4);
  const minutes = (value % 4) * 15;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};

const generateDateRange = (startDate: Date, endDate: Date) => {
  const dates: string[] = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

const InformationSection: React.FC<InformationSectionProps> = ({
  data,
  selectedDates,
  shoppingCartItem,
  setShoppingCartItem,
}) => {
  const [zones, setZones] = useState<{ date: string; startTime: string; endTime: string; stayTime: string }[]>([
    { date: "", startTime: "", endTime: "", stayTime: "" },
  ]);
  const [cartDialogOpen, setCartDialogOpen] = useState(false);

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

  const handleAddToCartClick = () => {
    // Update or add the current item in the shopping cart
    const updatedCart = shoppingCartItem.filter((cartItem) => cartItem.item.id !== data.id);
    updatedCart.push({ item: data, zones });
    setShoppingCartItem(updatedCart); // Update the cart with the new data
    setCartDialogOpen(true);
  };

  const handleCartDialogClose = () => {
    setCartDialogOpen(false);
  };

  const addZone = () => {
    setZones([...zones, { date: "", startTime: "", endTime: "", stayTime: "" }]);
  };

  const deleteZone = (index: number) => {
    const newZones = zones.filter((_, i) => i !== index);
    setZones(newZones);
  };

  const updateZone = (index: number, field: "date" | "startTime" | "endTime" | "stayTime", value: string) => {
    const newZones = [...zones];
    const currentZone = newZones[index];

    if (field === "startTime") {
      const startValue = parseInt(value, 10);
      const endValue = parseInt(currentZone.endTime, 10) || 96;

      if (startValue >= endValue - 2) {
        currentZone.endTime = (startValue + 2).toString();
      }

      currentZone.startTime = value;
    } else if (field === "endTime") {
      const endValue = parseInt(value, 10);
      const startValue = parseInt(currentZone.startTime, 10) || 0;

      if (endValue <= startValue + 2) {
        currentZone.startTime = (endValue - 2).toString();
      }

      currentZone.endTime = value;
    } else {
      currentZone[field] = value;
    }

    setZones(newZones);
  };

  const getFilteredTimeOptions = (min: number, max: number) => {
    return timeOptions.filter((option) => option.value >= min && option.value <= max);
  };

  return (
    <Box sx={{ width: "100%", padding: "20px", marginTop: "10px" }}>
      <Grid container spacing={2} alignItems="flex-start">
        {/* Image Section */}
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

        {/* Info Section */}
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

      {/* Preferred Visit Time Section */}
      <Box sx={{ marginTop: "20px" }}>
        <Typography variant="h6" sx={{ marginBottom: "10px" }}>
          Preferred Visit Time
        </Typography>

        {zones.map((zone, index) => {
          const startTime = parseInt(zone.startTime, 10) || 0;
          const endTime = parseInt(zone.endTime, 10) || 96;

          return (
            <Box key={index} sx={{ marginBottom: "20px" }}>
              <Grid container spacing={1} alignItems="center">
                <Grid size={{ xs: 12, md: 10 }} container spacing={2}>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <FormControl fullWidth>
                      <InputLabel>Select Date</InputLabel>
                      <Select
                        fullWidth
                        value={zone.date}
                        onChange={(e) => updateZone(index, "date", e.target.value)}
                      >
                        {availableDates.map((date) => (
                          <MenuItem key={date} value={date}>
                            {date}
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
                        value={zone.startTime}
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
                        value={zone.endTime}
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
                        value={zone.stayTime}
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

      <Box sx={{ marginTop: "20px", textAlign: "right" }}>
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
        <Box sx={{ padding: "20px" }}>
          <Typography variant="h6" sx={{ marginBottom: "10px" }}>
            Added to Cart
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
            <Button variant="contained" onClick={() => alert("Go to Cart")}>
              Go to Cart
            </Button>
            <Button variant="outlined" onClick={handleCartDialogClose}>
              Select Next
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default InformationSection;
