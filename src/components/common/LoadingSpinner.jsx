// src/components/common/LoadingSpinner.jsx
import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 'md', color = 'primary', className = '' }) => {
  // Tailles disponibles
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  // Couleurs disponibles
  const colors = {
    primary: 'border-primary-500',
    secondary: 'border-secondary-500',
    white: 'border-white',
    gray: 'border-gray-500',
  };

  // Animation de rotation
  const spinTransition = {
    repeat: Infinity,
    ease: "linear",
    duration: 1
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <motion.div
        className={`${sizes[size]} border-4 border-t-transparent ${colors[color]} rounded-full`}
        animate={{ rotate: 360 }}
        transition={spinTransition}
      />
    </div>
  );
};

export default LoadingSpinner;