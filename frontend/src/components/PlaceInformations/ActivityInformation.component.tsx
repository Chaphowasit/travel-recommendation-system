import {
  Typography,
  Box,
  Grid2 as Grid,
  Button,
  IconButton,
  FormControlLabel,
  Switch,
  Checkbox,
} from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import React, { useEffect, useState } from "react";

import { Activity } from "../../utils/DataType/place";
import {
  ActivityShoppingCartItem,
  Zone,
} from "../../utils/DataType/shoppingCart";
import { dayjsStartDate, formatTime, generateDateRange } from "../../utils/time";
import TimePicker from "../utils/TimePicker";

interface ActivityInformationProps {
  data: Activity | null;
  selectedDates: { startDate: Date | null; endDate: Date | null };
  shoppingCartItem: ActivityShoppingCartItem[]; // Initial shopping cart data
  setShoppingCartItem: React.Dispatch<React.SetStateAction<ActivityShoppingCartItem[]>>; // Function to update the shopping cart
  handleFinished: () => void;
}

const ActivityInformation: React.FC<ActivityInformationProps> = ({
  data,
  selectedDates,
  shoppingCartItem,
  setShoppingCartItem,
  handleFinished,
}) => {
  if (data === null) return null;

  // State for advanced setting
  const [showAdvanceSetting, setShowAdvanceSetting] = useState(false);

  // Outer (date) and inner (specific time) checkboxes
  const [selectedDatesArray, setSelectedDatesArray] = useState<string[]>([]);
  const [specificTimeDates, setSpecificTimeDates] = useState<string[]>([]);

  // Zones & stay hours
  const [zones, setZones] = useState<Zone[]>([]);
  const [stayHours, setStayHours] = useState<number>(8); // Default stay time

  const [mustGo, setMustGo] = useState<boolean>(false)

  // Load existing cart data if present
  useEffect(() => {
    if (!selectedDates.startDate) return;

    const existingItem = shoppingCartItem.find(
      (cartItem) => cartItem.item.id === data.id
    );
    if (existingItem) {
      // Restore zones, stayHours, and advanced setting
      setZones(existingItem.zones);
      setStayHours(existingItem.stayTime);
      setShowAdvanceSetting(existingItem.advance);
      setMustGo(existingItem.must)

      // If advanced setting is on, try to restore which days/times were selected
      if (existingItem.advance && selectedDates.endDate) {
        const dateRange = generateDateRange(
          selectedDates.startDate,
          selectedDates.endDate
        );

        // 1) Rebuild the "selectedDatesArray" from selectDateIndexes
        if (existingItem.selectDateIndexes && existingItem.selectDateIndexes.length > 0) {
          const newSelectedDatesArray: string[] = [];
          existingItem.selectDateIndexes.forEach((idx) => {
            if (idx >= 0 && idx < dateRange.length) {
              const dateStr = dayjsStartDate(dateRange[idx]).format("YYYY-MM-DD");
              newSelectedDatesArray.push(dateStr);
            }
          });
          setSelectedDatesArray(newSelectedDatesArray);

          // 2) Rebuild "specificTimeDates"
          const newSpecificTimeDates: string[] = [];
          newSelectedDatesArray.forEach((dateStr) => {
            // find all zones for that date
            const dateZones = existingItem.zones.filter(
              (z) => dayjsStartDate(z.date).format("YYYY-MM-DD") === dateStr
            );

            // If there's more than one zone, definitely user used specific times
            // If there's exactly one zone, check if it matches full business hours
            if (dateZones.length > 1) {
              newSpecificTimeDates.push(dateStr);
            } else if (dateZones.length === 1) {
              const zone = dateZones[0];
              if (
                zone.range.start !== data.business_hour.start ||
                zone.range.end !== data.business_hour.end
              ) {
                newSpecificTimeDates.push(dateStr);
              }
            }
          });
          setSpecificTimeDates(newSpecificTimeDates);
        }
      }
    } else {
      // By default, add one zone for the startDate
      const defaultZone: Zone = {
        date: dayjsStartDate(selectedDates.startDate).toDate(),
        range: {
          start: data.business_hour.start,
          end: data.business_hour.end,
        },
      };
      setZones([defaultZone]);
      setStayHours(data.duration);
    }
  }, [shoppingCartItem, data, selectedDates]);

  // Update zone start time for a specific date & index
  const handleZoneStartTimeChange = (
    zoneIndex: number,
    newStart: number,
    dateStr: string
  ) => {
    setZones((prevZones) => {
      // 1. separate out zones for this date vs. others
      const otherZones = prevZones.filter(
        (z) => dayjsStartDate(z.date).format("YYYY-MM-DD") !== dateStr
      );
      const dateZones = prevZones.filter(
        (z) => dayjsStartDate(z.date).format("YYYY-MM-DD") === dateStr
      );

      // 2. update the single zone at zoneIndex
      const endtime = (data.business_hour.end !== 96 || data.business_hour.start !== 0) ? Math.min(96, newStart + stayHours) : newStart + stayHours;
      dateZones[zoneIndex] = {
        ...dateZones[zoneIndex],
        range: { start: newStart, end: endtime },
      };

      // 3. recombine them
      return [...otherZones, ...dateZones];
    });
  };

  // Add a new zone row (defaults to the full business hour)
  const handleAddZone = (dateStr: string) => {
    const newZone: Zone = {
      date: dayjsStartDate(dateStr).toDate(),
      range: {
        start: data.business_hour.start,
        end: data.business_hour.end,
      },
    };
    setZones((prev) => [...prev, newZone]);
  };

  // Remove a zone row
  const handleRemoveZone = (dateStr: string, zoneStart: number) => {
    setZones((prev) => {
      const idxToRemove = prev.findIndex(
        (z) =>
          dayjsStartDate(z.date).format("YYYY-MM-DD") === dateStr &&
          z.range.start === zoneStart
      );
      if (idxToRemove !== -1) {
        const newZones = [...prev];
        newZones.splice(idxToRemove, 1);
        return newZones;
      }
      return prev;
    });
  };

  // Select the stay hours
  const handleStayHoursChange = (value: number) => {
    setStayHours(value);
  };

  // "Save" logic: build final zones and store them in the cart item
  const handleAddToCartClick = () => {
    if (!selectedDates.startDate || !selectedDates.endDate) return;

    const is24Hour = data.business_hour.start === 0 && data.business_hour.end === 96;

    let finalZones: Zone[] = [];
    let selectDateIndexes: number[] = [];
    let selectTimeIndexes: number[] = [];

    let hasError = false; // <-- Error flag to prevent saving

    const dateRange = generateDateRange(
      selectedDates.startDate,
      selectedDates.endDate
    );

    if (!showAdvanceSetting) {
      // 1) Advance Setting is OFF => zone for every day
      finalZones = dateRange.map((d) => ({
        date: dayjsStartDate(d).toDate(),
        range: {
          start: data.business_hour.start,
          end: data.business_hour.end,
        },
      }));
      // Mark all date indexes as selected
      selectDateIndexes = dateRange.map((_, i) => i);
      // No specific times => selectTimeIndexes remains empty
    } else {
      // 2) Advance Setting is ON
      if (selectedDatesArray.length === 0) {
        alert(
          "No day selected. Please select at least one day or disable Advance Setting."
        );
        return;
      }

      // For each date in the range, check if it's selected
      dateRange.forEach((d, i) => {
        const dateStr = dayjsStartDate(d).format("YYYY-MM-DD");
        if (selectedDatesArray.includes(dateStr)) {
          // This date is selected => add i to selectDateIndexes
          selectDateIndexes.push(i);

          const isSpecificTime = specificTimeDates.includes(dateStr);
          if (isSpecificTime) {
            // (a) "Specific visit time?" => push all user-defined zones for that date
            const userZonesForDate = zones.filter(
              (z) => dayjsStartDate(z.date).format("YYYY-MM-DD") === dateStr
            );

            finalZones.push(...userZonesForDate);

            // Determine the last day in the date range
            const lastDay = dayjsStartDate(selectedDates.endDate || undefined).format("YYYY-MM-DD");

            // If the current date is the last day in the range, validate end times
            if (dateStr === lastDay) {
              const hasInvalidEndTime = userZonesForDate.some((zone) => zone.range.end > 96);

              if (hasInvalidEndTime) {
                alert("One or more time slots on the last day exceed the allowed limit.");
                hasError = true; // <-- Set error flag
                return;
              }
            }

            // For each zone, we push its local index in a flattened array
            const timeIndexArray = userZonesForDate.map((_, zIndex) => zIndex);
            selectTimeIndexes = selectTimeIndexes.concat(timeIndexArray);
          }
          else {
            // (b) "Specific visit time?" is OFF => single zone with full business hour
            finalZones.push({
              date: dayjsStartDate(d).toDate(),
              range: {
                start: data.business_hour.start,
                end: data.business_hour.end,
              },
            });
            // No specific times => do not add anything to selectTimeIndexes
          }
        }
      });
    }

    // Stop execution if there was an error
    if (hasError) return;

    const anyInvalid = finalZones.some((zone) => {
      if (!is24Hour) {
        // Activity has fixed hours, must check range
        return (
          zone.range.start < data.business_hour.start ||
          zone.range.start + stayHours > data.business_hour.end
        );
      }
      return false; // If 24/7, allow all times
    });

    if (anyInvalid) {
      alert(
        "One or more selected time slots are outside the valid business hour range."
      );
      return; // stop here; don't save to cart
    }

    // Build the updated cart item
    const updatedCart = shoppingCartItem.filter(
      (cartItem) => cartItem.item.id !== data.id
    );

    updatedCart.push({
      item: data,
      zones: finalZones,
      stayTime: stayHours,
      must: mustGo,
      advance: showAdvanceSetting,
      selectDateIndexes,
      // single array of time indexes
      selectTimeIndexes,
    });

    setShoppingCartItem(updatedCart);
    handleFinished();
  };

  const handleRemoveFromCartClick = () => {
    setShoppingCartItem((oldItem) => {
      return oldItem.filter((item) => item.item.id !== data.id);
    });
    handleFinished();
  };

  return (
    <Box sx={{ width: "100%", padding: "20px", marginTop: "10px" }}>
      <Grid container spacing={2} alignItems="flex-start">
        {/* Image */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            component="img"
            src={data.image}
            alt={data.name}
            sx={{
              width: "100%",
              height: "250px",
              objectFit: "cover",
              borderRadius: "4px",
            }}
          />
        </Grid>

        {/* Info */}
        <Grid size={{ xs: 12, md: 6 }} sx={{ position: "relative" }}>
          <Box>
            <Typography
              variant="h4"
              component="div"
              sx={{
                fontWeight: "bold",
                marginBottom: "10px",
                marginTop: { xs: "10px", md: "0" },
              }}
            >
              {data.name}
            </Typography>
            <Box
              sx={{
                maxHeight: "150px",
                overflowY: "auto",
                marginBottom: "10px",
                paddingRight: "10px",
              }}
            >
              <Typography variant="body1">{data.description}</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ marginBottom: "10px" }}>
              <strong>Tag:</strong> {data.tag}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ marginBottom: "10px" }}>
              <strong>Business Hour:</strong> {formatTime(data.business_hour.start)} -{" "}
              {formatTime(data.business_hour.end)}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Stay Hours + Advance Setting */}
      <Box
        sx={{
          marginTop: "20px",
          display: "flex",
          justifyContent: "space-between",
          gap: 4,
        }}
      >
        {/* Stay Hours Select */}

        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Typography variant="h6">Stay Hours</Typography>
            <TimePicker
              time={stayHours}
              setTime={handleStayHoursChange}
              range={{
                start: 1,
                end: 96,
              }}
            />
          </Box>

          <FormControlLabel
            control={
              <Checkbox
                checked={mustGo}
                onChange={() => setMustGo((prev) => !prev)}
                color="primary"
              />
            }
            label="Must Visit?"
          />
        </Box>
        <FormControlLabel
          control={
            <Switch
              checked={showAdvanceSetting}
              onChange={() => setShowAdvanceSetting((prev) => !prev)}
              color="primary"
            />
          }
          label="Advance Setting"
        />
      </Box>

      {/* Preferred Visit Time Section */}
      {showAdvanceSetting && (
        <Box sx={{ marginTop: "20px" }}>
          <Typography variant="h6" sx={{ marginBottom: "10px" }}>
            Preferred Visit Time
          </Typography>
          {selectedDates.startDate &&
            selectedDates.endDate &&
            generateDateRange(selectedDates.startDate, selectedDates.endDate).map(
              (d) => {
                const dateStr = dayjsStartDate(d).format("YYYY-MM-DD");
                const isDateSelected = selectedDatesArray.includes(dateStr);
                const zonesForThisDate = zones.filter(
                  (z) =>
                    dayjsStartDate(z.date).format("YYYY-MM-DD") === dateStr
                );
                const isSpecificTimeEnabled = specificTimeDates.includes(dateStr);

                return (
                  <Box
                    key={dateStr}
                    sx={{
                      marginBottom: "20px",
                      border: "1px solid #ccc",
                      padding: "10px",
                      borderRadius: "4px",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        gap: 2,
                      }}
                    >
                      {/* Outer checkbox: select/deselect the date */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={isDateSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDatesArray((prev) => [...prev, dateStr]);
                              } else {
                                // Unselect this date => remove from advanced
                                setSelectedDatesArray((prev) =>
                                  prev.filter((day) => day !== dateStr)
                                );
                                setSpecificTimeDates((prev) =>
                                  prev.filter((day) => day !== dateStr)
                                );
                                // Also remove all zones for this date
                                setZones((prev) =>
                                  prev.filter(
                                    (z) =>
                                      dayjsStartDate(z.date).format("YYYY-MM-DD") !==
                                      dateStr
                                  )
                                );
                              }
                            }}
                            color="primary"
                          />
                        }
                        label={dateStr}
                      />

                      {/* Inner checkbox: enable specific time (only if the date is selected) */}
                      {isDateSelected && (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={isSpecificTimeEnabled}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSpecificTimeDates((prev) => [...prev, dateStr]);
                                  // If no zones exist for this date, add a default zone
                                  if (zonesForThisDate.length === 0) {
                                    const newZone: Zone = {
                                      date: dayjsStartDate(d).toDate(),
                                      range: {
                                        start: data.business_hour.start,
                                        end: data.business_hour.end,
                                      },
                                    };
                                    setZones((prev) => [...prev, newZone]);
                                  }
                                } else {
                                  setSpecificTimeDates((prev) =>
                                    prev.filter((day) => day !== dateStr)
                                  );
                                  // Remove all zones for this date
                                  setZones((prev) =>
                                    prev.filter(
                                      (z) =>
                                        dayjsStartDate(z.date).format("YYYY-MM-DD") !==
                                        dateStr
                                    )
                                  );
                                }
                              }}
                              color="primary"
                            />
                          }
                          label="Specific visit time?"
                        />
                      )}
                    </Box>

                    {/* Time selection UI (only if the date is selected and specific time is enabled) */}
                    {isDateSelected &&
                      isSpecificTimeEnabled &&
                      zonesForThisDate.map((zone, zoneIndex) => (
                        <Box
                          key={zoneIndex}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            backgroundColor: "#f9f9f9",
                            borderRadius: "8px",
                            padding: "8px 12px",
                            boxShadow: 1,
                            mt: 1,
                            ml: 4,
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography variant="body2" fontWeight="medium">
                              From:
                            </Typography>
                            <TimePicker
                              time={zone.range.start}
                              setTime={(newTime) => {
                                handleZoneStartTimeChange(zoneIndex, newTime, dateStr);
                              }}
                              range={{
                                start: data.business_hour.start,
                                end: (data.business_hour.end !== 96 || data.business_hour.start !== 0) ? data.business_hour.end - stayHours : 96,
                              }}
                            />
                            <Typography variant="body2" fontWeight="medium">
                              To:
                            </Typography>
                            <Typography variant="body2" color="primary">
                              {formatTime(zone.range.start + stayHours)}
                            </Typography>
                          </Box>

                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <IconButton
                              color="primary"
                              onClick={() => {
                                handleAddZone(dateStr);
                              }}
                              size="small"
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                            {zonesForThisDate.length > 1 && (
                              <IconButton
                                color="error"
                                onClick={() => {
                                  handleRemoveZone(dateStr, zone.range.start);
                                }}
                                size="small"
                              >
                                <RemoveIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                        </Box>
                      ))}
                  </Box>
                );
              }
            )}
        </Box>
      )}

      {/* Bottom Action Buttons */}
      <Box
        sx={{
          marginTop: "20px",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <Button
          onClick={handleAddToCartClick}
          color="primary"
          variant="contained"
          startIcon={<AddShoppingCartIcon />}
        >
          Save
        </Button>
        {shoppingCartItem.some((item) => item.item.id === data.id) && (
          <Button
            onClick={handleRemoveFromCartClick}
            color="error"
            variant="contained"
            startIcon={<DeleteIcon />}
          >
            Remove
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default ActivityInformation;
