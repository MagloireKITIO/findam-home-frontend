// src/components/features/PropertyCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiStar, FiMapPin, FiUser, FiHome } from 'react-icons/fi';

const PropertyCard = ({ property }) => {
  // Vérifiez que toutes les propriétés sont disponibles, avec des valeurs par défaut si nécessaire
  const {
    id,
    title,
    main_image,
    price_per_night,
    city_name = '',
    neighborhood_name = '',
    property_type = 'apartment',
    capacity = 1,
    bedrooms = 1,
    bathrooms = 1,
    avg_rating = 0,
    rating_count = 0,
  } = property || {};

  // Si les données sont incomplètes ou invalides
  if (!id || !title) {
    console.warn('PropertyCard: Données de propriété incomplètes', property);
    return null;
  }

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-md overflow-hidden"
    >
      <Link to={`/properties/${id}`} className="block">
        <div className="relative">
          <motion.div 
            className="h-52 bg-gray-200 overflow-hidden"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.5 }}
          >
            {main_image ? (
              <img
                src={main_image}
                alt={title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <FiHome className="text-gray-400" size={48} />
              </div>
            )}
          </motion.div>

          <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-lg text-sm font-medium shadow">
            {property_type}
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center text-sm text-gray-600">
              <FiMapPin className="mr-1" size={14} />
              <span>{city_name && neighborhood_name ? `${city_name}, ${neighborhood_name}` : city_name || neighborhood_name || 'Emplacement'}</span>
            </div>
            
            {avg_rating > 0 && (
              <div className="flex items-center">
                <FiStar className="text-yellow-500 mr-1" />
                <span className="text-sm font-medium">{avg_rating.toFixed(1)}</span>
                <span className="text-xs text-gray-500 ml-1">({rating_count})</span>
              </div>
            )}
          </div>

          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 mb-1">{title}</h3>

          <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
            <div className="flex items-center">
              <FiUser className="mr-1" size={14} />
              <span>{capacity} pers.</span>
            </div>
            <div>{bedrooms} ch.</div>
            <div>{bathrooms} sdb.</div>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <span className="text-lg font-bold text-primary-600">{typeof price_per_night === 'number' ? price_per_night.toLocaleString() : price_per_night} FCFA</span>
              <span className="text-sm text-gray-600"> / nuit</span>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Voir détails
            </motion.div>
            </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default PropertyCard;