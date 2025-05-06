// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { useNotification } from './NotificationContext';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
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

    checkLoggedIn();
  }, []);

  // Fonction de connexion
  const login = async (email, password) => {
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
    login,
    register,
    logout,
    changePassword,
    updateProfile,
    verifyIdentity,
    isOwner,
    isTenant,
    isVerified,
    isVerificationPending,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  return useContext(AuthContext);
};