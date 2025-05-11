// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import socialAuthService from '../services/socialAuth';
import { useNotification } from './NotificationContext';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [socialAuthInProgress, setSocialAuthInProgress] = useState(false);
  const { success, error } = useNotification();

  // Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (token) {
          // Vérifie la validité du token
          const response = await api.get('/accounts/profile/');
          setCurrentUser(response.data);
        }
      } catch (err) {
        console.error('Erreur de vérification du token:', err);
        // Token invalide ou expiré, suppression
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      } finally {
        setLoading(false);
      }
    };

    // Vérifier si nous revenons d'une authentification sociale
    const checkSocialAuth = async () => {
      try {
        setSocialAuthInProgress(true);
        const tokenData = await socialAuthService.checkAuthRedirect();
        
        if (tokenData) {
          // Stocker les tokens
          localStorage.setItem('access_token', tokenData.access);
          localStorage.setItem('refresh_token', tokenData.refresh);
          
          // Récupérer le profil utilisateur
          const userResponse = await api.get('/accounts/profile/');
          setCurrentUser(userResponse.data);
          
          success('Connexion réussie via authentification sociale.');
        }
      } catch (err) {
        console.error('Erreur lors de l\'authentification sociale:', err);
        const errorMessage = 'Une erreur est survenue lors de l\'authentification sociale.';
        setAuthError(errorMessage);
        error(errorMessage);
      } finally {
        setSocialAuthInProgress(false);
        setLoading(false);
      }
    };

    const initialize = async () => {
      setLoading(true);
      
      // D'abord vérifier l'authentification sociale
      try {
        await checkSocialAuth();
      } catch (e) {
        console.error('Erreur lors de la vérification de l\'authentification sociale:', e);
      }
      
      // Ensuite vérifier l'authentification par token si l'utilisateur n'est pas encore connecté
      if (!currentUser) {
        try {
          await checkLoggedIn();
        } catch (e) {
          console.error('Erreur lors de la vérification de l\'authentification par token:', e);
          setLoading(false);
        }
      }
    };

    initialize();
  }, []);

  // Fonction de connexion
  const login = async (email, password, redirectPath) => {
    setAuthError(null);
    try {
      const response = await api.post('/auth/token/', { email, password });
      
      // Stockage des tokens
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      
      // Récupération du profil utilisateur
      const userResponse = await api.get('/accounts/profile/');
      setCurrentUser(userResponse.data);
      
      success('Connexion réussie, bienvenue !');
      return userResponse.data;
    } catch (err) {
      console.error('Erreur de connexion:', err);
      const errorMessage = 
        err.response?.status === 401 
          ? 'Email ou mot de passe incorrect' 
          : err.response?.data?.detail || 'Une erreur est survenue lors de la connexion.';
      
      setAuthError(errorMessage);
      error(errorMessage);
      throw err;
    }
  };

  // Fonction d'inscription
  const register = async (userData) => {
    setAuthError(null);
    try {
      const response = await api.post('/accounts/register/', userData);
      success('Inscription réussie ! Vous pouvez maintenant vous connecter.');
      return response.data;
    } catch (err) {
      console.error('Erreur d\'inscription:', err);
      let errorMessage = 'Une erreur est survenue lors de l\'inscription.';
      
      // Traitement des erreurs spécifiques du backend
      if (err.response?.data) {
        const errors = err.response.data;
        if (errors.email) {
          errorMessage = `Email: ${errors.email[0]}`;
        } else if (errors.phone_number) {
          errorMessage = `Téléphone: ${errors.phone_number[0]}`;
        } else if (errors.password) {
          errorMessage = `Mot de passe: ${errors.password[0]}`;
        } else if (errors.non_field_errors) {
          errorMessage = errors.non_field_errors[0];
        }
      }
      
      setAuthError(errorMessage);
      error(errorMessage);
      throw err;
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setCurrentUser(null);
    success('Vous avez été déconnecté avec succès');
  };

  // Changement de mot de passe
  const changePassword = async (oldPassword, newPassword) => {
    setAuthError(null);
    try {
      await api.post('/accounts/change-password/', {
        old_password: oldPassword,
        new_password: newPassword,
        new_password2: newPassword
      });
      
      success('Mot de passe changé avec succès');
    } catch (err) {
      console.error('Erreur de changement de mot de passe:', err);
      const errorMessage = err.response?.data?.detail || 
                          'Une erreur est survenue lors du changement de mot de passe.';
      
      setAuthError(errorMessage);
      error(errorMessage);
      throw err;
    }
  };

  // Demande de réinitialisation de mot de passe
  const requestPasswordReset = async (email) => {
    setAuthError(null);
    try {
      await api.post('/accounts/password-reset/', { email });
      success('Un email de réinitialisation a été envoyé si l\'adresse est associée à un compte.');
    } catch (err) {
      console.error('Erreur de demande de réinitialisation:', err);
      // Ne pas révéler si l'email existe ou non
      success('Un email de réinitialisation a été envoyé si l\'adresse est associée à un compte.');
    }
  };

  // Confirmer la réinitialisation de mot de passe
  const confirmPasswordReset = async (uid, token, newPassword) => {
    setAuthError(null);
    try {
      await api.post('/accounts/password-reset/confirm/', {
        uid,
        token,
        new_password: newPassword
      });
      
      success('Votre mot de passe a été réinitialisé avec succès');
    } catch (err) {
      console.error('Erreur de réinitialisation de mot de passe:', err);
      const errorMessage = err.response?.data?.detail || 
                          'Une erreur est survenue lors de la réinitialisation du mot de passe.';
      
      setAuthError(errorMessage);
      error(errorMessage);
      throw err;
    }
  };

  // Mise à jour du profil
  const updateProfile = async (profileData) => {
    setAuthError(null);
    try {
      const response = await api.put('/accounts/profile/', profileData);
      setCurrentUser(response.data);
      success('Profil mis à jour avec succès');
      return response.data;
    } catch (err) {
      console.error('Erreur de mise à jour du profil:', err);
      const errorMessage = err.response?.data?.detail || 
                          'Une erreur est survenue lors de la mise à jour du profil.';
      
      setAuthError(errorMessage);
      error(errorMessage);
      throw err;
    }
  };

  // Vérification d'identité
  const verifyIdentity = async (verificationData) => {
    setAuthError(null);
    try {
      await api.post('/accounts/verify-identity/', verificationData);
      success('Votre demande de vérification a été soumise avec succès');
      
      // Mise à jour du profil pour refléter le statut "en attente de vérification"
      const userResponse = await api.get('/accounts/profile/');
      setCurrentUser(userResponse.data);
      
      return true;
    } catch (err) {
      console.error('Erreur de vérification d\'identité:', err);
      const errorMessage = err.response?.data?.detail || 
                          'Une erreur est survenue lors de la soumission de votre vérification d\'identité.';
      
      setAuthError(errorMessage);
      error(errorMessage);
      throw err;
    }
  };

  // Authentification avec Google
  const loginWithGoogle = () => {
    try {
      socialAuthService.initiateGoogleAuth();
    } catch (err) {
      console.error('Erreur lors de l\'initialisation de l\'authentification Google:', err);
      const errorMessage = 'Une erreur est survenue lors de la tentative de connexion avec Google.';
      setAuthError(errorMessage);
      error(errorMessage);
    }
  };

  // Authentification avec Facebook
  const loginWithFacebook = () => {
    try {
      socialAuthService.initiateFacebookAuth();
    } catch (err) {
      console.error('Erreur lors de l\'initialisation de l\'authentification Facebook:', err);
      const errorMessage = 'Une erreur est survenue lors de la tentative de connexion avec Facebook.';
      setAuthError(errorMessage);
      error(errorMessage);
    }
  };

  // Liaison de compte social
  const linkSocialAccount = async (provider, credentials) => {
    setAuthError(null);
    try {
      const response = await socialAuthService.linkAccount(provider, credentials);
      success(`Votre compte ${provider} a été lié avec succès`);
      return response;
    } catch (err) {
      console.error(`Erreur lors de la liaison avec ${provider}:`, err);
      const errorMessage = err.response?.data?.detail || 
                         `Une erreur est survenue lors de la liaison avec votre compte ${provider}.`;
      
      setAuthError(errorMessage);
      error(errorMessage);
      throw err;
    }
  };

  // Dissociation de compte social
  const unlinkSocialAccount = async (provider) => {
    setAuthError(null);
    try {
      await socialAuthService.unlinkAccount(provider);
      success(`Votre compte ${provider} a été dissocié avec succès`);
    } catch (err) {
      console.error(`Erreur lors de la dissociation du compte ${provider}:`, err);
      const errorMessage = err.response?.data?.detail || 
                         `Une erreur est survenue lors de la dissociation de votre compte ${provider}.`;
      
      setAuthError(errorMessage);
      error(errorMessage);
      throw err;
    }
  };

  // Récupération des comptes sociaux liés
  const getLinkedSocialAccounts = async () => {
    try {
      return await socialAuthService.getLinkedAccounts();
    } catch (err) {
      console.error('Erreur lors de la récupération des comptes sociaux liés:', err);
      return [];
    }
  };

  // Vérifier si l'utilisateur est un propriétaire
  const isOwner = () => {
    return currentUser?.user_type === 'owner';
  };

  // Vérifier si l'utilisateur est un locataire
  const isTenant = () => {
    return currentUser?.user_type === 'tenant';
  };

  // Vérifier si l'utilisateur est vérifié
  const isVerified = () => {
    return !!currentUser?.is_verified;
  };

  const isVerificationPending = () => {
    return currentUser?.profile?.verification_status === 'pending';
  };
  

  // Valeur du contexte
  const value = {
    currentUser,
    loading,
    authError,
    socialAuthInProgress,
    login,
    register,
    logout,
    changePassword,
    requestPasswordReset,
    confirmPasswordReset,
    updateProfile,
    verifyIdentity,
    loginWithGoogle,
    loginWithFacebook,
    linkSocialAccount,
    unlinkSocialAccount,
    getLinkedSocialAccounts,
    isOwner,
    isTenant,
    isVerified,
    isVerificationPending,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : null}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  return useContext(AuthContext);
};