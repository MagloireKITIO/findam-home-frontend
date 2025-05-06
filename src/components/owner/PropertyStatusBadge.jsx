// src/components/owner/PropertyStatusBadge.jsx
import React from 'react';
import { FiEye, FiEyeOff, FiClock, FiAlertCircle } from 'react-icons/fi';

/**
 * Badge indiquant le statut d'une propriété
 * @param {string} status - Statut de la propriété (published, draft, pending, rejected)
 * @param {string} className - Classes CSS additionnelles
 */
const PropertyStatusBadge = ({ status, className = '' }) => {
  // Configuration des styles et icônes selon le statut
  const statusConfig = {
    published: {
      icon: <FiEye />,
      label: 'Publié',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-200'
    },
    draft: {
      icon: <FiEyeOff />,
      label: 'Non publié',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800',
      borderColor: 'border-gray-200'
    },
    pending: {
      icon: <FiClock />,
      label: 'En attente',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-200'
    },
    rejected: {
      icon: <FiAlertCircle />,
      label: 'Rejeté',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      borderColor: 'border-red-200'
    }
  };

  // Utiliser la configuration par défaut si le statut n'est pas reconnu
  const config = statusConfig[status] || statusConfig.draft;

  return (
    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border 
      ${config.bgColor} ${config.textColor} ${config.borderColor} ${className}`}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </div>
  );
};

export default PropertyStatusBadge;