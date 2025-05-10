// src/components/owner/CompensationPayoutsWidget.jsx
import React, { useState, useEffect } from 'react';
import { FiAlertCircle, FiCheck, FiDollarSign } from 'react-icons/fi';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * Widget pour afficher les versements de compensation suite aux annulations
 */
const CompensationPayoutsWidget = () => {
  const [compensations, setCompensations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompensations = async () => {
      try {
        setLoading(true);
        // Récupérer les versements qui contiennent "Compensation" dans les notes
        const response = await api.get('/payments/payouts/', {
          params: {
            status__in: 'pending,scheduled,ready,processing',
            search: 'Compensation'
          }
        });
        
        // Filtrer pour ne garder que ceux qui mentionnent vraiment une compensation
        const filteredPayouts = (response.data.results || []).filter(
          payout => payout.notes && payout.notes.includes('Compensation')
        );
        
        setCompensations(filteredPayouts);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des compensations:', err);
        setError('Impossible de charger les compensations');
      } finally {
        setLoading(false);
      }
    };

    fetchCompensations();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Compensations d'annulation</h2>
        <div className="flex justify-center py-6">
          <LoadingSpinner size="md" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Compensations d'annulation</h2>
        <div className="text-red-500 p-4 bg-red-50 rounded-lg">
          <FiAlertCircle className="inline-block mr-2" />
          {error}
        </div>
      </div>
    );
  }

  if (compensations.length === 0) {
    return null; // Ne pas afficher le widget s'il n'y a pas de compensations
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Compensations d'annulation</h2>
      
      <div className="space-y-4">
        {compensations.map(compensation => (
          <div 
            key={compensation.id} 
            className="p-4 rounded-lg border border-green-200 bg-green-50"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-green-700">
                  {compensation.amount.toLocaleString()} FCFA
                </div>
                <div className="text-sm text-gray-600">
                  {compensation.notes}
                </div>
              </div>
              <div className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 border border-green-300">
                {compensation.status === 'ready' 
                  ? 'Prêt à verser' 
                  : compensation.status === 'processing'
                    ? 'En cours'
                    : 'Programmé'}
              </div>
            </div>
            
            {compensation.scheduled_at && (
              <div className="mt-2 text-xs text-gray-500">
                Versement prévu le {new Date(compensation.scheduled_at).toLocaleDateString('fr-FR')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompensationPayoutsWidget;