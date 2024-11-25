import React, { useState } from 'react';
import { CssBaseline, Box } from '@mui/material';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PreferenceView from './views/Preference.view';
import PlannerView from './views/Planner.view'; // Import PlannerView
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const App: React.FC = () => {
    // State for selected dates
    const [selectedDates, setSelectedDates] = useState<{ startDate: Date | null; endDate: Date | null }>({
        startDate: null,
        endDate: null,
    });

    // Handler to update selected dates
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
                <Box
                    sx={{
                        height: '100vh',
                        backgroundColor: '#f0f0f0',
                        width: '100vw',
                        display: 'flex',
                    }}
                >
                    <Routes>
                        {/* Redirect the root path to /chat */}
                        <Route path="/" element={<Navigate to="/preference" replace />} />

                        {/* Preference View */}
                        <Route
                            path="/preference"
                            element={<PreferenceView onDateChange={handleDateChange}/>}
                        />

                        {/* Planner View */}
                        <Route
                            path="/planner"
                            element={
                                selectedDates.startDate && selectedDates.endDate ? (
                                    <PlannerView selectedDates={selectedDates} handleDateChange={handleDateChange}/>
                                ) : (
                                    <Navigate to="/preference" replace />
                                )
                            }
                        />

                        {/* Catch-all route */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Box>
            </Router>
        </DndProvider>
    );
};

export default App;
