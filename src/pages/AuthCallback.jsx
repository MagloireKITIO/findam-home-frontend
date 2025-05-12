// src/pages/AuthCallback.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import Lottie from 'react-lottie';
import loadingAnimation from '../assets/animations/loading-animation.json'; // Animation JSON

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, isNewSocialUser, socialAuthInProgress } = useAuth();
  const { success, error: notifyError } = useNotification();
  const [isProcessing, setIsProcessing] = useState(true);
  const [authStatus, setAuthStatus] = useState('loading');
  const [message, setMessage] = useState("Authentification en cours...");

  // Configuration de l'animation Lottie
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: loadingAnimation,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  useEffect(() => {
    console.log("AuthCallback - Début du traitement");
    console.log("AuthCallback - État actuel:", {
      currentUser: !!currentUser,
      isNewSocialUser: isNewSocialUser(),
      socialAuthInProgress,
      locationSearch: location.search
    });

    // Vérifier d'abord si les paramètres sont dans l'URL (cas normal)
    const params = new URLSearchParams(location.search);
    const provider = params.get('provider');
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const authError = params.get('error');
    const isNewUser = params.get('is_new') === 'true';

    console.log("AuthCallback - Paramètres URL:", {
      provider,
      accessTokenExists: !!accessToken,
      refreshTokenExists: !!refreshToken,
      authError,
      isNewUser
    });

    // Si nous avons une erreur dans l'URL
    if (authError) {
      console.log("AuthCallback - Erreur détectée dans l'URL:", authError);
      setAuthStatus('error');
      setMessage(`Erreur d'authentification: ${authError}`);
      notifyError(`Erreur d'authentification: ${authError}`);
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      return;
    }

    // Si nous avons tous les paramètres nécessaires dans l'URL
    if (provider && accessToken && refreshToken) {
      console.log("AuthCallback - Traitement des paramètres URL");
      handleUrlParams(provider, accessToken, refreshToken, isNewUser);
      return;
    }

    // Si nous n'avons pas de paramètres dans l'URL, mais que l'authentification sociale est en cours
    // ou que nous avons un utilisateur connecté, c'est que le traitement a déjà été fait
    if (socialAuthInProgress || currentUser || localStorage.getItem('access_token')) {
      console.log("AuthCallback - Authentification déjà traitée, gestion de la redirection");
      handleAlreadyAuthenticatedUser();
      return;
    }

    // Sinon, c'est une erreur - nous n'avons pas les paramètres nécessaires
    console.log("AuthCallback - Aucun paramètre d'authentification trouvé");
    setAuthStatus('error');
    setMessage("Paramètres d'authentification manquants");
    notifyError("Paramètres d'authentification manquants");
    
    setTimeout(() => {
      navigate('/login');
    }, 3000);
  }, []);

  const handleUrlParams = (provider, accessToken, refreshToken, isNewUser) => {
    console.log("AuthCallback - Gestion des paramètres URL");
    
    // Stocker les tokens
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    
    if (isNewUser) {
      localStorage.setItem('is_new_social_user', 'true');
    }

    setAuthStatus('success');
    setMessage(`Authentification réussie via ${provider === 'google' ? 'Google' : 'Facebook'}`);
    success(`Authentification réussie via ${provider === 'google' ? 'Google' : 'Facebook'}`);
    
    redirectUser(isNewUser);
  };

  const handleAlreadyAuthenticatedUser = () => {
    console.log("AuthCallback - Gestion de l'utilisateur déjà authentifié");
    
    // Vérifier si c'est un nouvel utilisateur social
    const isNewUser = isNewSocialUser();
    
    setAuthStatus('success');
    setMessage('Authentification réussie');
    success('Authentification réussie via authentification sociale.');
    
    redirectUser(isNewUser);
  };

  const redirectUser = (isNewUser) => {
    console.log("AuthCallback - Redirection de l'utilisateur, isNewUser:", isNewUser);
    
    let redirectPath = '/';
    
    if (isNewUser) {
      // Pour les nouveaux utilisateurs, rediriger vers la page de complétion de profil
      redirectPath = '/auth/complete-profile';
      console.log("AuthCallback - Redirection vers complétion de profil");
    } else {
      // Pour les utilisateurs existants, rediriger vers la page principale ou précédente
      const previousPath = localStorage.getItem('auth_redirect_from');
      if (previousPath && previousPath !== '/login' && previousPath !== '/register') {
        redirectPath = previousPath;
      } else {
        redirectPath = '/';
      }
      console.log("AuthCallback - Redirection vers:", redirectPath);
      localStorage.removeItem('auth_redirect_from');
    }
    
    // Attendre un peu pour l'animation, puis rediriger
    setTimeout(() => {
      navigate(redirectPath, { replace: true });
    }, 1500);
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-32 h-32 mx-auto">
              <Lottie options={defaultOptions} />
            </div>
            
            <h2 className={`text-2xl font-bold mt-4 ${
              authStatus === 'error' ? 'text-red-600' : 
              authStatus === 'success' ? 'text-green-600' : 
              'text-primary-600'
            }`}>
              {authStatus === 'error' ? 'Erreur d\'authentification' : 
               authStatus === 'success' ? 'Authentification réussie!' : 
               'Authentification en cours...'}
            </h2>
            
            <p className="mt-2 text-gray-600">
              {message}
            </p>
            
            {authStatus === 'error' && (
              <p className="mt-4 text-sm text-gray-500">
                Vous allez être redirigé vers la page de connexion...
              </p>
            )}
            
            {authStatus === 'success' && (
              <p className="mt-4 text-sm text-gray-500">
                Vous allez être redirigé automatiquement...
              </p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AuthCallback;