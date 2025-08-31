import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        const { access_token } = refreshResponse.data;
        localStorage.setItem('access_token', access_token);
        
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export const notesService = {
  // Get all notes for the logged-in user
  getAllNotes: async () => {
    const response = await api.get('/notes/');
    return response.data;
  },

  // Get a single note by ID
  getNoteById: async (id) => {
    const response = await api.get(`/notes/${id}`);
    return response.data;
  },

  // Create a new note
  createNote: async (noteData) => {
    const response = await api.post('/notes/', noteData);
    return response.data;
  },

  // Update an existing note
  updateNote: async (id, noteData) => {
    const response = await api.put(`/notes/${id}`, noteData);
    return response.data;
  },

  // Delete a note
  deleteNote: async (id) => {
    const response = await api.delete(`/notes/${id}`);
    return response.data;
  },

  // Search notes by tags
  searchNotesByTags: async (tags) => {
    const response = await api.get('/notes/', {
      params: { tags: tags.join(',') }
    });
    return response.data;
  },

  // Search notes by title/content
  searchNotes: async (query) => {
    const response = await api.get('/notes/', {
      params: { search: query }
    });
    return response.data;
  }
};

export default notesService;