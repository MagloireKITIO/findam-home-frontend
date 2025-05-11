// src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

// Création de l'instance Axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT aux requêtes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Supprimer le Content-Type pour FormData (il sera automatiquement défini)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error); 
  }
);

// Intercepteur pour gérer les erreurs et le rafraîchissement des tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Si aucune configuration de requête n'est disponible, rejeter immédiatement
    if (!originalRequest) {
      return Promise.reject(error);
    }
    
    // Si l'erreur est 401 (Unauthorized) et que nous n'avons pas déjà essayé de rafraîchir le token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Tentative de rafraîchissement du token
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          // Si pas de refresh token, déconnexion
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
          return Promise.reject(error);
        }
        
        const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
          refresh: refreshToken
        });
        
        // Vérifier si la réponse est valide
        if (!response.data || !response.data.access) {
          throw new Error('Réponse de refresh token invalide');
        }
        
        // Mise à jour du token dans le localStorage
        localStorage.setItem('access_token', response.data.access);
        
        // Mise à jour du header et réessai de la requête
        originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
        return api(originalRequest);
      } catch (err) {
        console.error('Erreur lors du rafraîchissement du token:', err);
        // En cas d'échec du rafraîchissement, déconnexion propre
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        // Rediriger vers login mais ne bouclez pas si déjà sur la page login
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;