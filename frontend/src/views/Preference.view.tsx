import { Box, Button, Typography } from "@mui/material";
import { DateRange, Range, RangeKeyDict } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // Main style file
import 'react-date-range/dist/theme/default.css'; // Default theme CSS
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface PreferenceViewProps {
    onDateChange: (startDate: Date | undefined, endDate: Date | undefined) => void;
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
        onDateChange(selectionRange.startDate, selectionRange.endDate);
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
