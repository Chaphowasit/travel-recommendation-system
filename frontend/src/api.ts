import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000'

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

export const sendMessage = (text: string) =>
    axiosInstance.post('/sendMessage', { "message": text })

export const sendIntervals = (intervals: {
    breakfast?: {start: number, end: number},
    travel1?: {start: number, end: number},
    lunch?: {start: number, end: number},
    travel2?: {start: number, end: number},
    dinner?: {start: number, end: number},
}) =>
    axiosInstance.post('/vrp/process', {
        "accommodation_id": "H0001",
        "intervals": {
          "breakfast": {"start": 6.0, "end": 7.5},
          "travel1": {"start": 7.5, "end": 12.5},
          "lunch": {"start": 12.5, "end": 14},
          "travel2": {"start": 14.0, "end": 16.5},
          "dinner":{"start": 16.5, "end": 18.0}
        },
        "desired_places": {
          "breakfast": ["F0001", "F0002", "F0003", "F0005"],
          "travel1": ["A0001", "A0002", "A0003", "A0005"],
          "lunch": ["F0001", "F0003", "F0004", "F0005"],
          "travel2": ["A0001", "A0002", "A0003", "A0004"],
          "dinner": ["F0001", "F0002", "F0004", "F0005"]
        }
      })

export const getRestaurant = () => 
    axiosInstance.get('/getRestaurant')