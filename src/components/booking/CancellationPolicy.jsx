// src/components/booking/CancellationPolicy.jsx
import React from 'react';
import { FiAlertCircle, FiCheck, FiX } from 'react-icons/fi';

/**
 * Composant pour afficher la politique d'annulation et calculer le montant remboursable
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.policyType - Type de politique ('flexible', 'moderate', 'strict')
 * @param {Date} props.checkInDate - Date d'arrivée
 * @param {number} props.basePrice - Prix de base (sans frais)
 * @param {number} props.cleaningFee - Frais de ménage
 * @param {number} props.serviceFee - Frais de service
 */
const CancellationPolicy = ({ 
  policyType = 'moderate', 
  checkInDate, 
  basePrice = 0, 
  cleaningFee = 0,
  serviceFee = 0,
  gracePeriodMinutes = 30, // Nouveau prop pour la période de grâce
  reservationTime = null // Nouveau prop pour l'heure de réservation
}) => {
  // Politiques d'annulation (en jours avant l'arrivée)
  const policies = {
    'flexible': {
      fullRefund: 1,
      partialRefund: 0,
      partialRate: 0.5,
      description: "Annulation gratuite jusqu'à 24 heures avant l'arrivée. Annulation après ce délai : remboursement de 50% du montant payé."
    },
    'moderate': {
      fullRefund: 5,
      partialRefund: 0,
      partialRate: 0.5,
      description: "Annulation gratuite jusqu'à 5 jours avant l'arrivée. Annulation après ce délai : remboursement de 50% du montant payé."
    },
    'strict': {
      fullRefund: 14,
      partialRefund: 7,
      partialRate: 0.5,
      description: "Annulation gratuite jusqu'à 14 jours avant l'arrivée. Annulation entre 7 et 14 jours avant l'arrivée : remboursement de 50% du montant payé. Annulation moins de 7 jours avant l'arrivée : aucun remboursement."
    }
  };

  const policy = policies[policyType] || policies.moderate;
  
  // Calculer les jours restants avant l'arrivée
  const calculateDaysUntilCheckin = () => {
    if (!checkInDate) return null;
    
    const today = new Date();
    const checkin = new Date(checkInDate);
    const timeDiff = checkin.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };
  
  const daysUntilCheckin = calculateDaysUntilCheckin();
  
  // Déterminer la situation de remboursement actuelle
  const getRefundScenario = () => {
    if (daysUntilCheckin === null) return null;
    
    if (daysUntilCheckin >= policy.fullRefund) {
      return {
        type: 'full',
        rate: 1.0,
        message: `Remboursement complet disponible (${daysUntilCheckin} jours avant l'arrivée)`
      };
    } else if (daysUntilCheckin >= policy.partialRefund) {
      return {
        type: 'partial',
        rate: policy.partialRate,
        message: `Remboursement partiel de ${policy.partialRate * 100}% (${daysUntilCheckin} jours avant l'arrivée)`
      };
    } else {
      return {
        type: 'none',
        rate: 0,
        message: `Aucun remboursement disponible (${daysUntilCheckin} jours avant l'arrivée)`
      };
    }
  };
  
  const refundScenario = getRefundScenario();
  
  // Calculer le montant remboursable
  const calculateRefundableAmount = () => {
    if (!refundScenario) return 0;
    
    // S'assurer que les valeurs sont des nombres
    const baseP = Number(basePrice) || 0;
    const cleaningF = Number(cleaningFee) || 0;
    
    const refundableBase = baseP + cleaningF;
    return refundableBase * refundScenario.rate;
  };
  
  // Et assurez-vous d'initialiser refundableAmount correctement:
  const refundableAmount = calculateRefundableAmount() || 0;
 
  const isWithinGracePeriod = () => {
    if (!reservationTime) return false;
    
    const reservationDate = new Date(reservationTime);
    const now = new Date();
    const gracePeriodEnd = new Date(reservationDate.getTime() + gracePeriodMinutes * 60000);
    
    return now <= gracePeriodEnd;
  };

  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Politique d'annulation</h2>
      
      <div className="mb-4">
        <div className="flex items-center mb-2">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
            policyType === 'flexible' ? 'bg-green-100 text-green-500' : 
            policyType === 'moderate' ? 'bg-yellow-100 text-yellow-500' : 
            'bg-red-100 text-red-500'
          }`}>
            {policyType === 'flexible' ? <FiCheck /> : 
             policyType === 'moderate' ? <FiAlertCircle /> : 
             <FiX />}
          </div>
          <span className="font-medium capitalize">{policyType}</span>
        </div>
        
        <p className="text-gray-700 mb-4">
          {policy.description}
        </p>
      </div>
      
      {daysUntilCheckin !== null && (
        <div className={`p-4 rounded-lg ${
          refundScenario?.type === 'full' ? 'bg-green-50 border border-green-200' : 
          refundScenario?.type === 'partial' ? 'bg-yellow-50 border border-yellow-200' : 
          'bg-red-50 border border-red-200'
        }`}>
          <h3 className="font-medium mb-2">Si vous annulez maintenant</h3>
          
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700">Situation actuelle:</span>
            <span className={`font-medium ${
              refundScenario?.type === 'full' ? 'text-green-600' : 
              refundScenario?.type === 'partial' ? 'text-yellow-600' : 
              'text-red-600'
            }`}>
              {refundScenario?.message}
            </span>
          </div>
          
          {refundableAmount !== null && (
            <>
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-700">Montant réservation:</span>
                <span>{basePrice.toLocaleString()} FCFA</span>
              </div>
              
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-700">Frais de ménage:</span>
                <span>{cleaningFee.toLocaleString()} FCFA</span>
              </div>
              
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-700">Frais de service:</span>
                <span>Non remboursables</span>
              </div>
              
              <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between items-center font-semibold">
                <span>Montant remboursable:</span>
                <span className={`${
                  refundScenario?.type === 'full' ? 'text-green-600' : 
                  refundScenario?.type === 'partial' ? 'text-yellow-600' : 
                  'text-red-600'
                }`}>
                  {refundableAmount.toLocaleString()} FCFA
                </span>
              </div>
            </>
          )}
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-500">
        <FiAlertCircle className="inline-block mr-1" />
        Les conditions d'annulation sont appliquées automatiquement selon le calendrier ci-dessus.
      </div>
      {/* Information sur la période de grâce */}
        <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
            <div className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-blue-500 mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
            </div>
            <div>
                <h4 className="font-medium text-blue-700">Période de grâce</h4>
                <p className="text-sm text-blue-600">
                Vous bénéficiez d'une période de grâce de {gracePeriodMinutes} minutes après la réservation 
                pour annuler sans frais et obtenir un remboursement total (hors frais de service).
                </p>
                {reservationTime && (
                <p className="text-xs mt-1 text-blue-500">
                    {isWithinGracePeriod() 
                    ? `Cette période de grâce est actuellement active jusqu'à ${new Date(new Date(reservationTime).getTime() + gracePeriodMinutes * 60000).toLocaleTimeString()}.` 
                    : "Cette période de grâce est expirée pour cette réservation."}
                </p>
                )}
            </div>
            </div>
        </div>
    </div>
    
    
  );
};

export default CancellationPolicy;