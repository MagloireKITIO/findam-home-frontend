// src/components/owner/PropertyAmenitiesForm.jsx - Correction pour l'affichage des équipements
import React, { useState, useEffect } from 'react';
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
  // État pour les équipements groupés par catégorie
  const [categorizedAmenities, setCategorizedAmenities] = useState({});
  
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

  // Organiser les équipements par catégorie à partir de la liste fournie
  useEffect(() => {
    const amenitiesByCategory = {};
    
    // Initialiser toutes les catégories avec des tableaux vides
    categories.forEach(category => {
      amenitiesByCategory[category.id] = [];
    });
    
    // Répartir les équipements dans leurs catégories
    amenitiesList.forEach(amenity => {
      const category = amenity.category ? amenity.category.toLowerCase() : 'other';
      
      // Vérifier si la catégorie existe, sinon mettre dans "other"
      if (amenitiesByCategory[category] !== undefined) {
        amenitiesByCategory[category].push(amenity);
      } else {
        amenitiesByCategory['other'].push(amenity);
      }
    });
    
    setCategorizedAmenities(amenitiesByCategory);
  }, [amenitiesList]);
  
  // Toggle un équipement dans la sélection
  const toggleAmenity = (amenityId) => {
    if (selectedAmenities.includes(amenityId)) {
      updateAmenities(selectedAmenities.filter(id => id !== amenityId));
    } else {
      updateAmenities([...selectedAmenities, amenityId]);
    }
  };
  
  // Filtrer les équipements selon la recherche
  const getFilteredAmenities = (categoryId) => {
    const categoryAmenities = categorizedAmenities[categoryId] || [];
    
    if (!searchTerm) {
      return categoryAmenities;
    }
    
    return categoryAmenities.filter(amenity => 
      amenity.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };
  
  // Vérifier si aucun équipement ne correspond à la recherche
  const noSearchResults = searchTerm && 
    categories.every(category => getFilteredAmenities(category.id).length === 0);
  
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
      
      {/* Debugging - Afficher le nombre total d'équipements reçus */}
      <div className="text-xs text-gray-400">
        {amenitiesList.length} équipements disponibles au total
      </div>
      
      {/* Liste des équipements par catégorie */}
      <div className="space-y-6">
        {categories.map(category => {
          const filteredAmenities = getFilteredAmenities(category.id);
          
          // Ne pas afficher les catégories vides lors d'une recherche
          if (searchTerm && filteredAmenities.length === 0) {
            return null;
          }
          
          return (
            <div key={category.id}>
              <h3 className="text-lg font-medium text-gray-800 mb-3">
                {category.icon} {category.name}
              </h3>
              
              {filteredAmenities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredAmenities.map(amenity => (
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
              ) : (
                <p className="text-gray-500 text-sm italic">
                  Aucun équipement dans cette catégorie
                </p>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Message si aucun résultat de recherche */}
      {noSearchResults && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            Aucun équipement ne correspond à votre recherche "{searchTerm}"
          </p>
        </div>
      )}
      
      {/* Si aucun équipement n'est disponible */}
      {amenitiesList.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
          <h4 className="font-medium mb-2">Aucun équipement disponible</h4>
          <p className="text-sm">
            Il semble qu'aucun équipement n'ait été trouvé. Veuillez vérifier la connexion 
            avec le serveur ou contacter l'administrateur.
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