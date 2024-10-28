import axios from 'axios';

const requestForm = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 10000,
    headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'multipart/form-data',  
    },
});
requestForm.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => Promise.reject(error));

requestForm.interceptors.response.use(
    response => response.data,
    error => {
        console.log(error.response);
        if (error.response?.status === 401) {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
requestForm.get('/test-endpoint') // Replace with a valid endpoint
    .then(response => console.log("Response data:", response))
    .catch(error => console.error("Request error:", error));

export default requestForm;
