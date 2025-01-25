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

const ItemType = "ACTIVITY_CARD";

interface BusinessHour {
  start: number;
  end: number;
}

interface DroppedActivityCardProps {
  id: string;
  name: string;
  description: string;
  tag: string;
  business_hour: BusinessHour;
  image: string;
  onRemove: (id: string) => void;
  onUpdate: (updatedBusinessHour: BusinessHour) => void; // New prop for updating time
}

const DroppedActivityCard: React.FC<DroppedActivityCardProps> = ({
  id,
  name,
  description,
  tag,
  business_hour,
  image,
  onRemove,
  onUpdate,
}) => {
  const [open, setOpen] = useState(false);
  const [startHour, setStartHour] = useState<number>(business_hour.start);
  const [endHour, setEndHour] = useState<number>(business_hour.end);
  const [stayTime, setStayTime] = useState<number>(0.5);
  const [startError, setStartError] = useState<string>("");
  const [endError, setEndError] = useState<string>("");

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
      // Persist the updated hours
      onUpdate({ start: startHour, end: endHour });

      // Use a small timeout to ensure parent state syncs before closing
      setTimeout(() => {
        handleClose();
      }, 0);
    }
  };




  const handleClose = () => {
    setOpen(false);
    setStartError("");
    setEndError("");
    setStartHour(startHour);
    setEndHour(endHour);
  };

  useEffect(() => {
    if (endHour < startHour + 4) {
      setEndHour(startHour + 4);
    }
  }, [startHour]);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemType,
    item: { id, name, description, tag, business_hour, image },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const cardStyle = {
    opacity: isDragging ? 0.5 : 1,
    border: "2px dashed green",
    cursor: "move",
    padding: "10px",
    margin: "5px",
    width: "250px",
    display: "flex",
    alignItems: "center",
    flexDirection: "row", // Align content horizontally
    minWidth: "250px", // Ensure a minimum width
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleStayTimeChange = (value: number) => {
    setStayTime(value); // Update the stay time state
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
              <Typography variant="body2" sx={{ color: "gray" }}>
                Business Hours: {`${formatTime(business_hour.start)} - ${formatTime(business_hour.end)}`}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ margin: "20px 0" }} />

          <Typography variant="body1">Preferred Visit Hours</Typography>
          <Box
            sx={{
              display: "flex",
              gap: "15px",
              alignItems: "center",
              marginTop: "10px",
            }}
          >

            {/* Start Time Select */}
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

            {/* End Time Select */}
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

            {/* Vertical Divider */}
            <Divider
              orientation="vertical"
              flexItem
              sx={{
                backgroundColor: "#ccc",
                height: "60px",
              }}
            />

            {/* Preferred Stay Time */}
            <FormControl sx={{ width: "150px" }}>
              <InputLabel id="stay-time-label">Stay Time</InputLabel>
              <Select
                labelId="stay-time-label"
                value={stayTime} // Default value
                label="Stay Time"
                onChange={(e) => {handleStayTimeChange(Number(e.target.value))}}
              >
                {Array.from({ length: 16 }, (_, i) => (i + 1) / 2).map((hours) => (
                  <MenuItem key={hours} value={hours}>
                    {hours} Hour{hours > 1 ? "s" : ""}
                  </MenuItem>
                ))}
              </Select>
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

export default DroppedActivityCard;
