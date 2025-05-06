// src/components/owner/PropertyPricingForm.jsx
import React, { useState } from 'react';
import { FiInfo, FiDollarSign, FiPlus, FiTrash2, FiPercent } from 'react-icons/fi';

import Input from '../common/Input';
import Button from '../common/Button';

/**
 * Formulaire pour les informations de tarification d'un logement
 * @param {Object} formData - Données actuelles du formulaire
 * @param {Function} updateFormData - Fonction pour mettre à jour plusieurs champs à la fois
 * @param {Function} updateField - Fonction pour mettre à jour un champ spécifique
 */
const PropertyPricingForm = ({ formData, updateFormData, updateField }) => {
  // État local pour gérer l'affichage des tarifs longue durée
  const [showWeeklyPrice, setShowWeeklyPrice] = useState(!!formData.price_per_week);
  const [showMonthlyPrice, setShowMonthlyPrice] = useState(!!formData.price_per_month);
  
  // Options de politique d'annulation
  const cancellationPolicies = [
    { value: 'flexible', label: 'Flexible', description: 'Remboursement complet jusqu\'à 24h avant l\'arrivée' },
    { value: 'moderate', label: 'Modérée', description: 'Remboursement complet jusqu\'à 5 jours avant l\'arrivée' },
    { value: 'strict', label: 'Stricte', description: 'Remboursement à 50% jusqu\'à 7 jours avant l\'arrivée' }
  ];
  
  // Ajouter une remise pour les longs séjours
  const addLongStayDiscount = () => {
    const newDiscount = {
      min_days: 7,
      discount_percentage: 5
    };
    
    updateField('long_stay_discounts', [...formData.long_stay_discounts, newDiscount]);
  };
  
  // Supprimer une remise
  const removeLongStayDiscount = (index) => {
    const updatedDiscounts = [...formData.long_stay_discounts];
    updatedDiscounts.splice(index, 1);
    updateField('long_stay_discounts', updatedDiscounts);
  };
  
  // Mettre à jour une remise existante
  const updateLongStayDiscount = (index, field, value) => {
    const updatedDiscounts = [...formData.long_stay_discounts];
    updatedDiscounts[index] = {
      ...updatedDiscounts[index],
      [field]: value
    };
    updateField('long_stay_discounts', updatedDiscounts);
  };
  
  // Formater le prix pour l'affichage
  const formatPrice = (value) => {
    return new Intl.NumberFormat('fr-FR').format(value);
  };
  
  // Calculer le prix hebdomadaire suggéré (10% de remise)
  const getSuggestedWeeklyPrice = () => {
    return Math.round(formData.price_per_night * 7 * 0.9);
  };
  
  // Calculer le prix mensuel suggéré (30% de remise)
  const getSuggestedMonthlyPrice = () => {
    return Math.round(formData.price_per_night * 30 * 0.7);
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800 mb-6 flex items-start">
        <FiInfo className="mt-1 mr-3 flex-shrink-0" />
        <div>
          <h3 className="font-medium">Tarification</h3>
          <p className="mt-1 text-sm">
            Définissez les prix pour votre logement. Vous pouvez proposer des tarifs différents 
            selon la durée du séjour et ajouter des frais supplémentaires si nécessaire.
          </p>
        </div>
      </div>

      {/* Prix par nuit */}
      <div>
        <Input
          label="Prix par nuit (FCFA)"
          name="price_per_night"
          type="number"
          value={formData.price_per_night}
          onChange={(e) => updateField('price_per_night', parseInt(e.target.value, 10) || 0)}
          placeholder="Ex: 25000"
          min="0"
          step="500"
          required
          icon={<FiDollarSign />}
        />
        <p className="text-sm text-gray-500 mt-1">
          C'est le tarif de base pour une nuit dans votre logement.
        </p>
      </div>
      
      {/* Prix par semaine (optionnel) */}
      <div>
        {showWeeklyPrice ? (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Prix par semaine (FCFA)
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowWeeklyPrice(false);
                  updateField('price_per_week', null);
                }}
                className="text-red-500 hover:text-red-700 text-sm flex items-center"
              >
                <FiTrash2 className="mr-1" /> Retirer
              </button>
            </div>
            <div className="flex gap-2 items-center">
              <Input
                name="price_per_week"
                type="number"
                value={formData.price_per_week || getSuggestedWeeklyPrice()}
                onChange={(e) => updateField('price_per_week', parseInt(e.target.value, 10) || 0)}
                placeholder="Ex: 160000"
                min="0"
                step="1000"
                icon={<FiDollarSign />}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateField('price_per_week', getSuggestedWeeklyPrice())}
              >
                Suggérer
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Prix suggéré: {formatPrice(getSuggestedWeeklyPrice())} FCFA (7 nuits avec 10% de remise)
            </p>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            icon={<FiPlus />}
            onClick={() => {
              setShowWeeklyPrice(true);
              updateField('price_per_week', getSuggestedWeeklyPrice());
            }}
          >
            Ajouter un prix hebdomadaire
          </Button>
        )}
      </div>
      
      {/* Prix par mois (optionnel) */}
      <div>
        {showMonthlyPrice ? (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Prix par mois (FCFA)
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowMonthlyPrice(false);
                  updateField('price_per_month', null);
                }}
                className="text-red-500 hover:text-red-700 text-sm flex items-center"
              >
                <FiTrash2 className="mr-1" /> Retirer
              </button>
            </div>
            <div className="flex gap-2 items-center">
              <Input
                name="price_per_month"
                type="number"
                value={formData.price_per_month || getSuggestedMonthlyPrice()}
                onChange={(e) => updateField('price_per_month', parseInt(e.target.value, 10) || 0)}
                placeholder="Ex: 500000"
                min="0"
                step="5000"
                icon={<FiDollarSign />}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateField('price_per_month', getSuggestedMonthlyPrice())}
              >
                Suggérer
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Prix suggéré: {formatPrice(getSuggestedMonthlyPrice())} FCFA (30 nuits avec 30% de remise)
            </p>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            icon={<FiPlus />}
            onClick={() => {
              setShowMonthlyPrice(true);
              updateField('price_per_month', getSuggestedMonthlyPrice());
            }}
          >
            Ajouter un prix mensuel
          </Button>
        )}
      </div>
      
      {/* Frais supplémentaires */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            label="Frais de ménage (FCFA)"
            name="cleaning_fee"
            type="number"
            value={formData.cleaning_fee}
            onChange={(e) => updateField('cleaning_fee', parseInt(e.target.value, 10) || 0)}
            placeholder="Ex: 15000"
            min="0"
            step="1000"
            icon={<FiDollarSign />}
          />
          <p className="text-sm text-gray-500 mt-1">
            Frais additionnels pour le nettoyage du logement.
          </p>
        </div>
        <div>
          <Input
            label="Caution (FCFA)"
            name="security_deposit"
            type="number"
            value={formData.security_deposit}
            onChange={(e) => updateField('security_deposit', parseInt(e.target.value, 10) || 0)}
            placeholder="Ex: 100000"
            min="0"
            step="10000"
            icon={<FiDollarSign />}
          />
          <p className="text-sm text-gray-500 mt-1">
            Montant remboursable après le séjour si aucun dommage n'est constaté.
          </p>
        </div>
      </div>
      
      {/* Remises pour les longs séjours */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Remises pour les longs séjours
          </label>
          <Button
            variant="outline"
            size="sm"
            icon={<FiPlus />}
            onClick={addLongStayDiscount}
          >
            Ajouter une remise
          </Button>
        </div>
        
        {formData.long_stay_discounts.length > 0 ? (
          <div className="space-y-2">
            {formData.long_stay_discounts.map((discount, index) => (
              <div key={index} className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <Input
                  label="Durée minimale (jours)"
                  name={`min_days_${index}`}
                  type="number"
                  value={discount.min_days}
                  onChange={(e) => updateLongStayDiscount(index, 'min_days', parseInt(e.target.value, 10) || 1)}
                  min="1"
                  step="1"
                  className="w-full"
                />
                <Input
                  label="Remise (%)"
                  name={`discount_percentage_${index}`}
                  type="number"
                  value={discount.discount_percentage}
                  onChange={(e) => updateLongStayDiscount(index, 'discount_percentage', parseFloat(e.target.value) || 0)}
                  min="1"
                  max="90"
                  step="0.5"
                  icon={<FiPercent />}
                  className="w-full"
                />
                <Button
                  variant="outline"
                  size="sm"
                  icon={<FiTrash2 />}
                  onClick={() => removeLongStayDiscount(index)}
                  className="mt-6"
                >
                  Supprimer
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            Proposez des réductions pour encourager les réservations de longue durée.
          </p>
        )}
      </div>
      
      {/* Politique d'annulation */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Politique d'annulation
        </label>
        <div className="space-y-2">
          {cancellationPolicies.map((policy) => (
            <div
              key={policy.value}
              onClick={() => updateField('cancellation_policy', policy.value)}
              className={`border rounded-lg p-3 flex items-start cursor-pointer transition-colors
                ${formData.cancellation_policy === policy.value
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-primary-300'}
              `}
            >
              <div className={`mt-1 w-5 h-5 rounded-full mr-2 flex-shrink-0 flex items-center justify-center border
                ${formData.cancellation_policy === policy.value
                  ? 'border-primary-500'
                  : 'border-gray-300'}
              `}>
                {formData.cancellation_policy === policy.value && (
                  <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                )}
              </div>
              <div>
                <span className="font-medium">{policy.label}</span>
                <p className="text-sm text-gray-600 mt-1">{policy.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Option de remise négociable */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="allow_discount"
          checked={formData.allow_discount}
          onChange={(e) => updateField('allow_discount', e.target.checked)}
          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
        />
        <label htmlFor="allow_discount" className="ml-2 block text-sm text-gray-700">
          Autoriser les demandes de remise
        </label>
      </div>
      <p className="text-sm text-gray-500 -mt-2">
        Si activé, les locataires peuvent vous demander des remises supplémentaires.
      </p>
    </div>
  );
};

export default PropertyPricingForm;