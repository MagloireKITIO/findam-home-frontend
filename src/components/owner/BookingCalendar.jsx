// src/components/owner/BookingCalendar.jsx - Version corrigée sans boucles infines
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  FiChevronLeft, 
  FiChevronRight, 
  FiCalendar, 
  FiFilter, 
  FiHome, 
  FiPlus,
  FiInfo
} from 'react-icons/fi';

import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import Modal from '../common/Modal';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

/**
 * Composant pour afficher un calendrier des réservations pour les propriétaires
 */
const BookingCalendar = ({ 
  properties = [], 
  loading = false, 
  selectedPropertyId = null,
  onPropertyChange = () => {}
}) => {
  const { success, error: notifyError } = useNotification();
  
  // États
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [calendarDays, setCalendarDays] = useState([]);
  const [error, setError] = useState(null);
  const [lastLoadParams, setLastLoadParams] = useState(null);
  
  // Modals
  const [showBookingDetailsModal, setShowBookingDetailsModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showAddExternalBookingModal, setShowAddExternalBookingModal] = useState(false);
  const [externalBookingForm, setExternalBookingForm] = useState({
    startDate: '',
    endDate: '',
    clientName: '',
    clientPhone: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Générer les jours du calendrier
  function generateCalendarDays(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Premier jour du mois
    const firstDay = new Date(year, month, 1);
    // Dernier jour du mois
    const lastDay = new Date(year, month + 1, 0);
    
    // Jour de la semaine du premier jour (0 = dimanche, 1 = lundi, etc.)
    const firstDayIndex = firstDay.getDay();
    // Nombre de jours dans le mois
    const daysInMonth = lastDay.getDate();
    
    // Tableau des jours du calendrier
    const days = [];
    
    // Ajouter les jours du mois précédent
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
        bookings: []
      });
    }
    
    // Ajouter les jours du mois courant
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
        bookings: []
      });
    }
    
    // Ajouter les jours du mois suivant
    const daysToAdd = 42 - days.length; // 6 semaines au total (42 jours)
    for (let i = 1; i <= daysToAdd; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
        bookings: []
      });
    }
    
    return days;
  }
  
  // Mémoriser les jours du calendrier
  const memoizedCalendarDays = useMemo(() => {
    return generateCalendarDays(currentDate);
  }, [currentDate]);
  
  // Mettre à jour les jours du calendrier une seule fois
  useEffect(() => {
    setCalendarDays(memoizedCalendarDays);
  }, [memoizedCalendarDays]);
  
  // Charger les réservations de façon optimisée
  const loadBookings = useCallback(async () => {
    if (!selectedPropertyId || calendarDays.length === 0) return;
    
    // Obtenir le premier et dernier jour du calendrier
    const firstDay = calendarDays[0]?.date;
    const lastDay = calendarDays[calendarDays.length - 1]?.date;
    
    if (!firstDay || !lastDay) return;
    
    // Formater les dates pour l'API
    const startDate = firstDay.toISOString().split('T')[0];
    const endDate = lastDay.toISOString().split('T')[0];
    
    // Créer une clé unique pour les paramètres de chargement
    const loadKey = `${selectedPropertyId}-${startDate}-${endDate}`;
    
    // Éviter de charger si les mêmes paramètres ont déjà été utilisés
    if (lastLoadParams === loadKey) return;
    
    try {
      setIsLoadingBookings(true);
      setError(null);
      setLastLoadParams(loadKey);
      
      console.log('Chargement des réservations pour:', {
        property: selectedPropertyId,
        startDate,
        endDate
      });
      
      // Charger les réservations
      const response = await api.get('/bookings/bookings/', {
        params: {
          property: selectedPropertyId,
          check_in_after: startDate,
          check_out_before: endDate,
          is_owner: true,
          page_size: 100
        }
      });
      
      const bookingsList = response.data.results || [];
      setBookings(bookingsList);
      
    } catch (err) {
      console.error('Erreur lors du chargement des réservations:', err);
      setError('Une erreur est survenue lors du chargement des réservations.');
      setLastLoadParams(null); // Réinitialiser pour permettre un nouveau chargement
    } finally {
      setIsLoadingBookings(false);
    }
  }, [selectedPropertyId, calendarDays, lastLoadParams]);
  
  // Charger les réservations avec un délai pour éviter les appels multiples
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadBookings();
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [loadBookings]);
  
  // Mettre à jour les jours du calendrier avec les réservations
  useEffect(() => {
    if (!bookings.length || !calendarDays.length) return;
    
    // Créer une copie des jours du calendrier en réinitialisant les bookings
    const updatedDays = calendarDays.map(day => ({ 
      ...day, 
      bookings: [] 
    }));
    
    // Pour chaque réservation
    bookings.forEach(booking => {
      if (!booking.check_in_date || !booking.check_out_date) return;
      
      // Convertir les dates de check-in et check-out en objets Date
      const checkInDate = new Date(booking.check_in_date);
      const checkOutDate = new Date(booking.check_out_date);
      
      // Pour chaque jour entre check-in et check-out
      for (let date = new Date(checkInDate); date <= checkOutDate; date.setDate(date.getDate() + 1)) {
        // Trouver l'index du jour dans le calendrier
        const dayIndex = updatedDays.findIndex(day => 
          day.date.getDate() === date.getDate() && 
          day.date.getMonth() === date.getMonth() && 
          day.date.getFullYear() === date.getFullYear()
        );
        
        // Si le jour est dans le calendrier
        if (dayIndex !== -1) {
          // Ajouter la réservation au jour
          updatedDays[dayIndex].bookings.push({
            ...booking,
            isCheckIn: date.getTime() === checkInDate.getTime(),
            isCheckOut: date.getTime() === checkOutDate.getTime()
          });
        }
      }
    });
    
    // Mettre à jour l'état seulement si nécessaire
    setCalendarDays(updatedDays);
  }, [bookings]);
  
  // Navigation dans le calendrier
  const goToPreviousMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
    setLastLoadParams(null); // Forcer un nouveau chargement
  };
  
  const goToNextMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
    setLastLoadParams(null); // Forcer un nouveau chargement
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
    setLastLoadParams(null); // Forcer un nouveau chargement
  };
  
  // Gérer le clic sur un jour
  const handleDayClick = (day) => {
    setSelectedDate(day.date);
    
    // S'il y a des réservations pour ce jour, afficher la première
    if (day.bookings.length > 0) {
      setSelectedBooking(day.bookings[0]);
      setShowBookingDetailsModal(true);
    }
  };
  
  // Formater une date pour l'affichage
  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  
  // Ajouter une réservation externe
  const handleAddExternalBooking = async () => {
    if (!selectedPropertyId) {
      notifyError('Veuillez sélectionner une propriété');
      return;
    }
    
    if (!externalBookingForm.startDate || !externalBookingForm.endDate || !externalBookingForm.clientName) {
      notifyError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Utiliser le nouvel endpoint
      await api.post('/bookings/bookings/create_external_booking/', {
        property_id: selectedPropertyId,
        check_in_date: externalBookingForm.startDate,
        check_out_date: externalBookingForm.endDate,
        external_client_name: externalBookingForm.clientName,
        external_client_phone: externalBookingForm.clientPhone,
        external_notes: externalBookingForm.notes,
        guests_count: parseInt(externalBookingForm.guestsCount) || 1
      });
      
      success('Réservation externe ajoutée avec succès');
      
      // Réinitialiser le formulaire
      setExternalBookingForm({
        startDate: '',
        endDate: '',
        clientName: '',
        clientPhone: '',
        notes: ''
      });
      
      // Fermer la modal
      setShowAddExternalBookingModal(false);
      
      // Recharger les réservations
      setLastLoadParams(null);
      await loadBookings();
      
    } catch (err) {
      console.error('Erreur lors de l\'ajout de la réservation externe:', err);
      notifyError(err.response?.data?.detail || 'Une erreur est survenue lors de l\'ajout de la réservation externe');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Noms des jours de la semaine
  const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  
  // Si les propriétés sont en cours de chargement
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  // Si aucune propriété n'est disponible
  if (properties.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <FiHome className="mx-auto text-gray-300 mb-4" size={64} />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Aucun logement disponible</h2>
        <p className="text-gray-500 mb-6">
          Vous n'avez pas encore de logements pour gérer les réservations
        </p>
        <Button variant="primary" icon={<FiPlus />}>
          Ajouter un logement
        </Button>
      </div>
    );
  }
  
  return (
    <div>
      {/* En-tête du calendrier */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center mb-4 md:mb-0">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousMonth}
            icon={<FiChevronLeft />}
            className="mr-2"
          />
          <h2 className="text-xl font-semibold text-gray-900 mx-4">
            {currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextMonth}
            icon={<FiChevronRight />}
            className="mr-2"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
          >
            Aujourd'hui
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4">
          <div className="w-full md:w-60">
            <select
              value={selectedPropertyId || ''}
              onChange={(e) => {
                onPropertyChange(e.target.value);
                setLastLoadParams(null); // Forcer un nouveau chargement
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Tous les logements</option>
              {properties.map(property => (
                <option key={property.id} value={property.id}>
                  {property.title}
                </option>
              ))}
            </select>
          </div>
          
          <Button
            variant="primary"
            icon={<FiPlus />}
            onClick={() => setShowAddExternalBookingModal(true)}
          >
            Ajouter une réservation externe
          </Button>
        </div>
      </div>
      
      {/* Calendrier */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Jours de la semaine */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {weekDays.map(day => (
            <div key={day} className="py-2 text-center text-sm font-medium text-gray-700">
              {day}
            </div>
          ))}
        </div>
        
        {/* Jours du mois */}
        <div className="grid grid-cols-7">
          {isLoadingBookings ? (
            <div className="col-span-7 flex justify-center items-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            calendarDays.map((day, index) => {
              const isToday = 
                day.date.getDate() === new Date().getDate() && 
                day.date.getMonth() === new Date().getMonth() && 
                day.date.getFullYear() === new Date().getFullYear();
              
              return (
                <div 
                  key={index}
                  className={`
                    min-h-32 p-2 border-r border-b border-gray-200 relative cursor-pointer hover:bg-gray-50
                    ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                    ${isToday ? 'ring-2 ring-primary-500 ring-inset' : ''}
                  `}
                  onClick={() => handleDayClick(day)}
                >
                  <div className={`
                    text-right font-medium mb-1
                    ${!day.isCurrentMonth ? 'text-gray-400' : isToday ? 'text-primary-600' : 'text-gray-700'}
                  `}>
                    {day.date.getDate()}
                  </div>
                  
                  {/* Réservations du jour */}
                  <div className="space-y-1">
                  {day.bookings.map((booking, bookingIndex) => {
                    // Déterminer le type de réservation
                    const isExternal = booking.is_external;
                    const clientName = isExternal ? booking.external_client_name : (booking.tenant_name || 'Réservation');
                    
                    // Définir les couleurs selon le type
                    let colorClass = '';
                    if (isExternal) {
                      colorClass = 'bg-purple-100 text-purple-800 border-l-2 border-purple-400';
                    } else {
                      switch (booking.status) {
                        case 'confirmed':
                          colorClass = 'bg-green-100 text-green-800';
                          break;
                        case 'pending':
                          colorClass = 'bg-yellow-100 text-yellow-800';
                          break;
                        case 'completed':
                          colorClass = 'bg-blue-100 text-blue-800';
                          break;
                        case 'cancelled':
                          colorClass = 'bg-red-100 text-red-800';
                          break;
                        default:
                          colorClass = 'bg-gray-100 text-gray-800';
                      }
                    }
                    
                    // Si c'est le jour d'arrivée ou le seul jour de la réservation
                    if (booking.isCheckIn || (booking.isCheckIn && booking.isCheckOut)) {
                      return (
                        <div
                          key={booking.id + bookingIndex}
                          className={`
                            rounded-l-md p-1 truncate text-xs font-medium
                            ${colorClass}
                          `}
                        >
                          {isExternal && <span className="mr-1">🔒</span>}
                          {booking.isCheckIn && booking.isCheckOut ? '↔️' : '→'} {clientName}
                        </div>
                      );
                    }
                    // Si c'est le jour de départ
                    else if (booking.isCheckOut) {
                      return (
                        <div
                          key={booking.id + bookingIndex}
                          className={`
                            rounded-r-md p-1 truncate text-xs font-medium
                            ${colorClass}
                          `}
                        >
                          {isExternal && <span className="mr-1">🔒</span>}
                          ← {clientName}
                        </div>
                      );
                    }
                    // Si c'est un jour intermédiaire
                    else {
                      return (
                        <div
                          key={booking.id + bookingIndex}
                          className={`
                            p-1 truncate text-xs font-medium
                            ${colorClass}
                          `}
                        >
                          {isExternal && <span className="mr-1">🔒</span>}
                          ― {clientName}
                        </div>
                      );
                    }
                  })}
                </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      
      {/* Légende */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Légende</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-100 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Confirmée</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-100 rounded mr-2"></div>
            <span className="text-sm text-gray-600">En attente</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-100 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Terminée</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-100 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Annulée</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-100 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Externe</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-purple-100 border-l-2 border-purple-400 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Réservation externe</span>
          </div>
        </div>
      </div>
      
      {/* Modal de détails de réservation */}
      <Modal
        isOpen={showBookingDetailsModal}
        onClose={() => {
          setShowBookingDetailsModal(false);
          setSelectedBooking(null);
        }}
        title="Détails de la réservation"
        size="lg"
      >
        {selectedBooking && (
          <div>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-medium text-lg text-gray-900">
                Réservation #{selectedBooking.id.toString().slice(-6)}
              </h3>
              <p className="text-gray-600 text-sm">
                {selectedBooking.tenant_name || 'Réservation externe'}
              </p>
            </div>
            
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Du:</strong> {formatDate(new Date(selectedBooking.check_in_date))}</p>
              <p><strong>Au:</strong> {formatDate(new Date(selectedBooking.check_out_date))}</p>
              <p><strong>Statut:</strong> {selectedBooking.status}</p>
              {selectedBooking.total_price && (
                <p><strong>Montant:</strong> {selectedBooking.total_price.toLocaleString()} FCFA</p>
              )}
              {selectedBooking.guests_count && (
                <p><strong>Voyageurs:</strong> {selectedBooking.guests_count}</p>
              )}
            </div>
          </div>
        )}
      </Modal>
      
      {/* Modal d'ajout de réservation externe */}
      <Modal
        isOpen={showAddExternalBookingModal}
        onClose={() => setShowAddExternalBookingModal(false)}
        title="Ajouter une réservation externe"
        size="lg"
      >
        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            Utilisez ce formulaire pour ajouter des réservations provenant d'autres plateformes
            (Airbnb, Booking.com, etc.) ou des réservations directes.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Logement <span className="text-red-600">*</span>
              </label>
              <select
                value={selectedPropertyId || ''}
                onChange={(e) => onPropertyChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="">Sélectionner un logement</option>
                {properties.map(property => (
                  <option key={property.id} value={property.id}>
                    {property.title}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du client <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={externalBookingForm.clientName}
                onChange={(e) => setExternalBookingForm({
                  ...externalBookingForm,
                  clientName: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date d'arrivée <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                value={externalBookingForm.startDate}
                onChange={(e) => setExternalBookingForm({
                  ...externalBookingForm,
                  startDate: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de départ <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                value={externalBookingForm.endDate}
                onChange={(e) => setExternalBookingForm({
                  ...externalBookingForm,
                  endDate: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone du client
              </label>
              <input
                type="tel"
                value={externalBookingForm.clientPhone}
                onChange={(e) => setExternalBookingForm({
                  ...externalBookingForm,
                  clientPhone: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (plateforme, référence de réservation, etc.)
            </label>
            <textarea
              value={externalBookingForm.notes}
              onChange={(e) => setExternalBookingForm({
                ...externalBookingForm,
                notes: e.target.value
              })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            ></textarea>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowAddExternalBookingModal(false)}
          >
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleAddExternalBooking}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Ajout en cours..." : "Ajouter la réservation"}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default BookingCalendar;