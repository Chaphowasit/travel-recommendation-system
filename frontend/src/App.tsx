import React from 'react';
import { CssBaseline } from '@mui/material';
import { Box } from '@mui/material';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import Chatbot from './views/Chatbot';
import RoutingRecommender from './views/RoutingReccomender';
const App: React.FC = () => {



    return (
        <Router>
            <CssBaseline />
            <Box sx={{ height: '100vh', backgroundColor: '#f0f0f0', width: '100vw', display: "flex" }}>
                <Routes>
                    <Route path="/" element={<Navigate to="/chat"/>} />
                    <Route path="/chat" element={<Chatbot />} />
                    <Route path="/route" element={<RoutingRecommender />} />
                    <Route path="*" element={<Navigate to="/chat"/>} />
                </Routes>
            </Box>
        </Router>

    );
};

export default App;
