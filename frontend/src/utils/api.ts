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

export const generateRoute = (intervals: any) =>
    axiosInstance.post('/vrp/generate-route', {intervals})

export const fetchMariaDB = (uniquePlaceIds: any) =>
    axiosInstance.get('/fetch-mariadb', {
        params: { place_ids: uniquePlaceIds.join(',') },
    })