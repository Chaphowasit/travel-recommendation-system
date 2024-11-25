import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  TextField,
  MenuItem,
  Button,
  Typography,
} from "@mui/material";

interface Interval {
  start: number;
  end: number;
}

interface EditPlaceModalProps {
  open: boolean;
  name: string;
  intervals: Interval[];
  timeSlots: string[];
  error?: string;
  onAddInterval: () => void;
  onRemoveInterval: (index: number) => void;
  onUpdateInterval: (index: number, field: "start" | "end", value: number) => void;
  onRemovePlace: () => void;
  onCancel: () => void;
  onSave: () => void;
}

const EditPlaceModal: React.FC<EditPlaceModalProps> = ({
  open,
  name,
  intervals,
  timeSlots,
  error,
  onAddInterval,
  onRemoveInterval,
  onUpdateInterval,
  onRemovePlace,
  onCancel,
  onSave,
}) => {
  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="md">
      <DialogTitle>Edit Time Periods for {name}</DialogTitle>
      <DialogContent>
        {/* Error message */}
        {error && (
          <Typography color="error" sx={{ marginBottom: 2 }}>
            {error}
          </Typography>
        )}

        {/* Interval fields */}
        {intervals.map((interval, idx) => (
          <Box
            key={idx}
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "center",
              marginBottom: 2,
            }}
          >
            <TextField
              select
              label="Start Time"
              value={interval.start}
              onChange={(e) => onUpdateInterval(idx, "start", parseInt(e.target.value, 10))}
              fullWidth
            >
              {timeSlots.map((slot, i) => (
                <MenuItem key={i} value={i}>
                  {slot.split(" - ")[0]}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="End Time"
              value={interval.end}
              onChange={(e) => onUpdateInterval(idx, "end", parseInt(e.target.value, 10))}
              fullWidth
            >
              {timeSlots.map((slot, i) => (
                <MenuItem key={i} value={i}>
                  {slot.split(" - ")[1]}
                </MenuItem>
              ))}
            </TextField>
            {idx > 0 && (
              <Button
                variant="text"
                color="error"
                onClick={() => onRemoveInterval(idx)}
              >
                Remove
              </Button>
            )}
          </Box>
        ))}
        <Button variant="contained" onClick={onAddInterval}>
          Add Time Interval
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={onRemovePlace} color="error" sx={{ marginRight: "auto" }}>
          Remove Place
        </Button>
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="contained" color="primary" onClick={onSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditPlaceModal;
