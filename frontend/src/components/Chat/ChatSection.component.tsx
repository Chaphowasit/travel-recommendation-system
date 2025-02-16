import { Box } from "@mui/material";
import ChatWindow from "./ChatWindow.component";
import InputBox from "./InputBox.component";
import { useState, useCallback } from "react";
import { sendMessage } from "../../utils/api";
import { AccommodationShoppingCartItem, ActivityShoppingCartItem } from "../../utils/DataType/shoppingCart";
import { Message } from "../../utils/DataType/message";

interface ChatSectionProps {
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    setActivityShoppingCartItem: React.Dispatch<React.SetStateAction<ActivityShoppingCartItem[]>>;
    setAccommodationShoppingCartItem: React.Dispatch<React.SetStateAction<AccommodationShoppingCartItem>>;
}

const ChatSection: React.FC<ChatSectionProps> = ({ messages, setMessages, setActivityShoppingCartItem, setAccommodationShoppingCartItem }) => {
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
                    { 
                        sender: 'bot', 
                        text: response.data?.user_message || 'Sorry, I didn\'t get that.', 
                        accommodations: response.data.accommodations,  
                        activities: response.data.activities
                    },
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
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <ChatWindow 
                messages={messages} 
                setActivityShoppingCartItem={setActivityShoppingCartItem}
                setAccommodationShoppingCartItem={setAccommodationShoppingCartItem}
            />
            <InputBox onSend={onSend} loading={loading} />
        </Box>
    );
};

export default ChatSection;
