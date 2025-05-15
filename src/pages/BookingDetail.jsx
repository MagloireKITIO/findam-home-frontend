// src/pages/BookingDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiClock, FiCheck, FiX, FiCalendar, FiHome, FiUser,
  FiMapPin, FiDollarSign, FiCreditCard, FiStar, FiInfo,
  FiMessageSquare, FiDownload, FiShare2, FiAlertTriangle,
  FiAlertCircle
} from 'react-icons/fi';

import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import api from '../services/api';
import useApi from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import CancellationPolicy from '../components/booking/CancellationPolicy';

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { success, error: notifyError } = useNotification();
  const { fetchData, postData, loading: apiLoading, error: apiError } = useApi();

  // États
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [reviewData, setReviewData] = useState({
    rating: 5,
    cleanliness_rating: 5,
    location_rating: 5,
    value_rating: 5,
    communication_rating: 5,
    comment: '',
    title: ''
  });
  const [cancelLoading, setCancelLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [gracePeriodMinutes, setGracePeriodMinutes] = useState(30);


  // Charger les détails de la réservation

  useEffect(() => {
    // Si la réservation est chargée et que son statut de paiement est en attente
    if (booking && (booking.payment_status === 'pending' || booking.payment_status === 'authorized')) {
      // Vérifier le statut du paiement périodiquement
      const checkStatusInterval = setInterval(async () => {
        try {
          const statusResponse = await api.get(`/bookings/bookings/${id}/check_payment_status/`);
          if (statusResponse.data.payment_status === 'paid' || 
              statusResponse.data.status === 'completed' || 
              statusResponse.data.details?.status === 'complete') {
            // Recharger les données de la réservation si le paiement est confirmé
            const response = await api.get(`/bookings/bookings/${id}/`);
            setBooking(response.data);
            clearInterval(checkStatusInterval);
            success('Paiement confirmé ! Votre réservation est validée.');
          }
        } catch (error) {
          console.error('Erreur lors de la vérification du statut:', error);
        }
      }, 5000); // Vérifier toutes les 5 secondes
      
      // Nettoyage
      return () => clearInterval(checkStatusInterval);
    }
  }, [booking, id]);
 
    useEffect(() => {
      const getBookingDetails = async () => {
        setLoading(true);
        setError(null);
    
        try {
          // Vérifier si l'ID est complet ou tronqué
          let bookingId = id;
          
          // Si l'ID est court et ne contient pas de tirets, c'est probablement tronqué
          // UUID complet format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
          if (id && !id.includes('-') && id.length < 32) {
            // Récupérer l'ID complet depuis les paramètres d'URL ou localStorage
            const fullId = new URLSearchParams(window.location.search).get('full_id');
            if (fullId) {
              bookingId = fullId;
            } else {
              // Essayer de récupérer depuis le localStorage (si stocké lors du paiement)
              const storedBookings = localStorage.getItem('recent_bookings');
              if (storedBookings) {
                try {
                  const bookings = JSON.parse(storedBookings);
                  const matchingBooking = bookings.find(b => b.id.startsWith(id));
                  if (matchingBooking) {
                    bookingId = matchingBooking.id;
                  }
                } catch (e) {
                  console.error('Erreur lors de la récupération des réservations stockées:', e);
                }
              }
            }
          }
    
          const response = await api.get(`/bookings/bookings/${bookingId}/`);
          setBooking(response.data);
        } catch (err) {
          console.error('Erreur lors du chargement des détails de la réservation:', err);
          if (err.response?.status === 404) {
            setError('Cette réservation n\'existe pas ou a été supprimée.');
          } else {
            setError('Une erreur est survenue lors du chargement des détails de la réservation.');
          }
        } finally {
          setLoading(false);
        }
      };
    
      getBookingDetails();
    }, [id]);

    useEffect(() => {
      // Récupérer la configuration de la période de grâce
      const getGracePeriodConfig = async () => {
        try {
          const response = await api.get('/config/system/by_key/', {
            params: { key: 'CANCELLATION_GRACE_PERIOD_MINUTES' }
          });
          
          if (response.data && response.data.value) {
            setGracePeriodMinutes(parseInt(response.data.value, 10));
          }
        } catch (err) {
          console.error('Erreur lors de la récupération de la période de grâce:', err);
          // Garder la valeur par défaut en cas d'erreur
        }
      };
      
      getGracePeriodConfig();
    }, []);

  // Fonctions
  // Formater une date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Obtenir le statut formaté
  const getStatusElement = (status, paymentStatus) => {
    // Vérifier d'abord le statut de paiement
    if (paymentStatus === 'pending' || paymentStatus === 'failed') {
      return (
        <div className="flex items-center text-yellow-700 bg-yellow-100 px-4 py-2 rounded-lg">
          <FiClock className="mr-2" size={20} />
          <div>
            <p className="font-medium">Paiement en attente</p>
            <p className="text-sm">Votre réservation sera confirmée après réception du paiement.</p>
          </div>
        </div>
      );
    }

    switch (status) {
      case 'pending':
        return (
          <div className="flex items-center text-blue-700 bg-blue-100 px-4 py-2 rounded-lg">
            <FiClock className="mr-2" size={20} />
            <div>
              <p className="font-medium">En attente de confirmation</p>
              <p className="text-sm">Le propriétaire doit confirmer votre réservation.</p>
            </div>
          </div>
        );
      case 'confirmed':
        return (
          <div className="flex items-center text-green-700 bg-green-100 px-4 py-2 rounded-lg">
            <FiCheck className="mr-2" size={20} />
            <div>
              <p className="font-medium">Réservation confirmée</p>
              <p className="text-sm">Votre séjour est confirmé. Profitez de votre voyage !</p>
            </div>
          </div>
        );
      case 'completed':
        return (
          <div className="flex items-center text-green-700 bg-green-100 px-4 py-2 rounded-lg">
            <FiCheck className="mr-2" size={20} />
            <div>
              <p className="font-medium">Séjour terminé</p>
              <p className="text-sm">Nous espérons que vous avez passé un excellent séjour.</p>
            </div>
          </div>
        );
      case 'cancelled':
        return (
          <div className="flex items-center text-red-700 bg-red-100 px-4 py-2 rounded-lg">
            <FiX className="mr-2" size={20} />
            <div>
              <p className="font-medium">Réservation annulée</p>
              <p className="text-sm">Cette réservation a été annulée {booking.cancelled_at && `le ${formatDate(booking.cancelled_at)}`}.</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center text-gray-700 bg-gray-100 px-4 py-2 rounded-lg">
            <FiInfo className="mr-2" size={20} />
            <div>
              <p className="font-medium">Statut: {status}</p>
            </div>
          </div>
        );
    }
  };

  {booking && booking.status === 'cancelled' && booking.payment_status === 'refunded' && (
    <div className="flex items-center text-green-700 bg-green-100 px-4 py-2 rounded-lg mt-2">
      <FiCheck className="mr-2" size={20} />
      <div>
        <p className="font-medium">Remboursement effectué</p>
        <p className="text-sm">Un remboursement a été effectué suite à cette annulation.</p>
      </div>
    </div>
  )}
  
  {booking && booking.status === 'cancelled' && booking.payment_status === 'paid' && (
    <div className="flex items-center text-yellow-700 bg-yellow-100 px-4 py-2 rounded-lg mt-2">
      <FiClock className="mr-2" size={20} />
      <div>
        <p className="font-medium">Remboursement en cours</p>
        <p className="text-sm">Votre remboursement est en cours de traitement selon la politique d'annulation applicable.</p>
      </div>
    </div>
  )}

  // Calculer si l'utilisateur peut annuler
  const canCancel = () => {
    if (!booking) return false;
    
    const notCancellableStatuses = ['completed', 'cancelled'];
    if (notCancellableStatuses.includes(booking.status)) return false;
    
    // Vérifier si la date d'arrivée n'est pas déjà passée
    const today = new Date();
    const checkInDate = new Date(booking.check_in_date);
    return today < checkInDate;
  };

  // Calculer si l'utilisateur peut laisser un avis
  const canReview = () => {
    if (!booking) return false;
    
    // On peut laisser un avis si la réservation est terminée et qu'on n'a pas déjà laissé un avis
    return booking.status === 'completed' && !booking.review;
  };

  // Vérifier si une action de paiement est nécessaire
  const needsPaymentAction = () => {
    if (!booking) return false;
    
    return booking.payment_status === 'pending' || booking.payment_status === 'failed';
  };

  // Calculer le temps restant pour le paiement
  const getPaymentTimeRemaining = () => {
    if (!booking || !booking.created_at) return null;
    
    // On donne 24h pour effectuer le paiement
    const createdDate = new Date(booking.created_at);
    const paymentDeadline = new Date(createdDate);
    paymentDeadline.setHours(paymentDeadline.getHours() + 24);
    
    const now = new Date();
    const remainingMs = paymentDeadline - now;
    
    if (remainingMs <= 0) return 'Délai expiré';
    
    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}min`;
  };

  // Actions
  // Gérer l'annulation
  const handleCancel = async () => {
    if (!canCancel()) return;
    
    setCancelLoading(true);
    
    try {
      const response = await postData(`/bookings/bookings/${id}/cancel/`, {
        reason: cancelReason
      });
      
      // Recharger les données
      const bookingResponse = await api.get(`/bookings/bookings/${id}/`);
      setBooking(bookingResponse.data);
      
      // Afficher les détails du remboursement si disponibles
      if (response.cancellation_info && response.cancellation_info.refund_info) {
        const refundInfo = response.cancellation_info.refund_info;
        const refundAmount = refundInfo.amount.toLocaleString();
        const refundPercentage = refundInfo.percentage;
        
        success(
          `Réservation annulée avec succès. Remboursement de ${refundAmount} FCFA (${refundPercentage}%) ${
            refundInfo.status === 'completed' ? 'effectué' : 'en cours de traitement'
          }.`
        );
      } else {
        success('Réservation annulée avec succès');
      }
      
      setShowCancelModal(false);
    } catch (err) {
      console.error('Erreur lors de l\'annulation de la réservation:', err);
      
      // Afficher un message d'erreur plus détaillé si disponible
      if (err.response?.data?.detail) {
        notifyError(err.response.data.detail);
      } else {
        notifyError('Une erreur est survenue lors de l\'annulation de la réservation');
      }
    } finally {
      setCancelLoading(false);
    }
  };

  // Gérer la soumission d'un avis
  const handleReviewSubmit = async () => {
    if (!canReview()) return;
    
    setReviewLoading(true);
    
    try {
      await postData('/bookings/reviews/', {
        booking: id,
        ...reviewData
      });
      
      // Recharger les données
      const response = await api.get(`/bookings/bookings/${id}/`);
      setBooking(response.data);
      
      success('Avis publié avec succès');
      setShowReviewModal(false);
    } catch (err) {
      console.error('Erreur lors de la publication de l\'avis:', err);
      notifyError('Une erreur est survenue lors de la publication de l\'avis');
    } finally {
      setReviewLoading(false);
    }
  };

  // Gérer la reprise du paiement
  const resumePayment = async () => {
    try {
      const response = await postData(`/bookings/bookings/${id}/initiate_payment/`, {
        payment_method: 'mobile_money' // Par défaut
      });
      
      // Rediriger vers la page de paiement
      if (response.payment_url) {
        window.open(response.payment_url, '_blank');
      }
      
      success('Redirection vers la page de paiement...');
    } catch (err) {
      console.error('Erreur lors de l\'initialisation du paiement:', err);
      notifyError('Une erreur est survenue lors de l\'initialisation du paiement');
    }
  };

  // Gérer le changement dans le formulaire d'avis
  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewData(prev => ({ ...prev, [name]: value }));
  };

  // Contacter le propriétaire
  const contactOwner = async () => {
    try {
      // Vérifier si une conversation existe déjà
      const response = await postData('/communications/conversations/start_conversation/', {
        property_id: booking.property.id,
        message: `Bonjour, j'ai des questions concernant ma réservation du ${formatDate(booking.check_in_date)} au ${formatDate(booking.check_out_date)}.`
      });
      
      success('Conversation démarrée avec succès');
      navigate('/messages', { state: { conversationId: response.id } });
    } catch (err) {
      console.error('Erreur lors du démarrage de la conversation:', err);
      notifyError('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  const calculateNights = (checkInDate, checkOutDate) => {
 if (!checkInDate || !checkOutDate) return 0;
 
 const checkIn = new Date(checkInDate);
 const checkOut = new Date(checkOutDate);
 
 // Calculer la différence en millisecondes puis convertir en jours
 const diffTime = Math.abs(checkOut - checkIn);
 const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
 
 return diffDays;
};


  // Télécharger le reçu
  const downloadReceipt = async () => {
    try {
      setLoading(true);
      
      // Faire la requête pour télécharger le PDF
      const response = await api.get(`/bookings/bookings/${id}/download_receipt/`, {
        responseType: 'blob', // Important pour les fichiers
      });
      
      // Créer un blob et un lien de téléchargement
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Créer un élément <a> temporaire pour déclencher le téléchargement
      const link = document.createElement('a');
      link.href = url;
      link.download = `facture-${id.substring(0, 8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Nettoyer
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      success('Facture téléchargée avec succès');
    } catch (err) {
      console.error('Erreur lors du téléchargement de la facture:', err);
      
      if (err.response?.status === 403) {
        notifyError('Vous n\'êtes pas autorisé à télécharger cette facture');
      } else if (err.response?.status === 400) {
        notifyError('La facture n\'est disponible que pour les réservations payées');
      } else {
        notifyError('Erreur lors du téléchargement de la facture');
      }
    } finally {
      setLoading(false);
    }
  };
  // Rendu lors du chargement ou erreur
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

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
              onClick={() => navigate('/bookings')}
            >
              Retour à mes réservations
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!booking) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-500">Aucune donnée disponible</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Bouton de retour */}
          <div className="mb-6">
            <Link to="/bookings" className="text-primary-600 hover:underline flex items-center">
              &larr; Retour à mes réservations
            </Link>
          </div>
          
          {/* Titre et statut */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Réservation #{id.substring(0, 8)}</h1>
            {getStatusElement(booking.status, booking.payment_status)}
          </div>
          
          {/* Actions rapides */}
          <div className="flex flex-wrap gap-3 mb-8">
            {needsPaymentAction() && (
              <Button
                variant="primary"
                icon={<FiCreditCard />}
                onClick={resumePayment}
              >
                Compléter le paiement
                {getPaymentTimeRemaining() && (
                  <span className="ml-2 text-xs bg-white bg-opacity-20 px-2 py-0.5 rounded">
                    {getPaymentTimeRemaining()}
                  </span>
                )}
              </Button>
            )}
            
            {canCancel() && (
              <Button
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-50"
                icon={<FiX />}
                onClick={() => setShowCancelModal(true)}
              >
                Annuler
              </Button>
            )}
            
            {canReview() && (
              <Button
                variant="outline"
                icon={<FiStar />}
                onClick={() => setShowReviewModal(true)}
              >
                Laisser un avis
              </Button>
            )}
            
            <Button
              variant="outline"
              icon={<FiMessageSquare />}
              onClick={() => contactOwner()}
            >
              Contacter
            </Button>
            
            {booking.payment_status === 'paid' && (
              <Button
                variant="outline"
                icon={<FiDownload />}
                onClick={downloadReceipt}
              >
                Reçu
              </Button>
            )}
            
            <Button
              variant="outline"
              icon={<FiShare2 />}
              onClick={() => {/* Fonctionnalité à venir */}}
            >
              Partager
            </Button>
          </div>
          
          {/* Contenu principal */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Colonne gauche */}
            <div className="md:col-span-2">
              {/* Détails du logement */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Détails du logement</h2>
                
                <div className="flex">
                  <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    {booking.property?.main_image ? (
                      <img 
                        src={booking.property.main_image} 
                        alt={booking.property.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <FiHome className="text-gray-400" size={32} />
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4">
                    <h3 className="font-medium mb-1">
                      <Link 
                        to={`/properties/${booking.property?.id}`}
                        className="text-primary-600 hover:underline"
                      >
                        {booking.property?.title}
                      </Link>
                    </h3>
                    
                    <div className="text-sm text-gray-600 mb-2 flex items-center">
                      <FiMapPin className="mr-1" size={14} />
                      <span>{booking.property?.city_name}, {booking.property?.neighborhood_name}</span>
                    </div>
                    
                    <div className="text-sm flex items-center">
                      <FiHome className="mr-1" size={14} />
                      <span>{booking.property?.property_type}</span>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 mt-4 pt-4">
                  <h3 className="font-medium mb-3">Dates et voyageurs</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Arrivée</div>
                      <div className="flex items-center">
                        <FiCalendar className="mr-2 text-gray-500" size={14} />
                        <span>{formatDate(booking.check_in_date)}</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-600">Départ</div>
                      <div className="flex items-center">
                        <FiCalendar className="mr-2 text-gray-500" size={14} />
                        <span>{formatDate(booking.check_out_date)}</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-600">Voyageurs</div>
                      <div className="flex items-center">
                        <FiUser className="mr-2 text-gray-500" size={14} />
                        <span>{booking.guests_count} {booking.guests_count > 1 ? 'personnes' : 'personne'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {booking.special_requests && (
                  <div className="border-t border-gray-200 mt-4 pt-4">
                    <h3 className="font-medium mb-2">Demandes spéciales</h3>
                    <p className="text-gray-700 whitespace-pre-line">{booking.special_requests}</p>
                  </div>
                )}
              </div>
              
              {/* Coordonnées du propriétaire */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Propriétaire</h2>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-4">
                    {booking.property?.owner_avatar ? (
                      <img 
                        src={booking.property.owner_avatar} 
                        alt={booking.owner_name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FiUser size={24} className="text-gray-500" />
                    )}
                  </div>
                  
                  <div>
                    <div className="font-medium">{booking.owner_name}</div>
                    <button 
                      className="text-primary-600 text-sm hover:underline"
                      onClick={() => contactOwner()}
                    >
                      Contacter
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Politique d'annulation */}
              {canCancel() && booking && (
              <CancellationPolicy
                policyType={booking.property?.cancellation_policy || 'moderate'}
                checkInDate={booking.check_in_date}
                basePrice={booking.base_price || 0}
                cleaningFee={booking.cleaning_fee || 0}
                serviceFee={booking.service_fee || 0}
                gracePeriodMinutes={30} // On utilise une valeur par défaut, à remplacer par la valeur dynamique si disponible
                reservationTime={booking.created_at} // Heure de la réservation pour calculer la période de grâce
              />
            )}

            {booking && !canCancel() && booking.status !== 'cancelled' && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Politique d'annulation</h2>
                
                <p className="text-gray-700 mb-4">
                  {booking.property?.cancellation_policy === 'flexible' ? (
                    "Annulation gratuite jusqu'à 24 heures avant l'arrivée. Annulation après ce délai : remboursement de 50% du montant payé."
                  ) : booking.property?.cancellation_policy === 'moderate' ? (
                    "Annulation gratuite jusqu'à 5 jours avant l'arrivée. Annulation après ce délai : remboursement de 50% du montant payé."
                  ) : (
                    "Annulation gratuite jusqu'à 14 jours avant l'arrivée. Annulation après ce délai : remboursement de 50% du montant payé."
                  )}
                </p>
                
                <div className="text-sm text-red-600">
                  <FiAlertCircle className="inline-block mr-1" />
                  L'annulation n'est plus possible pour cette réservation.
                </div>
              </div>
            )}

            {booking && booking.status === 'cancelled' && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Détails de l'annulation</h2>
                
                <div className="flex items-start mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3 flex-shrink-0">
                    <FiX className="text-red-500" size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium">Réservation annulée</h3>
                    <p className="text-gray-700">
                      Cette réservation a été annulée le {formatDate(booking.cancelled_at)} {
                        booking.cancelled_by === booking.tenant?.id ? 'par le locataire' :
                        booking.cancelled_by === booking.property?.owner?.id ? 'par le propriétaire' : 'par l\'administration'
                      }.
                    </p>
                  </div>
                </div>
                
                {booking.payment_status === 'refunded' && (
                  <div className="p-4 bg-green-50 rounded-md border border-green-200 mt-3">
                    <h3 className="font-medium text-green-700 mb-2">Remboursement effectué</h3>
                    <p className="text-gray-700">
                      {booking.notes && booking.notes.includes('période de grâce')
                        ? "Un remboursement complet a été effectué suite à l'annulation pendant la période de grâce."
                        : `Un remboursement a été effectué conformément à la politique d'annulation ${booking.property?.cancellation_policy || 'applicable'}.`
                      }
                    </p>
                  </div>
                )}
                
                {booking.payment_status === 'pending' && (
                  <div className="p-4 bg-yellow-50 rounded-md border border-yellow-200">
                    <h3 className="font-medium text-yellow-700 mb-2">Remboursement en attente</h3>
                    <p className="text-gray-700">
                      Le remboursement est en cours de traitement et sera effectué selon la politique d'annulation applicable.
                    </p>
                  </div>
                )}
                
                {booking.notes && booking.notes.includes('Annulation:') && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Raison de l'annulation</h3>
                    <div className="p-3 bg-gray-50 rounded-md text-gray-700">
                      {booking.notes.split('Annulation:')[1].trim()}
                    </div>
                  </div>
                )}
              </div>
            )}
            {booking.notes && booking.notes.includes('période de grâce') && (
              <div className="p-4 bg-blue-50 rounded-md border border-blue-200 mt-3">
                <h3 className="font-medium text-blue-700 mb-2">Annulation pendant la période de grâce</h3>
                <p className="text-gray-700">
                  Cette réservation a été annulée pendant la période de grâce accordée après la réservation. 
                  Un remboursement complet a été appliqué (hors frais de service).
                </p>
                <div className="mt-2 text-xs text-gray-500">
                  La période de grâce permet aux locataires d'annuler rapidement sans pénalité en cas d'erreur de réservation.
                </div>
              </div>
            )}
              
              {/* Avis */}
              {booking.review && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">Mon avis</h2>
                  
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, index) => (
                          <FiStar
                            key={index}
                            className={index < booking.review.rating ? "text-yellow-500 fill-current" : "text-gray-300"}
                          />
                        ))}
                      </div>
                      <span className="ml-2 font-medium">{booking.review.rating}/5</span>
                    </div>
                    
                    <h3 className="font-medium">{booking.review.title}</h3>
                    <p className="text-gray-700 mt-2">{booking.review.comment}</p>
                    <div className="text-sm text-gray-500 mt-2">
                      Publié le {formatDate(booking.review.created_at)}
                    </div>
                  </div>
                  
                  {booking.review.owner_reply && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="font-medium mb-2">Réponse de {booking.owner_name}</div>
                      <p className="text-gray-700">{booking.review.owner_reply.content}</p>
                      <div className="text-sm text-gray-500 mt-2">
                        Publiée le {formatDate(booking.review.owner_reply.created_at)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Colonne droite */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
                <h2 className="text-xl font-semibold mb-4">Résumé des prix</h2>
                
                <div className="space-y-3">
                <div className="flex justify-between">
                  <span>
                    {booking.check_in_date && booking.check_out_date 
                      ? calculateNights(booking.check_in_date, booking.check_out_date) 
                      : 0} nuits x {
                        // Calcul du prix par nuit
                        (() => {
                          // Si price_per_night existe, l'utiliser
                          if (booking.price_per_night && booking.price_per_night > 0) {
                            return booking.price_per_night.toLocaleString();
                          }
                          // Sinon, si on a le prix total et le nombre de nuits, calculer le prix par nuit
                          else if (booking.base_price && booking.check_in_date && booking.check_out_date) {
                            const nights = calculateNights(booking.check_in_date, booking.check_out_date);
                            const pricePerNight = nights > 0 ? booking.base_price / nights : 0;
                            return Math.round(pricePerNight).toLocaleString();
                          }
                          // Valeur par défaut
                          return "0";
                        })()
                      } FCFA
                  </span>
                  <span>{(booking.base_price || 0).toLocaleString()} FCFA</span>
                </div>
                  
                  <div className="flex justify-between">
                    <span>Frais de ménage</span>
                    <span>{(booking.cleaning_fee|| 0).toLocaleString()} FCFA</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Frais de service</span>
                    <span>{(booking.service_fee|| 0).toLocaleString()} FCFA</span>
                  </div>
                  
                  {booking.discount_amount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Réduction</span>
                      <span>-{(booking.discount_amount|| 0).toLocaleString()} FCFA</span>
                    </div>
                  )}
                  
                  {booking.promo_code_details && (
                    <div className="flex justify-between text-green-600">
                      <span>Code promo ({booking.promo_code_details.code})</span>
                      <span>-{(((booking.base_price * booking.promo_code_details.discount_percentage) / 100)|| 0).toLocaleString()} FCFA</span>
                    </div>
                  )}
                </div>
                
                <div className="border-t border-gray-200 mt-4 pt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{(booking.total_price|| 0).toLocaleString()} FCFA</span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mt-2 flex items-center">
                    <FiCreditCard className="mr-1" />
                    <span>
                      {booking.payment_status === 'paid' 
                        ? 'Payé' 
                        : booking.payment_status === 'pending' 
                          ? 'Paiement en attente' 
                          : booking.payment_status === 'refunded' 
                            ? 'Remboursé'
                            : booking.payment_status}
                    </span>
                  </div>
                </div>
                
                {needsPaymentAction() && (
                  <div className="mt-6">
                    <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                      <div className="flex items-start">
                        <FiAlertTriangle className="text-yellow-600 mt-1 mr-2" />
                        <div>
                          <p className="font-medium text-yellow-800">Paiement requis</p>
                          <p className="text-sm text-yellow-700">
                            Veuillez compléter votre paiement pour confirmer votre réservation. 
                            {getPaymentTimeRemaining() && ` Temps restant: ${getPaymentTimeRemaining()}`}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="primary"
                      fullWidth
                      icon={<FiCreditCard />}
                      onClick={resumePayment}
                    >
                      Compléter le paiement
                    </Button>
                  </div>
                )}
                
                {booking.payment_status === 'paid' && (
                  <Button
                    variant="outline"
                    fullWidth
                    className="mt-6"
                    icon={<FiDownload />}
                    onClick={downloadReceipt}
                  >
                    Télécharger le reçu
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modales */}
      {/* Modale d'annulation */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Annuler la réservation"
        size="md"
      >
        <div className="space-y-6">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-start">
              <FiAlertTriangle className="text-yellow-600 mt-1 mr-2" />
              <div>
                <p className="font-medium text-yellow-800">Êtes-vous sûr de vouloir annuler ?</p>
                <p className="text-sm text-yellow-700">
                  {booking.property?.cancellation_policy === 'flexible' 
                    ? "Annulation gratuite jusqu'à 24 heures avant l'arrivée."
                    : booking.property?.cancellation_policy === 'moderate'
                      ? "Annulation gratuite jusqu'à 5 jours avant l'arrivée."
                      : "Annulation gratuite jusqu'à 14 jours avant l'arrivée."}
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Raison de l'annulation (optionnel)
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              rows={4}
              placeholder="Indiquez la raison de votre annulation..."
            ></textarea>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowCancelModal(false)}
              disabled={cancelLoading}
            >
              Annuler
            </Button>
            
            <Button
              variant="danger"
              onClick={handleCancel}
              disabled={cancelLoading}
            >
              {cancelLoading ? (
                <span className="flex items-center">
                  <LoadingSpinner size="sm" color="white" className="mr-2" />
                  Traitement...
                </span>
              ) : (
                "Confirmer l'annulation"
              )}
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Modale d'avis */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title="Laisser un avis"
        size="lg"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note globale
            </label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewData(prev => ({ ...prev, rating: star }))}
                  className="text-2xl focus:outline-none"
                >
                  <FiStar 
                    className={`${star <= reviewData.rating ? "text-yellow-500 fill-current" : "text-gray-300"}`}
                  />
                </button>
              ))}
              <span className="ml-2 text-gray-700">{reviewData.rating}/5</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Propreté
              </label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewData(prev => ({ ...prev, cleanliness_rating: star }))}
                    className="focus:outline-none"
                  >
                    <FiStar 
                      className={`${star <= reviewData.cleanliness_rating ? "text-yellow-500 fill-current" : "text-gray-300"}`}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Emplacement
              </label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewData(prev => ({ ...prev, location_rating: star }))}
                    className="focus:outline-none"
                  >
                    <FiStar 
                      className={`${star <= reviewData.location_rating ? "text-yellow-500 fill-current" : "text-gray-300"}`}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rapport qualité-prix
              </label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewData(prev => ({ ...prev, value_rating: star }))}
                    className="focus:outline-none"
                  >
                    <FiStar 
                      className={`${star <= reviewData.value_rating ? "text-yellow-500 fill-current" : "text-gray-300"}`}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Communication
              </label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewData(prev => ({ ...prev, communication_rating: star }))}
                    className="focus:outline-none"
                  >
                    <FiStar 
                      className={`${star <= reviewData.communication_rating ? "text-yellow-500 fill-current" : "text-gray-300"}`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre de votre avis
            </label>
            <input
              type="text"
              name="title"
              value={reviewData.title}
              onChange={handleReviewChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Résumez votre expérience en quelques mots"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Votre avis
            </label>
            <textarea
              name="comment"
              value={reviewData.comment}
              onChange={handleReviewChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              rows={4}
              placeholder="Partagez votre expérience avec ce logement..."
            ></textarea>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowReviewModal(false)}
              disabled={reviewLoading}
            >
              Annuler
            </Button>
            
            <Button
              variant="primary"
              onClick={handleReviewSubmit}
              disabled={reviewLoading || !reviewData.title || !reviewData.comment}
            >
              {reviewLoading ? (
                <span className="flex items-center">
                  <LoadingSpinner size="sm" color="white" className="mr-2" />
                  Publication...
                </span>
              ) : (
                "Publier l'avis"
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default BookingDetail;