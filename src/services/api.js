
import axios from 'axios';

localStorage.removeItem('token');
localStorage.removeItem('roles'); 


// Axios instance
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('token');
      window.location.href = '/'; 
    }
    return Promise.reject(error);
  }
);

export default api;
