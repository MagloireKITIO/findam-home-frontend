// src/components/payment/OwnerPaymentWarning.jsx
// Composant d'avertissement pour les propriétaires lors de l'ajout d'une méthode de paiement

import React from 'react';
import { FiAlertTriangle, FiClock, FiCheck } from 'react-icons/fi';

const OwnerPaymentWarning = ({ paymentType = 'mobile_money' }) => {
  if (paymentType !== 'mobile_money') return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <FiAlertTriangle className="text-amber-600 mt-1 mr-3 flex-shrink-0" size={20} />
        <div className="flex-1">
          <h4 className="font-semibold text-amber-800 mb-2">
            Important - Activation de votre compte de versement
          </h4>
          <div className="text-amber-700 space-y-2">
            <div className="flex items-center">
              <FiClock className="mr-2" size={16} />
              <p className="text-sm">
                Votre compte de versement sera activé sous <strong>24h à 48h maximum</strong>
              </p>
            </div>
            <div className="flex items-center">
              <FiCheck className="mr-2" size={16} />
              <p className="text-sm">
                Veuillez entrer un <strong>numéro Mobile Money valide</strong>, car ce numéro sera utilisé pour effectuer vos versements
              </p>
            </div>
          </div>
          <div className="mt-3 text-xs text-amber-600">
            <p>
              ⚠️ Assurez-vous que votre compte Orange Money est activé et fonctionnel avant de soumettre.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerPaymentWarning;