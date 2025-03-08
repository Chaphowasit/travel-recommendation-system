import React, { useEffect, useRef, useState } from 'react';
import { Box, Divider, Paper, Typography, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../../utils/DataType/message';
import AccommodationCard from '../PlaceInformations/AccommodationCard.component';
import ActivityCard from '../PlaceInformations/ActivityCard.component';
import { Accommodation, Activity } from '../../utils/DataType/place';
import { RouteData } from '../../utils/DataType/route';
import { convertExcelToImage, export_to_excel } from '../../utils/export_route';

interface ChatWindowProps {
  selectedDates: { startDate: Date; endDate: Date };
  messages: Message[];
  setActivity: (activity: Activity) => void;
  setAccommodation: (accommodation: Accommodation) => void;
}

/**
 * handleDownloadRoute:
 * - Uses export_to_excel() to create an Excel Blob from routeData.
 * - Creates a temporary link and triggers a download of the file.
 */
const handleDownloadRoute = (start_date: Date, end_date: Date, routeData: RouteData) => {

  export_to_excel(start_date, end_date, routeData)
    .then((blob: Blob) => {
      // Create a temporary URL for the Blob
      const url = URL.createObjectURL(blob);
      // Create a temporary link element
      const link = document.createElement("a");
      link.href = url;
      link.download = "route.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // Release the object URL after the download
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
  }, [routeData]);

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>{error}</div>;
  }
  return <img src={imageUrl!} alt="Excel representation of route data" />;
};

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
        backgroundColor: '#fff',
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
            <ReactMarkdown children={message.text} remarkPlugins={[remarkGfm]} />

            {(message.accommodations || message.activities) && <Divider />}

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
                        onClick={() => setActivity(activity)}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {message.route && (
              <>
                <Divider />
                <Box sx={{ marginTop: 2 }}>
                  {/* Instead of DisplaySchedule, we show the Excel image */}
                  <ExcelImage selectedDates={selectedDates} routeData={message.route} />
                </Box>

                {/* Download Button for Route */}
                <Box sx={{ marginTop: 2, textAlign: 'center' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleDownloadRoute(selectedDates.startDate, selectedDates.endDate, message.route!)}
                  >
                    Download Route
                  </Button>
                </Box>
              </>
            )}
          </Paper>
        </Box>
      ))}
    </Box>
  );
};

export default ChatWindow;
