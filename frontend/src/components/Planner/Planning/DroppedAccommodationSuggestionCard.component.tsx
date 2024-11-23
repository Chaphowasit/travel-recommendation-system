import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  CardMedia,
  IconButton,
  Dialog,
  DialogContent,
  Button,
  Box,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useDrag } from "react-dnd";

const ItemType = "ACCOMMODATION_CARD";

interface BusinessHour {
  start: number;
  end: number;
}

interface DroppedAccommodationCardProps {
  id: string;
  name: string;
  description: string;
  tag: string;
  business_hour: BusinessHour;
  image: string;
  onRemove: (id: string) => void;
}

const DroppedAccommodationCard: React.FC<DroppedAccommodationCardProps> = ({
  id,
  name,
  description,
  tag,
  business_hour,
  image,
  onRemove,
}) => {
  const [open, setOpen] = useState(false);
  const [startHour, setStartHour] = useState<number>(business_hour.start);
  const [endHour, setEndHour] = useState<number>(business_hour.end);
  const [startError, setStartError] = useState<string>("");
  const [endError, setEndError] = useState<string>("");

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemType,
    item: { id, name, description, tag, business_hour, image },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const formatTime = (value: number) => {
    const totalMinutes = value * 15;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  const startTimeOptions = Array.from({ length: 93 }, (_, i) => ({
    value: i,
    label: formatTime(i),
  }));

  const endTimeOptions = Array.from({ length: 93 }, (_, i) => ({
    value: i + 4,
    label: formatTime(i + 4),
  }));

  const availableEndTimes = endTimeOptions.filter(
    (option) => option.value >= startHour + 4
  );

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setStartError("");
    setEndError("");
    setStartHour(business_hour.start);
    setEndHour(business_hour.end);
  };

  const handleSave = () => {
    let valid = true;

    if (startHour < 0 || startHour > 92) {
      setStartError("Start Time must be between 0:00 and 23:00");
      valid = false;
    } else {
      setStartError("");
    }

    if (endHour < 4 || endHour > 96 || endHour < startHour + 4) {
      setEndError("End Time must be at least 1 hour after Start Time");
      valid = false;
    } else {
      setEndError("");
    }

    if (valid) {
      handleClose();
    }
  };

  useEffect(() => {
    if (endHour < startHour + 4) {
      setEndHour(startHour + 4);
    }
  }, [startHour]);

  const cardStyle = {
    opacity: isDragging ? 0.5 : 1,
    border: "2px dashed green",
    cursor: "move",
    padding: "10px",
    margin: "5px",
    width: "250px",
    display: "flex",
    alignItems: "center",
  };

  return (
    <>
      <Card ref={drag} sx={cardStyle} onClick={handleClickOpen}>
        <CardMedia
          component="img"
          sx={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            marginRight: "10px",
          }}
          image={image}
          alt={name}
        />
        <CardContent
          sx={{
            flexGrow: 1,
            padding: "0 10px",
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              color: "blue",
            }}
          >
            {name}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              color: "gray",
            }}
          >
            {`${formatTime(startHour)} - ${formatTime(endHour)}`}
          </Typography>
        </CardContent>
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            onRemove(id);
          }}
        >
          <CloseIcon />
        </IconButton>
      </Card>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogContent sx={{ padding: "20px" }}>
          <Box sx={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
            <Box
              sx={{
                width: 90,
                height: 90,
                borderRadius: "50%",
                overflow: "hidden",
                marginRight: "20px",
              }}
            >
              <img
                src={image}
                alt={name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </Box>
            <Box>
              <Typography variant="h6">{name}</Typography>
              <Typography variant="body2" sx={{ color: "gray" }}>
                Tag: {tag}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ margin: "20px 0" }} />

          <Typography variant="body1">Preferred Visit Hours</Typography>
          <Box sx={{ display: "flex", gap: "15px", marginTop: "10px" }}>
            <FormControl sx={{ width: "150px" }} error={!!startError}>
              <InputLabel id="start-time-label">Start Time</InputLabel>
              <Select
                labelId="start-time-label"
                value={startHour}
                label="Start Time"
                onChange={(e) => setStartHour(Number(e.target.value))}
              >
                {startTimeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{startError}</FormHelperText>
            </FormControl>
            <FormControl sx={{ width: "150px" }} error={!!endError}>
              <InputLabel id="end-time-label">End Time</InputLabel>
              <Select
                labelId="end-time-label"
                value={endHour}
                label="End Time"
                onChange={(e) => setEndHour(Number(e.target.value))}
              >
                {availableEndTimes.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{endError}</FormHelperText>
            </FormControl>
          </Box>

          <Divider sx={{ margin: "20px 0" }} />

          <Typography variant="body1">{description}</Typography>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
            <Button onClick={() => onRemove(id)} variant="outlined" color="error">
              Delete
            </Button>
            <Button onClick={handleSave} variant="contained" color="primary">
              Save
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DroppedAccommodationCard;
