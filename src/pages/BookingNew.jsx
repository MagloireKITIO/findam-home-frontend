// src/pages/BookingNew.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    FiCalendar, FiUsers, FiCreditCard, FiCheck, FiX,
    FiInfo, FiDollarSign, FiSmartphone, FiAlertCircle,
    FiHome, FiExternalLink
  } from 'react-icons/fi';

import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import useApi from '../hooks/useApi';

const BookingNew = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { success, error: notifyError } = useNotification();
  const { fetchData, postData, loading: apiLoading, error: apiError } = useApi();

  // Récupérer les données de l'état de navigation (depuis PropertyDetail)
  const {
    propertyId,
    checkIn,
    checkOut,
    guests,
    price
  } = location.state || {};

  // États
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingData, setBookingData] = useState({
    specialRequests: '',
    promoCode: '',
    paymentMethod: 'mobile_money', // Valeurs possibles: 'mobile_money', 'credit_card', 'bank_transfer'
    mobileMoneyNumber: '',
    agreedToTerms: false
  });
  const [promoCodeDetails, setPromoCodeDetails] = useState(null);
  const [promoCodeLoading, setPromoCodeLoading] = useState(false);
  const [promoCodeError, setPromoCodeError] = useState(null);
  const [currentStep, setCurrentStep] = useState(1); // 1: Récapitulatif, 2: Paiement
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [mobileOperator, setMobileOperator] = useState('mobile_money');

  // Vérifier si les données nécessaires sont présentes
  useEffect(() => {
    if (!propertyId || !checkIn || !checkOut || !guests) {
      notifyError('Informations de réservation incomplètes');
      navigate('/properties');
      return;
    }

    // Vérifier si l'utilisateur est connecté
    if (!currentUser) {
      notifyError('Veuillez vous connecter pour effectuer une réservation');
      navigate('/login', { 
        state: { 
          from: {
            pathname: '/booking/new',
            search: location.search
          },
          propertyId,
          checkIn,
          checkOut,
          guests,
          price
        } 
      });
      return;
    }

    // Charger les détails de la propriété
    const getPropertyDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get(`/properties/properties/${propertyId}/`);
        setProperty(response.data);

        // Si nous n'avons pas les informations de prix depuis l'état
        if (!price) {
          const availabilityResponse = await api.get(`/properties/properties/${propertyId}/check_availability/`, {
            params: {
              start_date: checkIn,
              end_date: checkOut
            }
          });

          if (!availabilityResponse.data.available) {
            notifyError('Ce logement n\'est plus disponible aux dates sélectionnées');
            navigate(`/properties/${propertyId}`);
            return;
          }
        }
      } catch (err) {
        console.error('Erreur lors du chargement de la propriété:', err);
        setError('Une erreur est survenue lors du chargement des détails de la propriété');
      } finally {
        setLoading(false);
      }
    };

    getPropertyDetails();
  }, [propertyId, checkIn, checkOut, guests, currentUser, navigate, price, notifyError]);

  // Gestion des changements dans le formulaire
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Vérifier périodiquement le statut du paiement
const checkPaymentStatus = (bookingId) => {
  // Créer une variable pour suivre le nombre de tentatives
  if (!window.paymentCheckRetries) {
    window.paymentCheckRetries = 0;
  }
  
  // Limite à 10 vérifications (50 secondes)
  if (window.paymentCheckRetries >= 10) {
    return;
  }
  
  // Incrémenter le compteur
  window.paymentCheckRetries++;
  
  // Vérifier le statut après 5 secondes
  setTimeout(async () => {
    try {
      const statusResponse = await fetchData(`/bookings/bookings/${bookingId}/check_payment_status/`);
      
      if (statusResponse.status === 'completed' || statusResponse.payment_status === 'paid') {
        // Paiement réussi
        success('Paiement confirmé ! Votre réservation est confirmée.');
        // Mise à jour de l'état si nécessaire...
      } else if (statusResponse.status === 'failed') {
        // Paiement échoué
        notifyError('Le paiement a échoué. Veuillez réessayer.');
      } else {
        // Toujours en attente, vérifier à nouveau
        checkPaymentStatus(bookingId);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du statut du paiement:', error);
      // En cas d'erreur, on continue à vérifier
      checkPaymentStatus(bookingId);
    }
  }, 5000); // Vérifier toutes les 5 secondes
};

  // Validation du code promo
  const validatePromoCode = async () => {
    if (!bookingData.promoCode.trim()) return;

    setPromoCodeLoading(true);
    setPromoCodeError(null);
    setPromoCodeDetails(null);

    try {
      const response = await api.get('/bookings/promo-codes/validate-code/', {
        params: {
          code: bookingData.promoCode,
          property: propertyId
        }
      });

      if (response.data.valid) {
        setPromoCodeDetails(response.data.promo_code);
        success('Code promo appliqué avec succès');
      } else {
        setPromoCodeError('Code promo invalide ou expiré');
      }
    } catch (err) {
      console.error('Erreur lors de la validation du code promo:', err);
      setPromoCodeError('Erreur lors de la validation du code promo');
    } finally {
      setPromoCodeLoading(false);
    }
  };

  // Calcul du prix avec code promo
  const calculatePrice = () => {
    if (!price) return null;

    let calculatedPrice = { ...price };

    // Appliquer la réduction du code promo si valide
    if (promoCodeDetails) {
      const discountAmount = (calculatedPrice.basePrice * (promoCodeDetails.discount_percentage / 100));
      calculatedPrice.discount = (calculatedPrice.discount || 0) + discountAmount;
      calculatedPrice.totalPrice = calculatedPrice.basePrice + calculatedPrice.cleaningFee + calculatedPrice.serviceFee - calculatedPrice.discount;
    }

    return calculatedPrice;
  };

  // Soumettre la réservation
  const submitBooking = async () => {
    // Vérification de base
    if (!bookingData.agreedToTerms) {
      notifyError('Veuillez accepter les conditions générales');
      return;
    }
  
    if (bookingData.paymentMethod === 'mobile_money' && !bookingData.mobileMoneyNumber) {
      notifyError('Veuillez saisir votre numéro de mobile money');
      return;
    }
  
    setBookingInProgress(true);
  
    try {
      // Création de la réservation
      const bookingResponse = await postData('/bookings/bookings/', {
        property: propertyId,
        check_in_date: checkIn,
        check_out_date: checkOut,
        guests_count: guests,
        special_requests: bookingData.specialRequests,
        promo_code: bookingData.promoCode || null
      });
  
      // Vérifier explicitement que bookingResponse existe et contient un ID
      if (bookingResponse && bookingResponse.id) {
        console.log("Réservation créée avec succès, ID:", bookingResponse.id);
        
        // Préparer les données de paiement selon la méthode choisie
        const paymentData = {
          payment_method: bookingData.paymentMethod
        };
        
        // Ajouter les détails spécifiques selon la méthode de paiement
        if (bookingData.paymentMethod === 'mobile_money') {
          paymentData.phone_number = bookingData.mobileMoneyNumber;
          paymentData.mobile_operator = mobileOperator;
        }
  
        try {
          const paymentResponse = await postData(`/bookings/bookings/${bookingResponse.id}/initiate_payment/`, paymentData);
  
          setBookingComplete(true);
          setBookingResult({
            bookingId: bookingResponse.id,
            paymentUrl: paymentResponse.payment_url,
            transactionId: paymentResponse.transaction_id,
            notchpayReference: paymentResponse.notchpay_reference
          });
  
          // Redirection vers la page de paiement NotchPay
          if (paymentResponse.payment_url) {
            window.open(paymentResponse.payment_url, '_blank');
          }
  
          success('Réservation créée avec succès. Veuillez compléter le paiement.');
          
          // Vérifier périodiquement le statut du paiement
          checkPaymentStatus(bookingResponse.id);
        } catch (paymentErr) {
          console.error('Erreur lors de l\'initiation du paiement:', paymentErr);
          notifyError(paymentErr.response?.data?.detail || 'Une erreur est survenue lors de l\'initiation du paiement. La réservation a été créée mais le paiement n\'a pas pu être initié.');
          
          // Même en cas d'erreur de paiement, marquer la réservation comme complète pour permettre la navigation
          setBookingComplete(true);
          setBookingResult({
            bookingId: bookingResponse.id,
            paymentUrl: null,
            error: true
          });
        }
      } else {
        console.error('Réponse de création de réservation invalide:', bookingResponse);
        notifyError('La réservation a été créée mais une erreur technique est survenue. Veuillez contacter le support.');
      }
    } catch (err) {
      console.error('Erreur lors de la création de la réservation:', err);
      notifyError(err.response?.data?.detail || 'Une erreur est survenue lors de la création de la réservation');
    } finally {
      setBookingInProgress(false);
    }
  };
  
    // Procéder à l'étape suivante
    const nextStep = () => {
      setCurrentStep(2);
      window.scrollTo(0, 0);
    };
  
    // Revenir à l'étape précédente
    const prevStep = () => {
      setCurrentStep(1);
      window.scrollTo(0, 0);
    };
  
    // Gérer le retour après la réservation
    const handleAfterBooking = () => {
      if (bookingResult) {
        // Rediriger vers la page de détail de la réservation
        navigate(`/bookings/${bookingResult.bookingId}`);
      } else {
        // Rediriger vers la liste des réservations
        navigate('/bookings');
      }
    };
  
    // Affichage en cas de chargement
    if (loading) {
      return (
        <Layout>
          <div className="min-h-screen flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        </Layout>
      );
    }
  
    // Affichage en cas d'erreur
    if (error) {
      return (
        <Layout>
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto bg-red-50 text-red-700 p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4">Erreur</h2>
              <p>{error}</p>
              <Button 
                variant="primary" 
                className="mt-4" 
                onClick={() => navigate(`/properties/${propertyId}`)}
              >
                Retour à la propriété
              </Button>
            </div>
          </div>
        </Layout>
      );
    }
  
    // Calcul du prix final
    const finalPrice = calculatePrice();
  
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Étapes de progression */}
            {!bookingComplete && (
              <div className="mb-8">
                <div className="flex justify-between mb-2">
                  <div 
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      currentStep >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    1
                  </div>
                  <div className="flex-1 h-1 mx-2 bg-gray-200">
                    <div 
                      className="h-full bg-primary-600" 
                      style={{ width: currentStep > 1 ? '100%' : '0%' }}
                    ></div>
                  </div>
                  <div 
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      currentStep >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    2
                  </div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Récapitulatif</span>
                  <span>Paiement</span>
                </div>
              </div>
            )}
  
            {/* Contenu principal selon l'étape */}
            {bookingComplete ? (
              // Étape 3: Confirmation de réservation
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-md p-6 md:p-8"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiCheck className="text-green-600" size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Réservation effectuée</h2>
                  <p className="text-gray-600">
                    Votre réservation a été enregistrée avec succès. Veuillez compléter le paiement pour la confirmer.
                  </p>
                </div>
  
                {bookingResult && bookingResult.paymentUrl && (
                  <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start">
                      <FiInfo className="text-yellow-600 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-yellow-800 mb-2">Paiement en attente</p>
                        <p className="text-yellow-700 mb-4">
                          Veuillez compléter votre paiement en cliquant sur le lien ci-dessous. Votre réservation sera confirmée dès réception du paiement.
                        </p>
                        <a 
                          href={bookingResult.paymentUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-primary-600 font-medium hover:underline"
                        >
                          Payer maintenant <FiExternalLink className="ml-1" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}
  
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h3 className="text-lg font-semibold mb-4">Que se passe-t-il ensuite ?</h3>
                  <div className="space-y-4">
                    <div className="flex">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                        <span className="font-semibold text-primary-600">1</span>
                      </div>
                      <div>
                        <p className="font-medium">Confirmation du propriétaire</p>
                        <p className="text-gray-600 text-sm">
                          Le propriétaire confirmera votre réservation dès que votre paiement sera reçu.
                        </p>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                        <span className="font-semibold text-primary-600">2</span>
                      </div>
                      <div>
                        <p className="font-medium">Communication avec le propriétaire</p>
                        <p className="text-gray-600 text-sm">
                          Vous pourrez communiquer avec le propriétaire via notre messagerie pour organiser votre arrivée.
                        </p>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                        <span className="font-semibold text-primary-600">3</span>
                      </div>
                      <div>
                        <p className="font-medium">Profitez de votre séjour</p>
                        <p className="text-gray-600 text-sm">
                          Rendez-vous à la propriété à la date convenue et profitez de votre séjour !
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
  
                <div className="mt-8 flex flex-col md:flex-row md:justify-center space-y-4 md:space-y-0 md:space-x-4">
                  <Button
                    variant="primary"
                    onClick={handleAfterBooking}
                  >
                    Voir mes réservations
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => navigate('/properties')}
                  >
                    Continuer l'exploration
                  </Button>
                </div>
              </motion.div>
            ) : currentStep === 1 ? (
              // Étape 1: Récapitulatif de la réservation
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8"
              >
                {/* Informations de réservation */}
                <div className="md:col-span-2">
                  <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-2xl font-semibold mb-6">Récapitulatif de la réservation</h2>
                    
                    {/* Détails de la propriété */}
                    <div className="flex mb-6 pb-6 border-b border-gray-200">
                      <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                        {property?.images && property.images.length > 0 ? (
                          <img 
                            src={property.images[0].image} 
                            alt={property.title} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200"></div>
                        )}
                      </div>
                      <div className="ml-4">
                        <h3 className="font-medium mb-1">{property?.title}</h3>
                        <div className="text-sm text-gray-600 mb-2">
                          {property?.city_name}, {property?.neighborhood_name}
                        </div>
                        <div className="text-sm flex items-center">
                          <FiHome className="mr-1" />
                          <span>{property?.property_type}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Dates et voyageurs */}
                    <div className="mb-6 pb-6 border-b border-gray-200">
                      <h3 className="font-medium mb-4">Détails du séjour</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Arrivée</div>
                          <div className="flex items-center">
                            <FiCalendar className="mr-2 text-gray-500" />
                            <span>{new Date(checkIn).toLocaleDateString('fr-FR', { 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric' 
                            })}</span>
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Départ</div>
                          <div className="flex items-center">
                            <FiCalendar className="mr-2 text-gray-500" />
                            <span>{new Date(checkOut).toLocaleDateString('fr-FR', { 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric' 
                            })}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <div className="text-sm text-gray-600 mb-1">Voyageurs</div>
                        <div className="flex items-center">
                          <FiUsers className="mr-2 text-gray-500" />
                          <span>{guests} {guests > 1 ? 'voyageurs' : 'voyageur'}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Demandes spéciales */}
                    <div>
                      <h3 className="font-medium mb-3">Demandes spéciales (optionnel)</h3>
                      <textarea
                        name="specialRequests"
                        value={bookingData.specialRequests}
                        onChange={handleInputChange}
                        placeholder="Informations complémentaires pour le propriétaire (heure d'arrivée, demandes particulières...)"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        rows={4}
                      ></textarea>
                    </div>
                  </div>
                  
                  {/* Information sur le paiement */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="font-semibold mb-4">Politique d'annulation</h3>
                    <p className="text-gray-700 mb-4">
                      {property?.cancellation_policy === 'flexible' ? (
                        "Annulation gratuite jusqu'à 24 heures avant l'arrivée. Annulation après ce délai : remboursement de 50% du montant payé."
                      ) : property?.cancellation_policy === 'moderate' ? (
                        "Annulation gratuite jusqu'à 5 jours avant l'arrivée. Annulation après ce délai : remboursement de 50% du montant payé."
                      ) : (
                        "Annulation gratuite jusqu'à 14 jours avant l'arrivée. Annulation après ce délai : remboursement de 50% du montant payé."
                      )}
                    </p>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="agreedToTerms"
                        name="agreedToTerms"
                        checked={bookingData.agreedToTerms}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <label htmlFor="agreedToTerms" className="ml-2 text-gray-700">
                        J'accepte les conditions générales et la politique d'annulation
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Récapitulatif du prix */}
                <div className="md:col-span-1">
                  <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
                    <h3 className="font-semibold mb-4">Détails du prix</h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>{finalPrice?.nights} nuits x {property?.price_per_night?.toLocaleString()} FCFA</span>
                        <span>{finalPrice?.basePrice?.toLocaleString()} FCFA</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Frais de ménage</span>
                        <span>{finalPrice?.cleaningFee?.toLocaleString()} FCFA</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Frais de service</span>
                        <span>{finalPrice?.serviceFee?.toLocaleString()} FCFA</span>
                      </div>
                      
                      {finalPrice?.discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Réduction</span>
                          <span>-{finalPrice.discount.toLocaleString()} FCFA</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Code promo */}
                    <div className="mt-4 mb-4">
                      <div className="relative">
                        <Input
                          name="promoCode"
                          value={bookingData.promoCode}
                          onChange={handleInputChange}
                          placeholder="Code promo"
                          error={promoCodeError}
                        />
                        <button
                          type="button"
                          onClick={validatePromoCode}
                          disabled={promoCodeLoading || !bookingData.promoCode}
                          className="absolute right-2 top-2 px-3 py-1 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700 disabled:opacity-50"
                        >
                          {promoCodeLoading ? '...' : 'Appliquer'}
                        </button>
                      </div>
                      
                      {promoCodeDetails && (
                        <div className="mt-2 text-sm text-green-600 flex items-center">
                          <FiCheck className="mr-1" />
                          <span>Code promo appliqué : -{promoCodeDetails.discount_percentage}%</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Prix total */}
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>{finalPrice?.totalPrice?.toLocaleString()} FCFA</span>
                      </div>
                    </div>
                    
                    {/* Bouton pour continuer */}
                    <Button
                      variant="primary"
                      fullWidth
                      size="lg"
                      className="mt-6"
                      onClick={nextStep}
                      disabled={!bookingData.agreedToTerms}
                    >
                      Continuer vers le paiement
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              // Étape 2: Paiement
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8"
              >
                {/* Informations de paiement */}
                <div className="md:col-span-2">
                  <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-2xl font-semibold mb-6">Méthode de paiement</h2>
                    
                    {/* Sélection de la méthode de paiement */}
                    <div className="mb-6">
                      <h3 className="font-medium mb-3">Choisissez votre méthode de paiement</h3>
                      
                      <div className="space-y-3">
                        <div 
                          className={`border rounded-lg p-4 cursor-pointer ${
                            bookingData.paymentMethod === 'mobile_money' 
                              ? 'border-primary-500 bg-primary-50' 
                              : 'border-gray-300 hover:border-primary-300'
                          }`}
                          onClick={() => setBookingData(prev => ({ ...prev, paymentMethod: 'mobile_money' }))}
                        >
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id="mobile_money"
                              name="paymentMethod"
                              value="mobile_money"
                              checked={bookingData.paymentMethod === 'mobile_money'}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                            />
                            <label htmlFor="mobile_money" className="ml-2 flex items-center">
                              <FiSmartphone className="mr-2" />
                              <span className="font-medium">Mobile Money</span>
                            </label>
                          </div>
                          
                          {/* Sélection de l'opérateur Mobile Money */}
                          {bookingData.paymentMethod === 'mobile_money' && (
                            <div className="mt-4">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Opérateur Mobile Money
                              </label>
                              <div className="grid grid-cols-3 gap-2 mt-2">
                                <div 
                                  className={`
                                    border rounded-lg p-3 cursor-pointer text-center transition-all
                                    ${mobileOperator === 'orange' 
                                      ? 'border-orange-500 bg-orange-50 text-orange-700' 
                                      : 'border-gray-300 hover:border-orange-300'}
                                  `}
                                  onClick={() => setMobileOperator('orange')}
                                >
                                  <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mb-2">
                                      <span className="text-orange-700 font-semibold">OM</span>
                                    </div>
                                    <span className="text-sm">Orange Money</span>
                                  </div>
                                </div>
                                
                                <div 
                                  className={`
                                    border rounded-lg p-3 cursor-pointer text-center transition-all
                                    ${mobileOperator === 'mtn' 
                                      ? 'border-yellow-500 bg-yellow-50 text-yellow-700' 
                                      : 'border-gray-300 hover:border-yellow-300'}
                                  `}
                                  onClick={() => setMobileOperator('mtn')}
                                >
                                  <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mb-2">
                                      <span className="text-yellow-700 font-semibold">MM</span>
                                    </div>
                                    <span className="text-sm">MTN MoMo</span>
                                  </div>
                                </div>
                                
                                <div 
                                  className={`
                                    border rounded-lg p-3 cursor-pointer text-center transition-all
                                    ${mobileOperator === 'mobile_money' 
                                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                                      : 'border-gray-300 hover:border-blue-300'}
                                  `}
                                  onClick={() => setMobileOperator('mobile_money')}
                                >
                                  <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                                      <span className="text-blue-700 font-semibold">Auto</span>
                                    </div>
                                    <span className="text-sm">Automatique</span>
                                  </div>
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {mobileOperator === 'orange' 
                                  ? "Utilisez votre compte Orange Money pour effectuer le paiement." 
                                  : mobileOperator === 'mtn'
                                    ? "Utilisez votre compte MTN Mobile Money pour effectuer le paiement."
                                    : "La détection automatique déterminera l'opérateur en fonction de votre numéro."}
                              </p>
                              {/* AJOUT DU CHAMP DE NUMÉRO DE TÉLÉPHONE (partie manquante) */}
                              <div className="mt-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Numéro de téléphone Mobile Money
                                </label>
                                <Input
                                  type="tel"
                                  name="mobileMoneyNumber"
                                  value={bookingData.mobileMoneyNumber}
                                  onChange={handleInputChange}
                                  placeholder="Ex: 6XXXXXXXX"
                                  required={bookingData.paymentMethod === 'mobile_money'}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Entrez votre numéro sans le code pays (ex: 656789012)
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div 
                          className={`border rounded-lg p-4 cursor-pointer ${
                            bookingData.paymentMethod === 'credit_card' 
                              ? 'border-primary-500 bg-primary-50' 
                              : 'border-gray-300 hover:border-primary-300'
                          }`}
                          onClick={() => setBookingData(prev => ({ ...prev, paymentMethod: 'credit_card' }))}
                        >
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id="credit_card"
                              name="paymentMethod"
                              value="credit_card"
                              checked={bookingData.paymentMethod === 'credit_card'}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                            />
                            <label htmlFor="credit_card" className="ml-2 flex items-center">
                              <FiCreditCard className="mr-2" />
                              <span className="font-medium">Carte Bancaire</span>
                            </label>
                          </div>
                        </div>
                        
                        <div 
                          className={`border rounded-lg p-4 cursor-pointer ${
                            bookingData.paymentMethod === 'bank_transfer' 
                              ? 'border-primary-500 bg-primary-50' 
                              : 'border-gray-300 hover:border-primary-300'
                          }`}
                          onClick={() => setBookingData(prev => ({ ...prev, paymentMethod: 'bank_transfer' }))}
                        >
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id="bank_transfer"
                              name="paymentMethod"
                              value="bank_transfer"
                              checked={bookingData.paymentMethod === 'bank_transfer'}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                            />
                            <label htmlFor="bank_transfer" className="ml-2 flex items-center">
                              <FiDollarSign className="mr-2" />
                              <span className="font-medium">Virement Bancaire</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Informations sur le processus de paiement */}
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <div className="flex items-start">
                        <FiInfo className="text-yellow-600 mt-1 mr-3" />
                        <div>
                          <h4 className="font-medium text-yellow-800 mb-1">Comment fonctionne le paiement ?</h4>
                          <p className="text-yellow-700 text-sm">
                            Une fois votre réservation confirmée, vous serez redirigé vers notre partenaire de paiement
                            sécurisé pour finaliser la transaction. Votre réservation sera confirmée dès réception du
                            paiement.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Récapitulatif du prix */}
                <div className="md:col-span-1">
                  <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
                    <h3 className="font-semibold mb-4">Récapitulatif</h3>
                    
                    <div className="mb-4 pb-4 border-b border-gray-200">
                      <div className="text-sm text-gray-600 mb-2">Propriété</div>
                      <div className="font-medium">{property?.title}</div>
                    </div>
                    
                    <div className="mb-4 pb-4 border-b border-gray-200">
                      <div className="text-sm text-gray-600 mb-2">Dates</div>
                      <div>
                        {new Date(checkIn).toLocaleDateString('fr-FR', { 
                          day: 'numeric', 
                          month: 'short'
                        })} - {new Date(checkOut).toLocaleDateString('fr-FR', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {finalPrice?.nights} nuits · {guests} {guests > 1 ? 'voyageurs' : 'voyageur'}
                      </div>
                    </div>
                    
                    {/* Prix */}
                    <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                      <div className="flex justify-between">
                        <span>{finalPrice?.nights} nuits</span>
                        <span>{finalPrice?.basePrice?.toLocaleString()} FCFA</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Frais de ménage</span>
                        <span>{finalPrice?.cleaningFee?.toLocaleString()} FCFA</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Frais de service</span>
                        <span>{finalPrice?.serviceFee?.toLocaleString()} FCFA</span>
                      </div>
                      
                      {finalPrice?.discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Réduction</span>
                          <span>-{finalPrice.discount.toLocaleString()} FCFA</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Prix total */}
                    <div className="flex justify-between font-bold text-lg mb-6">
                      <span>Total</span>
                      <span>{finalPrice?.totalPrice?.toLocaleString()} FCFA</span>
                    </div>
                    
                    {/* Boutons */}
                    <div className="space-y-3">
                      <Button
                        variant="primary"
                        fullWidth
                        onClick={submitBooking}
                        disabled={bookingInProgress || 
                                  (bookingData.paymentMethod === 'mobile_money' && !bookingData.mobileMoneyNumber)}
                      >
                        {bookingInProgress ? (
                          <span className="flex items-center justify-center">
                            <LoadingSpinner size="sm" color="white" className="mr-2" />
                            Traitement...
                          </span>
                        ) : (
                          "Confirmer et payer"
                        )}
                      </Button>
                      
                      <Button
                        variant="secondary"
                        fullWidth
                        onClick={prevStep}
                        disabled={bookingInProgress}
                      >
                        Retour
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </Layout>
    );
  };
  
  export default BookingNew;