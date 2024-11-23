import React, { useState } from 'react';
import { CssBaseline, Box } from '@mui/material';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PreferenceView from './views/Preference.view';
import PlannerView from './views/Planner.view'; // Import PlannerView
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const App: React.FC = () => {
    const [selectedDates, setSelectedDates] = useState<{ startDate: Date | null; endDate: Date | null }>({
        startDate: null,
        endDate: null,
    });

    const handleDateChange = (startDate: Date | undefined, endDate: Date | undefined) => {
        setSelectedDates({
            startDate: startDate || null,
            endDate: endDate || null,
        });
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <Router>
            <CssBaseline />
            <Box sx={{ height: '100vh', backgroundColor: '#f0f0f0', width: '100vw', display: 'flex' }}>
                <Routes>
                    <Route path="/" element={<Navigate to="/chat" />} />
                    <Route path="/chat" element={<PreferenceView onDateChange={handleDateChange} />} />
                    <Route path="/planner" element={<PlannerView selectedDates={selectedDates} />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </Box>
        </Router>
        </DndProvider>
        
    );
};

export default App;
