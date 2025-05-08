// src/components/booking/AvailabilityCalendar.jsx
import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight, FiX, FiCheck } from 'react-icons/fi';
import api from '../../services/api';

/**
 * Composant de calendrier amélioré pour montrer les disponibilités
 * 
 * @param {string} propertyId - ID du logement
 * @param {Date} initialStartDate - Date de début sélectionnée initialement
 * @param {Date} initialEndDate - Date de fin sélectionnée initialement
 * @param {function} onDateRangeChange - Callback appelé quand la plage de dates sélectionnée change
 * @param {number} months - Nombre de mois à afficher (défaut: 2)
 */
const AvailabilityCalendar = ({
  propertyId,
  initialStartDate = null,
  initialEndDate = null, 
  onDateRangeChange,
  months = 2
}) => {
  // État des dates
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [hoverDate, setHoverDate] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false); // true = sélectionnant endDate, false = sélectionnant startDate
  
  // États du calendrier
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarMonths, setCalendarMonths] = useState([]);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Charger les dates indisponibles pour le logement
  useEffect(() => {
    if (!propertyId) return;
    
    const fetchUnavailableDates = async () => {
        setLoading(true);
        setError(null);
        
        try {
          // Calculer la période pour laquelle charger les dates
          const today = new Date();
          const sixMonthsLater = new Date();
          sixMonthsLater.setMonth(today.getMonth() + 7); // +7 pour avoir une marge
          
          // Formater les dates pour l'API
          const startParam = formatDateForAPI(today);
          const endParam = formatDateForAPI(sixMonthsLater);
          
          // Utiliser l'endpoint check_availability qui est accessible publiquement
          // et qui retourne maintenant toutes les dates indisponibles futures
          const response = await api.get(`/properties/properties/${propertyId}/check_availability/`, {
            params: { 
              start_date: startParam,
              end_date: endParam
            }
          });
          
          // Traiter les données de réponse
          if (response.data) {
            // Utiliser all_unavailable_dates qui contient toutes les dates indisponibles futures
            // Ou se rabattre sur unavailable_dates si all_unavailable_dates n'existe pas
            const unavailableDatesArray = response.data.all_unavailable_dates || 
                                         response.data.unavailable_dates || 
                                         [];
            
            // Transformer les dates reçues en objets Date
            const unavailableDateRanges = unavailableDatesArray.map(range => ({
              startDate: new Date(range.start_date),
              endDate: new Date(range.end_date),
              bookingType: range.booking_type || 'unknown'
            }));
            
            setUnavailableDates(unavailableDateRanges);
            console.log('Dates indisponibles chargées:', unavailableDateRanges.length);
          } else {
            // Si la réponse est vide ou ne contient pas les données attendues
            console.warn('La réponse ne contient pas de dates indisponibles:', response.data);
            setUnavailableDates([]);
          }
        } catch (err) {
          console.error('Erreur lors du chargement des dates indisponibles:', err);
          console.error('Détails:', err.response?.data || err.message);
          setError('Impossible de charger les disponibilités. Veuillez réessayer.');
          // En cas d'erreur, ne pas bloquer l'utilisation du calendrier
          setUnavailableDates([]);
        } finally {
          setLoading(false);
        }
      };
    
    fetchUnavailableDates();
  }, [propertyId]);
  
  // Générer les mois du calendrier
  useEffect(() => {
    const generateCalendarMonths = () => {
      const months = [];
      
      for (let i = 0; i < months; i++) {
        const monthDate = new Date(currentMonth);
        monthDate.setMonth(monthDate.getMonth() + i);
        months.push(generateMonth(monthDate));
      }
      
      setCalendarMonths(months);
    };
    
    generateCalendarMonths();
  }, [currentMonth, months, unavailableDates]);
  
  // Générer un mois de calendrier
  const generateMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Premier jour du mois
    const firstDayOfMonth = new Date(year, month, 1);
    // Dernier jour du mois
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // Jour de la semaine du premier jour (0-6, 0 = dimanche)
    const firstDayWeekday = firstDayOfMonth.getDay();
    
    // Tableau des semaines du mois
    const weeks = [];
    
    // Ajouter les jours du mois précédent pour commencer par un dimanche
    let currentDay = new Date(firstDayOfMonth);
    currentDay.setDate(currentDay.getDate() - firstDayWeekday);
    
    // Générer 6 semaines pour s'assurer que le mois est complet
    for (let weekIndex = 0; weekIndex < 6; weekIndex++) {
      const week = [];
      
      // Générer 7 jours par semaine
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const isCurrentMonth = currentDay.getMonth() === month;
        const isPast = currentDay < new Date(new Date().setHours(0, 0, 0, 0));
        const isToday = isSameDay(currentDay, new Date());
        const isUnavailable = checkDateIsUnavailable(currentDay);
        const isSelected = startDate && endDate && 
                          (isSameDay(currentDay, startDate) || 
                           isSameDay(currentDay, endDate) || 
                           (currentDay > startDate && currentDay < endDate));
                           
        const isSelectionStart = startDate && isSameDay(currentDay, startDate);
        const isSelectionEnd = endDate && isSameDay(currentDay, endDate);
        
        // Déterminer si c'est une date de survol pour l'aperçu de la sélection
        const isHovering = hoverDate && startDate && !endDate && 
                          (currentDay > startDate && currentDay <= hoverDate);
        
        week.push({
          date: new Date(currentDay),
          isCurrentMonth,
          isPast,
          isToday,
          isUnavailable,
          isSelected,
          isSelectionStart,
          isSelectionEnd,
          isHovering
        });
        
        // Passer au jour suivant
        currentDay.setDate(currentDay.getDate() + 1);
      }
      
      weeks.push(week);
      
      // Arrêter la génération si on a dépassé le mois actuel et qu'on a déjà 4 semaines
      if (currentDay.getMonth() !== month && weekIndex >= 3) {
        break;
      }
    }
    
    return {
      date: date,
      weeks
    };
  };
  
  // Vérifier si une date est indisponible
  const checkDateIsUnavailable = (date) => {
    if (!date) return false;
    
    // Vérifier si la date est dans le passé
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;
    
    // Vérifier si la date est dans une période indisponible
    return unavailableDates.some(range => {
      const rangeStart = new Date(range.startDate);
      const rangeEnd = new Date(range.endDate);
      
      // Même jour ou entre les jours indisponibles
      return (date >= rangeStart && date <= rangeEnd);
    });
  };
  
  // Vérifier si une plage de dates chevauche des dates indisponibles
  const checkRangeIsAvailable = (start, end) => {
    if (!start || !end) return true;
    
    // Vérifier chaque jour entre start et end
    const day = new Date(start);
    while (day <= end) {
      if (checkDateIsUnavailable(day)) {
        return false;
      }
      day.setDate(day.getDate() + 1);
    }
    
    return true;
  };
  
  // Navigation entre les mois
  const goToPreviousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonth(newDate);
  };
  
  const goToNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
  };
  
  // Gestion des clics sur les dates
  const handleDateClick = (day) => {
    if (day.isPast || day.isUnavailable) return;
    
    if (!isSelecting) {
      // Sélectionner la date de début
      setStartDate(day.date);
      setEndDate(null);
      setIsSelecting(true);
    } else {
      // Sélectionner la date de fin
      if (day.date < startDate) {
        // Si la date cliquée est avant la date de début, inverser les dates
        setEndDate(startDate);
        setStartDate(day.date);
      } else {
        setEndDate(day.date);
      }
      
      setIsSelecting(false);
      
      // Vérifier si la plage de dates est disponible
      if (!checkRangeIsAvailable(startDate, day.date)) {
        setEndDate(null);
        // Optionnellement, afficher un message d'erreur
      }
    }
  };
  
  // Mettre à jour le composant parent quand la sélection change
  useEffect(() => {
    if (onDateRangeChange && startDate && endDate) {
      onDateRangeChange(startDate, endDate);
    }
  }, [startDate, endDate, onDateRangeChange]);
  
  // Gestion du survol pour l'aperçu de la sélection
  const handleDateHover = (day) => {
    if (isSelecting && !day.isPast && !day.isUnavailable) {
      setHoverDate(day.date);
    }
  };
  
  // Réinitialiser la sélection
  const resetSelection = () => {
    setStartDate(null);
    setEndDate(null);
    setIsSelecting(false);
  };
  
  // Formatage de date pour l'API
  const formatDateForAPI = (date) => {
    return date.toISOString().split('T')[0];
  };
  
  // Vérifier si deux dates sont le même jour
  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };
  
  // Formater une date pour l'affichage
  const formatDateDisplay = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };
  
  // Noms des mois et jours en français
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                     'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {/* En-tête du calendrier avec la période sélectionnée */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-2">
          <button 
            onClick={goToPreviousMonth}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Mois précédent"
          >
            <FiChevronLeft />
          </button>
          <div className="font-medium">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </div>
          <button 
            onClick={goToNextMonth}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Mois suivant"
          >
            <FiChevronRight />
          </button>
        </div>
        
        {(startDate || endDate) && (
          <button 
            onClick={resetSelection}
            className="text-sm px-2 py-1 flex items-center text-gray-600 hover:text-red-600"
          >
            <FiX className="mr-1" /> Réinitialiser
          </button>
        )}
      </div>
      
      {/* Affichage de la sélection */}
      {startDate && (
        <div className="mb-4 p-3 bg-blue-50 rounded-md text-sm">
          <div className="flex items-center mb-1">
            <FiCheck className="text-blue-600 mr-2" />
            <span className="font-medium">Date d'arrivée:</span> 
            <span className="ml-2">{formatDateDisplay(startDate)}</span>
          </div>
          {endDate && (
            <div className="flex items-center">
              <FiCheck className="text-blue-600 mr-2" />
              <span className="font-medium">Date de départ:</span>
              <span className="ml-2">{formatDateDisplay(endDate)}</span>
            </div>
          )}
        </div>
      )}
      
      {/* Légende du calendrier */}
      <div className="flex justify-start items-center text-xs text-gray-500 mb-2 space-x-4">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-primary-100 border border-primary-400 rounded-sm mr-1"></div>
          <span>Disponible</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-200 border border-gray-300 rounded-sm mr-1"></div>
          <span>Indisponible</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-primary-500 border border-primary-600 rounded-sm mr-1"></div>
          <span>Sélectionné</span>
        </div>
      </div>
      
      {/* Grilles des mois */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {calendarMonths.map((month, monthIndex) => (
          <div key={monthIndex} className="w-full">
            <div className="text-center font-medium mb-2">
              {monthNames[month.date.getMonth()]} {month.date.getFullYear()}
            </div>
            
            {/* Jours de la semaine */}
            <div className="grid grid-cols-7 mb-1">
              {dayNames.map((day, index) => (
                <div key={index} className="text-center text-xs text-gray-500 font-medium py-1">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Jours du mois */}
            {month.weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7">
                {week.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className={`
                      p-1 relative text-center text-sm 
                      ${!day.isCurrentMonth ? 'text-gray-300' : 
                        day.isPast || day.isUnavailable ? 'text-gray-400 bg-gray-100' : 
                        'text-gray-700 hover:bg-primary-50 cursor-pointer'}
                      ${day.isToday ? 'border border-primary-500' : ''}
                      ${day.isSelected ? 'bg-primary-400 text-white hover:bg-primary-500' : ''}
                      ${day.isSelectionStart ? 'rounded-l-md' : ''}
                      ${day.isSelectionEnd ? 'rounded-r-md' : ''}
                      ${day.isHovering ? 'bg-primary-100' : ''}
                    `}
                    onClick={() => handleDateClick(day)}
                    onMouseEnter={() => handleDateHover(day)}
                  >
                    <span className={`
                      ${day.isSelected ? 'font-medium' : ''}
                      ${day.isUnavailable ? 'line-through' : ''}
                    `}>
                      {day.date.getDate()}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
      
      {/* Instructions */}
      <div className="mt-4 text-sm text-gray-600">
        {!startDate ? (
          <p>Sélectionnez votre date d'arrivée</p>
        ) : !endDate ? (
          <p>Sélectionnez votre date de départ</p>
        ) : (
          <p>Votre séjour: {formatDateDisplay(startDate)} → {formatDateDisplay(endDate)} 
            ({Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))} nuits)
          </p>
        )}
      </div>
    </div>
  );
};

export default AvailabilityCalendar;