import { Box, Dialog, DialogContent, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChatWindow from "./ChatWindow.component";
import InputBox from "./InputBox.component";
import { useState, useCallback, useEffect } from "react";
import { io } from "socket.io-client";
import { 
  AccommodationShoppingCartItem, 
  ActivityShoppingCartItem, 
  OptimizeRouteData, 
  validatePayload, 
  Zone 
} from "../../utils/DataType/shoppingCart";
import { 
  CALL_ACCOMMODATION, 
  CALL_ACCOMMODATION_MESSAGE, 
  CALL_ACTIVITY, 
  CALL_ACTIVITY_MESSAGE, 
  GENERATE_ROUTE, 
  GENERATE_ROUTE_MESSAGE, 
  Message 
} from "../../utils/DataType/message";
import AccommodationInformation from "../PlaceInformations/AccommodationInformation.component";
import ActivityInformation from "../PlaceInformations/ActivityInformation.component";
import { Accommodation, Activity, Range } from "../../utils/DataType/place";
import { dayjsStartDate, generateDateRange } from "../../utils/time";

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

const convertToVrpPayload = (
  activityShoppingCartItems: ActivityShoppingCartItem[],
  accommodationShoppingCartItem: AccommodationShoppingCartItem,
  selectedDates: { startDate: Date; endDate: Date }
): OptimizeRouteData => {
  // Adjust zone ranges to account for the selected date range.
  const adjustZonesToRanges = (zones: Zone[]): Range[] => {
    if (!zones || zones.length === 0) return [];

    const days = generateDateRange(selectedDates.startDate, selectedDates.endDate);
    const adjustedRanges: Range[] = [];
    const sortedZones = [...zones].sort((a, b) => a.date.getTime() - b.date.getTime());

    for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
      const dayStr = days[dayIndex];
      const zonesForDay = sortedZones.filter(zone => dayjsStartDate(zone.date).format("YYYY-MM-DD") === dayStr);

      zonesForDay.forEach(zone => {
        adjustedRanges.push({
          start: zone.range.start + 96 * dayIndex,
          end: zone.range.end + 96 * dayIndex,
        });
      });
    }

    return adjustedRanges;
  };

  return {
    accommodation: {
      place_id: accommodationShoppingCartItem.item.id,
      sleep_times: adjustZonesToRanges(accommodationShoppingCartItem.zones),
    },
    activities: activityShoppingCartItems.map(activityItem => ({
      place_id: activityItem.item.id,
      stay_time: activityItem.stayTime,
      visit_range: adjustZonesToRanges(activityItem.zones),
      must: activityItem.must,
    })),
  };
};

const ChatSection: React.FC<ChatSectionProps> = ({
  messages,
  setMessages,
  selectedDates,
  activityShoppingCartItem,
  setActivityShoppingCartItem,
  accommodationShoppingCartItem,
  setAccommodationShoppingCartItem,
  requestCallValue,
  clearRequestCallValue
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [socket, setSocket] = useState<any>(null);

  // Initialize the WebSocket connection when the component mounts.
  useEffect(() => {
    const newSocket = io("http://localhost:5000"); // Replace with your backend URL.
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to websocket server");
    });

    // Listen for messages from the backend.
    newSocket.on("message", (response: any) => {
      // Update only the last bot message bubble.
      setMessages((prevMessages) => {
        if (prevMessages.length > 0 && prevMessages[prevMessages.length - 1].sender === 'bot') {
          const updatedMessages = [...prevMessages];
          updatedMessages[updatedMessages.length - 1] = {
            ...updatedMessages[updatedMessages.length - 1],
            text: updatedMessages[updatedMessages.length - 1].text + (response.message || "") || updatedMessages[updatedMessages.length - 1].text,
            accommodations: response.recommendations?.accommodations || updatedMessages[updatedMessages.length - 1].accommodations,
            activities: response.recommendations?.activities || updatedMessages[updatedMessages.length - 1].activities,
            route: response.route || updatedMessages[updatedMessages.length - 1].route,
            state: response.state_name
          };
          return updatedMessages;
        }
        return [
          ...prevMessages,
          {
            sender: 'bot',
            text: response.message || "",
            accommodations: response.recommendations?.accommodations,
            activities: response.recommendations?.activities,
            route: response.route,
            state: response.state_name
          },
        ];
      });
      
      // Only mark loading as complete if the final state is received.
      if (response.state_name && response.state_name === "dogshit") {
        setLoading(false);
      }
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from websocket server");
    });

    return () => {
      newSocket.disconnect();
    };
  }, [setMessages]);

  // Handle sending messages based on the provided text and payload.
  const handleSendMessage = (text: string) => {
    switch (text) {
      case GENERATE_ROUTE_MESSAGE:
        onSend(GENERATE_ROUTE_MESSAGE, convertToVrpPayload(activityShoppingCartItem, accommodationShoppingCartItem, selectedDates));
        break;
      default:
        let isValidPlace = validatePayload(activityShoppingCartItem, accommodationShoppingCartItem);
        onSend(text, isValidPlace.result ? convertToVrpPayload(activityShoppingCartItem, accommodationShoppingCartItem, selectedDates) : undefined);
    }
  };

  const onSend = useCallback((text: string, note_payload?: Object) => {
    if (loading || !socket) return;

    // Append the user message.
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: 'user', text },
    ]);

    // Append an empty bot message bubble as a placeholder.
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: 'bot', text: "" }
    ]);

    // Set loading to true until a final response is received.
    setLoading(true);

    // Emit the message event with an optional payload.
    socket.emit("message", { text, payload: note_payload });
  }, [loading, setMessages, socket]);

  // Listen for requestCallValue changes and trigger message sending accordingly.
  useEffect(() => {
    if (!requestCallValue) return;

    switch (requestCallValue) {
      case CALL_ACCOMMODATION:
        handleSendMessage(CALL_ACCOMMODATION_MESSAGE);
        break;
      case CALL_ACTIVITY:
        handleSendMessage(CALL_ACTIVITY_MESSAGE);
        break;
      case GENERATE_ROUTE:
        handleSendMessage(GENERATE_ROUTE_MESSAGE);
        break;
    }

    clearRequestCallValue();
  }, [requestCallValue]);

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
    handleCloseAccommodationDialog();
  };

  const handleSelectAccommodation = (accommodation: Accommodation) => {
    setAccommodationDialogOpen(true);
    setSelectedAccommodation(accommodation);
    handleCloseActivityDialog();
  };

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <ChatWindow
          selectedDates={selectedDates}
          messages={messages}
          setActivity={handleSelectActivity}
          setAccommodation={handleSelectAccommodation}
        />
        <InputBox onSend={handleSendMessage} loading={loading} />
      </Box>

      {/* Activity Dialog */}
      <Dialog open={activityDialogOpen} onClose={handleCloseActivityDialog} fullWidth maxWidth="md">
        <DialogContent>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: -2 }}>
            <IconButton onClick={handleCloseActivityDialog} sx={{ color: "#000", padding: 0 }}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
            Activity Details
          </Typography>
          <ActivityInformation
            data={selectedActivity}
            selectedDates={selectedDates}
            shoppingCartItem={activityShoppingCartItem}
            setShoppingCartItem={setActivityShoppingCartItem}
            handleFinished={handleCloseActivityDialog}
          />
        </DialogContent>
      </Dialog>

      {/* Accommodation Dialog */}
      <Dialog open={accommodationDialogOpen} onClose={handleCloseAccommodationDialog} fullWidth maxWidth="md">
        <DialogContent>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: -2 }}>
            <IconButton onClick={handleCloseAccommodationDialog} sx={{ color: "#000", padding: 0 }}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
            Accommodation Details
          </Typography>
          <AccommodationInformation
            data={selectedAccommodation}
            selectedDates={selectedDates}
            shoppingCartItem={accommodationShoppingCartItem}
            setShoppingCartItem={setAccommodationShoppingCartItem}
            handleFinished={handleCloseAccommodationDialog}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChatSection;
