import { Typography, Box } from "@mui/material";
import React from "react";

interface BusinessHour {
  start: number; // 0-96 format
  end: number; // 0-96 format
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

interface InformationSectionProps {
  data: Accommodation | Activity;
}

const formatTime = (value: number) => {
  const hours = Math.floor(value / 4);
  const minutes = (value % 4) * 15;
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
};

const InformationSection: React.FC<InformationSectionProps> = ({ data }) => {
  return (
    <Box sx={{ width: "100%", padding: "20px", marginTop: "10px" }}>
      {/* Name */}
      <Typography variant="h4" component="div" sx={{ fontWeight: "bold", marginBottom: "10px" }}>
        {data.name}
      </Typography>

      {/* Image */}
      <Box
        component="img"
        src={data.image}
        alt={data.name}
        sx={{ width: "100%", objectFit: "cover", marginBottom: "15px", borderRadius: "4px" }}
      />

      {/* Description */}
      <Typography variant="body1" sx={{ marginBottom: "10px" }}>
        {data.description}
      </Typography>

      {/* Tag */}
      <Typography variant="body2" color="text.secondary" sx={{ marginBottom: "10px" }}>
        Tag: {data.tag}
      </Typography>

      {/* Business Hours */}
      <Typography variant="body2" color="text.secondary">
        Business Hours: {`${formatTime(data.business_hour.start)} - ${formatTime(data.business_hour.end)}`}
      </Typography>
    </Box>
  );
};

export default InformationSection;
