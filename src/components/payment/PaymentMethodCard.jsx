// src/components/payment/PaymentMethodCard.jsx
// Composant pour afficher une carte de méthode de paiement

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiSmartphone, FiBriefcase, FiCreditCard, FiCheck, FiX, 
  FiRefreshCw, FiStar, FiMoreVertical, FiShield,
  FiTrash2, FiEdit, FiEye, FiActivate
} from 'react-icons/fi';
import Button from '../common/Button';
import ConfirmationModal from '../common/ConfirmationModal';

const PaymentMethodCard = ({ 
  method, 
  onActivate, 
  onDeactivate, 
  onVerify, 
  onSetDefault,
  onEdit,
  onDelete,
  isRefreshing = false 
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Configuration des types de paiement
  const paymentTypeConfig = {
    mobile_money: {
      icon: FiSmartphone,
      label: 'Mobile Money',
      color: 'blue'
    },
    bank_account: {
      icon: FiBriefcase,
      label: 'Compte Bancaire',
      color: 'green'
    },
    credit_card: {
      icon: FiCreditCard,
      label: 'Carte Bancaire',
      color: 'purple'
    }
  };

  // Configuration des statuts
  const statusConfig = {
    pending: {
      color: 'yellow',
      icon: FiRefreshCw,
      text: 'En vérification',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-600'
    },
    verified: {
      color: 'green',
      icon: FiCheck,
      text: 'Vérifiée',
      bgColor: 'bg-green-50',
      textColor: 'text-green-800',
      iconColor: 'text-green-600'
    },
    failed: {
      color: 'red',
      icon: FiX,
      text: 'Échec de vérification',
      bgColor: 'bg-red-50',
      textColor: 'text-red-800',
      iconColor: 'text-red-600'
    },
    disabled: {
      color: 'gray',
      icon: FiX,
      text: 'Désactivée',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-800',
      iconColor: 'text-gray-600'
    }
  };

  const config = paymentTypeConfig[method.payment_type] || paymentTypeConfig.mobile_money;
  const statusConf = statusConfig[method.status] || statusConfig.pending;
  const Icon = config.icon;
  const StatusIcon = statusConf.icon;

  // Fonction pour obtenir le texte d'affichage de la méthode
  const getDisplayText = () => {
    if (method.payment_type === 'mobile_money') {
      return method.masked_phone_number || 'Numéro masqué';
    } else if (method.payment_type === 'bank_account') {
      return `${method.bank_name} - ${method.masked_account_number}`;
    } else if (method.payment_type === 'credit_card') {
      return `**** **** **** ${method.last_digits}`;
    }
    return method.nickname || 'Méthode de paiement';
  };

  // Fonction pour obtenir l'opérateur Mobile Money
  const getOperatorInfo = () => {
    if (method.payment_type === 'mobile_money' && method.operator) {
      const operators = {
        orange: { name: 'Orange Money', color: 'text-orange-600' },
        mtn: { name: 'MTN MoMo', color: 'text-yellow-600' }
      };
      return operators[method.operator] || {};
    }
    return {};
  };

  const operatorInfo = getOperatorInfo();

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          {/* Icône et badge actif */}
          <div className="relative">
            <div className={`w-12 h-12 rounded-lg bg-${config.color}-100 flex items-center justify-center`}>
              <Icon className={`text-${config.color}-600`} size={24} />
            </div>
            {method.is_active && (
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                <FiShield className="text-white" size={12} />
              </div>
            )}
          </div>

          {/* Informations de la méthode */}
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-gray-900">{getDisplayText()}</h3>
              {method.is_default && (
                <FiStar className="text-yellow-500" size={16} />
              )}
            </div>
            
            <div className="flex items-center space-x-2 mt-1">
              <span className={`text-sm ${operatorInfo.color || 'text-gray-600'}`}>
                {method.payment_type === 'mobile_money' && operatorInfo.name ? 
                  operatorInfo.name : 
                  config.label
                }
              </span>
              
              {/* Badge de statut */}
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConf.bgColor} ${statusConf.textColor}`}>
                <StatusIcon className={`mr-1 ${statusConf.iconColor}`} size={12} />
                {statusConf.text}
              </span>
            </div>

            {/* Informations supplémentaires */}
            {method.nickname && (
              <div className="text-xs text-gray-500 mt-1">
                {method.nickname}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {/* Bouton d'activation/désactivation principal */}
          {method.status === 'verified' && !method.is_active && (
            <Button
              variant="primary"
              size="sm"
              onClick={onActivate}
              disabled={isRefreshing}
            >
              Activer
            </Button>
          )}

          {method.is_active && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onDeactivate}
              disabled={isRefreshing}
            >
              Désactiver
            </Button>
          )}

          {/* Menu déroulant d'actions */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowActions(!showActions)}
              icon={<FiMoreVertical />}
            />

            {/* Menu d'actions */}
            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200"
              >
                <div className="py-1">
                  {/* Vérifier */}
                  {method.status !== 'verified' && (
                    <button
                      onClick={() => {
                        onVerify();
                        setShowActions(false);
                      }}
                      disabled={isRefreshing || method.verification_attempts >= 3}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiRefreshCw className="mr-3" size={16} />
                      Relancer la vérification
                    </button>
                  )}

                  {/* Définir par défaut */}
                  {method.status === 'verified' && !method.is_default && (
                    <button
                      onClick={() => {
                        onSetDefault();
                        setShowActions(false);
                      }}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FiStar className="mr-3" size={16} />
                      Définir par défaut
                    </button>
                  )}

                  {/* Modifier */}
                  {onEdit && (
                    <button
                      onClick={() => {
                        onEdit();
                        setShowActions(false);
                      }}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FiEdit className="mr-3" size={16} />
                      Modifier
                    </button>
                  )}

                  {/* Supprimer */}
                  {onDelete && !method.is_active && (
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(true);
                        setShowActions(false);
                      }}
                      className="flex w-full items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                    >
                      <FiTrash2 className="mr-3" size={16} />
                      Supprimer
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Informations détaillées (optionnelles) */}
      {method.last_verification_at && (
        <div className="mt-3 text-xs text-gray-500">
          Dernière vérification : {new Date(method.last_verification_at).toLocaleDateString('fr-FR')}
          {method.verification_attempts > 0 && (
            <span className="ml-2">
              ({method.verification_attempts} tentative{method.verification_attempts > 1 ? 's' : ''})
            </span>
          )}
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          onDelete();
          setShowDeleteConfirm(false);
        }}
        title="Supprimer la méthode de paiement"
        message={`Êtes-vous sûr de vouloir supprimer cette méthode de paiement ? Cette action est irréversible.`}
        confirmText="Supprimer"
        confirmVariant="danger"
      />
    </>
  );
};

export default PaymentMethodCard;