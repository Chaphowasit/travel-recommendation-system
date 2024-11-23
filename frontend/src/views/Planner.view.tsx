import React, { useState } from 'react';
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SuggestionsSection from '../components/Planner/Suggestions/SuggestionsSection.component';
import ChatSection from '../components/Planner/Chat/ChatSection.component';
import PlanningSection from '../components/Planner/Planning/PlanningSection.component';
import DisplaySchedule from '../components/Schedule/DisplaySchedule.component';

interface BusinessHour {
    start: number; // 0-96 format
    end: number; // 0-96 format
}
  
interface Accommodation {
    id: string;
    name: string;
    description: string;
    tag: string;
    business_hour: BusinessHour;
    image: string;
}

interface Activity {
    id: string;
    name: string;
    description: string;
    tag: string;
    business_hour: BusinessHour;
    image: string;
}
  

interface PlannerViewProps {
    selectedDates: { startDate: Date | null; endDate: Date | null };
}

const PlannerView: React.FC<PlannerViewProps> = ({ selectedDates }) => {
    const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
    const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
    const [recommendAccommodations, setRecommendAccommodations] = useState<Accommodation[]>([]);
    const [recommendActivities, setRecommendActivities] = useState<Activity[]>([]);

    // Toggle the chat bubble
    const toggleChat = () => {
        setIsChatOpen((prev) => !prev);
    };

    const handleSetRecommendAccommodations = (newAccommodations: Accommodation[]) => {
        setRecommendAccommodations((prev) => {
            const updatedList = [...newAccommodations, ...prev];
            return updatedList.slice(0, 7); // Limit to 7 elements
        });
    };

    const handleSetRecommendActivities = (newActivities: Activity[]) => {
        setRecommendActivities((prev) => {
            const updatedList = [...newActivities, ...prev];
            return updatedList.slice(0, 7); // Limit to 7 elements
        });
    };

    return (
        <Grid container sx={{ width: '100%', height: '100%', overflow: 'hidden' }}>
            {/* Suggestions Section */}
            <Grid size={4}>
                <SuggestionsSection recommendAccommodations={recommendAccommodations} recommendActivities={recommendActivities}/>
            </Grid>

            {/* Main Content Area */}
            <Grid
                size={8}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    height: '100%',
                }}
            >
                {/* <DisplaySchedule/> */}
                <PlanningSection selectedDates={selectedDates}/>

                {/* Chat Bubble Button and Chat Section */}
                <Box sx={{ position: 'absolute', bottom: 16, right: 16, zIndex: 1000 }}>
                    {/* Chat Section */}
                    {isChatOpen && (
                        <Box
                            sx={{
                                width: 600,
                                height: 600,
                                boxShadow: 3,
                                borderRadius: 2,
                                overflow: 'hidden',
                                backgroundColor: 'white',
                                display: 'flex',
                                flexDirection: 'column',
                                position: 'absolute', // Absolute position to keep it on top of the button
                                bottom: 60, // Space between chat box and button (adjust as needed)
                                right: 0,
                            }}
                        >
                            {/* Chat Header */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    p: 1,
                                    backgroundColor: 'primary.main', // Add a background to distinguish the header
                                    color: 'white',
                                    zIndex: 1, // Ensure header stays on top of the content
                                }}
                            >
                                <Box sx={{ fontWeight: 'bold' }}>Chatbot</Box>
                                <IconButton
                                    onClick={toggleChat}
                                    size="small"
                                    sx={{ color: 'white' }}
                                >
                                    <CloseIcon />
                                </IconButton>
                            </Box>

                            {/* Chat Body */}
                            <Box
                                sx={{
                                    flexGrow: 1,
                                    overflowY: 'auto', // Scrollable chat body
                                }}
                            >
                                <ChatSection 
                                    messages={messages} 
                                    setMessages={setMessages} 
                                    setRecommendAccommodations={handleSetRecommendAccommodations}
                                    setRecommendActivities={handleSetRecommendActivities}
                                />
                            </Box>
                        </Box>
                    )}

                    {/* Button to toggle chat visibility */}
                    <IconButton
                        onClick={toggleChat}
                        sx={{
                            backgroundColor: 'primary.main',
                            color: 'white',
                            borderRadius: '50%',
                            boxShadow: 3,
                            position: 'relative',
                            zIndex: 1, // Ensure button stays on top of the chat box
                        }}
                    >
                        <ChatIcon />
                    </IconButton>
                </Box>
            </Grid>
        </Grid>
    );
};

export default PlannerView;
