// src/components/common/PrivateRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

/**
 * Composant pour protéger les routes privées
 * Redirige vers la page de connexion si l'utilisateur n'est pas authentifié
 */
const PrivateRoute = ({ children, requireVerified = false }) => {
  const { currentUser, loading, isVerified } = useAuth();
  const location = useLocation();

  // Afficher un spinner pendant le chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Rediriger vers la page de connexion si non connecté
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si la route nécessite une vérification d'identité
  if (requireVerified && !isVerified()) {
    return <Navigate to="/profile/verify" state={{ from: location }} replace />;
  }

  // Tout est ok, afficher le contenu protégé
  return children;
};

export default PrivateRoute;