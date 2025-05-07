// src/pages/owner/OwnerSubscriptionPayment.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiCreditCard, 
  FiSmartphone, 
  FiDollarSign, 
  FiCheck,
  FiClock,
  FiArrowLeft,
  FiInfo,
  FiAlertCircle,
  FiCheckCircle
} from 'react-icons/fi';

import Layout from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SectionTitle from '../../components/common/SectionTitle';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const OwnerSubscriptionPayment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error: notifyError } = useNotification();
  
  // États
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('mobile_money');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentMethods] = useState([
    {
      id: 'mobile_money',
      name: 'Mobile Money',
      icon: <FiSmartphone />,
      description: 'Paiement via Orange Money, MTN Mobile Money ou autre',
      options: [
        { id: 'orange', name: 'Orange Money' },
        { id: 'mtn', name: 'MTN Mobile Money' },
        { id: 'other', name: 'Autre' }
      ]
    },
    {
      id: 'credit_card',
      name: 'Carte bancaire',
      icon: <FiCreditCard />,
      description: 'Paiement sécurisé par carte Visa, MasterCard ou autre',
      options: []
    },
    {
      id: 'bank_transfer',
      name: 'Virement bancaire',
      icon: <FiDollarSign />,
      description: 'Paiement par virement bancaire (délai de traitement plus long)',
      options: []
    }
  ]);
  
  // Formulaire de paiement
  const [paymentForm, setPaymentForm] = useState({
    phoneNumber: '',
    mobileMoneyProvider: 'orange',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    cardHolder: '',
    bankName: '',
    accountName: '',
    accountNumber: ''
  });
  
  // Charger les détails de l'abonnement
  useEffect(() => {
    const loadSubscription = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Récupérer les détails de l'abonnement
        const response = await api.get(`/accounts/subscriptions/${id}/`);
        setSubscription(response.data);
        
        // Vérifier le statut du paiement
        if (response.data.status === 'active') {
          setPaymentStatus('success');
        } else if (response.data.status === 'cancelled') {
          setPaymentStatus('cancelled');
        }
        
      } catch (err) {
        console.error('Erreur lors du chargement des détails de l\'abonnement:', err);
        setError('Une erreur est survenue lors du chargement des détails de l\'abonnement.');
        notifyError('Une erreur est survenue lors du chargement des détails de l\'abonnement');
      } finally {
        setLoading(false);
      }
    };
    
    loadSubscription();
  }, [id, notifyError]);
  
  // Mettre à jour le formulaire de paiement
  const handlePaymentFormChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Initialiser le paiement
  const handleInitiatePayment = async () => {
    // Validation du formulaire selon la méthode de paiement
    if (selectedPaymentMethod === 'mobile_money') {
      if (!paymentForm.phoneNumber) {
        notifyError('Veuillez saisir votre numéro de téléphone');
        return;
      }
    } else if (selectedPaymentMethod === 'credit_card') {
      if (!paymentForm.cardNumber || !paymentForm.cardExpiry || !paymentForm.cardCvc || !paymentForm.cardHolder) {
        notifyError('Veuillez remplir tous les champs de la carte bancaire');
        return;
      }
    } else if (selectedPaymentMethod === 'bank_transfer') {
      if (!paymentForm.bankName || !paymentForm.accountName || !paymentForm.accountNumber) {
        notifyError('Veuillez remplir tous les champs du virement bancaire');
        return;
      }
    }
    
    try {
      setIsProcessing(true);
      
      // Préparer les données de paiement selon la méthode choisie
      let paymentData = {
        payment_method: selectedPaymentMethod
      };
      
      // Ajouter les détails spécifiques selon la méthode de paiement
      if (selectedPaymentMethod === 'mobile_money') {
        paymentData.phone_number = paymentForm.phoneNumber;
        paymentData.mobile_operator = paymentForm.mobileMoneyProvider; // orange, mtn ou mobile_money
      }
      
      // Initialiser le paiement via l'API
      const response = await api.post(`/accounts/subscriptions/${id}/initiate_payment/`, paymentData);
      
      // Si la réponse contient une URL de paiement, rediriger vers cette URL
      if (response.data.payment_url) {
        // On peut soit ouvrir dans un nouvel onglet
        window.open(response.data.payment_url, '_blank');
        
        // Ou rediriger directement
        // window.location.href = response.data.payment_url;
        
        // Mettre à jour l'état pour afficher les instructions
        setPaymentStatus('pending');
        
        // Démarrer la vérification périodique du statut
        setTimeout(checkPaymentStatus, 5000);
        
        success('Redirection vers la page de paiement...');
        return;
      }
      
      // Si pas d'URL mais succès, afficher un message
      if (response.data.success) {
        success('Demande de paiement envoyée avec succès');
        setPaymentStatus('pending');
        setTimeout(checkPaymentStatus, 5000);
      } else {
        notifyError(response.data.error || 'Une erreur est survenue lors de l\'initialisation du paiement');
      }
      
    } catch (err) {
      console.error('Erreur lors de l\'initialisation du paiement:', err);
      notifyError(err.response?.data?.detail || 'Une erreur est survenue lors de l\'initialisation du paiement');
    } finally {
      setIsProcessing(false);
    }
  };
    
    // Vérifier le statut du paiement
    const checkPaymentStatus = async () => {
      try {
        const response = await api.get(`/accounts/subscriptions/${id}/check_payment_status/`);
        
        if (response.data.status === 'completed' || response.data.subscription_status === 'active') {
          setPaymentStatus('success');
          success('Paiement effectué avec succès');
          
          // Mettre à jour l'abonnement
          setSubscription(prev => ({
            ...prev,
            status: 'active',
            is_active: true
          }));
          
          // AJOUTÉ ICI: Arrêter les vérifications futures
          window.paymentCheckRetries = 999; // Empêche tout appel futur
          return; // Sortir de la fonction immédiatement
          
        } else if (response.data.status === 'pending' || response.data.status === 'processing') {
          setPaymentStatus('pending');
          
          // Vérifier à nouveau après quelques secondes
          setTimeout(checkPaymentStatus, 5000);
          
        } else if (response.data.status === 'failed') {
          setPaymentStatus('failed');
          notifyError('Le paiement a échoué. Veuillez réessayer.');
        } else {
          // Pour tout autre statut, afficher un message générique
          notifyError('Une erreur est survenue lors de la vérification du statut du paiement.');
        }
        
      } catch (err) {
        console.error('Erreur lors de la vérification du statut du paiement:', err);
        
        // En cas d'erreur, on peut quand même réessayer quelques fois
        if (!window.paymentCheckRetries) {
          window.paymentCheckRetries = 1;
        } else {
          window.paymentCheckRetries++;
        }
        
        // Limiter à 3 tentatives en cas d'erreur
        if (window.paymentCheckRetries <= 3) {
          setTimeout(checkPaymentStatus, 5000);
        }
      }
    };
    
    // Retourner à la page d'abonnement
    const handleReturn = () => {
      navigate('/owner/subscription');
    };
    
    // Confirmer le paiement par virement bancaire
    const handleConfirmBankTransfer = async () => {
      try {
        setIsProcessing(true);
        
        await api.post(`/accounts/subscriptions/${id}/confirm_bank_transfer/`, {
          reference: paymentForm.transferReference
        });
        
        success('Confirmation envoyée avec succès. Votre paiement sera traité dans les plus brefs délais.');
        setPaymentStatus('pending');
        
      } catch (err) {
        console.error('Erreur lors de la confirmation du virement bancaire:', err);
        notifyError('Une erreur est survenue lors de la confirmation du virement bancaire');
      } finally {
        setIsProcessing(false);
      }
    };
    
    // Afficher le formulaire de paiement selon la méthode sélectionnée
    const renderPaymentForm = () => {
      if (selectedPaymentMethod === 'mobile_money') {
        return (
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Opérateur Mobile Money
              </label>
              <select
                name="mobileMoneyProvider"
                value={paymentForm.mobileMoneyProvider}
                onChange={handlePaymentFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="orange">Orange Money</option>
                <option value="mtn">MTN Mobile Money</option>
                <option value="mobile_money">Détection automatique</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Sélectionnez votre opérateur pour un traitement plus rapide ou "Détection automatique" pour laisser le système déterminer l'opérateur.
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de téléphone
              </label>
              <Input
                type="tel"
                name="phoneNumber"
                value={paymentForm.phoneNumber}
                onChange={handlePaymentFormChange}
                placeholder="Ex: 6XXXXXXXX"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Entrez votre numéro sans le code pays (ex: 656789012)
              </p>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg mb-6">
              <div className="flex">
                <div>
                  <FiInfo className="text-yellow-600 mr-3 mt-1" size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 mb-1">Instructions</h4>
                  <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
                    <li>Vous recevrez une notification sur votre téléphone après avoir cliqué sur "Payer maintenant"</li>
                    <li>Confirmez le paiement en saisissant votre code secret {paymentForm.mobileMoneyProvider === 'orange' ? 'Orange Money' : paymentForm.mobileMoneyProvider === 'mtn' ? 'MTN Mobile Money' : 'Mobile Money'}</li>
                    <li>Votre abonnement sera activé automatiquement après confirmation du paiement</li>
                  </ol>
                </div>
              </div>
            </div>
            
            {/* Afficher des instructions spécifiques selon l'opérateur */}
            {paymentForm.mobileMoneyProvider === 'orange' && (
              <div className="bg-orange-50 p-4 rounded-lg mb-4 border border-orange-200">
                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-orange-500 flex-shrink-0 flex items-center justify-center text-white mr-3">
                    <span className="text-sm font-bold">OM</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-orange-800">Orange Money</h4>
                    <p className="text-xs text-orange-700 mt-1">
                      Composez #150# sur votre téléphone pour approuver le paiement si vous ne recevez pas de notification automatique.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {paymentForm.mobileMoneyProvider === 'mtn' && (
              <div className="bg-yellow-50 p-4 rounded-lg mb-4 border border-yellow-200">
                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-yellow-500 flex-shrink-0 flex items-center justify-center text-white mr-3">
                    <span className="text-sm font-bold">MM</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">MTN Mobile Money</h4>
                    <p className="text-xs text-yellow-700 mt-1">
                      Vérifiez votre téléphone pour approuver la transaction. Composez *126# si vous ne recevez pas de notification automatique.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      } else if (selectedPaymentMethod === 'credit_card') {
        return (
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de carte
              </label>
              <Input
                type="text"
                name="cardNumber"
                value={paymentForm.cardNumber}
                onChange={handlePaymentFormChange}
                placeholder="4242 4242 4242 4242"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date d'expiration
                </label>
                <Input
                  type="text"
                  name="cardExpiry"
                  value={paymentForm.cardExpiry}
                  onChange={handlePaymentFormChange}
                  placeholder="MM/AA"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVC
                </label>
                <Input
                  type="text"
                  name="cardCvc"
                  value={paymentForm.cardCvc}
                  onChange={handlePaymentFormChange}
                  placeholder="123"
                  required
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titulaire de la carte
              </label>
              <Input
                type="text"
                name="cardHolder"
                value={paymentForm.cardHolder}
                onChange={handlePaymentFormChange}
                placeholder="John Doe"
                required
              />
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <div className="flex">
                <div>
                  <FiInfo className="text-blue-600 mr-3 mt-1" size={20} />
                </div>
                <div>
                  <p className="text-sm text-blue-700">
                    Le paiement par carte est entièrement sécurisé. Vos informations sont chiffrées et ne sont pas stockées sur nos serveurs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      } else if (selectedPaymentMethod === 'bank_transfer') {
        return (
          <div>
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Instructions pour le virement bancaire</h4>
              <div className="space-y-2 text-sm text-blue-700">
                <p>Veuillez effectuer un virement bancaire avec les informations suivantes :</p>
                <div className="grid grid-cols-2 gap-2 bg-white p-3 rounded">
                  <span className="text-gray-600">Banque :</span>
                  <span className="font-medium">Société Générale Cameroun</span>
                  <span className="text-gray-600">Bénéficiaire :</span>
                  <span className="font-medium">FINDAM SARL</span>
                  <span className="text-gray-600">IBAN :</span>
                  <span className="font-medium">CM21 3000 2000 3000 4000 5000 160</span>
                  <span className="text-gray-600">Référence :</span>
                  <span className="font-medium">SUB-{id.substring(0, 8)}</span>
                  <span className="text-gray-600">Montant :</span>
                  <span className="font-medium">{subscription?.amount.toLocaleString()} FCFA</span>
                </div>
                <p>Une fois le virement effectué, veuillez fournir les informations ci-dessous :</p>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de votre banque
              </label>
              <Input
                type="text"
                name="bankName"
                value={paymentForm.bankName}
                onChange={handlePaymentFormChange}
                placeholder="Ex: Ecobank"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du titulaire du compte
              </label>
              <Input
                type="text"
                name="accountName"
                value={paymentForm.accountName}
                onChange={handlePaymentFormChange}
                placeholder="Ex: John Doe"
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Référence du virement
              </label>
              <Input
                type="text"
                name="transferReference"
                value={paymentForm.transferReference}
                onChange={handlePaymentFormChange}
                placeholder="Ex: TRF123456789"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                La référence du virement que vous avez effectué
              </p>
            </div>
          </div>
        );
      }
      
      return null;
    };
    
    // Formatage du prix
    const formatPrice = (price) => {
      return price?.toLocaleString() + ' FCFA' || '0 FCFA';
    };
    
    // Contenu principal
    const renderContent = () => {
      if (loading) {
        return (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        );
      }
      
      if (error) {
        return (
          <div className="bg-red-50 p-4 rounded-lg text-red-700">
            {error}
          </div>
        );
      }
      
      if (!subscription) {
        return (
          <div className="bg-red-50 p-4 rounded-lg text-red-700">
            Abonnement non trouvé.
          </div>
        );
      }
      
      // Si le paiement a réussi
      if (paymentStatus === 'success') {
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-8 text-center"
          >
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <FiCheckCircle className="text-green-600 text-3xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Paiement réussi</h2>
            <p className="text-gray-600 mb-6">
              Votre abonnement {subscription.subscription_type_display} est maintenant actif.
              Vous pouvez profiter de toutes les fonctionnalités de votre compte propriétaire.
            </p>
            <div className="flex justify-center">
              <Button
                variant="primary"
                onClick={() => navigate('/owner/dashboard')}
              >
                Accéder au tableau de bord
              </Button>
            </div>
          </motion.div>
        );
      }
      
      // Si le paiement est en attente (spécifique au virement bancaire)
      if (paymentStatus === 'pending' && selectedPaymentMethod === 'bank_transfer') {
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-8 text-center"
          >
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
              <FiClock className="text-yellow-600 text-3xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Paiement en attente de confirmation</h2>
            <p className="text-gray-600 mb-6">
              Nous avons bien reçu votre confirmation de virement bancaire. Notre équipe va vérifier votre paiement dans les plus brefs délais.
              Votre abonnement sera activé dès que le paiement sera confirmé.
            </p>
            <div className="flex justify-center">
              <Button
                variant="primary"
                onClick={() => navigate('/owner/dashboard')}
              >
                Retour au tableau de bord
              </Button>
            </div>
          </motion.div>
        );
      }
      
      // Si le paiement a échoué
      if (paymentStatus === 'failed') {
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-8 text-center"
          >
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <FiAlertCircle className="text-red-600 text-3xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Paiement échoué</h2>
            <p className="text-gray-600 mb-6">
              Le paiement de votre abonnement a échoué. Veuillez vérifier vos informations de paiement et réessayer.
            </p>
            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/owner/subscription')}
              >
                Retour aux abonnements
              </Button>
              <Button
                variant="primary"
                onClick={() => setPaymentStatus(null)}
              >
                Réessayer
              </Button>
            </div>
          </motion.div>
        );
      }
      
      // Formulaire de paiement par défaut
      return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Résumé de la commande</h3>
                <p className="text-gray-600 mt-1">
                  Abonnement {subscription.subscription_type_display}
                </p>
              </div>
              <div className="mt-2 md:mt-0 text-right">
                <span className="text-2xl font-bold text-gray-900">{formatPrice(subscription.amount)}</span>
              </div>
            </div>
            
            <hr className="my-6" />
            
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Méthode de paiement</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {paymentMethods.map(method => (
                <div
                  key={method.id}
                  className={`
                    border rounded-lg p-4 cursor-pointer transition-all
                    ${selectedPaymentMethod === method.id 
                      ? 'border-primary-500 ring-2 ring-primary-100' 
                      : 'border-gray-200 hover:border-gray-300'}
                  `}
                  onClick={() => setSelectedPaymentMethod(method.id)}
                >
                  <div className="flex items-center mb-2">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center mr-3
                      ${selectedPaymentMethod === method.id ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'}
                    `}>
                      {method.icon}
                    </div>
                    <h4 className="font-medium">{method.name}</h4>
                  </div>
                  <p className="text-sm text-gray-600">{method.description}</p>
                  
                  {/* Afficher l'icône de sélection */}
                  {selectedPaymentMethod === method.id && (
                    <div className="flex justify-end">
                      <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                        <FiCheck className="text-white" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <hr className="my-6" />
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Détails du paiement</h3>
              {renderPaymentForm()}
            </div>
            
            <div className="flex flex-col-reverse md:flex-row md:justify-between">
              <Button
                variant="outline"
                icon={<FiArrowLeft />}
                onClick={handleReturn}
              >
                Retour
              </Button>
              
              {selectedPaymentMethod === 'bank_transfer' ? (
                <Button
                  variant="primary"
                  onClick={handleConfirmBankTransfer}
                  disabled={isProcessing}
                  className="mb-4 md:mb-0"
                >
                  {isProcessing ? "Traitement..." : "Confirmer le virement"}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleInitiatePayment}
                  disabled={isProcessing}
                  className="mb-4 md:mb-0"
                >
                  {isProcessing ? "Traitement..." : "Payer maintenant"}
                </Button>
              )}
            </div>
          </div>
        </div>
      );
    };
    
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <Button
                variant="outline"
                icon={<FiArrowLeft />}
                onClick={handleReturn}
              >
                Retour aux abonnements
              </Button>
            </div>
            
            <SectionTitle 
              title="Paiement de l'abonnement" 
              subtitle="Finalisez votre paiement pour activer votre abonnement"
              align="center"
            />
            
            {renderContent()}
          </div>
        </div>
      </Layout>
    );
  };
  
  export default OwnerSubscriptionPayment;