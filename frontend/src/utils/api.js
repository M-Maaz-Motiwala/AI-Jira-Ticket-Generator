import axios from 'axios';

const API = axios.create({
  // This must match the address of your running Flask backend
  baseURL: 'http://localhost:5000/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

export default API;