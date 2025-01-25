import { Box, Button, Typography } from "@mui/material";
import { DateRange, Range, RangeKeyDict } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // Main style file
import 'react-date-range/dist/theme/default.css'; // Default theme CSS
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface PreferenceViewProps {
    onDateChange: (startDate: Date , endDate: Date ) => void;
}

const PreferenceView: React.FC<PreferenceViewProps> = ({ onDateChange }) => {
    const navigate = useNavigate();

    const [state, setState] = useState<Range[]>([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: 'selection',
        },
    ]);

    const handleSelect = (ranges: RangeKeyDict) => {
        const selectionRange: Range = ranges.selection;
        setState([selectionRange]);
    
        // Adjust the dates by adding 7 hours for the timezone
        const adjustedStartDate = selectionRange.startDate
            ? new Date(selectionRange.startDate.getTime() + 7 * 60 * 60 * 1000)
            : new Date();
    
        const adjustedEndDate = selectionRange.endDate
            ? new Date(selectionRange.endDate.getTime() + 7 * 60 * 60 * 1000)
            : new Date();
    
        // Call the onDateChange callback with the adjusted dates
        onDateChange(adjustedStartDate, adjustedEndDate);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                width: '100%',
                height: '100%',
            }}
        >
            <Typography variant="h3" sx={{ mb: 2 }}>
                What date do you want to travel?
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <DateRange
                    editableDateInputs={true}
                    onChange={handleSelect}
                    moveRangeOnFirstSelection={false}
                    ranges={state}
                    minDate={new Date()}
                    preview={undefined}
                />

                <Box sx={{ display: 'flex', alignItems: 'center', height: '54.9px'}}>
                    <Button
                        variant="contained"
                        sx={{ alignSelf: 'center', justifySelf: 'center' }}
                        onClick={(_event) => navigate('/planner')}
                    >
                        Submit
                    </Button>
                </Box>

            </Box>
        </Box>
    );
};

export default PreferenceView;
