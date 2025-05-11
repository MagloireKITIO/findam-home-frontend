// src/components/auth/SocialAuthButtons.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

/**
 * Composant de boutons d'authentification sociale
 * Affiche des boutons pour la connexion via Google, Facebook, etc.
 * 
 * @param {Object} props - Props du composant
 * @param {Function} props.onGoogleAuth - Fonction appelée lors du clic sur le bouton Google
 * @param {Function} props.onFacebookAuth - Fonction appelée lors du clic sur le bouton Facebook
 * @param {string} props.buttonSize - Taille des boutons ("sm", "md", "lg")
 * @param {string} props.layout - Disposition des boutons ("row", "col", "grid")
 * @param {string} props.className - Classes CSS supplémentaires
 */
const SocialAuthButtons = ({ 
  onGoogleAuth, 
  onFacebookAuth, 
  buttonSize = "md", 
  layout = "row",
  className = "",
  isLoading = false
}) => {
  // Configuration des tailles
  const sizes = {
    sm: {
      button: "px-3 py-1.5 text-xs",
      icon: "h-4 w-4 mr-1.5"
    },
    md: {
      button: "px-4 py-2 text-sm",
      icon: "h-5 w-5 mr-2"
    },
    lg: {
      button: "px-6 py-3 text-base",
      icon: "h-6 w-6 mr-2"
    }
  };

  // Configuration des dispositions
  const layouts = {
    row: "flex space-x-3",
    col: "flex flex-col space-y-3",
    grid: "grid grid-cols-2 gap-3"
  };

  // Animation des boutons
  const buttonVariants = {
    hover: { 
      scale: 1.03,
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
    },
    tap: { 
      scale: 0.97
    }
  };

  return (
    <div className={`${layouts[layout]} ${className}`}>
      {/* Bouton Google */}
      <motion.button
        type="button"
        onClick={onGoogleAuth}
        disabled={isLoading}
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        className={`
          flex items-center justify-center 
          border border-gray-300 rounded-md shadow-sm 
          text-gray-700 bg-white hover:bg-gray-50 
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 
          transition-colors
          ${sizes[buttonSize].button}
          ${layout === "col" ? "w-full" : ""}
          ${isLoading ? "opacity-70 cursor-not-allowed" : ""}
        `}
      >
        <svg 
          className={sizes[buttonSize].icon} 
          viewBox="0 0 24 24" 
          width="24" 
          height="24"
        >
          <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
            <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
            <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
            <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
            <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
          </g>
        </svg>
        <span>Google</span>
      </motion.button>

      {/* Bouton Facebook */}
      <motion.button
        type="button"
        onClick={onFacebookAuth}
        disabled={isLoading}
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        className={`
          flex items-center justify-center 
          border border-gray-300 rounded-md shadow-sm 
          text-gray-700 bg-white hover:bg-gray-50 
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 
          transition-colors
          ${sizes[buttonSize].button}
          ${layout === "col" ? "w-full" : ""}
          ${isLoading ? "opacity-70 cursor-not-allowed" : ""}
        `}
      >
        <svg 
          className={sizes[buttonSize].icon} 
          viewBox="0 0 24 24" 
          fill="#1877F2"
        >
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        <span>Facebook</span>
      </motion.button>
    </div>
  );
};

SocialAuthButtons.propTypes = {
  onGoogleAuth: PropTypes.func.isRequired,
  onFacebookAuth: PropTypes.func.isRequired,
  buttonSize: PropTypes.oneOf(['sm', 'md', 'lg']),
  layout: PropTypes.oneOf(['row', 'col', 'grid']),
  className: PropTypes.string,
  isLoading: PropTypes.bool
};

export default SocialAuthButtons;