import React, { useState } from 'react';
import { CssBaseline, Box } from '@mui/material';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PreferenceView from './views/Preference.view';
import PlannerView from './views/Planner.view'; // Import PlannerView
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const App: React.FC = () => {
    const [selectedDates, setSelectedDates] = useState<{ startDate: Date; endDate: Date }>({
        startDate: new Date((new Date()).getTime() + 7 * 60 * 60 * 1000),
        endDate: new Date((new Date()).getTime() + 7 * 60 * 60 * 1000),
    });
    
    const handleDateChange = (startDate: Date, endDate: Date) => {
        setSelectedDates({
            startDate: startDate,
            endDate: endDate,
        });
    };
    

    return (
        <DndProvider backend={HTML5Backend}>
            <Router>
            <CssBaseline />
            <Box sx={{ height: '100vh', backgroundColor: '#f0f0f0', width: '100vw', display: 'flex' }}>
                <Routes>
                    <Route path="/" element={<Navigate to="/preference" />} />
                    <Route path="/preference" element={<PreferenceView onDateChange={handleDateChange} />} />
                    <Route path="/planner" element={<PlannerView selectedDates={selectedDates} setSelectedDates={handleDateChange}/>} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </Box>
        </Router>
        </DndProvider>
    );
};

export default App;
