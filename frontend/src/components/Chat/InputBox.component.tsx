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

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        padding: 1,
        borderTop: '1px solid #ccc',
        backgroundColor: '#f9f9f9',
      }}
    >
      <ChatIcon sx={{ marginRight: 1, color: '#555' }} />

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
          maxHeight: '10em', // Allows multiline growth up to 10 lines
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#bbb',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#f0f0f0',
          },
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              border: 'none', // Remove fieldset border
            },
          },
        }}
      />

      <IconButton
        color="primary"
        onClick={handleSend}
        sx={{
          marginLeft: 1,
          border: '1px solid #ccc',
          borderRadius: '50%',
          padding: '10px',
          backgroundColor: '#fff',
          transition: '0.2s ease-in-out',
          '&:hover': {
            backgroundColor: '#e0f7fa',
            transform: 'scale(1.1)',
          },
        }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : <ArrowUpwardIcon />}
      </IconButton>
    </Box>
  );
};

export default InputBox;
