// src/pages/owner/SubscriptionSuccess.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiLoader, FiAlertTriangle } from 'react-icons/fi';

import Layout from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

/**
 * Page affichée après le retour de la passerelle de paiement NotchPay
 * pour les paiements d'abonnement réussis
 */
const SubscriptionSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { success, error: notifyError } = useNotification();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('checking');
  const [subscription, setSubscription] = useState(null);
  
  // Récupérer l'ID de l'abonnement depuis les paramètres d'URL
  const queryParams = new URLSearchParams(location.search);
  const subscriptionId = queryParams.get('id');
  
  useEffect(() => {
    // Si pas d'ID d'abonnement, rediriger vers la page d'abonnement
    if (!subscriptionId) {
      navigate('/owner/subscription');
      return;
    }
    
    // Fonction pour vérifier le statut du paiement
    const checkPaymentStatus = async () => {
      try {
        setLoading(true);
        
        const response = await api.get(`/accounts/subscriptions/${subscriptionId}/check_payment_status/`);
        
        // Si le paiement est confirmé
        if (response.data.status === 'completed' || response.data.subscription_status === 'active') {
          setPaymentStatus('success');
          setSubscription(response.data.details);
          success('Paiement effectué avec succès');
        }
        // Si le paiement est en cours de traitement
        else if (response.data.status === 'pending' || response.data.status === 'processing') {
          setPaymentStatus('pending');
          
          // Vérifier à nouveau après 2 secondes
          setTimeout(checkPaymentStatus, 2000);
        }
        // Si le paiement a échoué
        else {
          setPaymentStatus('failed');
          setError('Le paiement a échoué. Veuillez réessayer.');
        }
        
      } catch (err) {
        console.error('Erreur lors de la vérification du statut du paiement:', err);
        setPaymentStatus('error');
        setError('Une erreur est survenue lors de la vérification du paiement.');
      } finally {
        setLoading(false);
      }
    };
    
    // Lancer la vérification du paiement
    checkPaymentStatus();
  }, [subscriptionId, navigate, success, notifyError]);
  
  // Gérer le retour au tableau de bord
  const handleBackToDashboard = () => {
    navigate('/owner/dashboard');
  };
  
  // Gérer le retour à la page d'abonnement
  const handleBackToSubscription = () => {
    navigate('/owner/subscription');
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-8 text-center"
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-gray-600">Vérification du paiement en cours...</p>
              </div>
            ) : paymentStatus === 'pending' ? (
              <div className="flex flex-col items-center py-8">
                <div className="animate-spin w-16 h-16 text-blue-500 mb-4">
                  <FiLoader size={64} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Paiement en cours de traitement</h2>
                <p className="text-gray-600 mb-4">
                  Votre paiement est en cours de traitement. Veuillez patienter quelques instants...
                </p>
                <p className="text-gray-500 text-sm">
                  Cette page se rafraîchira automatiquement.
                </p>
              </div>
            ) : paymentStatus === 'success' ? (
              <div>
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <FiCheckCircle className="text-green-600 text-3xl" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Paiement réussi</h2>
                <p className="text-gray-600 mb-6">
                  Félicitations ! Votre abonnement a été activé avec succès. Vous pouvez maintenant profiter de toutes les fonctionnalités de votre compte propriétaire.
                </p>
                <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <Button
                    variant="primary"
                    onClick={handleBackToDashboard}
                  >
                    Accéder au tableau de bord
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                  <FiAlertTriangle className="text-red-600 text-3xl" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {paymentStatus === 'failed' ? 'Paiement échoué' : 'Erreur de vérification'}
                </h2>
                <p className="text-gray-600 mb-6">
                  {error || 'Une erreur est survenue lors du traitement de votre paiement. Veuillez réessayer.'}
                </p>
                <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <Button
                    variant="outline"
                    onClick={handleBackToSubscription}
                  >
                    Retour aux abonnements
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default SubscriptionSuccess;