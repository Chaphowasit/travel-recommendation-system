import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

interface AttractionCardProps {
    attraction: string;
}

const AttractionCard: React.FC<AttractionCardProps> = ({ attraction }) => {
    return (
        <Card variant="outlined" sx={{ margin: 1, minWidth: 200, maxWidth: 200 }}>
            <CardContent>
                <Typography component={"div"}>{attraction}</Typography>
            </CardContent>
        </Card>
    );
};

export default AttractionCard;
