import {
  Typography,
  Box,
  Grid,
  Button,
} from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import React, { useEffect, useState } from "react";
import { Accommodation } from "../../utils/DataType/place";
import {
  AccommodationShoppingCartItem,
  Zone,
} from "../../utils/DataType/shoppingCart";
import { dayjsStartDate, generateDateRange } from "../../utils/time";
import DeleteIcon from "@mui/icons-material/Delete";

// Import custom quarter-hour TimePicker
import TimePicker from "../utils/TimePicker";

interface AccommodationInformationProps {
  data: Accommodation | null;
  selectedDates: { startDate: Date; endDate: Date };
  shoppingCartItem: AccommodationShoppingCartItem | null;
  setShoppingCartItem: (items: AccommodationShoppingCartItem) => void;
  handleFinished: () => void;
}

const AccommodationInformation: React.FC<AccommodationInformationProps> = ({
  data,
  selectedDates,
  shoppingCartItem,
  setShoppingCartItem,
  handleFinished,
}) => {
  if (data === null) return null;

  const [zones, setZones] = useState<Zone[]>([]);

  useEffect(() => {
    if (shoppingCartItem && shoppingCartItem.item.id === data.id) {
      setZones(shoppingCartItem.zones);
    } else {
      const dates = generateDateRange(selectedDates.startDate, selectedDates.endDate);

      const defaultZones = dates.map((date, index) => {
        const defaultEndTime = 32;
        let defaultStartTime = defaultEndTime - 32;

        if (index === 0) {
          defaultStartTime = Math.max(defaultStartTime, 0);
        }

        return {
          date: dayjsStartDate(date).toDate(),
          range: { start: defaultStartTime, end: defaultEndTime },
        };
      });

      setZones(defaultZones);
    }
  }, [shoppingCartItem, data?.id, selectedDates]);

  const handleEndTimeChange = (newEnd: number, index: number) => {
    setZones((prevZones) =>
      prevZones.map((z, i) =>
        i === index ? { ...z, range: { start: Math.max(0, newEnd - 32), end: newEnd } } : z
      )
    );
  };

  const handleAddToCartClick = () => {
    if (!data) return;
    setShoppingCartItem({ item: data, zones });
    handleFinished();
  };

  const handleRemoveFromCartClick = () => {
    setShoppingCartItem({
      item: {
        id: "-1",
        name: "0",
        description: "0",
        tag: "0",
        business_hour: { start: 0, end: 0 },
        image: "0",
      },
      zones: [],
    });
    handleFinished();
  };

  return (
    <Box sx={{ width: "100%", padding: "20px", marginTop: "10px" }}>
      <Grid container spacing={2} alignItems="flex-start">
        {/* Image Section */}
        <Grid item xs={12} md={6}>
          <Box
            component="img"
            src={data.image}
            alt={data.name}
            sx={{
              width: "100%",
              height: "250px",
              objectFit: "cover",
              borderRadius: "12px",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
            }}
          />
        </Grid>

        {/* Info Section */}
        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
              {data.name}
            </Typography>
            <Box
              sx={{
                maxHeight: "150px",
                overflowY: "auto",
                marginBottom: "10px",
                padding: "10px",
                borderRadius: "8px",
                backgroundColor: "#fafafa",
                boxShadow: "inset 0px 2px 5px rgba(0,0,0,0.1)",
              }}
            >
              <Typography variant="body1">{data.description}</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <strong>Tag:</strong> {data.tag}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Leave Time Section */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Preferred Leave Time
        </Typography>

        {zones.map((zone, index) => (
          <Box
            key={index}
            sx={{
              border: "1px solid #ccc",
              padding: "12px",
              borderRadius: "8px",
              mb: 2,
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
              transition: "0.2s ease-in-out",
              "&:hover": {
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="body1" fontWeight="medium">
                {dayjsStartDate(zone.date).format("YYYY-MM-DD")}
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                Leave Time:
              </Typography>
              <TimePicker
                time={zone.range.end}
                setTime={(newTime) => handleEndTimeChange(newTime, index)}
                range={{ start: 0, end: 96 }}
              />
            </Box>
          </Box>
        ))}
      </Box>

      {/* Action Buttons */}
      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Button
          onClick={handleAddToCartClick}
          color="primary"
          variant="contained"
          startIcon={<AddShoppingCartIcon />}
          sx={{
            background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
            boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)",
            fontWeight: "bold",
            borderRadius: "8px",
            textTransform: "none",
            padding: "8px 16px",
            transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
            "&:hover": {
              transform: "scale(1.05)",
              boxShadow: "0 5px 8px 3px rgba(33, 203, 243, .3)",
            },
          }}
        >
          Save
        </Button>
        {shoppingCartItem?.item.id !== "-1" && shoppingCartItem?.item.id === data.id && (
          <Button
            onClick={handleRemoveFromCartClick}
            color="error"
            variant="contained"
            startIcon={<DeleteIcon />}
            sx={{
              background: "linear-gradient(45deg, #ff5252 30%, #ff1744 90%)",
              boxShadow: "0 3px 5px 2px rgba(255, 82, 82, .3)",
              fontWeight: "bold",
              borderRadius: "8px",
              textTransform: "none",
              padding: "8px 16px",
              transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: "0 5px 8px 3px rgba(255, 82, 82, .3)",
              },
            }}
          >
            Remove
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default AccommodationInformation;
