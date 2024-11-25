import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import { useDrop } from "react-dnd";
import DroppedAccommodationCard from "./DroppedAccommodationSuggestionCard.component";
import DroppedActivityCard from "./DroppedActivitySuggestionCard.component";

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
  items?: DragItem[]; // Initial items (optional)
  onChange?: (items: DragItem[]) => void; // Callback to propagate changes
}

const DragAndDropContainer: React.FC<DragAndDropContainerProps> = ({
  acceptType,
  maxItems = -1, // Default is no limit
  items = [],
  onChange,
}) => {
  const [droppedItems, setDroppedItems] = useState<DragItem[]>(items);

  const handleDrop = (item: Omit<DragItem, "uniqueKey">) => {
    const uniqueKey = `${item.id}-${Date.now()}`; // Generate a unique key

    setDroppedItems((prevItems) => {
      const updatedItems = [...prevItems, { ...item, uniqueKey }];
      if (maxItems !== -1 && updatedItems.length > maxItems) {
        updatedItems.shift(); // Remove the first item if it exceeds the limit
      }
      if (onChange) {
        onChange(updatedItems); // Notify parent component
      }

      // Sort items by the start time in ascending order
      updatedItems.sort((a, b) => a.business_hour.start - b.business_hour.start);
      
      return updatedItems;
    });
  };

  const handleRemove = (uniqueKey: string) => {
    setDroppedItems((prevItems: DragItem[]) =>
      prevItems.filter((item) => item.uniqueKey !== uniqueKey)
    );
    if (onChange) {
      onChange(
        droppedItems.filter((item) => item.uniqueKey !== uniqueKey) // Notify parent
      );
    }
  };

  const handleUpdate = (uniqueKey: string, updatedBusinessHour: BusinessHour) => {
    const updatedItems = droppedItems.map((item) =>
      item.uniqueKey === uniqueKey
        ? { ...item, business_hour: updatedBusinessHour }
        : item
    );
  
    // Sort items by the start time in ascending order
    updatedItems.sort((a, b) => a.business_hour.start - b.business_hour.start);
  
    // Update state
    setDroppedItems(updatedItems);
  
    // Force immediate propagation of updated items
    if (onChange) {
      onChange([...updatedItems]); // Use the most recent updated state
    }
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
          width: "100%",
          height: "150px",
          flexDirection: "row",
          gap: "10px",
          border: "2px dashed gray",
          borderRadius: "8px",
          position: "relative",
          backgroundColor: isOver ? "lightblue" : "white",
          padding: "10px",
          overflowX: "auto",
          whiteSpace: "nowrap",
          display: "flex",
          flexWrap: "nowrap", // Prevent squeezing if items overflow horizontally
        }}
      >
        {droppedItems.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No items dropped yet.
          </Typography>
        ) : (
          droppedItems.map((item) =>
            acceptType === "ACCOMMODATION_CARD" ? (
              <DroppedAccommodationCard
                key={item.uniqueKey}
                id={item.id}
                name={item.name}
                description={item.description}
                tag={item.tag}
                business_hour={item.business_hour}
                image={item.image}
                onRemove={() => handleRemove(item.uniqueKey)}
              />
            ) : (
              <DroppedActivityCard
                key={item.uniqueKey}
                id={item.id}
                name={item.name}
                description={item.description}
                tag={item.tag}
                business_hour={item.business_hour}
                image={item.image}
                onRemove={() => handleRemove(item.uniqueKey)}
                onUpdate={(updatedBusinessHour) =>
                  handleUpdate(item.uniqueKey, updatedBusinessHour)
                }
              />
            )
          )
        )}
      </Box>
      {maxItems !== -1 && (
        <Typography variant="caption" color="text.secondary" mt={1}>
          {`${droppedItems.length}/${maxItems} items`}
        </Typography>
      )}
    </Box>
  );
};

export default DragAndDropContainer;
