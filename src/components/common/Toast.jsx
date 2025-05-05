// src/components/common/Toast.jsx
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiInfo, FiAlertCircle, FiXCircle, FiX } from 'react-icons/fi';

const Toast = ({
  message,
  type = 'info',
  duration = 3000,
  position = 'top-right',
  onClose,
  isVisible = true,
}) => {
  // Icônes par type
  const icons = {
    success: <FiCheckCircle size={20} />,
    info: <FiInfo size={20} />,
    warning: <FiAlertCircle size={20} />,
    error: <FiXCircle size={20} />,
  };

  // Classes par type
  const typeClasses = {
    success: 'bg-green-50 text-green-800 border-green-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    error: 'bg-red-50 text-red-800 border-red-200',
  };

  // Classes par position
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
  };

  // Variantes pour l'animation
  const toastVariants = {
    initial: (position) => {
      if (position.includes('top')) return { opacity: 0, y: -50 };
      if (position.includes('bottom')) return { opacity: 0, y: 50 };
      return { opacity: 0 };
    },
    animate: { opacity: 1, y: 0 },
    exit: (position) => {
      if (position.includes('top')) return { opacity: 0, y: -50 };
      if (position.includes('bottom')) return { opacity: 0, y: 50 };
      return { opacity: 0 };
    },
  };

  // Fermeture automatique après la durée spécifiée
  useEffect(() => {
    if (isVisible && duration !== null && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  // Pas de rendu si pas de message ou si la notification n'est pas visible
  if (!message || !isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`fixed ${positionClasses[position]} z-50 max-w-sm w-full shadow-lg`}
          variants={toastVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          custom={position}
          transition={{ duration: 0.3 }}
        >
          <div 
            className={`flex items-center p-4 rounded-lg shadow-lg border ${typeClasses[type]}`}
          >
            <div className="flex-shrink-0 mr-3">
              {icons[type]}
            </div>
            <div className="flex-grow">
              <p className="text-sm font-medium">{message}</p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 ml-2 focus:outline-none"
              aria-label="Fermer"
            >
              <FiX size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;