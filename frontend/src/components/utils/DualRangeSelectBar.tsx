import React, { useEffect, useState } from "react";
import { Box, Tooltip, IconButton, Stack } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CircleIcon from "@mui/icons-material/Circle";

interface Range {
  start: number;
  end: number;
}

interface DualRangeSelectBarProps {
  totalSlots: number;
  range: Range[];
  default_range: Range[];
  setRange: (range: Range[]) => void;
  displayFormat: (value: number) => string;
}

const DualRangeSelectBar: React.FC<DualRangeSelectBarProps> = ({
  totalSlots,
  range,
  default_range,
  setRange,
  displayFormat,
}) => {

  const [firstRange, setFirstRange] = useState<Range | null>(null);
  const [secondRange, setSecondRange] = useState<Range | null>(null);
  const [isSelectingLeft, setIsSelectingLeft] = useState(true); // Track which range is being selected

  // Convert range prop into selected slots
  useEffect(() => {
    setFirstRange(range[0]);
    setSecondRange(range[1]);
  }, [range]);

  const handleRangeClick = (index: number) => {
    if (isSelectingLeft) {
      // Selecting the left range
      let updatedFirstRange: Range = { start: 0, end: index + 1 == 96 ? 95 : index + 1 };
      let updatedSecondRange = secondRange;

      // If the new left range overlaps with the right range, remove the overlapping part
      if (secondRange && updatedFirstRange.end >= secondRange.start) {
        updatedSecondRange = secondRange.end > updatedFirstRange.end
          ? { start: updatedFirstRange.end, end: secondRange.end }
          : { start: 95, end: 96 };
      }

      setFirstRange(updatedFirstRange);
      setSecondRange(updatedSecondRange);
      setRange([updatedFirstRange, ...(updatedSecondRange ? [updatedSecondRange] : [])]);
    } else {
      // Selecting the right range
      let updatedSecondRange: Range = { start: index == 0 ? 1 : index, end: totalSlots };
      let updatedFirstRange = firstRange;

      // If the new right range overlaps with the left range, remove the overlapping part
      if (firstRange && updatedSecondRange.start <= firstRange.end) {
        updatedFirstRange = firstRange.start < updatedSecondRange.start
          ? { start: firstRange.start, end: updatedSecondRange.start }
          : { start: 0, end: 1 };
      }

      setFirstRange(updatedFirstRange);
      setSecondRange(updatedSecondRange);
      setRange([...(updatedFirstRange ? [updatedFirstRange] : []), updatedSecondRange]);
    }
  };

  const handleClearSelection = () => {
    // Use the stored original range from the ref for resetting
    setFirstRange(default_range[0]);
    setSecondRange(default_range[1]);
    setRange(default_range); // Reset the range to original
  };

  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ textAlign: "center", userSelect: "none", width: "100%" }}>
      {/* Left Range Select Button */}
      <Tooltip title="Select Morning">
        <IconButton
          color="primary"
          onClick={() => setIsSelectingLeft(true)}
          sx={{
            borderRadius: "50%",
            backgroundColor: isSelectingLeft ? "rgba(94, 255, 69, 0.7)" : "transparent",
          }}
        >
          <CircleIcon />
        </IconButton>
      </Tooltip>

      {/* Right Range Select Button */}
      <Tooltip title="Select Evening">
        <IconButton
          color="secondary"
          onClick={() => setIsSelectingLeft(false)}
          sx={{
            borderRadius: "50%",
            backgroundColor: !isSelectingLeft ? "rgba(94, 153, 255, 0.7)" : "transparent",
          }}
        >
          <CircleIcon />
        </IconButton>
      </Tooltip>

      <Box
        sx={{
          flexGrow: 1,
          height: "30px",
          backgroundColor: "#ddd",
          display: "flex",
          border: "1px solid black",
          cursor: "pointer",
          position: "relative",
        }}
      >
        {Array.from({ length: totalSlots }).map((_, index) => (
          <Tooltip
            key={index}
            title={
              isSelectingLeft
                ? `Morning: ${displayFormat(0)}-${displayFormat(index + 1)}`
                : `Evening: ${displayFormat(index)}-${displayFormat(totalSlots)}`
            }
            placement="top"
          >
            <Box
              sx={{
                flex: 1,
                height: "100%",
                backgroundColor:
                  (firstRange && index >= firstRange.start && index < firstRange.end)
                    ? "rgba(94, 255, 69, 0.7)" // First range color
                    : secondRange && index >= secondRange.start && index < secondRange.end
                    ? "rgba(94, 153, 255, 0.7)" // Second range color
                    : "transparent",
                borderRight: "1px solid rgba(0,0,0,0.2)",
              }}
              onClick={() => handleRangeClick(index)}
            />
          </Tooltip>
        ))}
      </Box>

      {/* Clear Button */}
      <Tooltip title="Clear All">
        <IconButton color="error" onClick={handleClearSelection}>
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    </Stack>
  );
};

export default DualRangeSelectBar;
