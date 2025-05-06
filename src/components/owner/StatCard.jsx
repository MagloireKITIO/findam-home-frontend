// src/components/owner/StatCard.jsx
import React from 'react';
import { motion } from 'framer-motion';

/**
 * Carte de statistique pour le tableau de bord propriétaire
 * @param {string} title - Titre de la statistique
 * @param {string|number} value - Valeur à afficher
 * @param {React.ReactNode} icon - Icône à afficher
 * @param {string} color - Couleur de la carte (green, blue, purple, orange)
 * @param {string} className - Classes CSS additionnelles
 */
const StatCard = ({ title, value, icon, color = 'blue', className = '' }) => {
  // Définir les couleurs selon la propriété color
  const colorClasses = {
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      iconBg: 'bg-green-100',
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      iconBg: 'bg-blue-100',
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-700',
      iconBg: 'bg-purple-100',
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-700',
      iconBg: 'bg-orange-100',
    },
  };

  const classes = colorClasses[color] || colorClasses.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className={`${classes.bg} border ${classes.border} rounded-lg p-6 shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className={`w-10 h-10 rounded-full ${classes.iconBg} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <div className={`text-2xl md:text-3xl font-bold ${classes.text}`}>
        {value}
      </div>
    </motion.div>
  );
};

export default StatCard;