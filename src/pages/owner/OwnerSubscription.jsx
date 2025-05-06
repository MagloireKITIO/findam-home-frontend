// src/pages/owner/OwnerSubscription.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiCheck, 
  FiX, 
  FiCheckCircle, 
  FiAlertCircle,
  FiCreditCard,
  FiHelpCircle,
  FiClock,
  FiInfo,
  FiRefreshCw
} from 'react-icons/fi';

import Layout from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import SectionTitle from '../../components/common/SectionTitle';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const OwnerSubscription = () => {
  const { currentUser } = useAuth();
  const { success, error: notifyError } = useNotification();
  const navigate = useNavigate();
  
  // États
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [subscriptionPlans, setSubscriptionPlans] = useState([
    {
      id: 'free',
      title: 'Gratuit',
      price: 0,
      pricePeriod: 'à vie',
      description: 'Idéal pour commencer avec un seul logement',
      features: [
        { text: '1 logement maximum', available: true },
        { text: 'Réservations illimitées', available: true },
        { text: 'Support par email', available: true },
        { text: 'Codes promo', available: false },
        { text: 'Calendrier des réservations', available: false },
        { text: 'Réservations externes', available: false },
      ],
      cta: 'Activez maintenant',
      recommended: false,
      disabled: false
    },
    {
      id: 'monthly',
      title: 'Mensuel',
      price: 5000,
      pricePeriod: 'par mois',
      description: 'Pour les propriétaires de plusieurs logements',
      features: [
        { text: '5 logements maximum', available: true },
        { text: 'Réservations illimitées', available: true },
        { text: 'Support prioritaire', available: true },
        { text: 'Codes promo', available: true },
        { text: 'Calendrier des réservations', available: true },
        { text: 'Réservations externes', available: true },
      ],
      cta: 'Souscrire',
      recommended: true,
      disabled: false
    },
    {
      id: 'quarterly',
      title: 'Trimestriel',
      price: 12000,
      pricePeriod: 'par trimestre',
      description: 'Pour les propriétaires cherchant des économies',
      features: [
        { text: '10 logements maximum', available: true },
        { text: 'Réservations illimitées', available: true },
        { text: 'Support prioritaire', available: true },
        { text: 'Codes promo', available: true },
        { text: 'Calendrier des réservations', available: true },
        { text: 'Réservations externes', available: true },
      ],
      cta: 'Souscrire',
      recommended: false,
      disabled: false
    },
    {
      id: 'yearly',
      title: 'Annuel',
      price: 40000,
      pricePeriod: 'par an',
      description: 'Pour les professionnels de la location',
      features: [
        { text: 'Logements illimités', available: true },
        { text: 'Réservations illimitées', available: true },
        { text: 'Support dédié 24/7', available: true },
        { text: 'Codes promo', available: true },
        { text: 'Calendrier des réservations', available: true },
        { text: 'Réservations externes', available: true },
      ],
      cta: 'Souscrire',
      recommended: false,
      disabled: false
    }
  ]);
  
  // Modals
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Charger l'abonnement actif
  useEffect(() => {
    const loadSubscription = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Récupérer le profil utilisateur pour obtenir l'abonnement actif
        const profileResponse = await api.get('/accounts/profile/');
        
        if (profileResponse.data.active_subscription) {
          setActiveSubscription(profileResponse.data.active_subscription);
          
          // Mettre à jour les états des plans d'abonnement
          updateSubscriptionPlans(profileResponse.data.active_subscription);
        }
        
      } catch (err) {
        console.error('Erreur lors du chargement de l\'abonnement:', err);
        setError('Une erreur est survenue lors du chargement de votre abonnement.');
        notifyError('Une erreur est survenue lors du chargement de votre abonnement');
      } finally {
        setLoading(false);
      }
    };
    
    loadSubscription();
  }, [notifyError]);
  
  // Mettre à jour les plans d'abonnement en fonction de l'abonnement actif
  const updateSubscriptionPlans = (subscription) => {
    setSubscriptionPlans(prevPlans => {
      return prevPlans.map(plan => {
        const isCurrentPlan = plan.id === subscription.subscription_type;
        const isActive = subscription.status === 'active';
        
        return {
          ...plan,
          current: isCurrentPlan,
          disabled: isCurrentPlan && isActive,
          cta: isCurrentPlan 
            ? (isActive ? 'Abonnement actif' : 'Finaliser le paiement') 
            : plan.cta
        };
      });
    });
  };
  
  // Souscrire à un abonnement
  const handleSubscribe = async () => {
    if (!selectedPlan) return;
    
    try {
      setIsProcessing(true);
      
      const response = await api.post('/accounts/subscriptions/', {
        subscription_type: selectedPlan.id
      });
      
      success(`Abonnement ${selectedPlan.title.toLowerCase()} créé avec succès`);
      
      // Rediriger vers la page de paiement
      navigate(`/owner/subscription/${response.data.id}/payment`);
      
    } catch (err) {
      console.error('Erreur lors de la souscription à l\'abonnement:', err);
      notifyError('Une erreur est survenue lors de la souscription à l\'abonnement');
    } finally {
      setIsProcessing(false);
      setShowSubscribeModal(false);
    }
  };
  
  // Annuler un abonnement
  const handleCancelSubscription = async () => {
    if (!activeSubscription) return;
    
    try {
      setIsProcessing(true);
      
      await api.post(`/accounts/subscriptions/${activeSubscription.id}/cancel/`);
      
      success('Abonnement annulé avec succès');
      
      // Mettre à jour l'interface
      setActiveSubscription(prev => ({
        ...prev,
        status: 'cancelled',
        is_active: false
      }));
      
      // Mettre à jour les états des plans d'abonnement
      setSubscriptionPlans(prevPlans => {
        return prevPlans.map(plan => {
          return {
            ...plan,
            current: plan.id === activeSubscription.subscription_type,
            disabled: false,
            cta: plan.id === activeSubscription.subscription_type 
              ? 'Renouveler' 
              : plan.cta
          };
        });
      });
      
    } catch (err) {
      console.error('Erreur lors de l\'annulation de l\'abonnement:', err);
      notifyError('Une erreur est survenue lors de l\'annulation de l\'abonnement');
    } finally {
      setIsProcessing(false);
      setShowCancelModal(false);
    }
  };
  
  // Renouveler un abonnement
  const handleRenewSubscription = async () => {
    if (!activeSubscription) return;
    
    try {
      setIsProcessing(true);
      
      const response = await api.post('/accounts/subscriptions/', {
        subscription_type: activeSubscription.subscription_type
      });
      
      success(`Abonnement ${activeSubscription.subscription_type_display.toLowerCase()} renouvelé avec succès`);
      
      // Rediriger vers la page de paiement
      navigate(`/owner/subscription/${response.data.id}/payment`);
      
    } catch (err) {
      console.error('Erreur lors du renouvellement de l\'abonnement:', err);
      notifyError('Une erreur est survenue lors du renouvellement de l\'abonnement');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Formatage du prix
  const formatPrice = (price) => {
    return price.toLocaleString() + ' FCFA';
  };
  
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
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <SectionTitle 
          title="Abonnement propriétaire" 
          subtitle="Choisissez le plan qui correspond à vos besoins"
          align="center"
        />
        
        {/* Bannière d'abonnement actif */}
        {activeSubscription && activeSubscription.status === 'active' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg shadow-md mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="bg-green-500 rounded-full p-2 mr-4">
                  <FiCheckCircle className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-green-800">
                    Abonnement {activeSubscription.subscription_type_display} actif
                  </h2>
                  <p className="text-green-700">
                    Expire le {formatDate(activeSubscription.end_date)} ({getDaysRemaining(activeSubscription.end_date)} jours restants)
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCancelModal(true)}
                >
                  Annuler l'abonnement
                </Button>
                <Button
                  variant="primary"
                  onClick={handleRenewSubscription}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Traitement..." : "Renouveler"}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Bannière d'abonnement en attente */}
        {activeSubscription && activeSubscription.status === 'pending' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-lg shadow-md mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="bg-yellow-500 rounded-full p-2 mr-4">
                  <FiClock className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-yellow-800">
                    Abonnement {activeSubscription.subscription_type_display} en attente
                  </h2>
                  <p className="text-yellow-700">
                    En attente de paiement
                  </p>
                </div>
              </div>
              <Button
                variant="primary"
                onClick={() => navigate(`/owner/subscription/${activeSubscription.id}/payment`)}
              >
                Finaliser le paiement
              </Button>
            </div>
          </motion.div>
        )}
        
        {/* Plans d'abonnement */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-lg text-red-700 mb-8">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
            {subscriptionPlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  bg-white rounded-lg shadow-md overflow-hidden border
                  ${plan.recommended ? 'border-primary-500' : 'border-gray-200'}
                  ${plan.current && activeSubscription?.status === 'active' ? 'ring-2 ring-green-500' : ''}
                `}
              >
                {plan.recommended && (
                  <div className="bg-primary-500 text-white text-center py-1 text-sm font-medium">
                    Recommandé
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900">{plan.title}</h3>
                  <div className="mt-4 flex items-baseline text-gray-900">
                    <span className="text-3xl font-extrabold">
                      {plan.price === 0 ? 'Gratuit' : formatPrice(plan.price)}
                    </span>
                    {plan.price > 0 && (
                      <span className="ml-1 text-xl font-medium text-gray-500">
                        {plan.pricePeriod}
                      </span>
                    )}
                  </div>
                  <p className="mt-5 text-gray-500">{plan.description}</p>
                  
                  <ul className="mt-6 space-y-4">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <div className="flex-shrink-0">
                          {feature.available ? (
                            <FiCheck className="h-5 w-5 text-green-500" />
                          ) : (
                            <FiX className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <p className={`ml-3 text-sm ${feature.available ? 'text-gray-700' : 'text-gray-500'}`}>
                          {feature.text}
                        </p>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-8">
                    <Button
                      variant={plan.current && activeSubscription?.status === 'active' ? 'success' : 'primary'}
                      fullWidth
                      disabled={plan.disabled || isProcessing}
                      onClick={() => {
                        if (plan.current && activeSubscription?.status === 'pending') {
                          // Si l'abonnement est en attente, rediriger vers la page de paiement
                          navigate(`/owner/subscription/${activeSubscription.id}/payment`);
                        } else if (plan.current && activeSubscription?.status === 'active') {
                          // Ne rien faire si l'abonnement est actif
                          return;
                        } else {
                          // Sinon, ouvrir la modal de souscription
                          setSelectedPlan(plan);
                          setShowSubscribeModal(true);
                        }
                      }}
                    >
                      {plan.current && activeSubscription?.status === 'active' ? (
                        <div className="flex items-center justify-center">
                          <FiCheckCircle className="mr-2" />
                          Abonnement actif
                        </div>
                      ) : plan.current && activeSubscription?.status === 'pending' ? (
                        "Finaliser le paiement"
                      ) : (
                        plan.cta
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        {/* Informations supplémentaires */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Informations importantes</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-600">
                  <FiCreditCard className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-medium text-gray-900">Paiement sécurisé</h4>
                <p className="mt-2 text-gray-600">
                  Nous acceptons les paiements par carte bancaire, mobile money et virement bancaire. 
                  Toutes les transactions sont sécurisées.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-600">
                  <FiRefreshCw className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-medium text-gray-900">Renouvellement automatique</h4>
                <p className="mt-2 text-gray-600">
                  Les abonnements sont renouvelés automatiquement à la fin de la période. 
                  Vous pouvez annuler votre abonnement à tout moment.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-600">
                  <FiClock className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-medium text-gray-900">Période d'essai</h4>
                <p className="mt-2 text-gray-600">
                  L'abonnement gratuit vous permet de tester la plateforme avec un logement avant de passer à un plan payant.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-600">
                  <FiHelpCircle className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-medium text-gray-900">Besoin d'aide ?</h4>
                <p className="mt-2 text-gray-600">
                  Notre équipe de support est disponible 24/7 pour répondre à toutes vos questions concernant les abonnements.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Modal de souscription */}
        <Modal
          isOpen={showSubscribeModal}
          onClose={() => setShowSubscribeModal(false)}
          title={`Souscrire à l'abonnement ${selectedPlan?.title}`}
          size="md"
        >
          {selectedPlan && (
            <div>
              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  Vous êtes sur le point de souscrire à l'abonnement <strong>{selectedPlan.title}</strong>.
                </p>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Abonnement:</span>
                    <span className="font-medium">{selectedPlan.title}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Prix:</span>
                    <span className="font-medium">{formatPrice(selectedPlan.price)} {selectedPlan.pricePeriod}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="text-gray-600">Total à payer:</span>
                    <span className="font-medium">{formatPrice(selectedPlan.price)}</span>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                    <FiInfo className="mr-2" />
                    Informations importantes
                  </h4>
                  <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                    <li>Vous serez redirigé vers la page de paiement après la confirmation</li>
                    <li>Votre abonnement sera actif dès que le paiement sera confirmé</li>
                    <li>Vous pourrez annuler votre abonnement à tout moment</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowSubscribeModal(false)}
                >
                  Annuler
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubscribe}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Traitement..." : "Confirmer et payer"}
                </Button>
              </div>
            </div>
          )}
        </Modal>
        
        {/* Modal d'annulation */}
        <Modal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          title="Annuler l'abonnement"
          size="md"
        >
          {activeSubscription && (
            <div>
              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  Vous êtes sur le point d'annuler votre abonnement <strong>{activeSubscription.subscription_type_display}</strong>.
                </p>
                
                <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                  <div className="flex items-start">
                    <div>
                      <FiAlertCircle className="text-yellow-600 mr-3 mt-1" size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800 mb-1">Conséquences de l'annulation</h4>
                      <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                        <li>Votre abonnement restera actif jusqu'au {formatDate(activeSubscription.end_date)}</li>
                        <li>Après cette date, vous serez rétrogradé à l'abonnement gratuit</li>
                        <li>Si vous avez plus de logements que ce que permet le plan gratuit, ils seront masqués</li>
                        <li>Vos données et réservations seront conservées</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600">
                  Êtes-vous sûr de vouloir annuler votre abonnement ? Cette action est irréversible.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCancelModal(false)}
                >
                  Revenir en arrière
                </Button>
                <Button
                  variant="danger"
                  onClick={handleCancelSubscription}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Traitement..." : "Confirmer l'annulation"}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default OwnerSubscription;
        