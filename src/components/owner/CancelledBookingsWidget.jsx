// src/components/owner/CancelledBookingsWidget.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiX, FiInfo, FiCalendar, FiUser, FiDollarSign } from 'react-icons/fi';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import Button from '../common/Button';

/**
 * Widget pour afficher les réservations annulées récentes sur le tableau de bord du propriétaire
 */
const CancelledBookingsWidget = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCancelledBookings = async () => {
        try {
          setLoading(true);
          // Ajoutez &include_compensation=true pour récupérer les détails des compensations
          const response = await api.get('/bookings/bookings/', {
            params: {
              status: 'cancelled',
              is_owner: true,
              ordering: '-cancelled_at',
              limit: 5,
              include_compensation: true  // Nouveau paramètre
            }
          });
          
          setBookings(response.data.results || []);
          setError(null);
        } catch (err) {
          console.error('Erreur lors du chargement des réservations annulées:', err);
          setError('Impossible de charger les réservations annulées');
        } finally {
          setLoading(false);
        }
      };

    fetchCancelledBookings();
  }, []);

  // Formater une date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Calculer le nombre de jours entre l'annulation et l'arrivée prévue
  const getDaysDifference = (cancelDate, checkInDate) => {
    if (!cancelDate || !checkInDate) return null;
    
    const cancel = new Date(cancelDate);
    const checkIn = new Date(checkInDate);
    const diffTime = checkIn - cancel;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Réservations récemment annulées</h2>
        <div className="flex justify-center py-6">
          <LoadingSpinner size="md" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Réservations récemment annulées</h2>
        <div className="text-red-500 p-4 bg-red-50 rounded-lg">
          <FiInfo className="inline-block mr-2" />
          {error}
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Réservations récemment annulées</h2>
        <div className="text-center text-gray-500 py-6">
          <FiX className="text-4xl mx-auto mb-2" />
          <p>Aucune réservation annulée récemment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Réservations récemment annulées</h2>
      
      <div className="space-y-4">
        {bookings.map(booking => {
          const daysDifference = getDaysDifference(booking.cancelled_at, booking.check_in_date);
          
          return (
            <div key={booking.id} className="border border-red-100 bg-red-50 rounded-lg p-4">
              <div className="flex justify-between">
                <h3 className="font-medium">
                  <Link to={`/owner/bookings/${booking.id}`} className="text-primary-600 hover:underline">
                    {booking.property_title}
                  </Link>
                </h3>
                <div className="flex items-center">
                <span className="text-red-600 text-sm px-2 py-1 bg-white rounded-full border border-red-200 mr-2">
                    Annulée
                </span>
                {booking.notes && booking.notes.includes('période de grâce') && (
                    <span className="text-blue-600 text-xs px-2 py-1 bg-blue-50 rounded-full border border-blue-200">
                    Période de grâce
                    </span>
                )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <FiCalendar className="mr-1" size={14} />
                  <span>{formatDate(booking.check_in_date)} - {formatDate(booking.check_out_date)}</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <FiUser className="mr-1" size={14} />
                  <span>{booking.tenant_name}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-3 text-sm">
                <div className="text-gray-700">
                  <strong>Annulée le:</strong> {formatDate(booking.cancelled_at)}
                  {daysDifference !== null && (
                    <span className={`ml-2 ${daysDifference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ({daysDifference > 0 ? `${daysDifference} jours avant l'arrivée` : 'après la date d\'arrivée'})
                    </span>
                  )}
                </div>
                
                <div className="font-medium">
                    <FiDollarSign className="inline-block mr-1" size={14} />
                    {booking.notes && booking.notes.includes('période de grâce') ? (
                        <span className="text-blue-600">Aucune compensation</span>
                    ) : booking.owner_compensation ? (
                        <span className="text-green-600">
                        {booking.owner_compensation.amount > 0 
                            ? `+${booking.owner_compensation.amount.toLocaleString()} FCFA (${booking.owner_compensation.percentage}%)`
                            : "Aucune compensation"}
                        </span>
                    ) : (
                        <span className="text-gray-600">Calcul en cours...</span>
                    )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 text-center">
        <Link to="/owner/bookings?status=cancelled">
          <Button variant="outline" size="sm">
            Voir toutes les annulations
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default CancelledBookingsWidget;