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
    axiosInstance.post('/sendIntervals', {intervals: intervals, desired_places: {breakfast: [4, 2, 16], travel1: [], lunch: [3, 4], travel2: [], dinner: [16, 2]}})

export const getRestaurant = () => 
    axiosInstance.get('/getRestaurant')