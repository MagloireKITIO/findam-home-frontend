// src/pages/owner/OwnerBookingDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiCalendar, FiHome, FiUser, FiMapPin, FiDollarSign,
  FiClock, FiCheck, FiX, FiMessageSquare, FiStar, FiInfo, FiAlertCircle
} from 'react-icons/fi';

import Layout from '../../components/layout/Layout';
import Sidebar from '../../components/layout/Sidebar';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const OwnerBookingDetail = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const { success, error: notifyError } = useNotification();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Charger les détails de la réservation
  useEffect(() => {
    const loadBookingDetails = async () => {
      setLoading(true);
      setError(null);
  
      try {
        // Utiliser 'id' au lieu de 'bookingId'
        const response = await api.get(`/bookings/bookings/${id}/?is_owner=true`);
        setBooking(response.data);
      } catch (err) {
        console.error('Erreur lors du chargement:', err);
        if (err.response?.status === 404) {
          setError('Cette réservation n\'existe pas.');
        } else {
          setError('Une erreur est survenue lors du chargement.');
        }
      } finally {
        setLoading(false);
      }
    };
  
    loadBookingDetails();
  }, [id]); 

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Obtenir le statut formaté pour le propriétaire
  const getOwnerStatusElement = (status, paymentStatus) => {
    if (paymentStatus === 'pending' || paymentStatus === 'failed') {
      return (
        <div className="flex items-center text-orange-700 bg-orange-100 px-4 py-2 rounded-lg">
          <FiClock className="mr-2" size={20} />
          <div>
            <p className="font-medium">En attente de paiement</p>
            <p className="text-sm">Le locataire doit finaliser son paiement.</p>
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
              <p className="font-medium">En attente de votre confirmation</p>
              <p className="text-sm">Veuillez confirmer ou refuser cette réservation.</p>
            </div>
          </div>
        );
      case 'confirmed':
        return (
          <div className="flex items-center text-green-700 bg-green-100 px-4 py-2 rounded-lg">
            <FiCheck className="mr-2" size={20} />
            <div>
              <p className="font-medium">Réservation confirmée</p>
              <p className="text-sm">Le locataire arrivera bientôt.</p>
            </div>
          </div>
        );
      case 'completed':
        return (
          <div className="flex items-center text-green-700 bg-green-100 px-4 py-2 rounded-lg">
            <FiCheck className="mr-2" size={20} />
            <div>
              <p className="font-medium">Séjour terminé</p>
              <p className="text-sm">Le locataire a terminé son séjour.</p>
            </div>
          </div>
        );
      case 'cancelled':
        return (
          <div className="flex items-center text-red-700 bg-red-100 px-4 py-2 rounded-lg">
            <FiX className="mr-2" size={20} />
            <div>
              <p className="font-medium">Réservation annulée</p>
              <p className="text-sm">Cette réservation a été annulée.</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Vérifier si le propriétaire peut confirmer
  const canConfirm = () => {
    return booking && booking.status === 'pending' && booking.payment_status === 'paid';
  };

  // Vérifier si le propriétaire peut marquer comme terminé
  const canMarkComplete = () => {
    return booking && booking.status === 'confirmed' && new Date(booking.check_out_date) <= new Date();
  };

  // Confirmer la réservation
  const handleConfirm = async () => {
    setActionLoading(true);
    try {
      await api.post(`/bookings/bookings/${id}/confirm/`);
      const response = await api.get(`/bookings/bookings/${id}/`);
      setBooking(response.data);
      setShowConfirmModal(false);
      success('Réservation confirmée avec succès');
    } catch (err) {
      console.error('Erreur lors de la confirmation:', err);
      notifyError('Erreur lors de la confirmation de la réservation');
    } finally {
      setActionLoading(false);
    }
  };

  // Marquer comme terminé
  const handleComplete = async () => {
    setActionLoading(true);
    try {
      await api.post(`/bookings/bookings/${id}/complete/`);
      const response = await api.get(`/bookings/bookings/${id}/`);
      setBooking(response.data);
      setShowCompleteModal(false);
      success('Réservation marquée comme terminée');
    } catch (err) {
      console.error('Erreur lors de la completion:', err);
      notifyError('Erreur lors de la mise à jour de la réservation');
    } finally {
      setActionLoading(false);
    }
  };

  // Contacter le locataire
  const contactTenant = async () => {
    try {
      const response = await api.post('/communications/conversations/start_conversation/', {
        property_id: booking.property.id,
        message: `Bonjour, concernant votre réservation du ${formatDate(booking.check_in_date)} au ${formatDate(booking.check_out_date)}.`
      });
      success('Conversation démarrée');
      // Rediriger vers les messages si nécessaire
    } catch (err) {
      console.error('Erreur:', err);
      notifyError('Erreur lors du démarrage de la conversation');
    }
  };

  // Calculer les revenus
  const calculateRevenue = () => {
    if (!booking) return 0;
    // Commission de 5% pour le propriétaire
    const commission = booking.total_price * 0.05;
    return booking.total_price - commission;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex h-screen bg-gray-50">
          <Sidebar isCollapsed={sidebarCollapsed} setIsCollapsed={setSidebarCollapsed} />
          <div className="flex-1 flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex h-screen bg-gray-50">
          <Sidebar isCollapsed={sidebarCollapsed} setIsCollapsed={setSidebarCollapsed} />
          <div className="flex-1 p-6">
            <div className="max-w-3xl mx-auto">
              <div className="bg-red-50 text-red-700 p-6 rounded-lg">
                <h2 className="text-2xl font-bold mb-4">Erreur</h2>
                <p>{error}</p>
                <Button className="mt-4" onClick={() => window.history.back()}>
                  Retour
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!booking) return null;

  return (
    <Layout>
      <div className="flex h-screen bg-gray-50">
        <Sidebar isCollapsed={sidebarCollapsed} setIsCollapsed={setSidebarCollapsed} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            <div className="p-6">
              <div className="max-w-4xl mx-auto">
                {/* Breadcrumb */}
                <div className="mb-6">
                  <Link to="/owner/bookings" className="text-primary-600 hover:underline">
                    ← Retour aux réservations
                  </Link>
                </div>

                {/* Titre et statut */}
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Réservation #{id.substring(0, 8)}
                  </h1>
                  {getOwnerStatusElement(booking.status, booking.payment_status)}
                </div>

                {/* Actions du propriétaire */}
                <div className="flex flex-wrap gap-3 mb-8">
                  {canConfirm() && (
                    <Button
                      variant="primary"
                      icon={<FiCheck />}
                      onClick={() => setShowConfirmModal(true)}
                    >
                      Confirmer la réservation
                    </Button>
                  )}

                  {canMarkComplete() && (
                    <Button
                      variant="primary"
                      icon={<FiCheck />}
                      onClick={() => setShowCompleteModal(true)}
                    >
                      Marquer comme terminé
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    icon={<FiMessageSquare />}
                    onClick={contactTenant}
                  >
                    Contacter le locataire
                  </Button>
                </div>

                {/* Contenu principal */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Colonne gauche */}
                  <div className="md:col-span-2">
                    {/* Détails du locataire */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <h2 className="text-xl font-semibold mb-4">
                                {booking.is_external ? 'Informations du client' : 'Informations du locataire'}
                            </h2>
                            
                            <div className="flex items-center">
                                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                {booking.is_external ? (
                                    <FiHome size={32} className="text-purple-500" />
                                ) : (
                                    <FiUser size={32} className="text-gray-500" />
                                )}
                                </div>
                                
                                <div className="ml-4">
                                <div className="flex items-center">
                                    <h3 className="font-medium text-lg">
                                    {booking.is_external ? booking.external_details?.client_name : booking.tenant_name}
                                    </h3>
                                    {booking.is_external && (
                                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                        Externe
                                    </span>
                                    )}
                                </div>
                                
                                {booking.is_external ? (
                                    <div className="text-sm space-y-1">
                                    <div>
                                        <span className="text-gray-600">Téléphone:</span>
                                        <span className="font-medium ml-1">
                                        {booking.external_details?.client_phone || 'Non renseigné'}
                                        </span>
                                    </div>
                                    {booking.external_details?.notes && (
                                        <div>
                                        <span className="text-gray-600">Notes:</span>
                                        <span className="font-medium ml-1">{booking.external_details.notes}</span>
                                        </div>
                                    )}
                                    </div>
                                ) : (
                                    <div className="text-sm space-y-1">
                                    <p className="text-gray-600">{booking.tenant_email}</p>
                                    {/* Autres détails du locataire... */}
                                    </div>
                                )}
                                </div>
                            </div>
                            </div>

                    {/* Détails du séjour */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                      <h2 className="text-xl font-semibold mb-4">Détails du séjour</h2>
                      
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

                      {booking.special_requests && (
                        <div className="border-t border-gray-200 mt-4 pt-4">
                          <h3 className="font-medium mb-2">Demandes spéciales du locataire</h3>
                          <p className="text-gray-700 whitespace-pre-line">{booking.special_requests}</p>
                        </div>
                      )}
                    </div>

                    {/* Informations sur le logement */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h2 className="text-xl font-semibold mb-4">Logement concerné</h2>
                      
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
                         <h3 className="font-medium text-lg">{booking.property?.title}</h3>
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
                   </div>
                 </div>

                 {/* Colonne droite - Revenus */}
                 <div className="md:col-span-1">
                   <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
                   <h2 className="text-xl font-semibold mb-4">
                        {booking.is_external ? 'Revenus' : 'Revenus'}
                    </h2>
                    {booking.is_external ? (
                        <div className="text-center py-8">
                        <FiHome className="mx-auto text-gray-300 mb-4" size={48} />
                        <p className="text-gray-500">
                            Réservation externe sans facturation
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                            Cette réservation ne génère pas de revenus via la plateforme
                        </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                       <div className="flex justify-between">
                         <span>Montant total</span>
                         <span>{booking.total_price?.toLocaleString()} FCFA</span>
                       </div>
                       
                       <div className="flex justify-between text-sm text-red-600">
                         <span>Commission (5%)</span>
                         <span>-{(booking.total_price * 0.05)?.toLocaleString()} FCFA</span>
                       </div>
                       
                       <div className="border-t border-gray-200 pt-3">
                         <div className="flex justify-between font-bold text-lg text-green-600">
                           <span>Votre revenu</span>
                           <span>{calculateRevenue().toLocaleString()} FCFA</span>
                         </div>
                       </div>
                       
                       <div className="text-sm text-gray-600">
                         <div className="flex items-center">
                           <FiInfo className="mr-1" />
                           <span>
                             {booking.payment_status === 'paid' 
                               ? 'Versement programmé 24h après l\'arrivée' 
                               : 'En attente du paiement'}
                           </span>
                         </div>
                       </div>
                     </div>
                    )}

                     {/* Statut du versement */}
                     {booking.payment_status === 'paid' && (
                       <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                         <h3 className="font-medium text-green-800 mb-2">Statut du versement</h3>
                         <div className="flex items-center text-green-700">
                           <FiClock className="mr-2" />
                           <span className="text-sm">
                             {booking.status === 'completed' 
                               ? 'Versement traité' 
                               : 'Fonds sécurisés, versement programmé'}
                           </span>
                         </div>
                       </div>
                     )}
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </main>
       </div>
     </div>

     {/* Modales */}
     {/* Modale de confirmation */}
     <Modal
       isOpen={showConfirmModal}
       onClose={() => setShowConfirmModal(false)}
       title="Confirmer la réservation"
       size="md"
     >
       <div className="space-y-4">
         <div className="flex items-start">
           <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
             <FiCheck className="text-green-600" size={20} />
           </div>
           <div>
             <h3 className="font-medium text-gray-900">Confirmer cette réservation ?</h3>
             <p className="text-sm text-gray-600 mt-1">
               Le locataire sera notifié que sa réservation est confirmée. 
               Vous vous engagez à accueillir le locataire aux dates prévues.
             </p>
           </div>
         </div>

         <div className="bg-blue-50 p-4 rounded-lg">
           <h4 className="font-medium text-blue-800 mb-2">Rappel :</h4>
           <ul className="text-sm text-blue-700 space-y-1">
             <li>• Assurez-vous que le logement est prêt</li>
             <li>• Préparez les instructions d'accès</li>
             <li>• Votre revenu sera versé 24h après l'arrivée</li>
           </ul>
         </div>

         <div className="flex justify-end space-x-3">
           <Button
             variant="outline"
             onClick={() => setShowConfirmModal(false)}
             disabled={actionLoading}
           >
             Annuler
           </Button>
           <Button
             variant="primary"
             onClick={handleConfirm}
             disabled={actionLoading}
           >
             {actionLoading ? (
               <span className="flex items-center">
                 <LoadingSpinner size="sm" color="white" className="mr-2" />
                 Confirmation...
               </span>
             ) : (
               "Confirmer la réservation"
             )}
           </Button>
         </div>
       </div>
     </Modal>

     {/* Modale de completion */}
     <Modal
       isOpen={showCompleteModal}
       onClose={() => setShowCompleteModal(false)}
       title="Marquer comme terminé"
       size="md"
     >
       <div className="space-y-4">
         <div className="flex items-start">
           <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
             <FiCheck className="text-blue-600" size={20} />
           </div>
           <div>
             <h3 className="font-medium text-gray-900">Le séjour est-il terminé ?</h3>
             <p className="text-sm text-gray-600 mt-1">
               Marquez cette réservation comme terminée une fois que le locataire a quitté votre logement.
             </p>
           </div>
         </div>

         <div className="bg-green-50 p-4 rounded-lg">
           <h4 className="font-medium text-green-800 mb-2">Après validation :</h4>
           <ul className="text-sm text-green-700 space-y-1">
             <li>• Votre versement sera traité immédiatement</li>
             <li>• Le locataire pourra laisser un avis</li>
             <li>• Vous pourrez également évaluer le locataire</li>
           </ul>
         </div>

         <div className="flex justify-end space-x-3">
           <Button
             variant="outline"
             onClick={() => setShowCompleteModal(false)}
             disabled={actionLoading}
           >
             Annuler
           </Button>
           <Button
             variant="primary"
             onClick={handleComplete}
             disabled={actionLoading}
           >
             {actionLoading ? (
               <span className="flex items-center">
                 <LoadingSpinner size="sm" color="white" className="mr-2" />
                 Traitement...
               </span>
             ) : (
               "Marquer comme terminé"
             )}
           </Button>
         </div>
       </div>
     </Modal>
   </Layout>
 );
};

export default OwnerBookingDetail;