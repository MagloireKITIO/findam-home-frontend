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
        
        // Mise à jour du token dans le localStorage
        localStorage.setItem('access_token', response.data.access);
        
        // Mise à jour du header et réessai de la requête
        originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
        return api(originalRequest);
      } catch (err) {
        // En cas d'échec du rafraîchissement, déconnexion
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    
    // Gestion des erreurs 429 (Too Many Requests)
    if (error.response?.status === 429) {
      // Si la requête n'a pas encore été retentée trop de fois
      if (!originalRequest._retryCount || originalRequest._retryCount < 3) {
        // Initialiser ou incrémenter le compteur de tentatives
        originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
        
        // Attendre un délai exponentiel avant de réessayer
        const delay = Math.pow(2, originalRequest._retryCount) * 1000;
        console.log(`Limite de requêtes atteinte, nouvelle tentative dans ${delay/1000} secondes...`);
        
        return new Promise(resolve => {
          setTimeout(() => {
            console.log(`Nouvelle tentative ${originalRequest._retryCount}...`);
            resolve(api(originalRequest));
          }, delay);
        });
      }
    }
    
    // Si c'est une erreur de timeout ou de réseau, tenter de réessayer
    if (error.code === 'ECONNABORTED' || !error.response) {
      if (!originalRequest._networkRetry) {
        originalRequest._networkRetry = true;
        console.log('Problème de connexion, nouvelle tentative...');
        return api(originalRequest);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;