// src/components/owner/PropertyAmenitiesForm.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiInfo, FiSearch, FiCheck } from 'react-icons/fi';

/**
 * Formulaire pour sélectionner les équipements d'un logement
 * @param {Array} selectedAmenities - Liste des IDs des équipements sélectionnés
 * @param {Function} updateAmenities - Fonction pour mettre à jour les équipements sélectionnés
 * @param {Array} amenitiesList - Liste complète des équipements disponibles
 */
const PropertyAmenitiesForm = ({ selectedAmenities = [], updateAmenities, amenitiesList = [] }) => {
  // État local pour la recherche
  const [searchTerm, setSearchTerm] = useState('');
  
  // Catégories triées par ordre d'importance
  const categories = [
    { id: 'essential', name: 'Essentiels', icon: '🏠' },
    { id: 'connectivity', name: 'Connectivité', icon: '📶' },
    { id: 'kitchen', name: 'Cuisine', icon: '🍳' },
    { id: 'bathroom', name: 'Salle de bain', icon: '🛁' },
    { id: 'bedroom', name: 'Chambre', icon: '🛏️' },
    { id: 'outdoors', name: 'Extérieur', icon: '🌳' },
    { id: 'safety', name: 'Sécurité', icon: '🔒' },
    { id: 'entertainment', name: 'Divertissement', icon: '📺' },
    { id: 'comfort', name: 'Confort', icon: '🛋️' },
    { id: 'other', name: 'Autres', icon: '📌' }
  ];
  
  // Toggle un équipement dans la sélection
  const toggleAmenity = (amenityId) => {
    if (selectedAmenities.includes(amenityId)) {
      updateAmenities(selectedAmenities.filter(id => id !== amenityId));
    } else {
      updateAmenities([...selectedAmenities, amenityId]);
    }
  };
  
  // Filtrer les équipements selon la recherche
  const filteredAmenities = amenitiesList.filter(amenity => 
    amenity.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Trier les équipements par catégorie
  const getAmenitiesByCategory = (categoryId) => {
    if (searchTerm) {
      return filteredAmenities.filter(amenity => amenity.category === categoryId);
    }
    return amenitiesList.filter(amenity => amenity.category === categoryId);
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800 mb-6 flex items-start">
        <FiInfo className="mt-1 mr-3 flex-shrink-0" />
        <div>
          <h3 className="font-medium">Équipements et services</h3>
          <p className="mt-1 text-sm">
            Sélectionnez les équipements et services disponibles dans votre logement.
            Les équipements bien choisis permettent de valoriser votre annonce et d'attirer plus de voyageurs.
          </p>
        </div>
      </div>
      
      {/* Barre de recherche */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Rechercher un équipement..."
          className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Statistiques de sélection */}
      <div className="text-sm text-gray-600">
        {selectedAmenities.length} équipement{selectedAmenities.length !== 1 ? 's' : ''} sélectionné{selectedAmenities.length !== 1 ? 's' : ''}
      </div>
      
      {/* Liste des équipements par catégorie */}
      <div className="space-y-6">
        {categories.map(category => {
          const categoryAmenities = getAmenitiesByCategory(category.id);
          
          // Ne pas afficher les catégories vides lors d'une recherche
          if (searchTerm && categoryAmenities.length === 0) {
            return null;
          }
          
          return (
            <div key={category.id}>
              <h3 className="text-lg font-medium text-gray-800 mb-3">
                {category.icon} {category.name}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {categoryAmenities.map(amenity => (
                  <motion.div
                    key={amenity.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleAmenity(amenity.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedAmenities.includes(amenity.id)
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <div 
                        className={`w-5 h-5 rounded flex items-center justify-center mr-3 ${
                          selectedAmenities.includes(amenity.id)
                            ? 'bg-primary-500 text-white'
                            : 'border border-gray-300'
                        }`}
                      >
                        {selectedAmenities.includes(amenity.id) && <FiCheck size={14} />}
                      </div>
                      <span>{amenity.name}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Message si aucun équipement dans la catégorie */}
              {categoryAmenities.length === 0 && (
                <p className="text-gray-500 text-sm italic">
                  Aucun équipement dans cette catégorie
                </p>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Message si aucun résultat de recherche */}
      {searchTerm && filteredAmenities.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            Aucun équipement ne correspond à votre recherche "{searchTerm}"
          </p>
        </div>
      )}
      
      {/* Recommandations d'équipements essentiels */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800 mt-6">
        <h4 className="font-medium mb-2">Équipements recommandés</h4>
        <p className="text-sm mb-3">
          Les logements bien équipés sont plus attractifs pour les voyageurs. 
          Nous vous recommandons d'inclure au minimum les équipements suivants :
        </p>
        <ul className="text-sm space-y-1">
          <li>• Wi-Fi</li>
          <li>• Climatisation ou ventilateur</li>
          <li>• Cuisine équipée (si applicable)</li>
          <li>• Eau chaude</li>
          <li>• Draps et serviettes</li>
        </ul>
      </div>
    </div>
  );
};

export default PropertyAmenitiesForm;