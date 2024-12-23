import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { useDrop } from "react-dnd";

interface AddPlaceDropZoneProps {
  onDrop: (item: any) => void;
  newPlace: any;
  onAddPlace: () => void;
}

const AddPlaceDropZone: React.FC<AddPlaceDropZoneProps> = ({
  onDrop,
  newPlace,
  onAddPlace,
}) => {
  const [{ isOver }, drop] = useDrop({
    accept: ["ACCOMMODATION_CARD", "ACTIVITY_CARD"],
    drop: onDrop,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <Box
      ref={drop}
      sx={{
        marginTop: 4,
        padding: 2,
        border: "2px dashed gray",
        borderRadius: "8px",
        backgroundColor: isOver ? "lightblue" : "white",
        textAlign: "center",
      }}
    >
      <Typography variant="body1">
        {newPlace
          ? `Place Ready to Add: ${newPlace.name}`
          : "Drag a Place Card Here to Add to the Schedule"}
      </Typography>
      {newPlace && (
        <Button variant="contained" color="primary" onClick={onAddPlace} sx={{ marginTop: 2 }}>
          Add Place
        </Button>
      )}
    </Box>
  );
};

export default AddPlaceDropZone;
