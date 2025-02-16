import React, { useState, useRef, useEffect } from "react";
import { Box, Tooltip, IconButton, Stack } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

interface Range {
  start: number;
  end: number;
}

interface MultiRangeSelectBarProps {
  totalSlots: number;
  range: Range[];
  setRange: (range: Range[]) => void;
  displayFormat: (value: number) => string;
}

const MultiRangeSelectBar: React.FC<MultiRangeSelectBarProps> = ({
  totalSlots,
  range,
  setRange,
  displayFormat,
}) => {
  const barRef = useRef<HTMLDivElement | null>(null);
  const isSelecting = useRef(false);
  const toggleMode = useRef<"add" | "remove" | null>(null);
  const lastSlotRef = useRef<number | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<Set<number>>(new Set());
  const bufferedSlots = useRef<Set<number>>(new Set());

  // Convert range prop into a Set of selected slots
  useEffect(() => {
    const newSelectedSlots = new Set<number>();
    range.forEach(({ start, end }) => {
      for (let i = start; i < end; i++) {
        newSelectedSlots.add(i);
      }
    });
    setSelectedSlots(newSelectedSlots);
  }, [range]);

  const getSlotFromEvent = (e: MouseEvent | React.MouseEvent<HTMLDivElement>): number | null => {
    if (!barRef.current) return null;
    const barRect = barRef.current.getBoundingClientRect();
    const relativeX = e.clientX - barRect.left;
    const slotWidth = barRect.width / totalSlots;
    return Math.max(0, Math.min(totalSlots - 1, Math.floor(relativeX / slotWidth)));
  };

  const interpolateSlots = (start: number, end: number): number[] => {
    const range: number[] = [];
    const step = start < end ? 1 : -1;
    for (let i = start; i !== end; i += step) {
      range.push(i);
    }
    range.push(end);
    return range;
  };

    // Helper: given a slot index, compute the contiguous block from selectedSlots
  const getContiguousRange = (slot: number, selected: Set<number>): Range | null => {
    if (!selected.has(slot)) return null;
    let start = slot;
    let end = slot;
    // Expand backwards
    while (selected.has(start - 1)) {
      start--;
    }
    // Expand forwards
    while (selected.has(end + 1)) {
      end++;
    }
    return { start, end: end + 1 }; // end is exclusive
  };


  const updateBufferedSlots = (currentSlot: number) => {
    if (!isSelecting.current) return;

    bufferedSlots.current = new Set(bufferedSlots.current);

    if (lastSlotRef.current !== null && lastSlotRef.current !== currentSlot) {
      const interpolatedSlots = interpolateSlots(lastSlotRef.current, currentSlot);
      interpolatedSlots.forEach((slot) => {
        toggleMode.current === "add" ? bufferedSlots.current.add(slot) : bufferedSlots.current.delete(slot);
      });
    } else {
      toggleMode.current === "add" ? bufferedSlots.current.add(currentSlot) : bufferedSlots.current.delete(currentSlot);
    }

    lastSlotRef.current = currentSlot;

    requestAnimationFrame(() => {
      setSelectedSlots(new Set(bufferedSlots.current));
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const slot = getSlotFromEvent(e);
    if (slot === null) return;

    isSelecting.current = true;
    toggleMode.current = selectedSlots.has(slot) ? "remove" : "add";

    bufferedSlots.current = new Set(selectedSlots);
    lastSlotRef.current = slot;

    updateBufferedSlots(slot);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isSelecting.current) return;
    const slot = getSlotFromEvent(e);
    if (slot === null) return;

    updateBufferedSlots(slot);
  };

  const handleMouseUp = () => {
    if (!isSelecting.current) return;
    isSelecting.current = false;
    lastSlotRef.current = null;

    // Convert buffered slots to { start: index, end: index+1 }
    const sortedSlots = [...bufferedSlots.current].sort((a, b) => a - b);
    let newRanges: Range[] = [];
    let start = sortedSlots[0];
    let end = start + 1;

    for (let i = 1; i < sortedSlots.length; i++) {
      if (sortedSlots[i] === end) {
        end = sortedSlots[i] + 1;
      } else {
        newRanges.push({ start, end });
        start = sortedSlots[i];
        end = start + 1;
      }
    }

    if (sortedSlots.length > 0) newRanges.push({ start, end });

    setRange(newRanges);
  };

  const handleClearSelection = () => {
    setSelectedSlots(new Set());
    bufferedSlots.current.clear();
    setRange([]);
  };

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ textAlign: "center", userSelect: "none", width: "100%" }}>
      <Box
        ref={barRef}
        sx={{
          flexGrow: 1, // Make sure the bar takes up the full available width
          height: "30px",
          backgroundColor: "#ddd",
          display: "flex",
          border: "1px solid black",
          cursor: "pointer",
          position: "relative",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={(e) => isSelecting.current && handleMouseMove(e.nativeEvent)}
      >
        {Array.from({ length: totalSlots }).map((_, index) => (
          <Tooltip 
          key={index} 
          title={
            selectedSlots.has(index)
              ? // Compute the contiguous range for this hovered slot.
                (() => {
                  const contiguous = getContiguousRange(index, selectedSlots);
                  return contiguous
                    ? `Range: ${displayFormat(contiguous.start)}-${displayFormat(contiguous.end)}, Slot: ${displayFormat(index)}-${displayFormat(index + 1)}`
                    : `Slot: ${displayFormat(index)}-${displayFormat(index + 1)}`;
                })()
              : `Slot: ${displayFormat(index)}-${displayFormat(index + 1)}`
          }
          placement="top"
        >
          <Box
            sx={{
              flex: 1,
              height: "100%",
              backgroundColor: selectedSlots.has(index)
                ? "rgba(94, 255, 69, 0.7)"
                : "transparent",
              borderRight: "1px solid rgba(0,0,0,0.2)",
            }}
          />
        </Tooltip>
        ))}
      </Box>
      <Tooltip title="Clear All">
        <IconButton color="error" onClick={handleClearSelection}>
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    </Stack>
  );
};

export default MultiRangeSelectBar;
