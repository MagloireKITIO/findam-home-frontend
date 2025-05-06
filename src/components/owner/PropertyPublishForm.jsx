// src/components/owner/PropertyPublishForm.jsx
import React, { useState } from 'react';
import { FiInfo, FiCheckCircle, FiAlertCircle, FiEye, FiEyeOff } from 'react-icons/fi';

import Button from '../common/Button';

/**
 * Formulaire final pour la publication d'un logement
 * @param {Object} propertyData - Toutes les données du logement
 * @param {Function} handlePublish - Fonction pour publier ou enregistrer comme brouillon
 * @param {boolean} loading - État de chargement pendant la soumission
 */
const PropertyPublishForm = ({ propertyData, handlePublish, loading = false }) => {
  // État local pour les termes et conditions
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  // Vérifications des données requises
  const checkBasicInfo = () => {
    return propertyData.title && 
           propertyData.description && 
           propertyData.property_type && 
           propertyData.capacity > 0 && 
           propertyData.bedrooms >= 0 && 
           propertyData.bathrooms >= 0;
  };
  
  const checkLocation = () => {
    return propertyData.city && 
           propertyData.neighborhood && 
           propertyData.address && 
           propertyData.latitude && 
           propertyData.longitude;
  };
  
  const checkPricing = () => {
    return propertyData.price_per_night > 0;
  };
  
  // Vérifier qu'il y a au moins une image (assumé à partir du formulaire précédent)
  const checkImages = () => {
    // Cette vérification est faite dans le flux principal
    return true;
  };
  
  // Vérifier qu'il y a au moins un équipement
  const checkAmenities = () => {
    return propertyData.amenities && propertyData.amenities.length > 0;
  };
  
  // Vérification globale pour tous les critères
  const isReadyToPublish = () => {
    return checkBasicInfo() && 
           checkLocation() && 
           checkPricing() && 
           checkImages() && 
           checkAmenities() && 
           acceptTerms;
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800 mb-6 flex items-start">
        <FiInfo className="mt-1 mr-3 flex-shrink-0" />
        <div>
          <h3 className="font-medium">Publication du logement</h3>
          <p className="mt-1 text-sm">
            Votre logement est presque prêt ! Vérifiez que toutes les informations sont complètes 
            avant de publier votre annonce.
          </p>
        </div>
      </div>
      
      {/* Récapitulatif des informations */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Récapitulatif de votre logement</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informations de base */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center mb-2">
              {checkBasicInfo() ? (
                <FiCheckCircle className="text-green-500 mr-2" />
              ) : (
                <FiAlertCircle className="text-red-500 mr-2" />
              )}
              <h4 className="font-medium">Informations de base</h4>
            </div>
            <ul className="text-sm space-y-1 ml-6">
              <li><span className="text-gray-600">Titre:</span> {propertyData.title || 'Non renseigné'}</li>
              <li><span className="text-gray-600">Type:</span> {propertyData.property_type || 'Non renseigné'}</li>
              <li><span className="text-gray-600">Capacité:</span> {propertyData.capacity || 0} personnes</li>
              <li><span className="text-gray-600">Chambres:</span> {propertyData.bedrooms || 0}</li>
              <li><span className="text-gray-600">Salles de bain:</span> {propertyData.bathrooms || 0}</li>
            </ul>
          </div>
          
          {/* Emplacement */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center mb-2">
              {checkLocation() ? (
                <FiCheckCircle className="text-green-500 mr-2" />
              ) : (
                <FiAlertCircle className="text-red-500 mr-2" />
              )}
              <h4 className="font-medium">Emplacement</h4>
            </div>
            <ul className="text-sm space-y-1 ml-6">
              <li><span className="text-gray-600">Ville:</span> {propertyData.city || 'Non renseignée'}</li>
              <li><span className="text-gray-600">Quartier:</span> {propertyData.neighborhood || 'Non renseigné'}</li>
              <li><span className="text-gray-600">Adresse:</span> {propertyData.address || 'Non renseignée'}</li>
            </ul>
          </div>
          
          {/* Tarification */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center mb-2">
              {checkPricing() ? (
                <FiCheckCircle className="text-green-500 mr-2" />
              ) : (
                <FiAlertCircle className="text-red-500 mr-2" />
              )}
              <h4 className="font-medium">Tarification</h4>
            </div>
            <ul className="text-sm space-y-1 ml-6">
              <li><span className="text-gray-600">Prix par nuit:</span> {propertyData.price_per_night?.toLocaleString() || '0'} FCFA</li>
              {propertyData.price_per_week && (
                <li><span className="text-gray-600">Prix par semaine:</span> {propertyData.price_per_week.toLocaleString()} FCFA</li>
              )}
              {propertyData.price_per_month && (
                <li><span className="text-gray-600">Prix par mois:</span> {propertyData.price_per_month.toLocaleString()} FCFA</li>
              )}
              <li><span className="text-gray-600">Frais de ménage:</span> {propertyData.cleaning_fee?.toLocaleString() || '0'} FCFA</li>
              <li><span className="text-gray-600">Caution:</span> {propertyData.security_deposit?.toLocaleString() || '0'} FCFA</li>
            </ul>
          </div>
          
          {/* Équipements */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center mb-2">
              {checkAmenities() ? (
                <FiCheckCircle className="text-green-500 mr-2" />
              ) : (
                <FiAlertCircle className="text-red-500 mr-2" />
              )}
              <h4 className="font-medium">Équipements</h4>
            </div>
            {propertyData.amenities && propertyData.amenities.length > 0 ? (
              <p className="text-sm ml-6">
                {propertyData.amenities.length} équipement{propertyData.amenities.length !== 1 ? 's' : ''} sélectionné{propertyData.amenities.length !== 1 ? 's' : ''}
              </p>
            ) : (
              <p className="text-sm text-red-500 ml-6">
                Aucun équipement sélectionné
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Termes et conditions */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="accept-terms"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <label htmlFor="accept-terms" className="ml-2 block text-sm text-gray-700">
            J'accepte les <a href="/terms" target="_blank" className="text-primary-600 hover:underline">Conditions Générales d'Utilisation</a> et 
            certifie que toutes les informations fournies sont exactes.
          </label>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 pt-6">
        <Button
          variant="primary"
          onClick={() => handlePublish(true)}
          disabled={!isReadyToPublish() || loading}
          icon={<FiEye />}
          className="flex-1"
        >
          {loading ? 'Publication en cours...' : 'Publier maintenant'}
        </Button>
        
        <Button
          variant="outline"
          onClick={() => handlePublish(false)}
          disabled={loading}
          icon={<FiEyeOff />}
          className="flex-1"
        >
          {loading ? 'Enregistrement...' : 'Enregistrer comme brouillon'}
        </Button>
      </div>
      
      {/* Information sur la validation */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
        <h4 className="font-medium mb-2">Processus de validation</h4>
        <p className="text-sm">
          Après publication, votre logement sera soumis à une vérification par notre équipe.
          Ce processus peut prendre jusqu'à 24 heures. Vous serez notifié dès que votre logement 
          sera approuvé et visible pour les voyageurs.
        </p>
      </div>
    </div>
  );
};

export default PropertyPublishForm;