import React, { useRef, useState } from 'react';
import { Box, Divider, Typography } from '@mui/material';
import FoodCard from './cardComponents/FoodCard';
import AttractionCard from './cardComponents/AttractionCard';
import HotelCard from './cardComponents/HotelCard';
import FoodDialog from './cardComponents/FoodDialog';

interface SuggestionProps {
    foodAndDrinks: { foodAndDrink_name: string }[];
    attractions: string[];
    hotels: string[];
}

const Suggestion: React.FC<SuggestionProps> = ({
    foodAndDrinks,
    attractions,
    hotels,
}) => {
    const [selectedFood, setSelectedFood] = useState<any>(null);
    const foodScrollRef = useRef<HTMLDivElement>(null);
    const attractionScrollRef = useRef<HTMLDivElement>(null);
    const hotelScrollRef = useRef<HTMLDivElement>(null);

    // Handle click on a food card
    const handleCardClick = (food: any) => {
        setSelectedFood(food);
    };

    // Close food dialog
    const handleClose = () => {
        setSelectedFood(null);
    };

    const scrollbarStyles = {
        scrollbarWidth: 'thin', // Firefox
        scrollbarColor: '#ccc #f0f0f0', // Firefox
        '&::-webkit-scrollbar': {
            width: '6px', // Width of the scrollbar
        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#ccc', // Color of the scrollbar thumb
            borderRadius: '4px', // Round the corners of the scrollbar thumb
        },
        '&::-webkit-scrollbar-track': {
            backgroundColor: '#f0f0f0', // Background of the scrollbar track
        },
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: 2, justifyContent: 'space-between' }}>
            {/* Food and drink section */}
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '30%', position: 'relative', marginBottom: 2 }}>
                <Typography variant="h5" gutterBottom>Food and Drink</Typography>
                {/* Scrollable food and drink cards */}
                <Box ref={foodScrollRef} sx={{ display: 'flex', overflowX: 'auto', scrollBehavior: 'smooth', padding: 1, ...scrollbarStyles }}>
                    {foodAndDrinks.map((food, index) => (
                        <FoodCard key={index} food={food} onClick={() => handleCardClick(food)} />
                    ))}
                </Box>
            </Box>
            <Divider />
            {/* Attractions section */}
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '30%', position: 'relative', marginBottom: 2 }}>
                <Typography variant="h5" gutterBottom>Attractions</Typography>
                {/* Scrollable attraction cards */}
                <Box ref={attractionScrollRef} sx={{ display: 'flex', overflowX: 'auto', scrollBehavior: 'smooth', padding: 1, ...scrollbarStyles }}>
                    {attractions.map((attraction, index) => (
                        <AttractionCard key={index} attraction={attraction} />
                    ))}
                </Box>
            </Box>
            <Divider />
            {/* Hotels section */}
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '30%', position: 'relative' }}>
                <Typography variant="h5" gutterBottom>Hotels</Typography>
                {/* Scrollable hotel cards */}
                <Box ref={hotelScrollRef} sx={{ display: 'flex', overflowX: 'auto', scrollBehavior: 'smooth', padding: 1, ...scrollbarStyles }}>
                    {hotels.map((hotel, index) => (
                        <HotelCard key={index} hotel={hotel} />
                    ))}
                </Box>
            </Box>
            {/* Food dialog */}
            {selectedFood && <FoodDialog food={selectedFood} onClose={handleClose} />}
        </Box>
    );
};

export default Suggestion;
