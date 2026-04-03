import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api', // Your Spring Boot Port
    headers: {
        'Content-Type': 'application/json',
    },
});

// Automatically add the JWT token to every request if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;