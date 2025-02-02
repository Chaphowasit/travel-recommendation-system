import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import ScheduleTable from "./ScheduleTable.component";
import EditPlaceModal from "./EditPlaceModal.component";
import AddPlaceDropZone from "./AddPlaceDropZone.component";
import { fetchMariaDB } from "../../utils/api";

// Generate 15-minute intervals
const timeSlots = Array.from({ length: 24 * 4 }, (_, i) => {
  const hour = Math.floor(i / 4);
  const minute = (i % 4) * 15;
  const nextMinute = (minute + 15) % 60;
  const nextHour = hour + Math.floor((minute + 15) / 60);
  return `${hour}:${minute.toString().padStart(2, "0")} - ${nextHour}:${nextMinute
    .toString()
    .padStart(2, "0")}`;
});

// Function to combine overlapping or adjacent intervals
const combineIntervals = (intervals: { start: number; end: number }[]) => {
  intervals.sort((a, b) => a.start - b.start);

  const merged: { start: number; end: number }[] = [];
  let current = intervals[0];

  for (let i = 1; i < intervals.length; i++) {
    const next = intervals[i];
    if (current.end >= next.start) {
      // Merge intervals
      current = { start: current.start, end: Math.max(current.end, next.end) };
    } else {
      merged.push(current);
      current = next;
    }
  }

  merged.push(current);
  return merged;
};

// Function to calculate collisions
const calculateCollisions = (schedules: {
  [placeId: string]: { item: { name: string }; slots: number[] }[];
}[]) => {
  return schedules.map((daySchedule) => {
    const collisions = Array(timeSlots.length).fill(0);

    Object.values(daySchedule).forEach((entries) => {
      entries.forEach((entry) => {
        entry.slots.forEach((slot) => {
          collisions[slot] += 1;
        });
      });
    });

    return collisions.map((count) => count > 1);
  });
};


interface RouteItem {
  arrival_time: number;
  departure_time: number;
  index: number;
  node: string;
  travel_time: number;
  waiting_time: number;
}

interface RouteData {
  routes: RouteItem[][];
  total_time: number;
  total_waiting_time: number;
}




interface DisplayScheduleProps {
  routeData: RouteData | undefined;
  setRouteData: (routeData: RouteData) => void;
}

const DisplaySchedule: React.FC<DisplayScheduleProps> = ({ routeData }) => {

  const convertRouteData = (routeData: RouteData | undefined) => {
    if (!routeData) return;

    const updatedRoutes = routeData.routes.map((route) =>
      route.flatMap((item, index) => {
        const isLastItem = index === route.length - 1;
        const arrivalDay = Math.floor(item.arrival_time / 96);
        const departureDay = Math.floor(item.departure_time / 96);

        const arrivalTime = item.arrival_time % 96;
        const departureTime = item.departure_time % 96;

        if (arrivalDay === departureDay) {
          // If arrival and departure happen on the same day
          return {
            ...item,
            arrival_time: arrivalTime,
            departure_time: isLastItem ? 95 : departureTime,
            day: arrivalDay,
          };
        } else {
          // Split into two objects if arrival and departure span different days
          return [
            {
              ...item,
              arrival_time: arrivalTime,
              departure_time: 95, // End of the current day
              day: arrivalDay,
            },
            {
              ...item,
              arrival_time: 0, // Start of the next day
              departure_time: isLastItem ? 95 : departureTime,
              day: departureDay,
            },
          ];
        }
      })
    );
    return updatedRoutes;
  };


  const arrangeRoutesToSchedule = (updatedRoutes: any[][] | undefined) => {
    if (!updatedRoutes) return [];

    const placeIds = updatedRoutes.flatMap((route) => route.map((item) => item.node));
    const uniquePlaceIds = Array.from(new Set(placeIds));

    return fetchMariaDB(uniquePlaceIds)
      .then((response) => {
        if (typeof response.data !== "object") {
          throw new Error("Expected response data to be an object.");
        }

        const placeNameMap = new Map<string, string>();
        response.data.forEach((d: { id: string; name: string }) => {
          placeNameMap.set(d.id, d.name);
        });

        const schedule: {
          [placeId: string]: { item: { name: string }; slots: number[] }[];
        }[] = [];

        // Iterate over the updated routes
        updatedRoutes.forEach((route) => {
          route.forEach((item) => {
            const day = Number(item.day);
            const placeId = item.node;
            const placeName = placeNameMap.get(placeId);

            // Ensure `schedule[day]` is initialized as an object
            if (!schedule[day]) {
              schedule[day] = {}; // Initialize the day index
            }

            // Ensure `schedule[day][placeId]` is initialized as an array
            if (!schedule[day][placeId]) {
              schedule[day][placeId] = [];
            }

            // Calculate slot values
            const slotValues = Array.from(
              { length: item.departure_time - item.arrival_time + 1 },
              (_, i) => item.arrival_time + i
            );

            // Add entry to the schedule
            schedule[day][placeId].push({
              item: { name: placeName || "" },
              slots: slotValues,
            });

          });
        });

        return schedule;


      })
      .catch((error) => {
        console.error("Error fetching place names from backend:", error);
        return [];
      });
  };


  useEffect(() => {
    // Define an async function to handle the asynchronous operation
    const fetchSchedule = async () => {
      try {
        const updatedRoutes = convertRouteData(routeData); // Ensure this is synchronous
        if (updatedRoutes) {
          const schedule = await arrangeRoutesToSchedule(updatedRoutes); // Await if it returns a Promise
          setSchedules(schedule);
        } else {
          setSchedules([]); // Handle cases where `updatedRoutes` is null or undefined
        }
      } catch (error) {
        console.error('Error fetching or arranging routes:', error);
        setSchedules([]); // Fallback to an empty array in case of an error
      }
    };

    fetchSchedule(); // Call the async function
  }, [routeData]);


  const [schedules, setSchedules] = useState<{
    [placeId: string]: { item: { name: string }; slots: number[] }[];
  }[]>([]);
  const [newPlace, setNewPlace] = useState<{
    id: string;
    name: string;
    business_hour: { start: number; end: number };
  } | null>(null);
  const [editingPlace, setEditingPlace] = useState<{
    dayIndex: number
    placeId: string;
    name: string;
    intervals: { start: number; end: number }[];
    error?: string;
  } | null>(null);

  const handleDropToSchedule = (
    item: {
      id: string;
      name: string;
      business_hour: { start: number; end: number };
    },
    dayIndex: number
  ) => {
    setSchedules((prevSchedules) => {
      const updatedSchedules = [...prevSchedules];
      const daySchedule = updatedSchedules[dayIndex] || {};

      const { id, name, business_hour } = item;
      const startSlot = business_hour.start * 4;
      const endSlot = business_hour.end === 96 ? 96 : business_hour.end * 4;

      if (!daySchedule[id]) {
        daySchedule[id] = [];
      }

      daySchedule[id].push({
        item: { name },
        slots: Array.from({ length: endSlot - startSlot }, (_, i) => startSlot + i),
      });

      updatedSchedules[dayIndex] = daySchedule;
      return updatedSchedules;
    });
  };


  const handleAddPlaceDirectly = () => {
    if (newPlace) {
      const { id, name, business_hour } = newPlace;

      // Automatically initialize the slots based on business hours
      const startSlot = business_hour.start * 4;
      const endSlot = business_hour.end === 96 ? 96 : business_hour.end * 4;

      setSchedules((prevSchedule) => ({
        ...prevSchedule,
        [id]: [
          {
            item: { name },
            slots: Array.from({ length: endSlot - startSlot }, (_, i) => startSlot + i),
          },
        ],
      }));
      setNewPlace(null);
    }
  };

  const handleEditPlace = (dayIndex: number, placeId: string) => {
    const daySchedule = schedules[dayIndex];
    const name = daySchedule[placeId]?.[0]?.item.name || "";
    const intervals =
      daySchedule[placeId]?.map((entry) => {
        const startSlot = Math.min(...entry.slots);
        const endSlot = Math.max(...entry.slots);
        return { start: startSlot, end: endSlot };
      }) || [];
    setEditingPlace({ dayIndex, placeId, name, intervals, error: "" });
  };


  const handleSaveEdit = () => {
    if (editingPlace) {
      const { dayIndex, placeId, intervals } = editingPlace;

      const hasInvalidInterval = intervals.some((interval) => interval.start >= interval.end);
      if (hasInvalidInterval) {
        setEditingPlace((prev) =>
          prev
            ? { ...prev, error: "Start time must be earlier than end time." }
            : null
        );
        return;
      }

      const combinedIntervals = combineIntervals(intervals);

      setSchedules((prevSchedules) => {
        const updatedSchedules = [...prevSchedules];
        const daySchedule = { ...updatedSchedules[dayIndex] };

        const newEntries = combinedIntervals.map(({ start, end }) => ({
          item: daySchedule[placeId][0].item,
          slots: Array.from({ length: end - start + 1 }, (_, i) => start + i),
        }));

        daySchedule[placeId] = newEntries;
        updatedSchedules[dayIndex] = daySchedule;
        return updatedSchedules;
      });

      setEditingPlace(null);
    }
  };


  const handleAddInterval = () => {
    if (editingPlace) {
      setEditingPlace((prev) =>
        prev
          ? {
            ...prev,
            intervals: [...prev.intervals, { start: 0, end: 1 }],
          }
          : null
      );
    }
  };

  const handleRemoveInterval = (index: number) => {
    if (editingPlace) {
      setEditingPlace((prev) =>
        prev
          ? {
            ...prev,
            intervals: prev.intervals.filter((_, i) => i !== index),
          }
          : null
      );
    }
  };

  const handleUpdateInterval = (index: number, field: "start" | "end", value: number) => {
    if (editingPlace) {
      setEditingPlace((prev) =>
        prev
          ? {
            ...prev,
            error: "", // Reset error on any update
            intervals: prev.intervals.map((int, i) =>
              i === index ? { ...int, [field]: value } : int
            ),
          }
          : null
      );
    }
  };

  const handleRemovePlace = () => {
    if (editingPlace) {
      const { placeId } = editingPlace;
      setSchedules((prevSchedule) => {
        const updatedSchedule = { ...prevSchedule };
        delete updatedSchedule[Number(placeId)];
        return updatedSchedule;
      });
      setEditingPlace(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingPlace(null);
  };

  return (
    <Box
      sx={{
        maxWidth: "100%",
        margin: "auto",
        padding: 2,
        border: "1px solid #ddd",
        borderRadius: "8px",
      }}
    >

      <Typography variant="h6" align="center" gutterBottom>
        Drag-and-Drop Schedule for Places
      </Typography>

      {schedules.map((daySchedule, dayIndex) => (
        <Box key={dayIndex} sx={{ marginBottom: 4 }}>
          <Typography variant="h6" gutterBottom>
            Day {dayIndex + 1}
          </Typography>
          <ScheduleTable
            schedule={daySchedule}
            timeSlots={timeSlots}
            collisions={calculateCollisions(schedules)[dayIndex]}
            onEdit={(placeId) => handleEditPlace(dayIndex, placeId)}
          />
          <AddPlaceDropZone
            onDrop={(item) => handleDropToSchedule(item, dayIndex)}
            newPlace={newPlace}
            onAddPlace={handleAddPlaceDirectly}
          />
        </Box>
      ))}

      {editingPlace && (
        <EditPlaceModal
          open={!!editingPlace}
          name={editingPlace.name}
          intervals={editingPlace.intervals}
          timeSlots={timeSlots}
          error={editingPlace.error}
          onAddInterval={handleAddInterval}
          onRemoveInterval={handleRemoveInterval}
          onUpdateInterval={handleUpdateInterval}
          onRemovePlace={handleRemovePlace}
          onCancel={handleCancelEdit}
          onSave={handleSaveEdit}
        />
      )}

    </Box>
  );
};

export default DisplaySchedule;