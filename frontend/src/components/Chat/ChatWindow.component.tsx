import React, { useEffect, useRef } from 'react';
import { Box, Divider, Paper, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import ReactMarkdown from 'react-markdown'; // Import Markdown parser
import remarkGfm from 'remark-gfm'; // For GitHub-flavored Markdown (optional)
import { Message } from '../../utils/DataType/message';
import AccommodationCard from '../PlaceInformations/AccommodationCard.component';
import ActivityCard from '../PlaceInformations/ActivityCard.component';
import { Accommodation, Activity } from '../../utils/DataType/place';
import DisplaySchedule from '../Schedule/DisplaySchedule.component';
import { RouteData } from '../../utils/DataType/route';

interface ChatWindowProps {
  messages: Message[];
  setActivity: (activity: Activity) => void;
  setAccommodation: (accommodation: Accommodation) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, setActivity, setAccommodation }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const chatWindowRef = useRef<HTMLDivElement>(null);

  // Scroll to the bottom when messages change
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Box
      ref={chatWindowRef}
      sx={{
        flex: 1,
        height: '100%',
        maxHeight: '100vh',
        overflowY: 'auto',
        padding: 2,
        backgroundColor: '#fff',
        scrollbarWidth: 'thin', // Firefox
        scrollbarColor: '#ccc #f0f0f0', // Firefox
        '&::-webkit-scrollbar': {
          width: '6px', // Width of the scrollbar
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#ccc', // Color of the scrollbar thumb
          borderRadius: '4px', // Round the corners of the scrollbar thumb
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: '#f0f0f0', // Background of the scrollbar track
        },
      }}
    >
      {messages.map((message, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
            marginBottom: 1,
          }}
        >
          <Paper
            sx={{
              padding: 2,
              backgroundColor: message.sender === 'user' ? '#daf8da' : '#f1f1f1',
              maxWidth: isSmallScreen ? '100%' : '90%',
              width: 'auto',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
            }}
          >
            {/* Render Markdown content */}
            <ReactMarkdown children={message.text} remarkPlugins={[remarkGfm]} />

            {(message.accommodations || message.activities) && (<Divider/>)}

            {/* Display Accommodations */}
            {message.accommodations && message.accommodations.length > 0 && (
              <Box sx={{ marginTop: 2 }}>
                <Typography variant="h6" fontWeight={"bold"}>Accommodations</Typography>
                <Box
                  sx={{
                    display: 'flex',
                    overflowX: 'auto',
                    maxWidth: '100%',
                    '&::-webkit-scrollbar': {
                      height: '6px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: '#ccc',
                      borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: '#f0f0f0',
                    },
                    padding: 2,
                  }}
                >
                  {message.accommodations.map((accommodation) => (
                    <Box key={accommodation.id} sx={{ marginRight: 2, flexShrink: 0 }}>
                      <AccommodationCard
                        accommodation={accommodation}
                        onClick={() => {
                          // Handle the accommodation click
                          setAccommodation(accommodation);
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* Display Activities */}
            {message.activities && message.activities.length > 0 && (
              <Box sx={{ marginTop: 2 }}>
                <Typography variant="h6" fontWeight={"bold"}>Activities</Typography>
                <Box
                  sx={{
                    display: 'flex',
                    overflowX: 'auto',
                    maxWidth: '100%',
                    '&::-webkit-scrollbar': {
                      height: '6px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: '#ccc',
                      borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: '#f0f0f0',
                    },
                    padding: 2,
                  }}
                >
                  {message.activities.map((activity) => (
                    <Box key={activity.id} sx={{ marginRight: 2, flexShrink: 0 }}>
                      <ActivityCard
                        activity={activity}
                        onClick={() => {
                          // Handle the activity click
                          setActivity(activity);
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {message.route && (<>
              <Divider/>

              <Box sx={{ marginTop: 2 }}>
              <DisplaySchedule routeData={message.route} setRouteData={function (_: RouteData): void {
                throw new Error('Function not implemented.');
              } }/>
            </Box>
            </>)}
            
          </Paper>
        </Box>
      ))}
    </Box>
  );
};

export default ChatWindow;