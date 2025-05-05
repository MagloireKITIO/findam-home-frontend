// src/components/features/PropertyMap.jsx
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMapPin, FiX } from 'react-icons/fi';
import { Link } from 'react-router-dom';

// Nous devrons importer les styles CSS de Leaflet
// Ajoutez ces lignes à votre index.js ou App.js
// import 'leaflet/dist/leaflet.css';
// import 'leaflet/dist/images/marker-shadow.png';
// import 'leaflet/dist/images/marker-icon.png';

const PropertyMap = ({ 
  properties, 
  selectedProperty = null, 
  center = [4.0500, 9.7000], // Coordonnées de Douala par défaut
  zoom = 12,
  height = '500px',
  showPopup = true,
  onClick = null,
  onMarkerClick = null,
  singlePropertyMode = false
}) => {
  const [activeProperty, setActiveProperty] = useState(selectedProperty);
  const [map, setMap] = useState(null);

  // Effet pour centrer la carte sur la propriété sélectionnée
  useEffect(() => {
    if (map && selectedProperty) {
      map.setView(
        [selectedProperty.latitude, selectedProperty.longitude],
        zoom + 2 // Zoomer davantage sur la propriété sélectionnée
      );
      setActiveProperty(selectedProperty);
    }
  }, [map, selectedProperty, zoom]);

  // Créer une icône personnalisée pour les marqueurs
  const createCustomIcon = (property) => {
    const isActive = activeProperty && activeProperty.id === property.id;
    
    return divIcon({
      className: '',
      html: `
        <div class="${isActive 
          ? 'bg-primary-600 text-white' 
          : 'bg-white text-primary-600'} 
          p-2 rounded-full shadow-md border-2 border-white flex items-center justify-center"
          style="width: ${isActive ? '40px' : '32px'}; height: ${isActive ? '40px' : '32px'};"
        >
          <span class="font-bold">${property.price_per_night.toLocaleString().substring(0, 5)}</span>
        </div>
      `,
      iconSize: [isActive ? 40 : 32, isActive ? 40 : 32],
      iconAnchor: [isActive ? 20 : 16, isActive ? 40 : 32]
    });
  };

  // Gérer le clic sur la carte
  const handleMapClick = () => {
    if (onClick) onClick();
    if (!singlePropertyMode) {
      setActiveProperty(null);
    }
  };

  // Gérer le clic sur un marqueur
  const handleMarkerClick = (property) => {
    setActiveProperty(property);
    if (onMarkerClick) onMarkerClick(property);
  };

  return (
    <div style={{ height }} className="relative rounded-lg overflow-hidden">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        whenCreated={setMap}
        onClick={handleMapClick}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {properties.map(property => (
          <Marker
            key={property.id}
            position={[property.latitude, property.longitude]}
            icon={createCustomIcon(property)}
            eventHandlers={{
              click: () => handleMarkerClick(property)
            }}
          >
            {showPopup && activeProperty && activeProperty.id === property.id && (
              <Popup>
                <div className="w-64">
                  <Link to={`/properties/${property.id}`} className="block">
                    <div className="relative h-32 mb-2">
                      {property.main_image ? (
                        <img 
                          src={property.main_image} 
                          alt={property.title} 
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded">
                          <FiMapPin size={24} className="text-gray-400" />
                        </div>
                      )}
                      <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded text-sm font-bold">
                        {property.price_per_night.toLocaleString()} FCFA / nuit
                      </div>
                    </div>
                    <h3 className="font-medium mb-1 line-clamp-1">{property.title}</h3>
                    <div className="text-sm text-gray-600 line-clamp-1">
                      {property.city_name}, {property.neighborhood_name}
                    </div>
                  </Link>
                </div>
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>

      {/* Popup mobile pour les petits écrans */}
      <AnimatePresence>
        {activeProperty && !showPopup && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg overflow-hidden md:hidden"
          >
            <Link to={`/properties/${activeProperty.id}`} className="block">
              <div className="flex">
                <div className="w-1/3">
                  {activeProperty.main_image ? (
                    <img 
                      src={activeProperty.main_image} 
                      alt={activeProperty.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <FiMapPin size={24} className="text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="w-2/3 p-3">
                  <h3 className="font-medium mb-1 line-clamp-1">{activeProperty.title}</h3>
                  <div className="text-sm text-gray-600 mb-1">
                    {activeProperty.city_name}, {activeProperty.neighborhood_name}
                  </div>
                  <div className="font-bold">
                    {activeProperty.price_per_night.toLocaleString()} FCFA / nuit
                  </div>
                </div>
              </div>
            </Link>
            <button
              className="absolute top-2 right-2 bg-white rounded-full p-1"
              onClick={() => setActiveProperty(null)}
            >
              <FiX size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PropertyMap;