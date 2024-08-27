import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Typography } from '@mui/material';

interface FoodDialogProps {
  food: any;
  onClose: () => void;
}

const FoodDialog: React.FC<FoodDialogProps> = ({ food, onClose }) => {
  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{food.foodAndDrink_name}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          <Typography variant="body1" component="div" paragraph>
            {food.about_and_tags.join(' ')}
          </Typography>
          <Typography variant="body2" component="div" paragraph>
            {`Latitude: ${food.latitude}`}
          </Typography>
          <Typography variant="body2" component="div" paragraph>
            {`Longitude: ${food.longitude}`}
          </Typography>
          <Typography variant="h6" component="div" gutterBottom>
            Reviews
          </Typography>
          {food.reviews.map((review: string, index: number) => (
            <Typography key={index} variant="body2" component="div" paragraph>
              {review}
            </Typography>
          ))}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default FoodDialog;
