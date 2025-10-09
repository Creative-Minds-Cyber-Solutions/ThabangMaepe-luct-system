// src/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'https://thabangmaepe-luct-system-1.onrender.com/api',
    timeout: 10000, // 10 second timeout
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor - automatically attach JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor - handle common errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized - token expired or invalid
        if (error.response?.status === 401) {
            // Clear local storage and redirect to login
            localStorage.clear();
            if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
                window.location.href = '/login';
            }
        }

        // Handle 403 Forbidden - insufficient permissions
        if (error.response?.status === 403) {
            console.error('Access forbidden:', error.response.data.message);
        }

        // Handle network errors
        if (!error.response) {
            console.error('Network error - server may be down');
        }

        return Promise.reject(error);
    }
);

export default api;