import { Box } from "@mui/material";
import ChatWindow from "../components/chatComponents/ChatWindow";
import InputBox from "../components/chatComponents/InputBox";
import { useState, useCallback, useRef } from "react";
import { sendMessage } from "../api";

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
    const inputRef = useRef<HTMLInputElement>(null); // Create a reference for the input box

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
