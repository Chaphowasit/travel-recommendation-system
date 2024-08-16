import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

interface HotelCardProps {
    hotel: string;
}

const HotelCard: React.FC<HotelCardProps> = ({ hotel }) => {
    return (
        <Card variant="outlined" sx={{ margin: 1, minWidth: 200, maxWidth: 200 }}>
            <CardContent>
                <Typography component={"div"}>{hotel}</Typography>
            </CardContent>
        </Card>
    );
};

export default HotelCard;
