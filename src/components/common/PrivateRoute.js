// src/components/common/PrivateRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import VerificationPendingPage from '../../pages/VerificationPendingPage';

/**
 * Composant pour protéger les routes privées
 * Redirige vers la page de connexion si l'utilisateur n'est pas authentifié
 */
const PrivateRoute = ({ children, requireVerified = false }) => {
  const { currentUser, loading, isVerified, isVerificationPending } = useAuth();
  const location = useLocation();

  // Afficher un spinner pendant le chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Si la route nécessite une vérification d'identité
  if (requireVerified) {
    if (!isVerified()) {
      // Afficher une page d'attente si la vérification est en cours
      if (isVerificationPending()) {
        return <VerificationPendingPage />;
      }
      // Sinon, rediriger vers la page de vérification
      return <Navigate to="/profile/verify" state={{ from: location }} replace />;
    }
  }

  return children;
};

export default PrivateRoute;