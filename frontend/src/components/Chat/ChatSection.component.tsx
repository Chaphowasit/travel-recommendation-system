import { Box, Dialog, DialogContent, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChatWindow from "./ChatWindow.component";
import InputBox from "./InputBox.component";
import { useState, useCallback, useEffect } from "react";
import { sendMessage } from "../../utils/api";
import { AccommodationShoppingCartItem, ActivityShoppingCartItem, OptimizeRouteData, Zone } from "../../utils/DataType/shoppingCart";
import { CALL_ACCOMMODATION, CALL_ACCOMMODATION_MESSAGE, CALL_ACTIVITY, CALL_ACTIVITY_MESSAGE, GENERATE_ROUTE, GENERATE_ROUTE_MESSAGE, Message } from "../../utils/DataType/message";
import AccommodationInformation from "../PlaceInformations/AccommodationInformation.component";
import ActivityInformation from "../PlaceInformations/ActivityInformation.component";
import { Accommodation, Activity, Range } from "../../utils/DataType/place";

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
  accommodationShoppingCartItem: AccommodationShoppingCartItem
): OptimizeRouteData => {
  // Helper function that adjusts zone ranges using the same algorithm
  const adjustZonesToRanges = (zones: Zone[]): Range[] => {
    if (!zones || zones.length === 0) return [];

    const sortedZones = [...zones].sort((a, b) => a.date.getTime() - b.date.getTime());
    let currentDate = sortedZones[0].date;
    let offsetMultiplier = 0;
    const adjustedRanges = sortedZones.map(zone => {
      if (zone.date.getTime() !== currentDate.getTime()) {
        offsetMultiplier++;
        currentDate = zone.date;
      }
      return {
        start: zone.range.start + 96 * offsetMultiplier,
        end: zone.range.end + 96 * offsetMultiplier,
      };
    });

    return adjustedRanges;
  };

  console.log(adjustZonesToRanges(accommodationShoppingCartItem.zones))

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
  clearRequestCallValue }) => {
  const [loading, setLoading] = useState<boolean>(false);

  const handleSendMessage = (text: string) => {
    switch (text) {
      case GENERATE_ROUTE_MESSAGE: onSend(GENERATE_ROUTE_MESSAGE, convertToVrpPayload(activityShoppingCartItem, accommodationShoppingCartItem)); break;
      default: onSend(text)
    }
  }

  const onSend = useCallback((text: string, note_payload?: Object) => {
    if (loading) return;

    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: 'user', text },
    ]);

    setLoading(true);

    sendMessage(text, note_payload)
      .then((response) => {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            sender: 'bot',
            text: response.data?.user_message || 'Sorry, I didn\'t get that.',
            accommodations: response.data?.accommodations,
            activities: response.data?.activities,
            route: response.data?.route
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
      case CALL_ACCOMMODATION: handleSendMessage(CALL_ACCOMMODATION_MESSAGE); break;
      case CALL_ACTIVITY: handleSendMessage(CALL_ACTIVITY_MESSAGE); break;
      case GENERATE_ROUTE: handleSendMessage(GENERATE_ROUTE_MESSAGE); break;
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
        <InputBox onSend={handleSendMessage} loading={loading} />
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
