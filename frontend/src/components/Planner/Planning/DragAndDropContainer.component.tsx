import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import { useDrop } from "react-dnd";
import DroppedAccommodationCard from "./DroppedAccommodationSuggestionCard.component";

interface BusinessHour {
  start: number;
  end: number;
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

interface DragItem extends Accommodation, Activity {
  uniqueKey: string; // Unique key for item identification
}

interface DragAndDropContainerProps {
  acceptType: string; // Flexible type for drag-and-drop
  maxItems?: number; // Maximum number of items allowed, -1 for infinite
}

const DragAndDropContainer: React.FC<DragAndDropContainerProps> = ({
  acceptType,
  maxItems = -1, // Default is no limit
}) => {
  const [droppedItems, setDroppedItems] = useState<DragItem[]>([]);

  // Handle drop logic
  const handleDrop = (item: Omit<DragItem, "uniqueKey">) => {
    const uniqueKey = `${item.id}-${Date.now()}`; // Generate a unique key
    setDroppedItems((prevItems) => {
      const updatedItems = [...prevItems, { ...item, uniqueKey }];
      if (maxItems !== -1 && updatedItems.length > maxItems) {
        return updatedItems.slice(1); // Remove the last item if it exceeds the limit
      }
      return updatedItems;
    });
  };

  // Handle item removal
  const handleRemove = (uniqueKey: string) => {
    setDroppedItems((prevItems) =>
      prevItems.filter((item) => item.uniqueKey !== uniqueKey)
    );
  };

  // Define the droppable area
  const [{ isOver }, drop] = useDrop({
    accept: acceptType,
    drop: (item: Omit<DragItem, "uniqueKey">) => handleDrop(item),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <Box display="flex" flexDirection="column" alignItems="center" mt={2}>
      <Box
        ref={drop}
        sx={{
          width: "100%", // Full width of the container
          height: "150px", // Fixed height
          display: "flex",
          flexDirection: "row", // Items aligned horizontally
          gap: "10px",
          border: "2px dashed gray",
          borderRadius: "8px",
          position: "relative",
          backgroundColor: isOver ? "lightblue" : "white", // Visual feedback
          padding: "10px",
          overflowX: "auto", // Allow horizontal scrolling
          whiteSpace: "nowrap", // Prevent line breaks
        }}
      >
        {droppedItems.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No items dropped yet.
          </Typography>
        ) : (
          droppedItems.map((item) => (
            <DroppedAccommodationCard
              key={item.uniqueKey} // Unique key for each item
              id={item.id}
              name={item.name}
              description={item.description}
              tag={item.tag}
              business_hour={item.business_hour}
              image={item.image}
              onRemove={() => handleRemove(item.uniqueKey)} // Remove item by unique key
            />
          ))
        )}
      </Box>
      {/* Display remaining slots if maxItems is not -1 */}
      {maxItems !== -1 && (
        <Typography variant="caption" color="text.secondary" mt={1}>
          {`${droppedItems.length}/${maxItems} items`}
        </Typography>
      )}
    </Box>
  );
};

export default DragAndDropContainer;
