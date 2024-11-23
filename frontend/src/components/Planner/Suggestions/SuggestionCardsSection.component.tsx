import { Typography, Divider, Stack, Box } from "@mui/material";
import { useState } from "react";
import AccommodationSuggestionCard from "./AccommodationSuggestionCard.component";
import ActivitySuggestionCard from "./ActivitySuggestionCard";

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

interface SuggestionCardsSectionProps {
  handleCardClick: (data: Accommodation | Activity) => void;
  accommodations: Accommodation[];
  activities: Activity[];
}

const SuggestionCardsSection: React.FC<SuggestionCardsSectionProps> = ({
  handleCardClick,
  accommodations,
  activities,
}) => {
  // Helper function to render a section
  const renderSection = (
    title: string,
    items: Accommodation[] | Activity[],
  ) => (
    <Box sx={{ marginBottom: "20px" }}>
      <Typography variant="h5" sx={{ marginBottom: "10px" }}>
        {title}
      </Typography>
      <Stack direction="row" spacing={2} sx={{ overflowX: "auto", paddingBottom: "10px" }}>
      {items.map((item) =>
          title === "Activities" ? (
            <ActivitySuggestionCard
              key={item.id}
              id={item.id}
              name={item.name}
              description={item.description}
              tag={item.tag}
              business_hour={item.business_hour}
              image={item.image}
              isDropped={false} // Default state for this demo
              onClick={() => handleCardClick(item)} // Trigger onClick handler
            />
          ) : (
            <AccommodationSuggestionCard
              key={item.id}
              id={item.id}
              name={item.name}
              description={item.description}
              tag={item.tag}
              business_hour={item.business_hour}
              image={item.image}
              isDropped={false} // Default state for this demo
              onClick={() => handleCardClick(item)} // Trigger onClick handler
            />
          )
        )}
      </Stack>
    </Box>
  );

  return (
    <Box sx={{ padding: "20px" }}>
      <Typography variant="h4" sx={{ marginBottom: "10px" }}>
        Suggestions
      </Typography>
      <Divider sx={{ marginBottom: "20px" }} />
      <Stack spacing={4}>
        {renderSection("Accommodations", accommodations)}
        {renderSection("Activities", activities)}
      </Stack>
    </Box>
  );
};

export default SuggestionCardsSection;

