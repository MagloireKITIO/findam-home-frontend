// src/pages/AuthCallback.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import Lottie from 'react-lottie';
import loadingAnimation from '../assets/animations/loading-animation.json'; // Placez un fichier d'animation JSON ici

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
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
    // Cette page ne devrait être accessible que depuis une redirection OAuth
    const params = new URLSearchParams(location.search);
    const provider = params.get('provider');
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const authError = params.get('error');

    if (authError) {
      setAuthStatus('error');
      setMessage(`Erreur d'authentification: ${authError}`);
      notifyError(`Erreur d'authentification: ${authError}`);
      
      // Rediriger vers la page de connexion après un délai
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      return;
    }

    if (!provider || !accessToken || !refreshToken) {
      setIsProcessing(false);
      setAuthStatus('error');
      setMessage("Paramètres d'authentification manquants");
      notifyError("Paramètres d'authentification manquants");
      
      // Rediriger vers la page de connexion après un délai
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      return;
    }

    // Stocker les tokens dans le localStorage
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);

    // Rediriger vers la page d'accueil ou la page précédente
    setAuthStatus('success');
    setMessage(`Authentification réussie via ${provider === 'google' ? 'Google' : 'Facebook'}`);
    success(`Authentification réussie via ${provider === 'google' ? 'Google' : 'Facebook'}`);
    
    // Si c'est une première connexion, rediriger vers la page de bienvenue
    // sinon vers la page d'accueil
    const redirectPath = localStorage.getItem('auth_redirect') || '/welcome';
    localStorage.removeItem('auth_redirect'); // Nettoyer après utilisation
    
    // Donner un peu de temps pour voir l'animation de succès
    setTimeout(() => {
      navigate(redirectPath);
    }, 1500);
  }, [navigate, location.search, notifyError, success]);

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