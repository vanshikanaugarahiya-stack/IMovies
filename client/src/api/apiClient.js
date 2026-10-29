import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT token from localStorage into outgoing requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('imovies_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle authentication expiration cleanly
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear invalid token if session has expired
      const currentToken = localStorage.getItem('imovies_token');
      if (currentToken) {
        localStorage.removeItem('imovies_token');
        localStorage.removeItem('imovies_user');
      }
    }
    return Promise.reject(error);
  }
);

// --- API Helpers ---

// Movies
export const fetchMovies = async (params = {}) => {
  const response = await apiClient.get('/movies', { params });
  return response.data;
};

export const fetchFeaturedMovies = async () => {
  const response = await apiClient.get('/movies/featured');
  return response.data;
};

export const fetchMovieById = async (id) => {
  const response = await apiClient.get(`/movies/${id}`);
  return response.data;
};

// Auth
export const loginApi = async (credentials) => {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data;
};

export const registerApi = async (userData) => {
  const response = await apiClient.post('/auth/register', userData);
  return response.data;
};

export const getMeApi = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

// Bookings
export const fetchOccupiedSeats = async (movieId, showDate, showtime) => {
  const response = await apiClient.get('/bookings/occupied-seats', {
    params: { movieId, showDate, showtime },
  });
  return response.data;
};

export const createBookingApi = async (bookingData) => {
  const response = await apiClient.post('/bookings', bookingData);
  return response.data;
};

export const fetchMyBookings = async () => {
  const response = await apiClient.get('/bookings/my-bookings');
  return response.data;
};

// Admin Movie Management
export const createMovieApi = async (movieData) => {
  const response = await apiClient.post('/movies', movieData);
  return response.data;
};

export const updateMovieApi = async (id, movieData) => {
  const response = await apiClient.put(`/movies/${id}`, movieData);
  return response.data;
};

export const deleteMovieApi = async (id) => {
  const response = await apiClient.delete(`/movies/${id}`);
  return response.data;
};

// Admin Bookings & Analytics
export const fetchAllBookingsApi = async () => {
  const response = await apiClient.get('/bookings/all');
  return response.data;
};

export default apiClient;
