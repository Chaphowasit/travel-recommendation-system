import { Box } from "@mui/material";
import ChatWindow from "./ChatWindow.component";
import InputBox from "./InputBox.component";
import { useState, useCallback } from "react";
import { sendMessage } from "../../utils/api";
import { Accommodation, Activity } from "../../utils/DataType/place";

interface Message {
    sender: string;
    text: string;
}

interface ChatSectionProps {
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    setRecommendAccommodations: (recommendAccommodations: Accommodation[]) => void;
    setRecommendActivities: (recommendActivities: Activity[]) => void;
}

const ChatSection: React.FC<ChatSectionProps> = ({ messages, setMessages, setRecommendAccommodations, setRecommendActivities }) => {
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
                if (response.data?.accommodations != null) {
                    // Send only the new accommodations to the parent
                    setRecommendAccommodations(response.data.accommodations);
                }
                
                if (response.data?.activities != null) {
                    // Send only the new activities to the parent
                    setRecommendActivities(response.data.activities);
                }

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
            <ChatWindow messages={messages} />
            <InputBox onSend={onSend} loading={loading} />
        </Box>
    );
};

export default ChatSection;
