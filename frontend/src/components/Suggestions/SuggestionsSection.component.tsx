import { Box, Typography, Divider, IconButton } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import React, { useState } from "react";
import SuggestionCardsSection from "./SuggestionCardsSection.component";
import InformationSection from "./InformationSection.component";

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

interface SuggestionsSectionProps {
  recommendAccommodations: Accommodation[];
  recommendActivities: Activity[];
}

const SuggestionsSection: React.FC<SuggestionsSectionProps> = ({
  recommendAccommodations,
  recommendActivities,
}) => {
  const [selectedAccommodation, setSelectedAccommodation] =
    useState<Accommodation | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Function to handle card selection
  const handleCardClick = (data: Accommodation | Activity) => {
    setSelectedAccommodation(data as Accommodation); // Assuming it will be Accommodation
  };

  return (
    <Box
      sx={{
        padding: "10px",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden", // Prevents overall overflow
      }}
    >
      {/* Suggestions Section */}
      <Box
        sx={{
          flexGrow: isCollapsed ? 0 : 1, // Takes available space when not collapsed
          overflowY: "auto", // Enable scrolling in suggestions section
          transition: "flex-grow 0.3s ease",
        }}
      >
        <SuggestionCardsSection
          handleCardClick={handleCardClick}
          accommodations={recommendAccommodations}
          activities={recommendActivities}
        />
      </Box>

      {/* IconButton on Divider */}
      <Divider sx={{ position: "relative", margin: "10px 0" }}>
        <IconButton
          sx={{
            position: "absolute",
            top: "-20px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1,
          }}
          onClick={() => setIsCollapsed((prev) => !prev)}
        >
          {isCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
        </IconButton>
      </Divider>

      {/* Information Section */}
      <Box
        sx={{
          height: isCollapsed ? "calc(100vh - 50px)" : "50px", // Expands when collapsed
          transition: "height 0.3s ease",
          overflowY: isCollapsed ? "auto" : "hidden", // Enable scrolling when expanded
          display: "flex",
          justifyContent: "center",
          alignItems: isCollapsed ? "flex-start" : "center", // Align info section content
          padding: isCollapsed ? "10px" : "0px",
        }}
      >
        {selectedAccommodation ? (
          isCollapsed ? (
            <InformationSection data={selectedAccommodation} />
          ) : (
            <Typography variant="body1">
              Info: {selectedAccommodation.name}
            </Typography>
          )
        ) : (
          <Typography variant="body1" sx={{ textAlign: "center" }}>
            Please select a place to see the information.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default SuggestionsSection;
