import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, IconButton, CircularProgress } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ChatIcon from '@mui/icons-material/Chat';

interface InputBoxProps {
  onSend: (text: string) => void;
  loading: boolean;
}

const InputBox: React.FC<InputBoxProps> = ({ onSend, loading }) => {
  const [text, setText] = useState('');
  const textFieldRef = useRef<HTMLDivElement | null>(null);

  const handleSend = () => {
    if (text.trim() !== '' && !loading) {
      onSend(text);
      setText('');
    }
  };

  useEffect(() => {
    if (!loading && textFieldRef.current) {
      textFieldRef.current.querySelector('textarea')?.focus();
    }
  }, [loading]);

  const scrollbarStyles = {
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
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', padding: 1, borderTop: '1px solid #ccc', backgroundColor: '#f0f0f0' }}>
      <ChatIcon sx={{ marginRight: 1 }} />
      <TextField
        fullWidth
        variant="outlined"
        multiline
        placeholder="Type your message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        disabled={loading}
        ref={textFieldRef}
        sx={{
          height: 'auto',
          maxHeight: '8em', // Increase maxHeight to 8 lines
          overflowY: 'auto', // Enable scroll when content exceeds maxHeight
          ...scrollbarStyles, // Apply scrollbar styles here
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              border: 'none', // Remove the border of the TextField
            },
          },
        }}
      />
      <IconButton
        color="primary"
        onClick={handleSend}
        sx={{
          marginLeft: 1,
          border: '1px solid #ccc', // Add border around IconButton
          borderRadius: '50%', // Make it a circular border
          padding: '10px', // Add some padding to make the button circular
        }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : <ArrowUpwardIcon />}
      </IconButton>
    </Box>
  );
};

export default InputBox;
