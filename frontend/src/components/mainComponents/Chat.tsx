import { Box } from "@mui/material";
import ChatWindow from "./chatComponents/ChatWindow";
import InputBox from "./chatComponents/InputBox";
import { useState, useCallback } from "react";
import { sendMessage } from "../../api";

interface Message {
    sender: string;
    text: string;
}

interface ChatProps {
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

const Chat: React.FC<ChatProps> = ({ messages, setMessages }) => {
    const [loading, setLoading] = useState<boolean>(false);

    const onSend = useCallback((text: string) => {
        if (loading) return;

        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'user', text },
        ]);

        setLoading(true);

        sendMessage(text)
            .then((response) => {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { sender: 'bot', text: response.data?.user_message || 'Sorry, I didn\'t get that.' },
                ]);
            })
            .catch((error) => {
                console.error('Error sending message:', error);
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { sender: 'bot', text: 'An error occurred. Please try again.' },
                ]);
            })
            .finally(() => {
                setLoading(false);
            });
        
        return true
    }, [loading, setMessages]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <ChatWindow messages={messages} />
            <InputBox onSend={onSend} loading={loading} />
        </Box>
    );
};

export default Chat;
