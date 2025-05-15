// src/components/booking/TenantBookingCalendar.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiChevronLeft, 
  FiChevronRight, 
  FiCalendar, 
  FiFilter, 
  FiHome, 
  FiInfo,
  FiClock,
  FiCheck,
  FiX
} from 'react-icons/fi';

import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import Modal from '../common/Modal';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

/**
 * Composant pour afficher un calendrier des réservations pour les locataires
 * @param {Object} props - Props du composant
 * @returns {JSX.Element} Le calendrier des réservations du locataire
 */
const TenantBookingCalendar = () => {
  const { success, error: notifyError } = useNotification();
  
  // États
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [calendarDays, setCalendarDays] = useState([]);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'past', 'confirmed', 'pending'
  
  // Modals
  const [showBookingDetailsModal, setShowBookingDetailsModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  // Générer les jours du calendrier
  const generateCalendarDays = (date) => {
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
  };
  
  // Charger les jours du calendrier
  useEffect(() => {
    const days = generateCalendarDays(currentDate);
    setCalendarDays(days);
  }, [currentDate]);
  
  // Mettre à jour les jours du calendrier avec les réservations quand les réservations changent
  useEffect(() => {
    if (bookings.length >= 0 && calendarDays.length > 0) {
      updateCalendarWithBookings(bookings);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings]);
  
  // Charger les réservations
  useEffect(() => {
    const loadBookings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Calculer les dates pour le mois courant
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        // Premier et dernier jour du mois étendu pour couvrir les jours du calendrier
        const firstOfMonth = new Date(year, month, 1);
        const lastOfMonth = new Date(year, month + 1, 0);
        
        // Étendre pour inclure les jours des mois précédent/suivant visibles
        const firstDayOfWeek = firstOfMonth.getDay();
        const startDate = new Date(firstOfMonth);
        startDate.setDate(startDate.getDate() - firstDayOfWeek);
        
        const endDate = new Date(lastOfMonth);
        const daysToAdd = 6 - lastOfMonth.getDay();
        endDate.setDate(endDate.getDate() + daysToAdd);
        
        // Formater les dates pour l'API
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];
        
        // Paramètres de requête selon le filtre
        const params = {
          check_in_after: startDateStr,
          check_out_before: endDateStr,
          page_size: 100 // Charger un maximum de réservations
        };
        
        // Appliquer les filtres
        if (filter === 'upcoming') {
          params.is_future = true;
        } else if (filter === 'past') {
          params.is_past = true;
        } else if (filter === 'confirmed') {
          params.status = 'confirmed';
        } else if (filter === 'pending') {
          params.status = 'pending';
        }
        
        // Charger les réservations du locataire
        const response = await api.get('/bookings/bookings/', { params });
        
        setBookings(response.data.results || []);
        
      } catch (err) {
        console.error('Erreur lors du chargement des réservations:', err);
        setError('Une erreur est survenue lors du chargement des réservations.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadBookings();
  }, [currentDate, filter]);
  
  // Mettre à jour les jours du calendrier avec les réservations
  const updateCalendarWithBookings = (bookingsList) => {
    // Réinitialiser d'abord tous les jours
    const updatedDays = calendarDays.map(day => ({
      ...day,
      bookings: []
    }));
    
    // Pour chaque réservation
    bookingsList.forEach(booking => {
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
    
    // Mettre à jour l'état uniquement si nécessaire
    setCalendarDays(updatedDays);
  };
  
  // Navigation dans le calendrier
  const goToPreviousMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };
  
  const goToNextMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  // Gérer le clic sur un jour
  const handleDayClick = (day) => {
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
  
  // Obtenir la couleur selon le statut de la réservation
  const getBookingColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Obtenir le statut d'affichage
  const getStatusDisplay = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmée';
      case 'pending':
        return 'En attente';
      case 'completed':
        return 'Terminée';
      case 'cancelled':
        return 'Annulée';
      default:
        return status;
    }
  };
  
  // Noms des jours de la semaine
  const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  
  // Options de filtre
  const filterOptions = [
    { value: 'all', label: 'Toutes les réservations' },
    { value: 'upcoming', label: 'À venir' },
    { value: 'past', label: 'Passées' },
    { value: 'confirmed', label: 'Confirmées' },
    { value: 'pending', label: 'En attente' }
  ];
  
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
        
        <div className="flex items-center space-x-4">
          <div className="w-48">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              {filterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
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
          {isLoading ? (
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
                      const isCheckInDay = booking.isCheckIn;
                      const isCheckOutDay = booking.isCheckOut;
                      const isSingleDay = isCheckInDay && isCheckOutDay;
                      
                      return (
                        <div
                          key={booking.id + bookingIndex}
                          className={`
                            p-1 truncate text-xs font-medium
                            ${getBookingColor(booking.status)}
                            ${isCheckInDay && !isSingleDay ? 'rounded-l-md' : ''}
                            ${isCheckOutDay && !isSingleDay ? 'rounded-r-md' : ''}
                            ${isSingleDay ? 'rounded-md' : ''}
                          `}
                          title={`${booking.property_title} - ${getStatusDisplay(booking.status)}`}
                        >
                          <div className="flex items-center">
                            {isCheckInDay && <span className="mr-1">→</span>}
                            {isCheckOutDay && !isCheckInDay && <span className="mr-1">←</span>}
                            {!isCheckInDay && !isCheckOutDay && <span className="mr-1">―</span>}
                            <span className="truncate">{booking.property_title}</span>
                          </div>
                        </div>
                      );
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
            <span className="text-sm text-gray-600 mr-2">→ Arrivée</span>
            <span className="text-sm text-gray-600 mr-2">← Départ</span>
            <span className="text-sm text-gray-600">― Séjour</span>
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
              <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <div>
                  <h3 className="font-medium text-lg text-gray-900">
                    {selectedBooking.property_title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Réservation #{selectedBooking.id.slice(-6)}
                  </p>
                </div>
                <div className={`mt-2 md:mt-0 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getBookingColor(selectedBooking.status)}`}>
                  {getStatusDisplay(selectedBooking.status)}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Informations sur le séjour */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <FiCalendar className="mr-2" />
                  Séjour
                </h3>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-gray-600 text-sm">Arrivée:</span>
                        <span className="block font-medium">{formatDate(new Date(selectedBooking.check_in_date))}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Départ:</span>
                        <span className="block font-medium">{formatDate(new Date(selectedBooking.check_out_date))}</span>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-gray-100">
                      <span className="text-gray-600 text-sm">Durée:</span>
                      <span className="block font-medium">
                        {Math.ceil((new Date(selectedBooking.check_out_date) - new Date(selectedBooking.check_in_date)) / (1000 * 60 * 60 * 24))} nuits
                      </span>
                    </div>
                    
                    <div className="pt-2 border-t border-gray-100">
                      <span className="text-gray-600 text-sm">Voyageurs:</span>
                      <span className="block font-medium">{selectedBooking.guests_count}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Informations sur la réservation */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <FiInfo className="mr-2" />
                  Informations
                </h3>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="space-y-2">
                    <div>
                      <span className="text-gray-600 text-sm">Propriétaire:</span>
                      <span className="block font-medium">{selectedBooking.owner_name}</span>
                    </div>
                    
                    <div className="pt-2 border-t border-gray-100">
                      <span className="text-gray-600 text-sm">Montant total:</span>
                      <span className="block font-medium">{selectedBooking.total_price?.toLocaleString()} FCFA</span>
                      <span className={`text-sm ${
                        selectedBooking.payment_status === 'paid' ? 'text-green-600' : 
                        selectedBooking.payment_status === 'pending' ? 'text-yellow-600' : 
                        'text-gray-500'
                      }`}>
                        {selectedBooking.payment_status === 'paid' ? 'Payé' : 
                         selectedBooking.payment_status === 'pending' ? 'En attente de paiement' : 
                         selectedBooking.payment_status === 'refunded' ? 'Remboursé' : 
                         'Non payé'}
                      </span>
                    </div>
                    
                    <div className="pt-2 border-t border-gray-100">
                      <span className="text-gray-600 text-sm">Adresse:</span>
                      <span className="block text-gray-800">{selectedBooking.city}, {selectedBooking.neighborhood}</span>
                    </div>
                    
                    {selectedBooking.special_requests && (
                      <div className="pt-2 border-t border-gray-100">
                        <span className="text-gray-600 text-sm">Demandes spéciales:</span>
                        <span className="block text-gray-800 whitespace-pre-line">{selectedBooking.special_requests}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Link to={`/bookings/${selectedBooking.id}`}>
                <Button variant="outline">
                  Voir tous les détails
                </Button>
              </Link>
              <Link to={`/messages?booking=${selectedBooking.id}`}>
                <Button variant="primary">
                  Contacter le propriétaire
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TenantBookingCalendar;