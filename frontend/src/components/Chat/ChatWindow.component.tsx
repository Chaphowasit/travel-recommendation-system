import React, { useEffect, useRef, useState } from 'react';
import { Box, Divider, Paper, Typography, Button, Avatar, CircularProgress, Skeleton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DownloadIcon from '@mui/icons-material/Download';
import { Message } from '../../utils/DataType/message';
import AccommodationCard from '../PlaceInformations/AccommodationCard.component';
import ActivityCard from '../PlaceInformations/ActivityCard.component';
import { Accommodation, Activity } from '../../utils/DataType/place';
import { RouteData } from '../../utils/DataType/route';
import { convertExcelToImage, export_to_excel } from '../../utils/export_route';

/**
 * handleDownloadRoute:
 * - Uses export_to_excel() to create an Excel Blob from routeData.
 * - Creates a temporary link and triggers a download of the file.
 */
const handleDownloadRoute = (start_date: Date, end_date: Date, routeData: RouteData) => {
  export_to_excel(start_date, end_date, routeData)
    .then((blob: Blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "route.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    })
    .catch((error) => {
      console.error("Error generating Excel file:", error);
    });
};

/**
 * ExcelImage Component:
 * - Converts the routeData into an Excel file, then to an image.
 * - Displays the resulting image.
 */
const ExcelImage: React.FC<{ selectedDates: { startDate: Date; endDate: Date }, routeData: RouteData }> = ({ selectedDates, routeData }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateImage = async () => {
      try {
        const blob = await export_to_excel(selectedDates.startDate, selectedDates.endDate, routeData);
        const imgUrl = await convertExcelToImage(blob);
        setImageUrl(imgUrl);
      } catch (err) {
        console.error('Error generating Excel image:', err);
        setError('Failed to generate image');
      } finally {
        setLoading(false);
      }
    };
    generateImage();
  }, [routeData, selectedDates]);

  if (loading) {
    return (
      <Skeleton
        variant="rectangular"
        width="100%"
        height={200}
        animation="wave"
        sx={{ borderRadius: 2 }}
      />
    );
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return <img src={imageUrl!} alt="Excel representation of route data" style={{ width: '100%', borderRadius: 8 }} />;
};

interface ChatWindowProps {
  selectedDates: { startDate: Date; endDate: Date };
  messages: Message[];
  setActivity: (activity: Activity) => void;
  setAccommodation: (accommodation: Accommodation) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ selectedDates, messages, setActivity, setAccommodation }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const chatWindowRef = useRef<HTMLDivElement>(null);

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
        background: 'linear-gradient(270deg,rgba(103, 245, 200, 0.3),rgba(103, 193, 245, 0.3));',
        borderRadius: '16px',
        margin: 1,
        scrollbarWidth: 'thin',
        scrollbarColor: '#ccc #f0f0f0',
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#ccc',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: '#f0f0f0',
        },
      }}
    >
      {messages.map((message, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
            alignItems: 'flex-start',
            marginBottom: 1,
          }}
        >
          {/* Avatar */}
          <Avatar
            sx={{
              marginRight: message.sender === 'user' ? 0 : 1,
              marginLeft: message.sender === 'user' ? 1 : 0,
              transform: 'translateY(8px)',
            }}
            src={message.sender === 'user' ? '/user.png' : '/bot.png'}
            alt={message.sender === 'user' ? 'User Icon' : 'Bot Icon'}
          />

          <Paper
            sx={{
              position: 'relative',
              marginY: 1,
              marginX: 1,
              paddingX: 2,
              paddingY: message.sender === 'user' ? 0 : 1,
              background:
                message.sender === 'user'
                  ? 'rgb(163, 234, 255)'
                  : 'rgba(255, 255, 255)',
              backdropFilter: message.sender === 'user' ? 'none' : 'blur(10px)',
              maxWidth: isSmallScreen ? '100%' : '80%',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              borderRadius: '16px',
              color: '#333',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              ...(message.sender !== 'user' && {
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 12,
                  left: -12,
                  borderTop: '8px solid transparent',
                  borderBottom: '8px solid transparent',
                  borderRight: '16px solid rgba(255, 255, 255)',
                },
              }),
              ...(message.sender === 'user' && {
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 12,
                  right: -12,
                  borderTop: '8px solid transparent',
                  borderBottom: '8px solid transparent',
                  borderLeft: '16px solid rgb(163, 234, 255)',
                },
              }),
            }}
          >
            {message.text === "" ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CircularProgress size={16} sx={{ marginRight: 1 }} />
                  <Typography variant="body2">{message.state}</Typography>
                </Box>
                <Skeleton animation="wave" width={400}/>
                <Skeleton animation="wave" width={400}/>
                <Skeleton animation="wave" width={400}/>
              </Box>
            ) : (
              <ReactMarkdown children={message.text} remarkPlugins={[remarkGfm]} />
            )}

            {/* Show additional details only for final bot messages */}
            {message.sender !== 'user' && message.state === "dogshit" && (
              <>
                {(message.accommodations || message.activities) && <Divider sx={{ marginY: 1 }} />}
                {message.accommodations && message.accommodations.length > 0 && (
                  <Box sx={{ marginTop: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                      Accommodations
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        overflowX: 'auto',
                        maxWidth: '100%',
                        padding: 2,
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
                      }}
                    >
                      {message.accommodations.map((accommodation) => (
                        <Box key={accommodation.id} sx={{ marginRight: 2, flexShrink: 0 }}>
                          <AccommodationCard
                            accommodation={accommodation}
                            onClick={() => setAccommodation(accommodation)}
                          />
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {message.activities && message.activities.length > 0 && (
                  <Box sx={{ marginTop: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                      Activities
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        overflowX: 'auto',
                        maxWidth: '100%',
                        padding: 2,
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
                      }}
                    >
                      {message.activities.map((activity) => (
                        <Box key={activity.id} sx={{ marginRight: 2, flexShrink: 0 }}>
                          <ActivityCard
                            activity={activity}
                            onClick={() => setActivity(activity)}
                          />
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {message.route && (
                  <>
                    <Divider sx={{ marginY: 1 }} />
                    <Box sx={{ marginTop: 2 }}>
                      <ExcelImage selectedDates={selectedDates} routeData={message.route} />
                    </Box>
                    <Box sx={{ marginTop: 2, textAlign: 'center' }}>
                      <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleDownloadRoute(selectedDates.startDate, selectedDates.endDate, message.route!)}
                        sx={{
                          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                          boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                          fontWeight: 'bold',
                          borderRadius: '8px',
                          textTransform: 'none',
                          padding: '8px 16px',
                          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'scale(1.05)',
                            boxShadow: '0 5px 8px 3px rgba(33, 203, 243, .3)',
                          },
                        }}
                      >
                        Download Route
                      </Button>
                    </Box>
                  </>
                )}
              </>
            )}
          </Paper>
        </Box>
      ))}
    </Box>
  );
};

export default ChatWindow;
