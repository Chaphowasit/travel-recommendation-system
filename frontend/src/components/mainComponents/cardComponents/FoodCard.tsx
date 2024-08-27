import React from 'react';
import { Card, CardContent, Typography, CardActionArea } from '@mui/material';

interface FoodCardProps {
  food: {
    foodAndDrink_name: string;
    start_time: string;
    end_time: string;
  };
  onClick: () => void;
}

const FoodCard: React.FC<FoodCardProps> = ({ food, onClick }) => {
  return (
    <Card sx={{ margin: 1, minWidth: 200, maxWidth: 200 }}>
      <CardActionArea onClick={onClick}>
        <CardContent>
          <Typography component="div">
            {food.foodAndDrink_name}
          </Typography>
          <Typography color="textSecondary">
            {`Start Time: ${food.start_time}`}
          </Typography>
          <Typography color="textSecondary">
            {`End Time: ${food.end_time}`}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default FoodCard;
