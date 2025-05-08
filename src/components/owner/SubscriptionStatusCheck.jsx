// src/components/owner/SubscriptionStatusCheck.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiClock, FiAlertTriangle } from 'react-icons/fi';
import Button from '../common/Button';
import api from '../../services/api';

/**
 * Composant pour vérifier et afficher le statut d'abonnement d'un propriétaire
 * Ce composant est utilisé dans le tableau de bord propriétaire pour remplacer
 * la bannière d'activation d'abonnement lorsqu'un abonnement est actif
 */
const SubscriptionStatusCheck = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setLoading(true);
        const response = await api.get('/accounts/subscriptions/active/');
        setSubscription(response.data);
      } catch (err) {
        // Si l'erreur est 404, cela signifie qu'il n'y a pas d'abonnement actif
        if (err.response && err.response.status === 404) {
          setSubscription(null);
        } else {
          console.error('Erreur lors de la récupération de l\'abonnement:', err);
          setError('Une erreur est survenue lors de la récupération de votre abonnement.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  // Formatage de la date pour l'affichage
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Calcul des jours restants
  const getDaysRemaining = (endDate) => {
    if (!endDate) return 0;
    
    const end = new Date(endDate);
    const now = new Date();
    
    const diff = end - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    return Math.max(0, days);
  };

  // Si chargement en cours
  if (loading) {
    return null; // Ne rien afficher pendant le chargement
  }

  // Si erreur
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  // Si aucun abonnement actif
  if (!subscription) {
    return (
      <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 p-6 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">
              Activez votre abonnement propriétaire
            </h2>
            <p className="text-yellow-700 mb-4 md:mb-0">
              Pour publier des logements et recevoir des réservations, veuillez souscrire à un abonnement.
            </p>
          </div>
          <Link to="/owner/subscription">
            <Button variant="primary">
              Voir les abonnements
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Si abonnement en attente de paiement
  if (subscription.status === 'pending') {
    return (
      <div className="bg-gradient-to-r from-orange-100 to-orange-200 p-6 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="bg-orange-500 rounded-full p-2 mr-4">
              <FiClock className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-orange-800 mb-2">
                Votre abonnement est en attente
              </h2>
              <p className="text-orange-700 mb-4 md:mb-0">
                Veuillez finaliser votre paiement pour activer votre abonnement {subscription.subscription_type_display?.toLowerCase()}.
              </p>
            </div>
          </div>
          <Link to={`/owner/subscription/${subscription.id}/payment`}>
            <Button variant="primary">
              Finaliser le paiement
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Si abonnement actif
  if (subscription.status === 'active') {
    // Obtenir le nombre de jours restants
    const daysRemaining = getDaysRemaining(subscription.end_date);
    
    // Si l'abonnement expire bientôt (moins de 7 jours)
    if (daysRemaining <= 7 && daysRemaining > 0) {
      return (
        <div className="bg-gradient-to-r from-amber-100 to-amber-200 p-6 rounded-lg shadow-md mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-amber-500 rounded-full p-2 mr-4">
                <FiAlertTriangle className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-amber-800 mb-2">
                  Votre abonnement {subscription.subscription_type_display} expire bientôt
                </h2>
                <p className="text-amber-700 mb-4 md:mb-0">
                  Il expire le {formatDate(subscription.end_date)} ({daysRemaining} jours restants). Renouvelez-le pour continuer à utiliser toutes les fonctionnalités.
                </p>
              </div>
            </div>
            <Link to="/owner/subscription">
              <Button variant="primary">
                Renouveler maintenant
              </Button>
            </Link>
          </div>
        </div>
      );
    }

    // Abonnement actif et pas d'expiration imminente
    return (
      <div className="bg-gradient-to-r from-green-100 to-green-200 p-6 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="bg-green-500 rounded-full p-2 mr-4">
              <FiCheckCircle className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-green-800">
                Abonnement {subscription.subscription_type_display} actif
              </h2>
              <p className="text-green-700">
                Expire le {formatDate(subscription.end_date)} ({daysRemaining} jours restants)
              </p>
            </div>
          </div>
          <Link to="/owner/subscription">
            <Button variant="outline">
              Gérer mon abonnement
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Si abonnement annulé ou autre statut
  return (
    <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-6 rounded-lg shadow-md mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Votre abonnement a expiré
          </h2>
          <p className="text-gray-700 mb-4 md:mb-0">
            Souscrivez à un nouvel abonnement pour bénéficier de toutes les fonctionnalités propriétaire.
          </p>
        </div>
        <Link to="/owner/subscription">
          <Button variant="primary">
            Voir les abonnements
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default SubscriptionStatusCheck;