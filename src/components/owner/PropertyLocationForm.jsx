// src/components/owner/PropertyLocationForm.jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { FiMapPin, FiInfo, FiSearch } from 'react-icons/fi';

import Input from '../common/Input';

/**
 * Formulaire pour les informations de localisation d'un logement
 * @param {Object} formData - Données actuelles du formulaire
 * @param {Function} updateFormData - Fonction pour mettre à jour plusieurs champs à la fois
 * @param {Function} updateField - Fonction pour mettre à jour un champ spécifique
 * @param {Array} cities - Liste des villes disponibles
 * @param {Array} neighborhoods - Liste des quartiers disponibles pour la ville sélectionnée
 */
const PropertyLocationForm = ({ formData, updateFormData, updateField, cities = [], neighborhoods = [] }) => {
  // États locaux
  const [mapCenter, setMapCenter] = useState([4.0511, 9.7679]); // Douala par défaut
  const [mapZoom, setMapZoom] = useState(13);
  const [markerPosition, setMarkerPosition] = useState(
    formData.latitude && formData.longitude 
      ? [formData.latitude, formData.longitude] 
      : null
  );

  // Mettre à jour le centre de la carte quand la ville change
  useEffect(() => {
    if (formData.latitude && formData.longitude) {
      setMapCenter([formData.latitude, formData.longitude]);
      setMarkerPosition([formData.latitude, formData.longitude]);
    } else {
      // Si la ville est sélectionnée mais pas encore de coordonnées,
      // on pourrait rechercher les coordonnées de la ville
      const selectedCity = cities.find(city => city.id === formData.city);
      if (selectedCity && selectedCity.latitude && selectedCity.longitude) {
        setMapCenter([selectedCity.latitude, selectedCity.longitude]);
      }
    }
  }, [formData.city, formData.latitude, formData.longitude, cities]);

  // Composant pour gérer les événements de la carte
  const LocationMarker = () => {
    useMapEvents({
        click(e) {
          const { lat, lng } = e.latlng;
          // Formatter et limiter les coordonnées pour respecter la contrainte max_digits=9
          const formattedLat = parseFloat(parseFloat(lat).toFixed(9));
          const formattedLng = parseFloat(parseFloat(lng).toFixed(9));
          
          setMarkerPosition([formattedLat, formattedLng]);
          updateFormData({
            latitude: formattedLat,
            longitude: formattedLng
          });
        }
      });

    return markerPosition ? (
      <Marker 
        position={markerPosition}
      />
    ) : null;
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800 mb-6 flex items-start">
        <FiInfo className="mt-1 mr-3 flex-shrink-0" />
        <div>
          <h3 className="font-medium">Emplacement de votre logement</h3>
          <p className="mt-1 text-sm">
            L'emplacement précis ne sera visible par les locataires qu'après leur réservation confirmée.
            Sur la carte publique, seul l'emplacement approximatif sera affiché.
          </p>
        </div>
      </div>

      {/* Sélection de la ville */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ville <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.city}
          onChange={(e) => {
            updateField('city', e.target.value);
            // Réinitialiser le quartier quand la ville change
            updateField('neighborhood', '');
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          required
        >
          <option value="">Sélectionnez une ville</option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>{city.name}</option>
          ))}
        </select>
      </div>

      {/* Sélection du quartier */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Quartier <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.neighborhood}
          onChange={(e) => updateField('neighborhood', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          required
          disabled={!formData.city || neighborhoods.length === 0}
        >
          <option value="">Sélectionnez un quartier</option>
          {neighborhoods.map((neighborhood) => (
            <option key={neighborhood.id} value={neighborhood.id}>{neighborhood.name}</option>
          ))}
        </select>
        {formData.city && neighborhoods.length === 0 && (
          <p className="text-sm text-yellow-600 mt-1">
            Chargement des quartiers...
          </p>
        )}
      </div>

      {/* Adresse */}
      <div>
        <Input
          label="Adresse précise"
          name="address"
          value={formData.address}
          onChange={(e) => updateField('address', e.target.value)}
          placeholder="Ex: 123 Avenue de l'Indépendance"
          required
          icon={<FiMapPin />}
        />
        <p className="text-sm text-gray-500 mt-1">
          Cette adresse ne sera visible que par les voyageurs ayant réservé votre logement.
        </p>
      </div>

      {/* Carte pour sélectionner l'emplacement */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Emplacement sur la carte <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-500 mb-2">
          Cliquez sur la carte pour indiquer l'emplacement exact de votre logement.
        </p>
        
        <div className="h-96 rounded-lg overflow-hidden border border-gray-300">
          <MapContainer 
            center={mapCenter} 
            zoom={mapZoom} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <LocationMarker />
          </MapContainer>
        </div>
        
        {!markerPosition && (
          <p className="text-sm text-red-500 mt-2">
            Veuillez sélectionner l'emplacement en cliquant sur la carte.
          </p>
        )}
      </div>

      {/* Coordonnées (lecture seule) */}
      {markerPosition && (
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Latitude"
            value={formData.latitude}
            readOnly
            disabled
          />
          <Input
            label="Longitude"
            value={formData.longitude}
            readOnly
            disabled
          />
        </div>
      )}
    </div>
  );
};

export default PropertyLocationForm;