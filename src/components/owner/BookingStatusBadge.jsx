// src/components/owner/BookingStatusBadge.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiClock, FiAlertCircle } from 'react-icons/fi';

/**
 * Composant pour afficher un badge de statut de réservation
 * @param {string} status - Le statut de la réservation ('pending', 'confirmed', 'completed', 'cancelled')
 * @param {string} className - Classes CSS supplémentaires
 * @returns {JSX.Element} Le badge avec le statut
 */
const BookingStatusBadge = ({ status, className = '' }) => {
  // Configuration des styles et icônes selon le statut
  const statusConfig = {
    pending: {
      icon: <FiClock />,
      label: 'En attente',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-200'
    },
    confirmed: {
      icon: <FiCheckCircle />,
      label: 'Confirmée',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-200'
    },
    completed: {
      icon: <FiCheckCircle />,
      label: 'Terminée',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      borderColor: 'border-blue-200'
    },
    cancelled: {
      icon: <FiXCircle />,
      label: 'Annulée',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      borderColor: 'border-red-200'
    },
    draft: {
      icon: <FiClock />,
      label: 'Brouillon',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800',
      borderColor: 'border-gray-200'
    },
    // Statut par défaut si le statut fourni n'est pas reconnu
    default: {
      icon: <FiAlertCircle />,
      label: 'Inconnu',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800',
      borderColor: 'border-gray-200'
    }
  };

  // Utiliser la configuration du statut fourni ou la configuration par défaut
  const config = statusConfig[status] || statusConfig.default;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${config.bgColor} ${config.textColor} border ${config.borderColor}
        ${className}
      `}
    >
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </motion.div>
  );
};

export default BookingStatusBadge;