// src/services/socialAuth.js
import api from './api';

/**
 * Service pour gérer l'authentification sociale
 * Fournit des méthodes pour l'authentification avec Google, Facebook, etc.
 */
class SocialAuthService {
  /**
   * Initialise le processus d'authentification Google
   * Redirige vers la page d'authentification Google
   */
  initiateGoogleAuth() {
    console.log("Initiation de l'authentification Google");
    // Stocker l'URL actuelle pour y revenir après authentification (si nécessaire)
    localStorage.setItem('auth_redirect_from', window.location.pathname);
    
    // En production, cette URL serait récupérée depuis l'API backend
    const googleAuthUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1'}/auth/google/`;
    
    console.log("Redirection vers:", googleAuthUrl);
    // Rediriger vers l'URL d'authentification Google
    window.location.href = googleAuthUrl;
  }

  /**
   * Initialise le processus d'authentification Facebook
   * Redirige vers la page d'authentification Facebook
   */
  initiateFacebookAuth() {
    // Stocker l'URL actuelle pour y revenir après authentification (si nécessaire)
    localStorage.setItem('auth_redirect_from', window.location.pathname);
    
    // En production, cette URL serait récupérée depuis l'API backend
    const facebookAuthUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1'}/auth/facebook/`;
    
    // Rediriger vers l'URL d'authentification Facebook
    window.location.href = facebookAuthUrl;
  }

  /**
   * Échange un code d'autorisation contre un token d'accès
   * @param {string} provider - Le provider d'authentification (google, facebook)
   * @param {string} code - Le code d'autorisation reçu
   * @param {string} state - Paramètre state pour la vérification CSRF
   * @returns {Promise<Object>} - Promesse résolue avec les tokens JWT
   */
  async exchangeAuthCode(provider, code, state) {
    try {
      const response = await api.post(`/auth/${provider}/callback/`, {
        code,
        state
      });
      
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de l'échange du code ${provider}:`, error);
      throw error;
    }
  }

  /**
   * Vérifie si l'URL actuelle contient des paramètres de redirection d'authentification sociale
   * et traite l'authentification si nécessaire
   * @returns {Promise<Object|null>} - Promesse résolue avec les tokens et les infos ou null si pas de paramètres
   */
  async checkAuthRedirect() {
    console.log("checkAuthRedirect - Vérification des paramètres de redirection");
    
    const urlParams = new URLSearchParams(window.location.search);
    const provider = urlParams.get('provider');
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');
    const isNewUser = urlParams.get('is_new') === 'true';
    const error = urlParams.get('error');
    
    console.log("checkAuthRedirect - Paramètres extraits:", { 
      provider, 
      accessTokenExists: !!accessToken,
      refreshTokenExists: !!refreshToken,
      isNewUser,
      error
    });
    
    // Vérifier s'il y a une erreur
    if (error) {
      console.error("checkAuthRedirect - Erreur d'authentification:", error);
      throw new Error(`Erreur d'authentification: ${error}`);
    }
    
    // Vérifier si nous avons un provider et des tokens
    if (provider && accessToken && refreshToken) {
      try {
        console.log("checkAuthRedirect - Paramètres d'authentification valides");
        
        // Nettoyer l'URL (supprimer les paramètres d'authentification)
        const url = new URL(window.location.href);
        url.search = '';
        window.history.replaceState({}, document.title, url.toString());
        
        console.log("checkAuthRedirect - URL nettoyée, retour des informations d'authentification");
        
        // Retourner les informations d'authentification
        return {
          access: accessToken,
          refresh: refreshToken,
          provider,
          isNewUser
        };
      } catch (error) {
        console.error('Erreur lors du traitement de la redirection d\'authentification:', error);
        throw error;
      }
    } else {
      console.log("checkAuthRedirect - Aucun paramètre d'authentification trouvé");
    }
    
    return null;
  }

  /**
   * Connecte l'utilisateur avec les identifiants d'un provider externe (sans redirection OAuth)
   * @param {string} provider - Le provider d'authentification (google, facebook)
   * @param {Object} credentials - Les identifiants (token) du provider
   * @returns {Promise<Object>} - Promesse résolue avec les tokens JWT
   */
  async loginWithProvider(provider, credentials) {
    try {
      const response = await api.post(`/auth/${provider}/connect/`, credentials);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la connexion avec ${provider}:`, error);
      throw error;
    }
  }

  /**
   * Associe un compte social à un compte utilisateur existant
   * @param {string} provider - Le provider d'authentification (google, facebook)
   * @param {Object} credentials - Les identifiants (token) du provider
   * @returns {Promise<Object>} - Promesse résolue avec le résultat
   */
  async linkAccount(provider, credentials) {
    try {
      const response = await api.post(`/auth/${provider}/link/`, credentials);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la liaison du compte ${provider}:`, error);
      throw error;
    }
  }

  /**
   * Déconnecte un compte social d'un compte utilisateur
   * @param {string} provider - Le provider d'authentification (google, facebook)
   * @returns {Promise<Object>} - Promesse résolue avec le résultat
   */
  async unlinkAccount(provider) {
    try {
      const response = await api.post(`/auth/${provider}/unlink/`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la déconnexion du compte ${provider}:`, error);
      throw error;
    }
  }

  /**
   * Récupère la liste des comptes sociaux liés à l'utilisateur
   * @returns {Promise<Array>} - Promesse résolue avec la liste des comptes
   */
  async getLinkedAccounts() {
    try {
      const response = await api.get('/auth/accounts/');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des comptes liés:', error);
      throw error;
    }
  }
}

// Exporter une instance unique
export default new SocialAuthService();