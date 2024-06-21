import React, { useState } from 'react';
import { Box, CssBaseline } from '@mui/material';
import ChatWindow from './components/ChatWindow';
import InputBox from './components/InputBox';
import axios from 'axios';

const App: React.FC = () => {
    const [messages, setMessages] = useState<{ sender: string, text: string }[]>([]);

    const sendMessage = (text: string) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'user', text },
        ]);

        axios.post('http://127.0.0.1:5000/send', {
            message: text
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then((response) => {
            setMessages((prevMessages) => [
                ...prevMessages,
                { sender: 'bot', text: response.data.user_message },
            ]);
        }).catch((error) => {
            console.error('Error sending message:', error);
        });
    };

    return (
        <Box sx={{ height: '100vh', backgroundColor: '#f0f0f0', width: '100vw' }}>
            <CssBaseline />
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
                <ChatWindow messages={messages} />
                <InputBox onSend={sendMessage} />
            </Box>
        </Box>
    );
};

export default App;
