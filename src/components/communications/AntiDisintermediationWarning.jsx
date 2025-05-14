// src/components/communications/AntiDisintermediationWarning.jsx

import React from 'react';
import { FiShield, FiAlertTriangle } from 'react-icons/fi';

const AntiDisintermediationWarning = ({ 
  hasFilteredContent = false,
  warningMessage = null,
  className = ""
}) => {
  if (!hasFilteredContent && !warningMessage) return null;

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <FiShield className="h-5 w-5 text-blue-600" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-800">
            Protection anti-désintermédiation
          </h3>
          <div className="mt-2 text-sm text-blue-700">
            {warningMessage || (
              <>
                🔒 Pour votre sécurité et celle de tous les utilisateurs, 
                restez sur la plateforme Findam pour toutes vos communications. 
                Les coordonnées seront disponibles après confirmation de votre réservation.
              </>
            )}
          </div>
          {hasFilteredContent && (
            <div className="mt-3 flex items-center text-xs text-blue-600">
              <FiAlertTriangle className="mr-1" />
              Certaines informations de contact ont été masquées dans ce message
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AntiDisintermediationWarning;