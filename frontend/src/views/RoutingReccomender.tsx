import React, { useEffect, useState } from 'react';
import { Slider, Checkbox, FormControlLabel, Box, Typography, Grid, Button } from '@mui/material';
import { getRestaurant, sendIntervals } from '../api';
import MultipleSelectChip from '../components/routingRecommenderComponents/MultipleSelectChip';

const RoutingRecommender: React.FC = () => {
    const [times, setTimes] = useState<number[]>([7, 8.5, 12, 13.5, 18, 19.5]);
    const [includeBreakfast, setIncludeBreakfast] = useState(true);
    const [includeLunch, setIncludeLunch] = useState(true);
    const [includeDinner, setIncludeDinner] = useState(true);
    const [foodAndDrinkName, setfoodAndDrinkName] = React.useState<string[]>([]);

    const handleCheckboxChange = (meal: string) => {
        switch (meal) {
            case 'breakfast':
                setIncludeBreakfast(prev => {
                    const newIncludeBreakfast = !prev;
                    setTimes(prevTimes => {
                        let newTimes;
                        if (!newIncludeBreakfast) {
                            newTimes = prevTimes.slice(1);
                        } else {
                            const newTime = Math.max(0, prevTimes[0] - 1);
                            newTimes = [newTime, ...prevTimes];
                        }
                        return adjustTimesWithinRange(newTimes);
                    });
                    return newIncludeBreakfast;
                });
                break;

            case 'lunch':
                setIncludeLunch(prev => {
                    const newIncludeLunch = !prev;
                    setTimes(prevTimes => {
                        let newTimes;
                        if (!newIncludeLunch) {
                            if (includeBreakfast) {
                                let midtime = Math.floor((prevTimes[1] + prevTimes[4]) / 2);
                                newTimes = [...prevTimes.slice(0, 2), midtime, ...prevTimes.slice(4)];
                            } else {
                                let midtime = Math.floor((prevTimes[0] + prevTimes[3]) / 2);
                                newTimes = [...prevTimes.slice(0, 1), midtime, ...prevTimes.slice(3)];
                            }
                        } else {
                            if (includeBreakfast) {
                                newTimes = [...prevTimes.slice(0, 2), prevTimes[2], ...prevTimes.slice(2)];
                            } else {
                                newTimes = [...prevTimes.slice(0, 1), prevTimes[2], ...prevTimes.slice(1)];
                            }
                        }
                        return adjustTimesWithinRange(newTimes);
                    });
                    return newIncludeLunch;
                });
                break;

            case 'dinner':
                setIncludeDinner(prev => {
                    const newIncludeDinner = !prev;
                    setTimes(prevTimes => {
                        let newTimes;
                        if (!newIncludeDinner) {
                            newTimes = prevTimes.slice(0, -1);
                        } else {
                            const newTime = Math.min(24, prevTimes[prevTimes.length - 1] + 1);
                            newTimes = [...prevTimes, newTime];
                        }
                        return adjustTimesWithinRange(newTimes);
                    });
                    return newIncludeDinner;
                });
                break;

            default:
                break;
        }
    };

    const adjustTimesWithinRange = (times: number[]) => {
        let adjustedTimes = [...times];
        adjustedTimes = adjustedTimes.map(time => Math.min(24, Math.max(0, time)));
        for (let i = 1; i < adjustedTimes.length; i++) {
            if (adjustedTimes[i] <= adjustedTimes[i - 1] + 1) {
                adjustedTimes[i] = adjustedTimes[i - 1] + 1;
            }
        }
        for (let i = adjustedTimes.length - 1; i > 0; i--) {
            if (adjustedTimes[i] >= 24) {
                adjustedTimes[i] = 24;
                adjustedTimes[i - 1] = Math.min(adjustedTimes[i - 1], 23);
            }
        }
        return adjustedTimes;
    };


    const handleSliderChange = (_event: Event, newTimes: number | number[]) => {
        let adjustedTimes = [...(newTimes as number[])];
        for (let i = 1; i < adjustedTimes.length; i++) {
            if (adjustedTimes[i] <= adjustedTimes[i - 1] + 1) {
                adjustedTimes[i] = adjustedTimes[i - 1] + 1;
            }
        }
        for (let i = adjustedTimes.length - 2; i >= 0; i--) {
            if (adjustedTimes[i] >= adjustedTimes[i + 1] - 1) {
                adjustedTimes[i] = adjustedTimes[i + 1] - 1;
            }
        }
        for (let i = 0; i < adjustedTimes.length; i++) {
            adjustedTimes[i] = Math.min(24, Math.max(0, adjustedTimes[i]));
        }
        for (let i = adjustedTimes.length - 2; i >= 0; i--) {
            if (adjustedTimes[i] >= adjustedTimes[i + 1] - 1) {
                adjustedTimes[i] = adjustedTimes[i + 1] - 1;
            }
        }
        if (adjustedTimes[adjustedTimes.length - 1] > 24) {
            adjustedTimes[adjustedTimes.length - 1] = 24;
        }
        if (adjustedTimes[0] < 0) {
            adjustedTimes[0] = 0;
        }

        setTimes(adjustedTimes);
    };


    const formatTime = (time: number) => {
        const hours = Math.floor(time);
        const minutes = (time % 1) * 60;
        return `${hours}:${minutes === 0 ? '00' : '30'}`;
    };

    const getIntervalText = () => {
        const intervals = [];
        let currentIndex = 0;
    
        // Handle Breakfast
        if (includeBreakfast) {
            intervals.push(`Breakfast: ${formatTime(times[currentIndex])} - ${formatTime(times[currentIndex + 1])}`);
            currentIndex += 2;
        }
    
        // Handle Lunch
        if (includeLunch) {
            const travelStart = times[currentIndex - 1] || times[currentIndex];
            const travelEnd = times[currentIndex];
            intervals.push(`Travel Time 1: ${formatTime(travelStart)} - ${formatTime(travelEnd)}`);
            
            const lunchEnd = times[currentIndex + 1];
            intervals.push(`Lunch: ${formatTime(travelEnd)} - ${formatTime(lunchEnd)}`);
            
            currentIndex += 2;  // Move past lunch end time
            intervals.push(`Travel Time 2: ${formatTime(times[currentIndex - 1])} - ${formatTime(times[currentIndex])}`);
        } else {
            // Handle case when lunch is not included
            const travelStart = times[currentIndex - 1] || times[currentIndex];
            const travelMid = times[currentIndex];
            const travelEnd = times[currentIndex + 1];
            
            intervals.push(`Travel Time 1: ${formatTime(travelStart)} - ${formatTime(travelMid)}`);
            intervals.push(`Travel Time 2: ${formatTime(travelMid)} - ${formatTime(travelEnd)}`);
            
            currentIndex += 1;
        }
    
        // Handle Dinner
        if (includeDinner) {
            intervals.push(`Dinner: ${formatTime(times[currentIndex])} - ${formatTime(times[currentIndex + 1])}`);
        }
    
        return intervals;
    };

    const [intervalJson, setIntervalJson] = useState<{
        breakfast?: { start: number, end: number },
        travel1?: { start: number, end: number },
        lunch?: { start: number, end: number },
        travel2?: { start: number, end: number },
        dinner?: { start: number, end: number },
    }>({})

    const handleSendIntervals = () => {
        let currentIndex = 0;

        const intervals: {
            breakfast?: { start: number, end: number },
            travel1?: { start: number, end: number },
            lunch?: { start: number, end: number },
            travel2?: { start: number, end: number },
            dinner?: { start: number, end: number },
        } = {};

        if (includeBreakfast) {
            intervals.breakfast = {
                start: times[currentIndex],
                end: times[currentIndex + 1],
            };
            currentIndex += 2;
        }

        if (includeLunch) {
            intervals.travel1 = {
                start: includeBreakfast ? times[currentIndex - 1] : times[currentIndex],
                end: includeBreakfast ? times[currentIndex] : times[currentIndex + 1],
            };
            intervals.lunch = {
                start: includeBreakfast ? times[currentIndex] : times[currentIndex + 1],
                end: includeBreakfast ? times[currentIndex + 1] : times[currentIndex + 2],
            };
            currentIndex += 2;
            intervals.travel2 = {
                start: times[currentIndex - 1],
                end: times[currentIndex],
            };
        } else {
            intervals.travel1 = {
                start: includeBreakfast ? times[currentIndex - 1] : times[currentIndex],
                end: includeBreakfast ? times[currentIndex] : times[currentIndex + 1],
            };
            currentIndex += 1;
            intervals.travel2 = {
                start: times[currentIndex - 1],
                end: times[currentIndex],
            };
        }

        if (includeDinner) {
            intervals.dinner = {
                start: times[currentIndex],
                end: times[currentIndex + 1],
            };
        }

        // Send the intervals object to the server
        sendIntervals(intervals)
            .then(response => {
                console.log("Interval data sent successfully", response.data);
                setIntervalJson(response.data.intervals)
            })
            .catch(error => {
                console.error("Error sending interval data", error);
            });
    };


    return (
        <Grid container sx={{ width: "100vw", p: 5 }} display={"flex"}>
            <Grid item xs={10}>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={includeBreakfast}
                            onChange={() => handleCheckboxChange('breakfast')}
                        />
                    }
                    label="Include Breakfast"
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={includeLunch}
                            onChange={() => handleCheckboxChange('lunch')}
                        />
                    }
                    label="Include Lunch"
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={includeDinner}
                            onChange={() => handleCheckboxChange('dinner')}
                        />
                    }
                    label="Include Dinner"
                />
                <Typography variant="body2">
                    Times: {times.join(', ')}
                </Typography>
                <Slider
                    value={times}
                    onChange={handleSliderChange}
                    step={0.5}
                    marks
                    min={0}
                    max={24}
                    valueLabelDisplay="on"
                    valueLabelFormat={(value, index) => {
                        const labelStyles: React.CSSProperties = {
                            display: 'block',
                            textAlign: 'center',
                            width: '100%',
                        };

                        if (includeBreakfast && includeLunch && includeDinner) {
                            // All meals included
                            switch (index) {
                                case 0:
                                    return (
                                        <span style={labelStyles}>
                                            Breakfast:<br />
                                            {formatTime(value)}
                                        </span>
                                    );
                                case 1:
                                    return (
                                        <span style={labelStyles}>
                                            Travel:<br />
                                            {formatTime(value)}
                                        </span>
                                    );
                                case 2:
                                    return (
                                        <span style={labelStyles}>
                                            Lunch:<br />
                                            {formatTime(value)}
                                        </span>
                                    );
                                case 3:
                                    return (
                                        <span style={labelStyles}>
                                            Travel:<br />
                                            {formatTime(value)}
                                        </span>
                                    );
                                case 4:
                                    return (
                                        <span style={labelStyles}>
                                            Dinner:<br />
                                            {formatTime(value)}
                                        </span>
                                    );
                                case 5:
                                    return (
                                        <span style={labelStyles}>
                                            End of the Day:<br />
                                            {formatTime(value)}
                                        </span>
                                    );
                                default:
                                    return formatTime(value);
                            }
                        } else if (includeBreakfast && includeLunch && !includeDinner) {
                            // Breakfast and Lunch included, no Dinner
                            switch (index) {
                                case 0:
                                    return (
                                        <span style={labelStyles}>
                                            Breakfast:<br />
                                            {formatTime(value)}
                                        </span>
                                    );
                                case 1:
                                    return (
                                        <span style={labelStyles}>
                                            Travel:<br />
                                            {formatTime(value)}
                                        </span>
                                    );
                                case 2:
                                    return (
                                        <span style={labelStyles}>
                                            Lunch:<br />
                                            {formatTime(value)}
                                        </span>
                                    );
                                case 3:
                                    return (
                                        <span style={labelStyles}>
                                            Travel:<br />
                                            {formatTime(value)}
                                        </span>
                                    );
                                case 4:
                                    return (
                                        <span style={labelStyles}>
                                            End of the Day:<br />
                                            {formatTime(value)}
                                        </span>
                                    );
                                default:
                                    return formatTime(value);
                            }
                        } else if (includeBreakfast && !includeLunch && includeDinner) {
                            // Breakfast and Dinner included, no Lunch
                            switch (index) {
                                case 0:
                                    return (
                                        <span style={labelStyles}>
                                            Breakfast:<br />
                                            {formatTime(value)}
                                        </span>
                                    );
                                case 1:
                                    return (
                                        <span style={labelStyles}>
                                            Travel:<br />
                                            {formatTime(value)}
                                        </span>
                                    );
                                case 2:
                                    return (
                                        <span style={labelStyles}>
                                            Afternoon:<br />
                                            {formatTime(value)}
                                        </span>
                                    );
                                case 3:
                                    return (
                                        <span style={labelStyles}>
                                            Dinner:<br />
                                            {formatTime(value)}
                                        </span>
                                    );
                                case 4:
                                    return (
                                        <span style={labelStyles}>
                                            End of the Day:<br />
                                            {formatTime(value)}
                                        </span>
                                    );
                                default:
                                    return formatTime(value);
                            }
                        } else if (includeBreakfast && !includeLunch && !includeDinner) {
                            // Only Breakfast included
                            switch (index) {
                                case 0:
                                    return (
                                        <span style={labelStyles}>
                                            Breakfast:<br />
                                            {formatTime(value)}
                                        </span>
                                    );
                                case 1:
                                    return (
                                        <span style={labelStyles}>
                                            Travel:<br />
                                            {formatTime(value)}
                                        </span>
                                    );
                                case 2:
                                    return (
                                        <span style={labelStyles}>
                                            Afternoon:<br />
                                            {formatTime(value)}
                                        </span>
                                    );
                                case 3:
                                    return (
                                        <span style={labelStyles}>
                                            End of the Day:<br />
                                            {formatTime(value)}
                                        </span>
                                    );
                                default:
                                    return formatTime(value);
                            }
                        } else if (!includeBreakfast && includeLunch && includeDinner) {
                            // Lunch and Dinner included, no Breakfast
                            switch (index) {
                                case 0:
                                    return (
                                        <span style={labelStyles}>
                                            Travel:<br />
                                            {formatTime(value)}
                                        </span>
                                    );
                                case 1:
                                    return (
                                        <span style={labelStyles}>
                                            Lunch:<br />
                                            {formatTime(value)}
                                        </span>
                                    );
                                case 2:
                                    return (
                                        <span style={labelStyles}>
                                            Travel:<br />
                                            {formatTime(value)}
                                        </span>
                                    );
                                case 3:
                                    return (
                                        <span style={labelStyles}>
                                            Dinner:<br />
                                            {formatTime(value)}
                                        </span>
                                    );
                                case 4:
                                    return (
                                        <span style={labelStyles}>
                                            End of the Day:<br />
                                            {formatTime(value)}
                                        </span>
                                    );
                                default:
                                    return formatTime(value);
                            }
                        } else if (!includeBreakfast && includeLunch && !includeDinner) {
                            // Only Lunch included
                            switch (index) {
                                case 0:
                                    return (
                                        <span style={labelStyles}>
                                            Travel:<br />
                                            {formatTime(value)}
                                        </span>
                                    );
                                case 1:
                                    return (
                                        <span style={labelStyles}>
                                            Lunch:<br />
                                            {formatTime(value)}
                                        </span>
                                    );
                                case 2:
                                    return (
                                        <span style={labelStyles}>
                                            Travel:<br />
                                            {formatTime(value)}
                                        </span>
                                    );
                                case 3:
                                    return (
                                        <span style={labelStyles}>
                                            End of the Day:<br />
                                            {formatTime(value)}
                                        </span>
                                    );
                                default:
                                    return formatTime(value);
                            }
                        } else if (!includeBreakfast && !includeLunch && includeDinner) {
                            // Only Dinner included
                            switch (index) {
                                case 0:
                                    return (
                                        <span style={labelStyles}>
                                            Travel:<br />
                                            {formatTime(value)}
                                        </span>
                                    );
                                case 1:
                                    return (
                                        <span style={labelStyles}>
                                            Afternoon:<br />
                                            {formatTime(value)}
                                        </span>
                                    );
                                case 2:
                                    return (
                                        <span style={labelStyles}>
                                            Dinner:<br />
                                            {formatTime(value)}
                                        </span>
                                    );
                                case 3:
                                    return (
                                        <span style={labelStyles}>
                                            End of the Day:<br />
                                            {formatTime(value)}
                                        </span>
                                    );
                                default:
                                    return formatTime(value);
                            }
                        } else {
                            // No meals included
                            switch (index) {
                                case 0:
                                    return (
                                        <span style={labelStyles}>
                                            Travel:<br />
                                            {formatTime(value)}
                                        </span>
                                    );
                                case 1:
                                    return (
                                        <span style={labelStyles}>
                                            Afternoon:<br />
                                            {formatTime(value)}
                                        </span>
                                    );
                                case 2:
                                    return (
                                        <span style={labelStyles}>
                                            End of the Day:<br />
                                            {formatTime(value)}
                                        </span>
                                    );
                                default:
                                    return formatTime(value);
                            }
                        }
                    }}



                    sx={{
                        '& .MuiSlider-valueLabel': {
                            top: 40,  // Position the label underneath the slider
                            transform: 'none',  // Prevent the default transform that positions it above
                            backgroundColor: 'transparent',  // Remove the default background color
                            color: 'black',  // Change the text color
                            fontSize: '12px',  // Change the font size
                            fontWeight: 'bold',  // Make the text bold
                            padding: '0',  // Remove the padding
                            '&:before': {
                                display: 'none',  // Remove the arrow pointing to the slider
                            },
                        },
                    }}
                />
            </Grid>
            <Grid item xs={2}>
                <Box sx={{ marginTop: 4 }}>
                    {getIntervalText().map((interval, idx) => (
                        <Typography key={idx} variant="body2" align="center">
                            {interval}
                        </Typography>
                    ))}
                </Box>
            </Grid>
            <Grid item xs={12}>
                <Box display={"flex"}>
                    <MultipleSelectChip names={["assa", "asdb"]} />
                    <Button variant="contained" onClick={handleSendIntervals}>
                        Send Intervals
                    </Button>
                    {JSON.stringify(intervalJson)}
                </Box>
            </Grid>
        </Grid>

    );
};

export default RoutingRecommender;
