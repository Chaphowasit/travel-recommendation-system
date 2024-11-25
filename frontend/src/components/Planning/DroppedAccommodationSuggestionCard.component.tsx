import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  CardMedia,
  IconButton,
  Dialog,
  DialogContent,
  Box,
  Divider,
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

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemType,
    item: { id, name, description, tag, business_hour, image },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

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

  const formatTime = (value: number) => {
    const totalMinutes = value * 15;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
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
            {`${formatTime(business_hour.start)} - ${formatTime(business_hour.end)}`}
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
        <DialogContent sx={{ padding: "20px", position: "relative" }}>
          {/* Close Button */}
          <IconButton
            onClick={handleClose}
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
              zIndex: 1,
              color: "gray",
            }}
          >
            <CloseIcon />
          </IconButton>

          {/* Content */}
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

          <Typography variant="body1">{description}</Typography>

        </DialogContent>
      </Dialog>

    </>
  );
};

export default DroppedAccommodationCard;
