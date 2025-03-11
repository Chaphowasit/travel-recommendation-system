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
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
        height: "290px",
        borderRadius: "12px",
        border: "1px solid #ccc",
        transition: "transform 0.3s ease-in-out, background-color 0.3s ease-in-out, box-shadow 0.3s",
        ":hover": {
          backgroundColor: "#f5f5f5",
          transform: "scale(1.05)",
          cursor: "pointer",
          boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.15)",
        },
      }}
      onClick={onClick}
    >
      <CardMedia
        component="img"
        image={activity.image}
        alt={activity.name}
        sx={{
          height: "140px",
          objectFit: "cover",
          borderTopLeftRadius: "12px",
          borderTopRightRadius: "12px",
        }}
      />
      <CardContent sx={{ padding: "12px", flexGrow: 1 }}>
        <Typography variant="h6" sx={{ fontSize: "1rem", fontWeight: "bold", color: "#333" }}>
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
            marginTop: "5px",
            fontSize: "0.9rem",
          }}
        >
          {activity.description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ActivityCard;
