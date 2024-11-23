import React, { useEffect, useRef } from 'react';
import { Box, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import ReactMarkdown from 'react-markdown'; // Import Markdown parser
import remarkGfm from 'remark-gfm'; // For GitHub-flavored Markdown (optional)

interface ChatWindowProps {
  messages: { sender: string; text: string }[];
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages }) => {
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
              padding: 1,
              backgroundColor: message.sender === 'user' ? '#daf8da' : '#f1f1f1',
              maxWidth: isSmallScreen ? '100%' : '90%',
              width: 'auto',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
            }}
          >
            <ReactMarkdown
              children={message.text} // Render Markdown content
              remarkPlugins={[remarkGfm]} // Optional: GitHub-flavored Markdown
            />
          </Paper>
        </Box>
      ))}
    </Box>
  );
};

export default ChatWindow;
