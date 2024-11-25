import React from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

interface ScheduleTableProps {
  schedule: {
    [placeId: string]: { item: { name: string }; slots: number[] }[];
  };
  timeSlots: string[];
  collisions: boolean[];
  onEdit: (placeId: string) => void;
}

const ScheduleTable: React.FC<ScheduleTableProps> = ({
  schedule,
  timeSlots,
  collisions,
  onEdit,
}) => {
  const placeIds = Object.keys(schedule);

  return (
    <TableContainer component={Paper}>
      <Table>
        {/* Collision Row */}
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                whiteSpace: "nowrap",
                fontWeight: "bold",
                backgroundColor: "#f0f0f0",
              }}
            >
              Collisions
            </TableCell>
            {timeSlots.map((slot, index) => {
              // Check if this column has any item and if it's a hotel
              const hasCollision = collisions[index];
              const isHotel = placeIds.some((placeId) =>
                schedule[placeId]?.some(
                  (entry) =>
                    entry.slots.includes(index) && placeId.startsWith("H")
                )
              );
              const hasItem = placeIds.some((placeId) =>
                schedule[placeId]?.some((entry) => entry.slots.includes(index))
              );

              // Determine the background color for collision row
              const backgroundColor = hasCollision
                ? "lightcoral" // Light red for collision
                : isHotel
                  ? "#dda0dd" // Light purple for hotel without collision
                  : hasItem
                    ? "lightgreen" // Light green for regular items without collision
                    : "lightyellow"; // Light yellow for empty slots

              return (
                <TableCell
                  key={`collision-${slot}`}
                  align="center"
                  sx={{
                    backgroundColor: backgroundColor,
                    opacity: hasCollision ? 0.7 : 1,
                    minWidth: "40px",
                  }}
                />
              );
            })}
          </TableRow>

          {/* Time Slot Headers */}
          <TableRow>
            <TableCell
              sx={{
                whiteSpace: "nowrap",
                fontWeight: "bold",
              }}
            >
              Place / Time Slot
            </TableCell>
            {timeSlots.map((slot) => (
              <TableCell
                key={slot}
                align="center"
                sx={{
                  writingMode: "vertical-lr",
                  transform: "rotate(180deg)",
                  whiteSpace: "nowrap",
                  fontSize: "12px",
                  minWidth: "40px",
                }}
              >
                {slot}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {/* Main Schedule Rows */}
          {placeIds.map((placeId) => (
            <TableRow key={placeId}>
              <TableCell
                sx={{
                  whiteSpace: "nowrap",
                  fontWeight: "bold",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  {schedule[placeId]?.[0]?.item.name}
                  <IconButton
                    onClick={() => onEdit(placeId)}
                    sx={{ marginLeft: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                </Box>
              </TableCell>
              {timeSlots.map((slot, index) => {
                const entry = schedule[placeId]?.find((entry) =>
                  entry.slots.includes(index)
                );
                const isHotel = placeId.startsWith("H");

                // Determine the background color
                const backgroundColor =
                  entry && isHotel
                    ? "#dda0dd" // Replace with a valid color
                    : entry ? "lightgreen" : "white";
                return (
                  <TableCell
                    key={`${placeId}-${slot}`}
                    sx={{
                      border: "1px solid #ddd",
                      minWidth: "50px",
                      height: "50px",
                      padding: "5px",
                      backgroundColor: backgroundColor, // Background color applied here
                    }}
                  />
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ScheduleTable;
