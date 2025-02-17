import { Box, Dialog, DialogContent, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChatWindow from "./ChatWindow.component";
import InputBox from "./InputBox.component";
import { useState, useCallback, useEffect } from "react";
import { sendMessage } from "../../utils/api";
import { AccommodationShoppingCartItem, ActivityShoppingCartItem } from "../../utils/DataType/shoppingCart";
import { CALL_ACCOMMODATION, CALL_ACCOMMODATION_MESSAGE, CALL_ACTIVITY, CALL_ACTIVITY_MESSAGE, GENERATE_ROUTE, GENERATE_ROUTE_MESSAGE, Message } from "../../utils/DataType/message";
import AccommodationInformation from "../PlaceInformations/AccommodationInformation.component";
import ActivityInformation from "../PlaceInformations/ActivityInformation.component";
import { Accommodation, Activity } from "../../utils/DataType/place";

interface ChatSectionProps {
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    selectedDates: { startDate: Date; endDate: Date };
    activityShoppingCartItem: ActivityShoppingCartItem[];
    setActivityShoppingCartItem: React.Dispatch<React.SetStateAction<ActivityShoppingCartItem[]>>;
    accommodationShoppingCartItem: AccommodationShoppingCartItem;
    setAccommodationShoppingCartItem: React.Dispatch<React.SetStateAction<AccommodationShoppingCartItem>>;
    requestCallValue: CALL_ACCOMMODATION | CALL_ACTIVITY | GENERATE_ROUTE | null;
    clearRequestCallValue: () => void;
}

const ChatSection: React.FC<ChatSectionProps> = ({ 
    messages, 
    setMessages, 
    selectedDates, 
    activityShoppingCartItem, 
    setActivityShoppingCartItem, 
    accommodationShoppingCartItem, 
    setAccommodationShoppingCartItem, 
    requestCallValue, 
    clearRequestCallValue }) => {
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

    useEffect(() => {
        if (!requestCallValue) return;
        
        switch (requestCallValue) {
            case CALL_ACCOMMODATION: onSend(CALL_ACCOMMODATION_MESSAGE); break;
            case CALL_ACTIVITY: onSend(CALL_ACTIVITY_MESSAGE); break;
            case GENERATE_ROUTE: onSend(GENERATE_ROUTE_MESSAGE); break;
        }

        clearRequestCallValue()
    }, [requestCallValue])

    const [activityDialogOpen, setActivityDialogOpen] = useState(false);
    const [accommodationDialogOpen, setAccommodationDialogOpen] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
    const [selectedAccommodation, setSelectedAccommodation] = useState<Accommodation | null>(null);

    const handleCloseActivityDialog = () => {
        setActivityDialogOpen(false);
        setSelectedActivity(null);
    };

    const handleCloseAccommodationDialog = () => {
        setAccommodationDialogOpen(false);
        setSelectedAccommodation(null);
    };

    const handleSelectActivity = (activity: Activity) => {
        setActivityDialogOpen(true);
        setSelectedActivity(activity);
        handleCloseAccommodationDialog()
    };

    const handleSelectAccommodation = (accommodation: Accommodation) => {
        setAccommodationDialogOpen(true);
        setSelectedAccommodation(accommodation);
        handleCloseActivityDialog()
    };

    

    return (
        <>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <ChatWindow
                    messages={messages}
                    setActivity={handleSelectActivity}
                    setAccommodation={handleSelectAccommodation}
                />
                <InputBox onSend={onSend} loading={loading} />
            </Box>

            {/* activity dialog */}
            <Dialog open={activityDialogOpen} onClose={handleCloseActivityDialog} fullWidth maxWidth="md">
                <DialogContent>
                    {/* Close Button */}
                    <Box sx={{ display: "flex", justifyContent: "flex-end", mb: -2 }}>
                        <IconButton onClick={handleCloseActivityDialog} sx={{ color: "#000", padding: 0 }}>
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    {/* Title based on Type */}
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
                        Activity Details
                    </Typography>

                    {/* Information Section */}
                    <ActivityInformation
                        data={selectedActivity}
                        selectedDates={selectedDates}
                        shoppingCartItem={activityShoppingCartItem}  // Correct for activities
                        setShoppingCartItem={setActivityShoppingCartItem}
                        handleFinished={handleCloseActivityDialog}
                    />


                </DialogContent>
            </Dialog>

            {/* activity dialog */}
            <Dialog open={accommodationDialogOpen} onClose={handleCloseAccommodationDialog} fullWidth maxWidth="md">
                <DialogContent>
                    {/* Close Button */}
                    <Box sx={{ display: "flex", justifyContent: "flex-end", mb: -2 }}>
                        <IconButton onClick={handleCloseAccommodationDialog} sx={{ color: "#000", padding: 0 }}>
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    {/* Title based on Type */}
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
                        Accommodation Details
                    </Typography>

                    {/* Information Section */}
                    <AccommodationInformation
                        data={selectedAccommodation}
                        selectedDates={selectedDates} // Pass correct dates
                        shoppingCartItem={accommodationShoppingCartItem}  // Correct prop for accommodations
                        setShoppingCartItem={setAccommodationShoppingCartItem}
                        handleFinished={handleCloseAccommodationDialog}
                    />

                </DialogContent>
            </Dialog>
        </>

    );
};

export default ChatSection;
