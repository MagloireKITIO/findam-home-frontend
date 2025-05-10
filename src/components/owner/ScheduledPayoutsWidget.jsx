// src/components/owner/ScheduledPayoutsWidget.jsx
// Composant pour afficher les versements programmés sur le tableau de bord propriétaire

import React, { useState, useEffect } from 'react';
import { FiClock, FiDollarSign, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import api from '../../services/api';

const ScheduledPayoutsWidget = () => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchScheduledPayouts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/payments/payouts/', {
            params: {
              status__in: 'scheduled,ready,processing'  // Utiliser status__in pour les filtres multiples
            }
          });
        
        setPayouts(response.data.results || []);
        setError(null);
      } catch (err) {
        console.error('Erreur lors de la récupération des versements programmés:', err);
        setError('Impossible de charger les versements programmés');
      } finally {
        setLoading(false);
      }
    };

    fetchScheduledPayouts();
  }, []);

  // Fonction pour formater le montant
  const formatAmount = (amount, currency = 'XAF') => {
    return `${Number(amount).toLocaleString()} ${currency}`;
  };

  // Fonction pour obtenir l'icône et la classe de couleur selon le statut
  const getStatusInfo = (status) => {
    switch (status) {
      case 'scheduled':
        return { 
          icon: <FiClock className="text-blue-500" />, 
          textColor: 'text-blue-700',
          bgColor: 'bg-blue-50',
          label: 'Programmé'
        };
      case 'ready':
        return { 
          icon: <FiCheckCircle className="text-green-500" />, 
          textColor: 'text-green-700',
          bgColor: 'bg-green-50',
          label: 'Prêt à verser'
        };
      case 'processing':
        return { 
          icon: <FiDollarSign className="text-yellow-500" />, 
          textColor: 'text-yellow-700',
          bgColor: 'bg-yellow-50',
          label: 'En cours'
        };
      default:
        return { 
          icon: <FiAlertCircle className="text-gray-500" />, 
          textColor: 'text-gray-700',
          bgColor: 'bg-gray-50',
          label: status
        };
    }
  };

  // Fonction pour calculer une date relative
  const getRelativeDate = (dateString) => {
    if (!dateString) return 'Non défini';

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Il y a ${Math.abs(diffDays)} jour${Math.abs(diffDays) > 1 ? 's' : ''}`;
    } else if (diffDays === 0) {
      return "Aujourd'hui";
    } else if (diffDays === 1) {
      return "Demain";
    } else if (diffDays < 30) {
      return `Dans ${diffDays} jours`;
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Versements programmés</h2>
        <div className="flex justify-center">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Versements programmés</h2>
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          <FiAlertCircle className="inline-block mr-2" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Versements programmés</h2>
      
      {payouts.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <FiDollarSign className="mx-auto text-gray-400 mb-2" size={24} />
          <p>Aucun versement programmé pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payouts.map(payout => {
            const statusInfo = getStatusInfo(payout.status);
            
            return (
              <div 
                key={payout.id} 
                className={`p-4 rounded-lg border flex items-center ${statusInfo.bgColor}`}
              >
                <div className="h-10 w-10 rounded-full flex items-center justify-center mr-4 bg-white">
                  {statusInfo.icon}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className={`font-medium ${statusInfo.textColor}`}>
                        {formatAmount(payout.amount)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {payout.bookings_details && payout.bookings_details.length > 0 
                          ? `Pour ${payout.bookings_details.length} réservation(s)` 
                          : 'Versement programmé'}
                      </div>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full ${statusInfo.bgColor} ${statusInfo.textColor} border border-current`}>
                      {statusInfo.label}
                    </div>
                  </div>
                  
                  {payout.scheduled_at && (
                    <div className="mt-2 text-xs text-gray-500 flex items-center">
                      <FiClock className="mr-1" />
                      <span>Prévu: {getRelativeDate(payout.scheduled_at)}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          <div className="text-center mt-4">
            <a href="/owner/payouts" className="text-primary-600 text-sm hover:underline">
              Voir tous les versements
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduledPayoutsWidget;