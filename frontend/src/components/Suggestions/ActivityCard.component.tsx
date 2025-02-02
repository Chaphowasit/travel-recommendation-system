import React from "react";
import { Card, CardContent, CardMedia, Typography } from "@mui/material";
import { Activity } from "../../utils/DataType/place";

interface ActivityCardProps {
  activity: Activity;
  onClick: () => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onClick }) => {
  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: "350px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        height: "280px",
        transition: "transform 0.3s, background-color 0.3s",
        ":hover": {
          backgroundColor: "#e0e0e0",
          transform: "scale(1.05)",
          cursor: "pointer",
        },
      }}
      onClick={onClick}
    >
      <CardMedia
        component="img"
        image={activity.image}
        alt={activity.name}
        sx={{ height: "120px", objectFit: "cover" }}
      />
      <CardContent>
        <Typography variant="h6" sx={{ fontSize: "1rem", fontWeight: "bold" }}>
          {activity.name}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
          }}
        >
          {activity.description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ActivityCard;
