// src/pages/PropertyDetail.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiCalendar, FiUsers, FiMapPin, FiHome, FiDollarSign, 
  FiStar, FiCheck, FiBed, FiShower, FiUser, FiClock,
  FiInfo, FiHeart, FiShare2, FiArrowLeft, FiArrowRight,
  FiX, FiExternalLink
} from 'react-icons/fi';

import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import useApi from '../hooks/useApi';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { success, error: notifyError } = useNotification();
  const { fetchData, postData, loading: apiLoading, error: apiError } = useApi();
  const imageSliderRef = useRef(null);

  // États
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAllImages, setShowAllImages] = useState(false);
  const [showAmenities, setShowAmenities] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [dateRange, setDateRange] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1
  });
  const [priceCalculation, setPriceCalculation] = useState({
    nights: 0,
    basePrice: 0,
    cleaningFee: 0,
    serviceFee: 0,
    discount: 0,
    totalPrice: 0,
    available: true
  });

  // Effet pour charger les détails de la propriété
  useEffect(() => {
    const getPropertyDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get(`/properties/properties/${id}/`);
        setProperty(response.data);
      } catch (err) {
        console.error('Erreur lors du chargement de la propriété:', err);
        if (err.response?.status === 404) {
          setError('Cette propriété n\'existe pas ou a été supprimée.');
        } else {
          setError('Une erreur est survenue lors du chargement de la propriété.');
        }
      } finally {
        setLoading(false);
      }
    };

    getPropertyDetails();
  }, [id]);

  // Effet pour vérifier la disponibilité et calculer le prix lorsque les dates changent
  useEffect(() => {
    const checkAvailability = async () => {
      if (!dateRange.checkIn || !dateRange.checkOut) return;

      try {
        const response = await api.get(`/properties/properties/${id}/check_availability/`, {
          params: {
            start_date: dateRange.checkIn,
            end_date: dateRange.checkOut
          }
        });

        setPriceCalculation({
          nights: response.data.nights || 0,
          basePrice: response.data.base_price || 0,
          cleaningFee: response.data.cleaning_fee || 0,
          serviceFee: response.data.service_fee || 0,
          discount: response.data.discount_amount || 0,
          totalPrice: response.data.total_price || 0,
          available: response.data.available
        });
      } catch (err) {
        console.error('Erreur lors de la vérification de disponibilité:', err);
        notifyError('Erreur lors du calcul du prix. Veuillez réessayer.');
        setPriceCalculation(prev => ({ ...prev, available: false }));
      }
    };

    if (property) {
      checkAvailability();
    }
  }, [dateRange.checkIn, dateRange.checkOut, id, notifyError, property]);

  // Gestion des dates
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const handleGuestsChange = (e) => {
    setDateRange(prev => ({ ...prev, guests: parseInt(e.target.value) }));
  };

  // Fonction pour naviguer dans le carousel d'images
  const navigateImages = (direction) => {
    if (!property?.images?.length) return;

    if (direction === 'next') {
      setCurrentImageIndex(prev => 
        prev === property.images.length - 1 ? 0 : prev + 1
      );
    } else {
      setCurrentImageIndex(prev => 
        prev === 0 ? property.images.length - 1 : prev - 1
      );
    }
  };

  // Fonction pour démarrer une conversation avec le propriétaire
  const startConversation = async () => {
    if (!currentUser) {
      notifyError('Veuillez vous connecter pour contacter le propriétaire.');
      navigate('/login', { state: { from: `/properties/${id}` } });
      return;
    }

    try {
      const response = await postData('/communications/conversations/start_conversation/', {
        property_id: id,
        message: 'Bonjour, je suis intéressé(e) par votre logement.'
      });

      success('Conversation démarrée avec succès.');
      navigate('/messages', { state: { conversationId: response.id } });
    } catch (err) {
      console.error('Erreur lors du démarrage de la conversation:', err);
      notifyError('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  // Fonction pour initier une réservation
  const initiateBooking = () => {
    if (!currentUser) {
      notifyError('Veuillez vous connecter pour réserver ce logement.');
      navigate('/login', { state: { from: `/properties/${id}` } });
      return;
    }

    if (!dateRange.checkIn || !dateRange.checkOut) {
      notifyError('Veuillez sélectionner des dates de séjour.');
      return;
    }

    if (!priceCalculation.available) {
      notifyError('Ce logement n\'est pas disponible aux dates sélectionnées.');
      return;
    }

    // Rediriger vers la page de réservation avec les paramètres
    navigate(`/booking/new`, {
      state: {
        propertyId: id,
        checkIn: dateRange.checkIn,
        checkOut: dateRange.checkOut,
        guests: dateRange.guests,
        price: priceCalculation
      }
    });
  };

  // Rendu lors du chargement ou erreur
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 text-red-700 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Erreur</h2>
            <p>{error}</p>
            <Link to="/properties" className="mt-4 inline-block">
              <Button variant="primary">
                Retour à la recherche
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (!property) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-500">Aucune donnée disponible</p>
        </div>
      </Layout>
    );
  }

  // Calculer les paramètres pour le component
  const mainImage = property.images && property.images.length > 0 
    ? property.images.find(img => img.is_main)?.image || property.images[0].image 
    : null;
  
  // Formater les types de propriété en français
  const propertyTypeDisplay = {
    'apartment': 'Appartement',
    'house': 'Maison',
    'villa': 'Villa',
    'studio': 'Studio',
    'room': 'Chambre'
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Début de la section titre et navigation */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <Link to="/properties" className="text-primary-600 hover:underline flex items-center mb-2">
                <FiArrowLeft className="mr-1" /> Retour aux résultats
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
            </div>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <button 
                className="flex items-center text-gray-600 hover:text-primary-600"
                onClick={() => {/* Implémentation à venir */}}
              >
                <FiHeart className="mr-1" /> Enregistrer
              </button>
              <button 
                className="flex items-center text-gray-600 hover:text-primary-600"
                onClick={() => {/* Implémentation à venir */}}
              >
                <FiShare2 className="mr-1" /> Partager
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center text-gray-600 text-sm">
            {property.avg_rating > 0 && (
              <div className="flex items-center mr-4">
                <FiStar className="text-yellow-500 mr-1" />
                <span className="font-medium mr-1">{property.avg_rating.toFixed(1)}</span>
                <span>({property.rating_count} avis)</span>
              </div>
            )}
            <div className="flex items-center mr-4">
              <FiMapPin className="mr-1" />
              <span>{property.city_name}, {property.neighborhood_name}</span>
            </div>
            {property.owner_verified && (
              <div className="flex items-center">
                <FiCheck className="text-green-500 mr-1" />
                <span>Propriétaire vérifié</span>
              </div>
            )}
          </div>
        </div>
        {/* Fin de la section titre et navigation */}

        {/* Début de la section galerie d'images */}
        <div className="mb-8">
          <div className="relative rounded-xl overflow-hidden h-[400px] md:h-[500px]">
            {/* Image principale */}
            {mainImage ? (
              <img 
                src={mainImage} 
                alt={property.title} 
                className="w-full h-full object-cover"
                onClick={() => setShowAllImages(true)}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <FiHome size={64} className="text-gray-400" />
              </div>
            )}
            
            {/* Navigation du carousel */}
            {property.images && property.images.length > 1 && (
              <>
                <button 
                  className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
                  onClick={() => navigateImages('prev')}
                >
                  <FiArrowLeft size={20} />
                </button>
                <button 
                  className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
                  onClick={() => navigateImages('next')}
                >
                  <FiArrowRight size={20} />
                </button>
              </>
            )}
            
            {/* Bouton pour voir toutes les images */}
            {property.images && property.images.length > 1 && (
              <button 
                className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-100 text-sm font-medium"
                onClick={() => setShowAllImages(true)}
              >
                Voir toutes les photos
              </button>
            )}
          </div>
        </div>
        {/* Fin de la section galerie d'images */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Début de la colonne principale (gauche et milieu) */}
          <div className="md:col-span-2">
            {/* Résumé de la propriété */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-6 mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    {propertyTypeDisplay[property.property_type] || property.property_type} chez {property.owner_name}
                  </h2>
                  <div className="flex flex-wrap items-center text-gray-600">
                    <span className="mr-3">{property.capacity} voyageurs</span>
                    <span className="mr-3">{property.bedrooms} chambre{property.bedrooms !== 1 && 's'}</span>
                    <span>{property.bathrooms} salle{property.bathrooms !== 1 && 's'} de bain</span>
                  </div>
                </div>
                <div className="mt-4 md:mt-0">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-3">
                      <FiUser size={24} className="text-gray-500" />
                    </div>
                    <div>
                      <div className="font-medium">{property.owner_name}</div>
                      <div className="text-sm text-gray-500">Membre depuis {new Date(property.owner_since).getFullYear()}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4">Description</h3>
                <div className="text-gray-700">
                  {showFullDescription ? (
                    <>
                      <p className="whitespace-pre-line">{property.description}</p>
                      <button 
                        className="text-primary-600 font-medium mt-2"
                        onClick={() => setShowFullDescription(false)}
                      >
                        Voir moins
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="whitespace-pre-line">
                        {property.description?.length > 300 
                          ? `${property.description.substring(0, 300)}...` 
                          : property.description}
                      </p>
                      {property.description?.length > 300 && (
                        <button 
                          className="text-primary-600 font-medium mt-2"
                          onClick={() => setShowFullDescription(true)}
                        >
                          Voir plus
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Équipements */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4">Équipements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {property.amenities?.slice(0, 8).map(amenity => (
                    <div key={amenity.id} className="flex items-center">
                      <FiCheck className="text-green-500 mr-2" />
                      <span>{amenity.name}</span>
                    </div>
                  ))}
                </div>
                {property.amenities?.length > 8 && (
                  <button 
                    className="mt-4 text-primary-600 font-medium"
                    onClick={() => setShowAmenities(true)}
                  >
                    Voir tous les équipements ({property.amenities.length})
                  </button>
                )}
              </div>
            </div>

            {/* Politique d'annulation et règlements */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-xl font-semibold mb-4">Politique d'annulation</h3>
              <div className="text-gray-700 mb-4">
                {property.cancellation_policy === 'flexible' ? (
                  <p>Remboursement complet jusqu'à 24 heures avant l'arrivée. Remboursement partiel après.</p>
                ) : property.cancellation_policy === 'moderate' ? (
                  <p>Remboursement complet jusqu'à 5 jours avant l'arrivée. Remboursement partiel après.</p>
                ) : (
                  <p>Remboursement complet jusqu'à 14 jours avant l'arrivée. Remboursement partiel après.</p>
                )}
              </div>
              <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                <FiInfo className="mt-1 text-primary-600 mr-3 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-gray-700">
                    Assurez-vous de lire attentivement la politique d'annulation avant de réserver.
                    En cas de question, n'hésitez pas à contacter le propriétaire.
                  </p>
                </div>
              </div>
            </div>

            {/* Avis */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">
                  Avis ({property.rating_count || 0})
                </h3>
                {property.avg_rating > 0 && (
                  <div className="flex items-center">
                    <FiStar className="text-yellow-500 mr-1" />
                    <span className="font-medium">{property.avg_rating.toFixed(1)}</span>
                  </div>
                )}
              </div>

              {property.rating_count === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  <p>Aucun avis pour le moment.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Ici, nous afficherions les avis, mais pour l'exemple nous les simulerons */}
                  <div className="pb-6 border-b border-gray-200">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-3">
                        <FiUser size={20} className="text-gray-500" />
                      </div>
                      <div>
                        <div className="font-medium">Sophie N.</div>
                        <div className="text-sm text-gray-500">Mars 2023</div>
                      </div>
                    </div>
                    <div className="flex items-center mb-3">
                      <FiStar className="text-yellow-500 mr-1" />
                      <span className="font-medium">4.8</span>
                    </div>
                    <p className="text-gray-700">
                      Superbe appartement, bien situé et équipé. Le propriétaire est très accueillant et réactif. Je recommande vivement ce logement pour un séjour à Douala.
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-3">
                        <FiUser size={20} className="text-gray-500" />
                      </div>
                      <div>
                        <div className="font-medium">Michel T.</div>
                        <div className="text-sm text-gray-500">Janvier 2023</div>
                      </div>
                    </div>
                    <div className="flex items-center mb-3">
                      <FiStar className="text-yellow-500 mr-1" />
                      <span className="font-medium">4.5</span>
                    </div>
                    <p className="text-gray-700">
                      Très bon rapport qualité-prix. L'appartement est bien situé, proche des commerces et restaurants. Petit bémol sur le bruit la nuit, mais rien de rédhibitoire.
                    </p>
                  </div>
                </div>
              )}
              
              <button 
                className="mt-6 text-primary-600 font-medium"
                onClick={() => navigate(`/properties/${id}/reviews`)}
              >
                Voir tous les avis
              </button>
            </div>
            
            {/* Localisation */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-xl font-semibold mb-4">Emplacement</h3>
              <div className="flex items-center mb-4">
                <FiMapPin className="mr-2 text-gray-600" />
                <span className="text-gray-700">{property.city_name}, {property.neighborhood_name}</span>
              </div>
              
              <div className="h-[300px] bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                <p className="text-gray-600">Carte en cours de chargement...</p>
                {/* Ici, nous intégrerons Google Maps ou une autre solution de cartographie */}
              </div>
              
              <div className="text-gray-700">
                <p>Le logement est situé dans un quartier {property.neighborhood_name} à {property.city_name}. 
                   {property.address && ` À proximité de ${property.address}.`}</p>
              </div>
            </div>
          </div>
          {/* Fin de la colonne principale */}
          
          {/* Début de la colonne latérale (à droite) */}
          <div className="md:col-span-1">
            <div className="sticky top-20">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">{property.price_per_night.toLocaleString()} FCFA</span>
                    <span className="text-gray-600"> / nuit</span>
                  </div>
                  {property.avg_rating > 0 && (
                    <div className="flex items-center">
                      <FiStar className="text-yellow-500 mr-1" />
                      <span className="font-medium mr-1">{property.avg_rating.toFixed(1)}</span>
                      <span className="text-gray-600">({property.rating_count})</span>
                    </div>
                  )}
                </div>
                
                <form className="mb-6">
                  <div className="border border-gray-300 rounded-lg overflow-hidden mb-4">
                    <div className="grid grid-cols-2">
                      <div className="p-4 border-r border-b">
                        <label htmlFor="checkIn" className="block text-sm text-gray-600 mb-1">Arrivée</label>
                        <input
                          type="date"
                          id="checkIn"
                          name="checkIn"
                          value={dateRange.checkIn}
                          onChange={handleDateChange}
                          className="w-full border-none focus:ring-0 p-0 text-gray-900"
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div className="p-4 border-b">
                        <label htmlFor="checkOut" className="block text-sm text-gray-600 mb-1">Départ</label>
                        <input
                          type="date"
                          id="checkOut"
                          name="checkOut"
                          value={dateRange.checkOut}
                          onChange={handleDateChange}
                          className="w-full border-none focus:ring-0 p-0 text-gray-900"
                          min={dateRange.checkIn || new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>
                    <div className="p-4">
                      <label htmlFor="guests" className="block text-sm text-gray-600 mb-1">Voyageurs</label>
                      <select
                        id="guests"
                        value={dateRange.guests}
                        onChange={handleGuestsChange}
                        className="w-full border-none focus:ring-0 p-0 text-gray-900"
                      >
                        {[...Array(property.capacity)].map((_, i) => (
                          <option key={i} value={i + 1}>
                            {i + 1} {i === 0 ? 'voyageur' : 'voyageurs'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <Button
                    type="button"
                    variant="primary"
                    fullWidth
                    size="lg"
                    onClick={initiateBooking}
                    disabled={!dateRange.checkIn || !dateRange.checkOut || !priceCalculation.available}
                  >
                    Réserver
                  </Button>
                </form>
                
                {dateRange.checkIn && dateRange.checkOut && (
                  <div className="mb-6">
                    {!priceCalculation.available ? (
                      <div className="text-red-600 text-center p-3 bg-red-50 rounded-lg">
                        <p>Ce logement n'est pas disponible aux dates sélectionnées.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>{property.price_per_night.toLocaleString()} FCFA x {priceCalculation.nights} nuits</span>
                          <span>{priceCalculation.basePrice.toLocaleString()} FCFA</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Frais de ménage</span>
                          <span>{priceCalculation.cleaningFee.toLocaleString()} FCFA</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Frais de service</span>
                          <span>{priceCalculation.serviceFee.toLocaleString()} FCFA</span>
                        </div>
                        {priceCalculation.discount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Réduction (séjour longue durée)</span>
                            <span>-{priceCalculation.discount.toLocaleString()} FCFA</span>
                          </div>
                        )}
                        <div className="border-t pt-3 font-bold flex justify-between">
                          <span>Total</span>
                          <span>{priceCalculation.totalPrice.toLocaleString()} FCFA</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="text-center">
                  <button
                    onClick={() => setShowContact(true)}
                    className="text-primary-600 font-medium"
                  >
                    Contacter {property.owner_name}
                  </button>
                </div>
              </div>
              
              {/* Information sur le dépôt de garantie */}
              {property.security_deposit > 0 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm">
                  <div className="flex items-start">
                    <FiInfo className="mt-1 text-primary-600 mr-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium mb-1">Dépôt de garantie</p>
                      <p className="text-gray-700">
                        Un dépôt de garantie de {property.security_deposit.toLocaleString()} FCFA sera demandé à l'arrivée et remboursé au départ si aucun dommage n'est constaté.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Fin de la colonne latérale */}
        </div>
      </div>
      
      {/* Modals */}
      {/* Modal pour toutes les images */}
      <Modal
        isOpen={showAllImages}
        onClose={() => setShowAllImages(false)}
        title="Photos"
        size="xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {property.images?.map((image, index) => (
            <div 
              key={image.id || index} 
              className="rounded-lg overflow-hidden"
            >
              <img 
                src={image.image} 
                alt={image.caption || `Photo ${index + 1}`} 
                className="w-full h-64 object-cover"
              />
              {image.caption && (
                <div className="p-2 text-sm text-gray-700">
                  {image.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      </Modal>
      
      {/* Modal pour tous les équipements */}
      <Modal
        isOpen={showAmenities}
        onClose={() => setShowAmenities(false)}
        title="Équipements"
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {property.amenities?.map(amenity => (
            <div key={amenity.id} className="flex items-center p-2">
              <FiCheck className="text-green-500 mr-3" />
              <span>{amenity.name}</span>
            </div>
          ))}
        </div>
      </Modal>
      
      {/* Modal pour contacter le propriétaire */}
      <Modal
        isOpen={showContact}
        onClose={() => setShowContact(false)}
        title={`Contacter ${property.owner_name}`}
        size="md"
      >
        <div className="space-y-6">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-4">
              <FiUser size={32} className="text-gray-500" />
            </div>
            <div>
              <div className="font-medium text-lg">{property.owner_name}</div>
              <div className="text-gray-600">Membre depuis {new Date(property.owner_since).getFullYear()}</div>
              {property.owner_verified && (
                <div className="flex items-center text-green-600 text-sm">
                  <FiCheck className="mr-1" />
                  <span>Identité vérifiée</span>
                </div>
              )}
            </div>
          </div>
          
          <p className="text-gray-700">
            Vous pouvez contacter {property.owner_name} pour poser des questions ou obtenir plus d'informations sur ce logement.
          </p>
          
          {!currentUser ? (
            <div>
              <p className="mb-4 text-gray-700">
                Vous devez être connecté pour contacter le propriétaire.
              </p>
              <div className="flex space-x-4">
                <Link to="/login" state={{ from: `/properties/${id}` }}>
                  <Button variant="primary">Se connecter</Button>
                </Link>
                <Link to="/register" state={{ from: `/properties/${id}` }}>
                  <Button variant="secondary">S'inscrire</Button>
                </Link>
              </div>
            </div>
          ) : (
            <Button
              variant="primary"
              fullWidth
              onClick={() => {
                startConversation();
                setShowContact(false);
              }}
            >
              Envoyer un message
            </Button>
          )}
        </div>
      </Modal>
    </Layout>
  );
};

export default PropertyDetail;