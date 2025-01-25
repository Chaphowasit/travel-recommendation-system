import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { useDrag } from "react-dnd";

const ItemType = "ACTIVITY_CARD";

interface ActivitySuggestionCardProps {
  id: string;
  name: string;
  description: string;
  tag: string;
  business_hour: {
    start: number;
    end: number;
  };
  image: string;
  isDropped: boolean;
  onClick: (data: {
    id: string;
    name: string;
    description: string;
    tag: string;
    business_hour: { start: number; end: number };
    image: string;
  }) => void;
}

const ActivitySuggestionCard: React.FC<ActivitySuggestionCardProps> = ({
  id,
  name,
  description,
  tag,
  business_hour,
  image,
  isDropped,
  onClick,
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemType, // Drag-and-drop item type
    item: { id, name, description, tag, business_hour, image },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  // Style for the card based on dragging or dropped state
  const cardStyle = {
    opacity: isDragging ? 0.5 : 1,
    border: isDropped ? "2px dashed green" : "1px solid gray",
    width: "250px", // Increase card width
    minWidth: "250px", // Ensure a consistent minimum width
    cursor: "move",
    display: "flex",
    flexDirection: "column", // Stack image and content vertically
    transition: "opacity 0.3s ease",
    borderRadius: "8px", // Rounded corners
  };

  const imageStyle = {
    width: "100%",
    height: "150px", // Fixed height for the image
    objectFit: "cover", // Maintain aspect ratio
    borderTopLeftRadius: "8px",
    borderTopRightRadius: "8px",
  };

  return (
    <Card
      ref={drag}
      sx={cardStyle}
      onClick={() => onClick({ id, name, description, tag, business_hour, image })}
    >
      <Box component="img" src={image} alt={name} sx={imageStyle} />
      <CardContent sx={{ padding: 2 }}>
        <Typography gutterBottom variant="subtitle1" component="div" noWrap>
          {name}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", whiteSpace: "normal" }}>
          Tag: {tag}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ActivitySuggestionCard;
