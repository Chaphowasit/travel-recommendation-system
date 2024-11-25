import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SuggestionsSection from '../components/Suggestions/SuggestionsSection.component';
import ChatSection from '../components/Chat/ChatSection.component';
import PlanningSection from '../components/Planning/PlanningSection.component';
import DisplaySchedule from '../components/Schedule/DisplaySchedule.component';
import { Tabs, Tab, AppBar, FormControl, InputLabel, MenuItem, Select, Toolbar } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface BusinessHour {
  start: number; // 0-96 format
  end: number; // 0-96 format
}

interface Accommodation {
  id: string;
  name: string;
  description: string;
  tag: string;
  business_hour: BusinessHour;
  image: string;
}

interface Activity {
  id: string;
  name: string;
  description: string;
  tag: string;
  business_hour: BusinessHour;
  image: string;
}

interface RouteItem {
  arrival_time: number;
  departure_time: number;
  index: number;
  node: string;
  travel_time: number;
  waiting_time: number;
}

interface RouteData {
  routes: RouteItem[][];
  total_time: number;
  total_waiting_time: number;
}


interface PlannerViewProps {
  selectedDates: { startDate: Date | null; endDate: Date | null };
  handleDateChange: (startDate: Date | undefined, endDate: Date | undefined) => void;
}

const PlannerView: React.FC<PlannerViewProps> = ({ selectedDates, handleDateChange }) => {
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    // Redirect if selected dates are null
    if (!selectedDates.startDate || !selectedDates.endDate) {
      navigate('/'); // Redirect to the home route
    }
  }, [selectedDates, navigate]); // Add dependencies

  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [recommendAccommodations, setRecommendAccommodations] = useState<Accommodation[]>([
    {
      "id": "H0676",
      "name": "The Pho Thong Phuket",
      "description": "[\"4.0 Very good 4.0 of 5 bubbles 11 reviews #19 of 47 guest houses in Phuket Town Location 4.0 Cleanliness 3.0 Service 3.0 Value 3.3 Finding an ideal budget friendly guest house in Phuket Town does not have to be difficult. Welcome to The Pho Thong Phuket, a nice option for travelers like you. Rooms at The Pho Thong Phuket provide air conditioning, and guests can stay connected with free wifi. In addition, while staying at The Pho Thong Phuket guests have access to a 24 hour front desk and baggage storage. Need a place to park? Free parking is available at The Pho Thong Phuket. Given the close proximity of popular landmarks, such as Soi Romanee (0.3 mi) and Surin Circle Clock Tower (0.4 mi), guests of The Pho Thong Phuket can easily experience some of Phuket Town\\'s most well known attractions. Travelers looking to enjoy some lobster can head to La Gaetana, Brasserie Phuket, or Hong Kong Restaurant. Otherwise, you may want to check out a southwestern restaurant such as Comics Cafe & Bar. Phuket Town is also known for some great parks, including 72nd Anniversary Queen Sirikit Park and King Rama 9 Park, which are not too far from The Pho Thong Phuket. The Pho Thong Phuket puts the best of Phuket Town at your fingertips, making your stay both relaxing and enjoyable.\", \\'Property amenities Free parking Free High Speed Internet (WiFi) Children Activities (Kid / Family Friendly) Baggage storage Non-smoking hotel Shared lounge / TV area 24-hour front desk Room features Air conditioning Housekeeping Clothes rack Bath / shower Complimentary toiletries Good to know HOTEL CLASS Star ratings are intended to indicate the general level of features, amenities, and services to expect. This property is classified according to Giata. 3.0 of 5 stars HOTEL STYLE Budget Languages Spoken English, Thai\\']",
      "tag": "just make for frontend work",
      "business_hour": {
        "start": 0,
        "end": 96
      },
      "image": "https://cf.bstatic.com/xdata/images/hotel/max1024x768/56824650.jpg?k=46999c437cbec2a3a34c6be5370084607c06437e7b94f72d474b9d64f797980e&o=&hp=1"
    },
    {
      "id": "H0411",
      "name": "Samkong Place",
      "description": "['4.0 Very good 4.0 of 5 bubbles 53 reviews #23 of 119 small hotels in Phuket Town Location 3.1 Cleanliness 4.6 Service 4.0 Value 4.3 Samkong Place is a boutique service apartment with Sino-Portuguese architectural design, situated in a residential area, far from the noise and crowds. The rooms are spacious with antique and chic decors all around. Samkong Place definitely offers you an unbeatable opportunity to mix business with pleasure. With its ideal location located between Phuket town and major shopping & entertainment malls.Gracious, friendly Thai hospitality and service, unique antique design with chic colorful touches will create special memories and a desire to return again and again.', 'Property amenities Free parking Valet parking Free High Speed Internet (WiFi) Airport transportation Salon Non-smoking hotel ATM on site Laundry service Wifi Car hire Show more Room features Air conditioning Private balcony Safe Refrigerator Room types Non-smoking rooms Good to know HOTEL CLASS Star ratings are intended to indicate the general level of features, amenities, and services to expect. This property is classified according to Giata. 3.0 of 5 stars HOTEL STYLE Modern Charming Languages Spoken English, Thai']",
      "tag": "just make for frontend work",
      "business_hour": {
        "start": 0,
        "end": 96
      },
      "image": "https://www.finedaechiangmai.com/img/upload/image/Stay_Samkhongplace/IMG_2854.jpg"
    },
    {
      "id": "H0256",
      "name": "Travelodge Phuket Town",
      "description": "[\"4.5 Excellent 4.5 of 5 bubbles 63 reviews #23 of 137 hotels in Phuket Town Location 4.3 Cleanliness 4.8 Service 4.4 Value 4.7 Travelers\\' Choice Tripadvisor gives a Travelers’ Choice award to accommodations, attractions and restaurants that consistently earn great reviews from travelers and are ranked within the top 10% of properties on Tripadvisor. The hotel’s location provides all the convenience and enjoyment that the city hotel has to offer while being a sidestep away to provide a relaxing escape when you need it. Walking distance to the two Central shopping malls, with a cinema, aquarium and theme park adding to its 500 shops and restaurants. A short drive takes you to the famous Phuket Old Town, the charming, century-old Sino-Portuguese tourist spot, filled with brightly painted townhouses converted into artisanal stores, restaurants, and bars with a Sunday Walking Street Market for souvenirs and street food. The hotel and the town are placed at the heart of the island and so all the island’s beaches and attractions are all within short reach. Giving our Guests the best opportunity to see and experience all what Phuket has to offer. Designed to suit today’s modern lifestyle and an enjoyable city stay, the hotel offers an all-day-dining restaurant and lobby-bar, an outdoor pool with pool-bar and a gym to accompany its 165 contemporary-style air-conditioned rooms; all areas equipped with unlimited free Wi-Fi access to keep you connected throughout your stay. Each room features an en-suite bathroom, a flat screen TV, tea and coffee making facilities and a work desk.\", \\'Property amenities Free parking Free High Speed Internet (WiFi) Fitness Center with Gym / Workout Room Pool Bar / lounge Highchairs available Car hire 24-hour security Outdoor pool Saltwater pool Coffee shop Restaurant Breakfast available Breakfast buffet Breakfast in the room Complimentary tea Complimentary welcome drink Happy hour Outdoor dining area Wine / champagne Poolside bar Concierge Outdoor furniture Sun deck Sun terrace First aid kit Umbrella 24-hour check-in 24-hour front desk Laundry service Show more Room features Blackout curtains Soundproof rooms Air conditioning Desk Fireplace Refrigerator Cable / satellite TV Bidet Housekeeping Safe Telephone Bottled water Clothes rack Iron Laptop safe Wake-up service / alarm clock Electric kettle Flatscreen TV Walk-in shower Complimentary toiletries Hair dryer Show more Room types City view Pool view Non-smoking rooms Family rooms Good to know HOTEL CLASS Star ratings are intended to indicate the general level of features, amenities, and services to expect. This property is classified according to Giata. 3.0 of 5 stars HOTEL STYLE Charming Budget Languages Spoken English, Thai\\']",
      "tag": "just make for frontend work",
      "business_hour": {
        "start": 0,
        "end": 96
      },
      "image": "https://pix10.agoda.net/hotelImages/28689949/-1/45114f063520c577dcb0339c1e9084cf.jpg?ca"
    },
    {
      "id": "H0482",
      "name": "Phuket Old Town Hostel",
      "description": "['3.5 Very good 3.5 of 5 bubbles 51 reviews #42 of 72 hostels in Phuket Town Location 4.2 Cleanliness 3.8 Service 3.6 Value 3.6 Hostel in the center of phuket town. Feel the journey in phuket lifestyle start from here. Around with the old town environment. Near many facilities such as bus stop, restaurants, nice spot in phuket town.', 'Property amenities Paid public parking nearby Free High Speed Internet (WiFi) Wifi Non-smoking hotel Dry cleaning Laundry service Room features Air conditioning Housekeeping Bath / shower Room types Family rooms Good to know HOTEL CLASS Star ratings are intended to indicate the general level of features, amenities, and services to expect. This property is classified according to Giata. 2.0 of 5 stars HOTEL STYLE Classic Budget Languages Spoken English, Chinese, Thai']",
      "tag": "just make for frontend work",
      "business_hour": {
        "start": 0,
        "end": 96
      },
      "image": "https://pix10.agoda.net/hotelImages/285436/955773441/75bee747b12c03765f558dddef491440.jpg?ce"
    },
    {
      "id": "H0052",
      "name": "OYO 1054 Phuket Backpacker Hostel",
      "description": "['3.5 Very good 3.5 of 5 bubbles 183 reviews #25 of 71 hostels in Phuket Town Location 3.7 Cleanliness 3.7 Service 3.7 Value 3.8 Just opened: Contemporary Thai / Chinese fusion boutique hostel, conveniently located in the centre of Phuket town. Great value with sophistication! Very welcome to Phuket Backpacker. We are centrally located in the bustling heart of Phuket Town. A town rich with Thai culture & history. We offer a home away from home. With our newly renovated property we offer our guests clean & comfortable accommodation set in a contemporary boutique Asian fusion style.', 'Property amenities Free public parking nearby Free internet Coffee shop Bicycle rental Billiards Airport transportation BBQ facilities Baggage storage Wifi Shuttle bus service Car hire Currency exchange Non-smoking hotel Outdoor furniture Picnic area Shared kitchen Shared lounge / TV area Shops Sun terrace ATM on site 24-hour front desk Laundry service Show more Room features Room service Safe Seating area Good to know HOTEL CLASS Star ratings are intended to indicate the general level of features, amenities, and services to expect. This property is classified according to Giata. 2.0 of 5 stars HOTEL STYLE Budget Languages Spoken English, Thai']",
      "tag": "just make for frontend work",
      "business_hour": {
        "start": 0,
        "end": 96
      },
      "image": "https://images.oyoroomscdn.com/uploads/hotel_image/94153/small/126f2f69501011c5.jpg"
    },
    {
      "id": "H0458",
      "name": "Win Backpacker Hostel",
      "description": "['4.0 Very good 4.0 of 5 bubbles 65 reviews #22 of 72 hostels in Phuket Town Location 4.6 Cleanliness 4.0 Service 4.4 Value 4.1 The hotel is located in the old town of Phuket. From Phuket Bus Station 1 and Central Festival takes 10 minutes by car offers private rooms and dormitory rooms with wireless Internet access (Wi-Fi) access. If traveling by car, the hostel is located. Big Buddha from 15 minutes to 2 hours 20 minutes from the bus station and 45 minutes from Phuket International Airport. The staff at the front desk is open 24 hours a day can arrange shuttle service. The tour desk can arrange a tour of the guests. It also offers free public parking on site. bars, convenience stores and restaurants are located nearby.', 'Property amenities Free parking Free High Speed Internet (WiFi) Airport transportation Baggage storage Concierge 24-hour check-in Dry cleaning Laundry service Parking Wifi Car hire Taxi service Shops Doorperson Show more Room types Non-smoking rooms Suites Family rooms Good to know HOTEL CLASS Star ratings are intended to indicate the general level of features, amenities, and services to expect. This property is classified according to Giata. 2.0 of 5 stars HOTEL STYLE Budget Languages Spoken English, Thai']",
      "tag": "just make for frontend work",
      "business_hour": {
        "start": 0,
        "end": 96
      },
      "image": "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/05/3f/9b/7f/win-backpacker-hostel.jpg"
    },
    {
      "id": "H0446",
      "name": "Khao Rang Place",
      "description": "['4.5 Excellent 4.5 of 5 bubbles 32 reviews #2 of 5 condos in Talat Nuea Location 5.0 Cleanliness 4.4 Service 4.5 Value 4.5 New Hotel Good Price Good Location In Phuket Good Price Good Location In Phuket 9.3 New Hotel Good Price Good Location In Phuket Room Cleaning Very Good Staff Service Very Good can Looking View In Phuket Town Near Shopping Center', 'Property amenities Free parking Parking Free High Speed Internet (WiFi) Wifi Non-smoking hotel 24-hour front desk Room features Blackout curtains Air conditioning Safe Bottled water Kitchenette Microwave Bath / shower Complimentary toiletries Refrigerator Hair dryer Show more Room types Non-smoking rooms Suites Family rooms Good to know HOTEL CLASS Star ratings are intended to indicate the general level of features, amenities, and services to expect. This property is classified according to Giata. 3.0 of 5 stars HOTEL STYLE Budget Business']",
      "tag": "just make for frontend work",
      "business_hour": {
        "start": 0,
        "end": 96
      },
      "image": "https://cf.bstatic.com/xdata/images/hotel/max1024x768/529417698.jpg?k=cf7192be5bce1b5c86faaa740ab6c824e50e029e2b2bcdb3e0f9c6ab883805b6&o=&hp=1"
    }
  ]);
  const [recommendActivities, setRecommendActivities] = useState<Activity[]>([
    {
      "id": "A0198",
      "name": "Private Tour: Amazing Phuket Island & Big Buddha Guided Tour",
      "description": "[\"After you\\'re picked up from your hotel, make your way to Patong Beach\\\\u2014one of the most popular beaches in the area. Take in the view of blonde sands framed by turquoise waters and framatic rock formations just offshore. From there, continue to Karon Viewpoint, where you can enjoy panoramic views of 3 beaches\\\\u2014Kata, Kata Noi, and Karon.\\\\n\\\\nProceed to Promthep Cape, at the south end of Phuket Island, to snap photos of the breathtaking scenery of the coastline. Make your way to the neighboring Wat Chalong, one of the most venerated temples in Phuket. A further stop will be made so you can admire the magnificence of the island\\'s Big Buddha.\\\\n\\\\nLastly, head back to Phuket Town. Pop into a cashew factory to taste and shop for nutty souvenirs, and then cruise through the streets to admire the well-preserved and historic Sino-Portuguese architecture of the city. Your outing ends at the Gems Gallery, where you can opt to stay and shop before hopping back to your Hotel.\\\\n\\\\n\"]",
      "tag": "just make for frontend work",
      "business_hour": {
        "start": 0,
        "end": 96
      },
      "image": "https://media.tacdn.com/media/attractions-splice-spp-674x446/11/f8/ab/aa.jpg"
    },
    {
      "id": "A0130",
      "name": "Kata Noi Beach",
      "description": "['Kata Noi Beach is a beautiful sandy bay and a perfect spot in Phuket if you want to be near the famous Kata Beach while staying away from the tourist crowds. This strand of white sand is blessed with incredibly clear blue water during the high season, and its location out of the way keeps it relatively quiet. Unless you know about it, you probably will miss it.']",
      "tag": "just make for frontend work",
      "business_hour": {
        "start": 0,
        "end": 96
      },
      "image": "https://www.joeysantini.com/app/uploads/2020/05/Turquoise.jpg"
    },
    {
      "id": "A0102",
      "name": "Old Phuket Town",
      "description": "['Our Phuket Old Town and Old Street Walking Guide will save you time and effort! The historical part of Phuket is not huge but is rich and exciting enough to explore in half a day. On this page, we break it down by streets and describe the main points of interest, significant landmarks and, of course, the best places to eat Thai food! It’s easy and fun to explore, even on a rainy day, plus there are plenty of little cafes and restaurants to take a break and enjoy lunch or dinner. Phuket Old Town has always been one of the most popular items on our list of Best Things to Do in Phuket.']",
      "tag": "just make for frontend work",
      "business_hour": {
        "start": 0,
        "end": 96
      },
      "image": "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/31/01/38.jpg"
    },
    {
      "id": "A0243",
      "name": "Nai Thon Beach",
      "description": "['Naithon Beach is one of these little-known beaches on the west coast of Phuket, far from crowded areas such as Patong Beach or Kata Beach. People choose to stay here to find a peaceful village with just enough restaurants and hotels not to feel too remote but still all the necessary facilities you need for a great holiday. Phuket is such a small island; you can always rent a car and drive to Patong for a fun night out or further south for a discovery day.']",
      "tag": "just make for frontend work",
      "business_hour": {
        "start": 0,
        "end": 96
      },
      "image": "https://www.pullmanphuketarcadia.com/wp-content/uploads/sites/65/2020/02/Naithon-Beach-Bliss.jpg"
    },
    {
      "id": "A0217",
      "name": "Sea Canoe",
      "description": "[\\'Sea Canoe (Thailand) is an eco-friendly company. We have operated the most highly awarded sea-kayaking business in southern Thailand for over 26 years and were the first company to create this kind of service for tourists. Our offices are now in Phuket, Krabi and we also offer many adventure tours in other parts of Southern Thailand , Khao Sok , Trang, Tarutao & Beyond. Our company offers you an experienced staff who have been trained to ACA standards. Our professional guides give you the highest standards of safety and service. Sea Canoe is always exploring, and new adventures are created every year. We have recently found a new area to explore in southern Thailand, where caves and \"hongs\" have been reported. If you are interested in joining us on the trip, please contact us.\\']",
      "tag": "just make for frontend work",
      "business_hour": {
        "start": 28,
        "end": 84
      },
      "image": "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/18/05/cf/57/get-the-opportunity-to.jpg"
    },
    {
      "id": "A0846",
      "name": "See Sea Blue Marine",
      "description": "['Before the establishment of See Sea Blue Marine Co., Ltd., one of our executive board members gained a wealth of practical experience in marine and fishery of native common job. Likewise, our executive has realized the efficiency of his crews and joined a great management team, thus the company was definitely established in 2018 under See Sea Blue Marine Co., Ltd. for excursion and Suriyan Marine Co., Ltd. for boat maintenance and human resources. Since 2018, our executive and customer service team have highly emphasized on quality and ambiance of a particular trip. The customer satisfaction during trip is our top priority. Our crews, under the management of Suriyan Marine Co., Ltd., operates company’s 20 in-service boats with high skilled and knowledge trained by the Marine Department regularly as our customer safety is the most important. Our skillful guide team can speak several languages such as English, Chinese and Russian. Training sessions liked safety and first aid are frequently conducted to be prepared and respond to any accident and unexpected circumstance. All of us, crew team, guide team and onsite team, focus on providing our customer with the best service as well as safety of every journey. On behalf of See Sea Blue Marine Co., Ltd. and Suriyan Marine Co., Ltd., our happiness is your smile and your impression of us.']",
      "tag": "just make for frontend work",
      "business_hour": {
        "start": 0,
        "end": 96
      },
      "image": "https://media-cdn.tripadvisor.com/media/photo-s/19/19/7d/96/line-id-seeseablue-marine.jpg"
    },
    {
      "id": "A0148",
      "name": "Phuket FantaSea",
      "description": "['This cultural theme park is divided into three sections: shopping in the Festival village, dining in the Golden Kinnaree Buffet Restaurant and Vegas-style entertainment in the Palace of the Elephants.']",
      "tag": "just make for frontend work",
      "business_hour": {
        "start": 0,
        "end": 96
      },
      "image": "https://www.phuket-fantasea.com/mobile/en/images/pf1.jpg"
    }
  ]);
  const [tabIndex, setTabIndex] = useState(0); // Manage active tab state

  // Toggle the chat bubble
  const toggleChat = () => {
    setIsChatOpen((prev) => !prev);
  };

  const handleSetRecommendAccommodations = (newAccommodations: Accommodation[]) => {
    setRecommendAccommodations((prev) => {
      // Combine the new and previous accommodations
      const combinedList = [...newAccommodations, ...prev];

      // Use a Map to ensure uniqueness by 'id'
      const uniqueById = Array.from(
        new Map(combinedList.map((item) => [item.id, item])).values()
      );

      // Return the first 7 unique elements
      return uniqueById.slice(0, 7);
    });
  };

  const handleSetRecommendActivities = (newActivities: Activity[]) => {
    setRecommendActivities((prev) => {
      // Combine the new and previous activities
      const combinedList = [...newActivities, ...prev];

      // Use a Map to ensure uniqueness by 'id'
      const uniqueById = Array.from(
        new Map(combinedList.map((item) => [item.id, item])).values()
      );

      // Return the first 7 unique elements
      return uniqueById.slice(0, 7);
    });
  };

  const [isFinishedRouteFinding, setIsFinishedRouteFinding] = useState<boolean>(false)
  const [routeData, setRouteData] = useState<RouteData>()
  const handleFinishedRouteFinding = (routeData: RouteData) => {
    setTabIndex(1);
    setIsFinishedRouteFinding(true)
    setRouteData(routeData)
  }

  const handleTabChange = (_: React.SyntheticEvent, newIndex: number) => {
    setTabIndex(newIndex);
  };

  const [startDate, setStartDate] = useState<Date | null>(selectedDates.startDate);
  const [duration, setDuration] = useState<number>(
    selectedDates.startDate && selectedDates.endDate
      ? Math.ceil(
        (selectedDates.endDate.getTime() - selectedDates.startDate.getTime()) /
        (1000 * 60 * 60 * 24) +
        1
      )
      : 1
  );

  useEffect(() => {
    const endDate = calculateEndDate(startDate, duration);
    handleDateChange(startDate || undefined, endDate || undefined);
  }, [startDate, duration, handleDateChange]);

  const calculateEndDate = (startDate: Date | null, duration: number): Date | null => {
    if (!startDate) return null;
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + duration - 1);
    return endDate;
};


  return (
    <Grid container sx={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Suggestions Section */}
      <Grid size={4}>
        <SuggestionsSection
          recommendAccommodations={recommendAccommodations}
          recommendActivities={recommendActivities}
        />
      </Grid>

      {/* Main Content Area */}
      <Grid
        size={8}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          height: '100%',
        }}
      >
        {/* AppBar Section */}
        <AppBar position="sticky" color="primary" sx={{ zIndex: 1201 }}>
                <Toolbar>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                                flexGrow: 1,
                                height: "40px", // Standardize the height
                            }}
                        >
                            {/* Start Date Picker */}
                            <Box sx={{ height: "100%", display: "flex", alignItems: "center" }}>
                                <DatePicker
                                    label="Start Date"
                                    value={startDate}
                                    onChange={(newDate) => setStartDate(newDate)}
                                    minDate={new Date()}
                                    slotProps={{
                                        textField: {
                                            size: "small",
                                            variant: "outlined",
                                            sx: { height: "100%" },
                                        },
                                    }}
                                />
                            </Box>

                            {/* Duration Selector */}
                            <Box sx={{ height: "100%", display: "flex", alignItems: "center" }}>
                                <FormControl
                                    sx={{
                                        minWidth: 120,
                                        height: "100%",
                                    }}
                                >
                                    <InputLabel sx={{ top: "-6px" }}>Duration</InputLabel>
                                    <Select
                                        value={duration}
                                        onChange={(e) => setDuration(Number(e.target.value))}
                                        label="Duration"
                                        sx={{ height: "100%" }}
                                    >
                                        {[1, 2, 3, 4, 5].map((day) => (
                                            <MenuItem key={day} value={day}>
                                                {day} {day === 1 ? "Day" : "Days"}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                        </Box>
                    </LocalizationProvider>
                </Toolbar>
            </AppBar>
        {/* Tabs for Display Schedule and Planning Section */}
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Planning" />
          <Tab label="Display" disabled={!isFinishedRouteFinding}/>
        </Tabs>

        {/* Tab Content */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto', padding: 2 }}>
          {tabIndex === 1 && <DisplaySchedule routeData={routeData} setRouteData={setRouteData}/>}
          {tabIndex === 0 && (
            <PlanningSection
            selectedDates={{
                startDate,
                endDate: calculateEndDate(startDate, duration),
            }}
            handleFinishedRouteFinding={handleFinishedRouteFinding}
        />
          )}
        </Box>

        {/* Chat Bubble Button and Chat Section */}
        <Box sx={{ position: 'absolute', bottom: 16, right: 16, zIndex: 9000 }}>
          {isChatOpen && (
            <Box
              sx={{
                width: 600,
                height: 600,
                boxShadow: 3,
                borderRadius: 2,
                overflow: 'hidden',
                backgroundColor: 'white',
                display: 'flex',
                flexDirection: 'column',
                position: 'absolute',
                bottom: 60,
                right: 0,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 1,
                  backgroundColor: 'primary.main',
                  color: 'white',
                }}
              >
                <Box sx={{ fontWeight: 'bold' }}>Chatbot</Box>
                <IconButton
                  onClick={toggleChat}
                  size="small"
                  sx={{ color: 'white' }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
              <Box
                sx={{
                  flexGrow: 1,
                  overflowY: 'auto',
                }}
              >
                <ChatSection
                  messages={messages}
                  setMessages={setMessages}
                  setRecommendAccommodations={handleSetRecommendAccommodations}
                  setRecommendActivities={handleSetRecommendActivities}
                />
              </Box>
            </Box>
          )}
          <IconButton
            onClick={toggleChat}
            sx={{
              backgroundColor: 'primary.main',
              color: 'white',
              borderRadius: '50%',
              boxShadow: 3,
            }}
          >
            <ChatIcon />
          </IconButton>
        </Box>
      </Grid>
    </Grid>
  );
};

export default PlannerView;
