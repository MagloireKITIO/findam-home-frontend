// src/pages/owner/SubscriptionCancel.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiXCircle } from 'react-icons/fi';

import Layout from '../../components/layout/Layout';
import Button from '../../components/common/Button';

/**
 * Page affichée après annulation du paiement sur NotchPay
 */
const SubscriptionCancel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Récupérer l'ID de l'abonnement depuis les paramètres d'URL
  const queryParams = new URLSearchParams(location.search);
  const subscriptionId = queryParams.get('id');
  
  // Gérer le retour à la page d'abonnement
  const handleBackToSubscription = () => {
    navigate('/owner/subscription');
  };
  
  // Gérer la reprise du paiement
  const handleResumePipayment = () => {
    if (subscriptionId) {
      navigate(`/owner/subscription/${subscriptionId}/payment`);
    } else {
      navigate('/owner/subscription');
    }
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
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <FiXCircle className="text-red-600 text-3xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Paiement annulé</h2>
            <p className="text-gray-600 mb-6">
              Vous avez annulé le processus de paiement. Votre abonnement n'a pas été activé.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Button
                variant="outline"
                onClick={handleBackToSubscription}
              >
                Retour aux abonnements
              </Button>
              <Button
                variant="primary"
                onClick={handleResumePipayment}
              >
                Reprendre le paiement
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default SubscriptionCancel;