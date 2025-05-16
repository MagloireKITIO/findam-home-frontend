// src/components/common/PrivateRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import VerificationPendingPage from '../../pages/VerificationPendingPage';

/**
 * Composant pour protéger les routes privées
 * Redirige vers la page de connexion si l'utilisateur n'est pas authentifié
 * Vérifie les rôles selon les routes
 */
const PrivateRoute = ({ 
  children, 
  requireVerified = false, 
  allowedRoles = null,
  ownerOnly = false,
  tenantOnly = false 
}) => {
  const { currentUser, loading, isVerified, isVerificationPending, isOwner, isTenant } = useAuth();
  const location = useLocation();

  // Afficher un spinner pendant le chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Rediriger vers login si pas connecté
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Vérification des rôles
  if (ownerOnly && !isOwner()) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (tenantOnly && !isTenant()) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Vérification avec allowedRoles
  if (allowedRoles && !allowedRoles.includes(currentUser.user_type) && !currentUser.is_staff) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Vérification spéciale pour les routes owner dans l'URL
  if (location.pathname.startsWith('/owner/') && !isOwner() && !currentUser.is_staff) {
    return <Navigate to="/unauthorized" replace />;
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