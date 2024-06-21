import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

interface ChatWindowProps {
  messages: { sender: string; text: string }[];
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ flex: 1, overflowY: 'auto', padding: 2, backgroundColor: '#fff' }}>
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
              padding: 1,
              backgroundColor: message.sender === 'user' ? '#daf8da' : '#f1f1f1',
              maxWidth: isSmallScreen ? '100%' : '60%', // Adjust maxWidth based on screen size
              width: 'auto',
            }}
          >
            <Typography variant="body1">{message.text}</Typography>
          </Paper>
        </Box>
      ))}
    </Box>
  );
};

export default ChatWindow;
