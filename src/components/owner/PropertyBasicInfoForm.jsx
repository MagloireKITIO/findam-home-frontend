// src/components/owner/PropertyBasicInfoForm.jsx
import React from 'react';
import { FiInfo, FiHome, FiUsers, FiMaximize } from 'react-icons/fi';

import Input from '../common/Input';

/**
 * Formulaire pour les informations de base d'un logement
 * @param {Object} formData - Données actuelles du formulaire
 * @param {Function} updateFormData - Fonction pour mettre à jour plusieurs champs à la fois
 * @param {Function} updateField - Fonction pour mettre à jour un champ spécifique
 */
const PropertyBasicInfoForm = ({ formData, updateFormData, updateField }) => {
  // Liste des types de logements disponibles
  const propertyTypes = [
    { value: 'apartment', label: 'Appartement' },
    { value: 'house', label: 'Maison' },
    { value: 'villa', label: 'Villa' },
    { value: 'studio', label: 'Studio' },
    { value: 'guest_house', label: 'Maison d\'hôtes' },
    { value: 'room', label: 'Chambre privée' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800 mb-6 flex items-start">
        <FiInfo className="mt-1 mr-3 flex-shrink-0" />
        <div>
          <h3 className="font-medium">Informations de base</h3>
          <p className="mt-1 text-sm">
            Commencez par renseigner les informations essentielles concernant votre logement.
            Assurez-vous que le titre est attractif et que la description est détaillée.
          </p>
        </div>
      </div>

      {/* Titre du logement */}
      <div>
        <Input
          label="Titre du logement"
          name="title"
          value={formData.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="Ex: Bel appartement au cœur de Douala avec vue"
          required
          icon={<FiHome />}
        />
        <p className="text-sm text-gray-500 mt-1">
          Le titre doit être accrocheur et contenir les points forts de votre logement (50-70 caractères).
        </p>
      </div>

      {/* Description du logement */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description du logement <span className="text-red-500">*</span>
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Décrivez votre logement en détail. Mentionnez les caractéristiques principales, l'ambiance, les avantages, etc."
          rows={5}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          required
        />
        <p className="text-sm text-gray-500 mt-1">
          Une description détaillée et honnête augmente les chances d'attirer les bons locataires.
        </p>
      </div>

      {/* Type de logement */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Type de logement <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {propertyTypes.map((type) => (
            <div
              key={type.value}
              onClick={() => updateField('property_type', type.value)}
              className={`border rounded-lg p-3 flex items-center cursor-pointer transition-colors
                ${formData.property_type === type.value
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-primary-300'}
              `}
            >
              <div className={`w-5 h-5 rounded-full mr-2 flex items-center justify-center border
                ${formData.property_type === type.value
                  ? 'border-primary-500'
                  : 'border-gray-300'}
              `}>
                {formData.property_type === type.value && (
                  <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                )}
              </div>
              <span>{type.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Capacité et configuration du logement */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Capacité (nombre de voyageurs) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Capacité d'accueil <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => updateField('capacity', Math.max(1, formData.capacity - 1))}
              className="w-10 h-10 rounded-l-lg border border-gray-300 flex items-center justify-center bg-gray-50 text-gray-600 hover:bg-gray-100"
            >
              -
            </button>
            <div className="h-10 px-3 py-2 border-t border-b border-gray-300 flex items-center justify-center min-w-[50px]">
              {formData.capacity}
            </div>
            <button
              type="button"
              onClick={() => updateField('capacity', formData.capacity + 1)}
              className="w-10 h-10 rounded-r-lg border border-gray-300 flex items-center justify-center bg-gray-50 text-gray-600 hover:bg-gray-100"
            >
              +
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Nombre de personnes pouvant être accueillies
          </p>
        </div>

        {/* Nombre de chambres */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Chambres <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => updateField('bedrooms', Math.max(0, formData.bedrooms - 1))}
              className="w-10 h-10 rounded-l-lg border border-gray-300 flex items-center justify-center bg-gray-50 text-gray-600 hover:bg-gray-100"
            >
              -
            </button>
            <div className="h-10 px-3 py-2 border-t border-b border-gray-300 flex items-center justify-center min-w-[50px]">
              {formData.bedrooms}
            </div>
            <button
              type="button"
              onClick={() => updateField('bedrooms', formData.bedrooms + 1)}
              className="w-10 h-10 rounded-r-lg border border-gray-300 flex items-center justify-center bg-gray-50 text-gray-600 hover:bg-gray-100"
            >
              +
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Nombre de chambres à coucher
          </p>
        </div>

        {/* Nombre de salles de bain */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Salles de bain <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => updateField('bathrooms', Math.max(0.5, formData.bathrooms - 0.5))}
              className="w-10 h-10 rounded-l-lg border border-gray-300 flex items-center justify-center bg-gray-50 text-gray-600 hover:bg-gray-100"
            >
              -
            </button>
            <div className="h-10 px-3 py-2 border-t border-b border-gray-300 flex items-center justify-center min-w-[50px]">
              {formData.bathrooms}
            </div>
            <button
              type="button"
              onClick={() => updateField('bathrooms', formData.bathrooms + 0.5)}
              className="w-10 h-10 rounded-r-lg border border-gray-300 flex items-center justify-center bg-gray-50 text-gray-600 hover:bg-gray-100"
            >
              +
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Nombre de salles de bain (0.5 = toilettes seules)
          </p>
        </div>
      </div>
    </div>
  );
};

export default PropertyBasicInfoForm;