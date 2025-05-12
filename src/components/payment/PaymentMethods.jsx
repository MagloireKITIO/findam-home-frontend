// src/components/payment/PaymentMethods.jsx
// Composant pour gérer les méthodes de paiement avec activation

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, FiCreditCard, FiSmartphone, FiBriefcase, 
  FiCheck, FiX, FiEye, FiEyeOff, FiRefreshCw,
  FiAlertTriangle, FiShield
} from 'react-icons/fi';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import usePaymentMethods from '../../hooks/usePaymentMethods';
import AddPaymentMethodModal from './AddPaymentMethodModal';
import PaymentMethodCard from './PaymentMethodCard';

const PaymentMethods = ({ className = '' }) => {
  const { currentUser } = useAuth();
  const { success, error: notifyError } = useNotification();
  
  // Utiliser notre hook personnalisé
  const {
    paymentMethods,
    activeMethod,
    summary,
    loading,
    loadPaymentMethods,
    loadSummary,
    addPaymentMethod,
    activateMethod,
    deactivateMethod,
    verifyMethod,
    setDefaultMethod,
    deleteMethod
  } = usePaymentMethods();

  // États locaux pour l'interface
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Charger les méthodes de paiement à l'initialisation
  useEffect(() => {
    loadPaymentMethods();
    loadSummary();
  }, [loadPaymentMethods, loadSummary]);

  const handleAddMethod = async (methodData) => {
    try {
      const newMethod = await addPaymentMethod(methodData);
      setShowAddModal(false);
      
      // Vérifier que newMethod a un ID avant de déclencher la vérification
      if (newMethod && newMethod.id) {
        setTimeout(() => {
          verifyMethod(newMethod.id);
        }, 1000);
      }
      
    } catch (err) {
      // L'erreur est déjà gérée dans le hook
    }
  };

  const handleActivate = async (methodId) => {
    try {
      await activateMethod(methodId);
    } catch (err) {
      // L'erreur est déjà gérée dans le hook
    }
  };

  const handleDeactivate = async (methodId) => {
    try {
      await deactivateMethod(methodId);
    } catch (err) {
      // L'erreur est déjà gérée dans le hook
    }
  };

  const handleVerify = async (methodId) => {
    try {
      setRefreshing(true);
      await verifyMethod(methodId);
    } catch (err) {
      // L'erreur est déjà gérée dans le hook
    } finally {
      setRefreshing(false);
    }
  };

  const handleSetDefault = async (methodId) => {
    try {
      await setDefaultMethod(methodId);
    } catch (err) {
      // L'erreur est déjà gérée dans le hook
    }
  };

  const handleDelete = async (methodId) => {
    try {
      await deleteMethod(methodId);
    } catch (err) {
      // L'erreur est déjà gérée dans le hook
    }
  };

  const getMethodIcon = (method) => {
    switch (method.payment_type) {
      case 'mobile_money':
        return <FiSmartphone className="text-primary-600" size={24} />;
      case 'bank_account':
        return <FiBriefcase className="text-primary-600" size={24} />;
      case 'credit_card':
        return <FiCreditCard className="text-primary-600" size={24} />;
      default:
        return <FiCreditCard className="text-primary-600" size={24} />;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'yellow', icon: FiRefreshCw, text: 'En vérification' },
      verified: { color: 'green', icon: FiCheck, text: 'Vérifiée' },
      failed: { color: 'red', icon: FiX, text: 'Échec' },
      disabled: { color: 'gray', icon: FiX, text: 'Désactivée' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
        <Icon className="mr-1" size={12} />
        {config.text}
      </span>
    );
  };

  if (loading && !paymentMethods.length) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {/* En-tête */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Méthodes de paiement</h2>
            <p className="text-gray-600 mt-1">
              Gérez vos méthodes de paiement pour recevoir des remboursements et versements
            </p>
          </div>
          <Button
            variant="primary"
            icon={<FiPlus />}
            onClick={() => setShowAddModal(true)}
            disabled={loading}
          >
            Ajouter une méthode
          </Button>
        </div>
      </div>

      {/* Résumé */}
      {summary && (
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">{summary.total_methods}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{summary.verified_methods}</div>
              <div className="text-sm text-gray-600">Vérifiées</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{summary.pending_methods}</div>
              <div className="text-sm text-gray-600">En attente</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{summary.failed_methods}</div>
              <div className="text-sm text-gray-600">Échouées</div>
            </div>
          </div>
        </div>
      )}

      {/* Méthode active */}
      {activeMethod && (
        <div className="p-6 bg-green-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                <FiShield className="text-green-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-800">Méthode active</h3>
                <p className="text-green-700">{activeMethod.display_name}</p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleDeactivate(activeMethod.id)}
              disabled={loading}
            >
              Désactiver
            </Button>
          </div>
        </div>
      )}

      {/* Liste des méthodes */}
      <div className="p-6">
        {paymentMethods.length === 0 ? (
          <div className="text-center py-8">
            <FiCreditCard className="mx-auto text-gray-400" size={48} />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Aucune méthode de paiement</h3>
            <p className="mt-2 text-gray-600">
              Ajoutez une méthode de paiement pour recevoir des versements.
            </p>
            <Button
              variant="primary"
              className="mt-4"
              icon={<FiPlus />}
              onClick={() => setShowAddModal(true)}
            >
              Ajouter votre première méthode
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {paymentMethods.map((method) => (
                <motion.div
                  key={method.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -300 }}
                  className={`
                    border rounded-lg p-4 transition-all duration-200
                    ${method.is_active ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}
                  `}
                >
                  <PaymentMethodCard
                    method={method}
                    onActivate={() => handleActivate(method.id)}
                    onDeactivate={() => handleDeactivate(method.id)}
                    onVerify={() => handleVerify(method.id)}
                    onSetDefault={() => handleSetDefault(method.id)}
                    onDelete={() => handleDelete(method.id)}
                    isRefreshing={refreshing}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Informations sur la sécurité */}
      <div className="p-6 bg-blue-50 border-t border-gray-200">
        <div className="flex items-start">
          <FiAlertTriangle className="text-blue-600 mt-1 mr-3" size={20} />
          <div>
            <h4 className="font-medium text-blue-800 mb-1">Sécurité et confidentialité</h4>
            <p className="text-blue-700 text-sm">
              Toutes vos informations de paiement sont chiffrées et sécurisées. Nous ne stockons jamais
              d'informations sensibles comme les codes CVV. La vérification est effectuée via NotchPay
              pour garantir la validité de vos méthodes.
            </p>
          </div>
        </div>
      </div>

      {/* Modal d'ajout */}
      <AddPaymentMethodModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddMethod}
        loading={loading}
      />
    </div>
  );
};

export default PaymentMethods;