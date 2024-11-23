import React, { useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Modal,
  TextField,
} from "@mui/material";
import { useDrop } from "react-dnd";

interface DragItem {
  id: string;
  name: string;
  description: string;
  image: string;
  placeId: string; // Unique identifier for the place
  businessHour: {
    start: number;
    end: number;
  };
  uniqueKey: string; // Unique key for item identification
}

const timeSlots = Array.from({ length: 24 * 4 }, (_, i) => {
  const hour = Math.floor(i / 4);
  const minute = (i % 4) * 15;
  return `${hour}:${minute.toString().padStart(2, "0")}`;
});

const DisplaySchedule: React.FC = () => {
  const [schedule, setSchedule] = useState<{
    [placeId: string]: DragItem[];
  }>({});
  const [modalData, setModalData] = useState<{
    placeId: string;
    item: DragItem | null;
  } | null>(null);

  // Handle drop logic
  const handleDrop = (placeId: string, item: DragItem) => {
    setSchedule((prevSchedule) => ({
      ...prevSchedule,
      [placeId]: [...(prevSchedule[placeId] || []), { ...item, uniqueKey: `${item.id}-${Date.now()}` }],
    }));
  };

  const handleRemove = (placeId: string, uniqueKey: string) => {
    setSchedule((prevSchedule) => ({
      ...prevSchedule,
      [placeId]: prevSchedule[placeId]?.filter((item) => item.uniqueKey !== uniqueKey),
    }));
  };

  const openEditModal = (placeId: string, item: DragItem) => {
    setModalData({ placeId, item });
  };

  const confirmEdit = (start: number, end: number) => {
    if (modalData && modalData.item) {
      const { placeId, item } = modalData;
      setSchedule((prevSchedule) => ({
        ...prevSchedule,
        [placeId]: prevSchedule[placeId]?.map((i) =>
          i.uniqueKey === item.uniqueKey
            ? { ...i, businessHour: { start, end } }
            : i
        ),
      }));
      setModalData(null);
    }
  };

  const computeSpan = (start: number, end: number) => (end - start) * 4;

  // Generate place rows dynamically
  const placeIds = Object.keys(schedule);

  return (
    <Box
      sx={{
        maxWidth: "1200px",
        margin: "auto",
        padding: 2,
        border: "1px solid #ddd",
        borderRadius: "8px",
      }}
    >
      <Typography variant="h6" align="center" gutterBottom>
        Drag-and-Drop Schedule for Places
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Place / Time Slot</TableCell>
              {timeSlots.map((slot) => (
                <TableCell key={slot} align="center">
                  {slot}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {placeIds.map((placeId) => (
              <TableRow key={placeId}>
                <TableCell>{placeId}</TableCell>
                {timeSlots.map((slot, index) => {
                  const [{ isOver }, drop] = useDrop({
                    accept: "drag-item",
                    drop: (item: DragItem) => {
                      if (item.placeId === placeId) {
                        handleDrop(placeId, item);
                      }
                    },
                    collect: (monitor) => ({
                      isOver: monitor.isOver(),
                    }),
                  });

                  const currentItem = schedule[placeId]?.find(
                    (item) =>
                      item.businessHour.start * 4 <= index &&
                      index < item.businessHour.end * 4
                  );

                  if (currentItem && index === currentItem.businessHour.start * 4) {
                    const colSpan = computeSpan(
                      currentItem.businessHour.start,
                      currentItem.businessHour.end
                    );

                    return (
                      <TableCell
                        key={`${placeId}-${slot}`}
                        colSpan={colSpan}
                        sx={{
                          backgroundColor: "lightgreen",
                          border: "1px solid #ddd",
                          textAlign: "center",
                          position: "relative",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography variant="body2">
                            {currentItem.name} ({currentItem.businessHour.start}:00 -{" "}
                            {currentItem.businessHour.end}:00)
                          </Typography>
                          <Button
                            size="small"
                            onClick={() => openEditModal(placeId, currentItem)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleRemove(placeId, currentItem.uniqueKey)}
                          >
                            Remove
                          </Button>
                        </Box>
                      </TableCell>
                    );
                  }

                  if (currentItem && index > currentItem.businessHour.start * 4) {
                    return null; // Skip cells spanned by the item
                  }

                  return (
                    <TableCell
                      key={`${placeId}-${slot}`}
                      ref={drop}
                      sx={{
                        border: "2px dashed gray",
                        backgroundColor: isOver ? "lightblue" : "white",
                        minWidth: "50px",
                        height: "50px",
                        padding: "5px",
                      }}
                    >
                      <Typography variant="body2" align="center">
                        Drop Here
                      </Typography>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {modalData && (
        <Modal open={!!modalData} onClose={() => setModalData(null)}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 300,
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: "8px",
            }}
          >
            <Typography variant="h6" gutterBottom>
              Edit Time Range
            </Typography>
            <TextField
              label="Start Time"
              type="number"
              fullWidth
              margin="normal"
              inputProps={{ min: 0, max: 23 }}
              defaultValue={modalData?.item?.businessHour.start}
              onChange={(e) => {
                const newStart = +e.target.value;
                setModalData((prev) => {
                  if (!prev) return null; // Ensure `prev` is not null
                  return {
                    ...prev,
                    item: {
                      ...prev.item!,
                      businessHour: { ...prev.item!.businessHour, start: newStart },
                    },
                  };
                });
              }}
            />
            <TextField
              label="End Time"
              type="number"
              fullWidth
              margin="normal"
              inputProps={{ min: 0, max: 23 }}
              defaultValue={modalData?.item?.businessHour.end}
              onChange={(e) => {
                const newEnd = +e.target.value;
                setModalData((prev) => {
                  if (!prev) return null; // Ensure `prev` is not null
                  return {
                    ...prev,
                    item: {
                      ...prev.item!,
                      businessHour: { ...prev.item!.businessHour, end: newEnd },
                    },
                  };
                });
              }}
            />

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() =>
                  confirmEdit(
                    modalData.item?.businessHour.start!,
                    modalData.item?.businessHour.end!
                  )
                }
              >
                Confirm
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => setModalData(null)}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Modal>
      )}
    </Box>
  );
};

export default DisplaySchedule;
