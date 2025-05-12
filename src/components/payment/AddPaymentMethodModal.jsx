// src/components/payment/AddPaymentMethodModal.jsx
// Modal pour ajouter une nouvelle méthode de paiement

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, FiSmartphone, FiBriefcase, FiCreditCard, 
  FiCheck, FiInfo, FiAlertTriangle
} from 'react-icons/fi';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import OwnerPaymentWarning from './OwnerPaymentWarning';

const AddPaymentMethodModal = ({ isOpen, onClose, onAdd, loading = false }) => {
  const [step, setStep] = useState(1); // 1: Type, 2: Détails, 3: Confirmation
  const { currentUser } = useAuth();
  const [selectedType, setSelectedType] = useState('');
  const [formData, setFormData] = useState({
    payment_type: '',
    nickname: '',
    phone_number: '',
    operator: '',
    account_number: '',
    account_name: '',
    bank_name: '',
    branch_code: ''
  });
  const [errors, setErrors] = useState({});

  // Réinitialiser le modal quand il se ferme
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setSelectedType('');
      setFormData({
        payment_type: '',
        nickname: '',
        phone_number: '',
        operator: '',
        account_number: '',
        account_name: '',
        bank_name: '',
        branch_code: ''
      });
      setErrors({});
    }
  }, [isOpen]);

  // Types de paiement disponibles
  const paymentTypes = [
    {
      value: 'mobile_money',
      label: 'Mobile Money',
      description: 'Orange Money, MTN MoMo',
      icon: FiSmartphone,
      color: 'blue'
    },
    {
      value: 'bank_account',
      label: 'Compte Bancaire',
      description: 'Compte dans une banque camerounaise',
      icon: FiBriefcase,
      color: 'green'
    },
    {
      value: 'credit_card',
      label: 'Carte Bancaire',
      description: 'Visa, Mastercard',
      icon: FiCreditCard,
      color: 'purple',
      disabled: true // Désactivé pour l'instant
    }
  ];

  // Banques camerounaises populaires
  const cameroonBanks = [
    'Afriland First Bank',
    'BICEC',
    'SGBC',
    'Ecobank',
    'UBA',
    'BGFI Bank',
    'CCA Bank',
    'NFC Bank',
    'Commercial Bank of Cameroon',
    'Autre'
  ];

  // Gestion des changements de formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Retirer l'erreur si elle existe
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Auto-détection de l'opérateur pour Mobile Money
    if (name === 'phone_number' && selectedType === 'mobile_money') {
      const cleanNumber = value.replace(/[^0-9]/g, '');
      if (cleanNumber.startsWith('69') || cleanNumber.startsWith('65')) {
        setFormData(prev => ({ ...prev, operator: 'orange' }));
      } else if (cleanNumber.startsWith('67') || cleanNumber.startsWith('68') || cleanNumber.startsWith('66')) {
        setFormData(prev => ({ ...prev, operator: 'mtn' }));
      }
    }
  };

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {};

    if (!formData.nickname) {
      newErrors.nickname = 'Veuillez donner un nom à cette méthode';
    }

    if (selectedType === 'mobile_money') {
      if (!formData.phone_number) {
        newErrors.phone_number = 'Numéro de téléphone requis';
      } else if (!/^(\+237)?[6][5-9]\d{7}$/.test(formData.phone_number.replace(/\s/g, ''))) {
        newErrors.phone_number = 'Numéro de téléphone camerounais invalide';
      }
    } else if (selectedType === 'bank_account') {
      if (!formData.account_number) {
        newErrors.account_number = 'Numéro de compte requis';
      }
      if (!formData.account_name) {
        newErrors.account_name = 'Nom du titulaire requis';
      }
      if (!formData.bank_name) {
        newErrors.bank_name = 'Nom de la banque requis';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gestion des étapes
  const nextStep = () => {
    if (step === 1 && selectedType) {
      setFormData(prev => ({ ...prev, payment_type: selectedType }));
      setStep(2);
    } else if (step === 2 && validateForm()) {
      setStep(3);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Soumission finale
  const handleSubmit = async () => {
    if (!validateForm()) return;

    // Formater les données selon le type
    const submitData = {
      payment_type: selectedType,
      nickname: formData.nickname
    };

    if (selectedType === 'mobile_money') {
      submitData.phone_number = formData.phone_number.replace(/\s/g, '');
      submitData.operator = formData.operator;
    } else if (selectedType === 'bank_account') {
      submitData.account_number = formData.account_number;
      submitData.account_name = formData.account_name;
      submitData.bank_name = formData.bank_name;
      submitData.branch_code = formData.branch_code;
    }

    onAdd(submitData);
  };

  // Rendu de l'étape 1 - Sélection du type
  const renderStepOne = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Choisissez un type de méthode</h3>
      
      <div className="grid gap-4">
        {paymentTypes.map((type) => {
          const Icon = type.icon;
          return (
            <motion.div
              key={type.value}
              whileHover={{ scale: type.disabled ? 1 : 1.02 }}
              whileTap={{ scale: type.disabled ? 1 : 0.98 }}
              onClick={() => !type.disabled && setSelectedType(type.value)}
              className={`
                border-2 rounded-lg p-4 cursor-pointer transition-all
                ${type.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary-300'}
                ${selectedType === type.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}
              `}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-lg bg-${type.color}-100 flex items-center justify-center`}>
                  <Icon className={`text-${type.color}-600`} size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{type.label}</h4>
                  <p className="text-sm text-gray-600">{type.description}</p>
                  {type.disabled && (
                    <p className="text-xs text-red-600 mt-1">Bientôt disponible</p>
                  )}
                </div>
                {selectedType === type.value && (
                  <FiCheck className="text-primary-600" size={20} />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  // Rendu de l'étape 2 - Détails
  const renderStepTwo = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Détails de la méthode</h3>
      {/* Avertissement pour les propriétaires */}
        {currentUser?.user_type === 'owner' && (
        <OwnerPaymentWarning paymentType={selectedType} />
        )}
      {/* Nom de la méthode */}
      <Input
        label="Nom de la méthode"
        name="nickname"
        value={formData.nickname}
        onChange={handleInputChange}
        placeholder="Ex: Mon compte Orange Money principal"
        error={errors.nickname}
        required
      />

      {/* Champs spécifiques au Mobile Money */}
      {selectedType === 'mobile_money' && (
        <>
          <Input
            label="Numéro de téléphone"
            name="phone_number"
            type="tel"
            value={formData.phone_number}
            onChange={handleInputChange}
            placeholder="+237 6XX XXX XXX"
            error={errors.phone_number}
            required
          />

          {/* Auto-détection de l'opérateur */}
          {formData.operator && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center text-green-800">
                <FiCheck className="mr-2" size={16} />
                <span className="text-sm">
                  Opérateur détecté : {formData.operator === 'orange' ? 'Orange Money' : 'MTN MoMo'}
                </span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Champs spécifiques au compte bancaire */}
      {selectedType === 'bank_account' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Numéro de compte"
              name="account_number"
              value={formData.account_number}
              onChange={handleInputChange}
              placeholder="XXXXXXXXXXXXXXX"
              error={errors.account_number}
              required
            />
            <Input
              label="Code agence (optionnel)"
              name="branch_code"
              value={formData.branch_code}
              onChange={handleInputChange}
              placeholder="Ex: 00001"
            />
          </div>

          <Input
            label="Nom du titulaire"
            name="account_name"
            value={formData.account_name}
            onChange={handleInputChange}
            placeholder="Nom complet tel qu'il apparaît sur le compte"
            error={errors.account_name}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Banque <span className="text-red-500">*</span>
            </label>
            <select
              name="bank_name"
              value={formData.bank_name}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
            >
              <option value="">Sélectionnez votre banque</option>
              {cameroonBanks.map((bank) => (
                <option key={bank} value={bank}>{bank}</option>
              ))}
            </select>
            {errors.bank_name && (
              <p className="mt-1 text-sm text-red-600">{errors.bank_name}</p>
            )}
          </div>

          {formData.bank_name === 'Autre' && (
            <Input
              label="Nom de la banque"
              name="bank_name"
              value={formData.bank_name}
              onChange={handleInputChange}
              placeholder="Tapez le nom de votre banque"
              required
            />
          )}
        </>
      )}

      {/* Informations importantes */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <FiInfo className="text-blue-600 mt-1 mr-3" size={16} />
          <div>
            <h4 className="font-medium text-blue-800 mb-1">À propos de la vérification</h4>
            <p className="text-blue-700 text-sm">
              Après ajout, votre méthode sera vérifiée automatiquement via notre partenaire NotchPay.
              Cette vérification garantit que vous pouvez recevoir des paiements sur cette méthode.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Rendu de l'étape 3 - Confirmation
  const renderStepThree = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Confirmer la méthode</h3>
      
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Type :</span>
          <span className="font-medium">{paymentTypes.find(t => t.value === selectedType)?.label}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Nom :</span>
          <span className="font-medium">{formData.nickname}</span>
        </div>

        {selectedType === 'mobile_money' && (
          <>
            <div className="flex justify-between">
              <span className="text-gray-600">Numéro :</span>
              <span className="font-medium">{formData.phone_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Opérateur :</span>
              <span className="font-medium">
                {formData.operator === 'orange' ? 'Orange Money' : 'MTN MoMo'}
              </span>
            </div>
          </>
        )}

        {selectedType === 'bank_account' && (
          <>
            <div className="flex justify-between">
              <span className="text-gray-600">Banque :</span>
              <span className="font-medium">{formData.bank_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Titulaire :</span>
              <span className="font-medium">{formData.account_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Numéro de compte :</span>
              <span className="font-medium">***{formData.account_number.slice(-4)}</span>
            </div>
          </>
        )}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <FiAlertTriangle className="text-yellow-600 mt-1 mr-3" size={16} />
          <div>
            <h4 className="font-medium text-yellow-800 mb-1">Important</h4>
            <p className="text-yellow-700 text-sm">
              Assurez-vous que les informations sont correctes. Vous devrez valider cette méthode
              avant de pouvoir l'utiliser pour recevoir des paiements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ajouter une méthode de paiement">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {step === 1 && renderStepOne()}
          {step === 2 && renderStepTwo()}
          {step === 3 && renderStepThree()}
        </motion.div>
      </AnimatePresence>

      {/* Boutons de navigation */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <div>
          {step > 1 && (
            <Button variant="secondary" onClick={prevStep} disabled={loading}>
              Retour
            </Button>
          )}
        </div>
        
        <div className="space-x-3">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          
          {step < 3 ? (
            <Button
              variant="primary"
              onClick={nextStep}
              disabled={loading || (step === 1 && !selectedType)}
            >
              Continuer
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Ajout en cours...' : 'Ajouter la méthode'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AddPaymentMethodModal;