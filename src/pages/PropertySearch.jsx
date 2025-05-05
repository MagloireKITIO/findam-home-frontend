// src/pages/PropertySearch.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, FiMapPin, FiCalendar, FiUsers, FiFilter, 
  FiX, FiSliders, FiGrid, FiMap, FiChevronDown, FiHome, 
  FiDollarSign, FiCheckCircle
} from 'react-icons/fi';

import Layout from '../components/layout/Layout';
import PropertyCard from '../components/features/PropertyCard';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Pagination from '../components/common/Pagination';
import api from '../services/api';
import useApi from '../hooks/useApi';
import { useNotification } from '../context/NotificationContext';

const PropertySearch = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { error: notifyError } = useNotification();
  const { fetchData, loading: apiLoading, error: apiError } = useApi();

  // États pour la recherche et les résultats
  const [properties, setProperties] = useState([]);
  const [totalProperties, setTotalProperties] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [cities, setCities] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // État pour l'affichage
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'map'
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState('-created_at'); // Par défaut: les plus récents

  // Paramètres de recherche
  const [searchParams, setSearchParams] = useState({
    location: '',
    city: '',
    neighborhood: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    minPrice: '',
    maxPrice: '',
    propertyType: '',
    bedrooms: '',
    bathrooms: '',
    amenities: [],
  });

  // Récupérer les paramètres de l'URL lors du chargement initial
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    // Construire les paramètres de recherche à partir de l'URL
    const newSearchParams = { ...searchParams };
    
    if (params.has('location')) newSearchParams.location = params.get('location');
    if (params.has('city')) newSearchParams.city = params.get('city');
    if (params.has('city_name')) newSearchParams.location = params.get('city_name');
    if (params.has('neighborhood')) newSearchParams.neighborhood = params.get('neighborhood');
    if (params.has('check_in_date')) newSearchParams.checkIn = params.get('check_in_date');
    if (params.has('check_out_date')) newSearchParams.checkOut = params.get('check_out_date');
    if (params.has('guests_count')) newSearchParams.guests = parseInt(params.get('guests_count'));
    if (params.has('min_price')) newSearchParams.minPrice = params.get('min_price');
    if (params.has('max_price')) newSearchParams.maxPrice = params.get('max_price');
    if (params.has('property_type')) newSearchParams.propertyType = params.get('property_type');
    if (params.has('bedrooms')) newSearchParams.bedrooms = params.get('bedrooms');
    if (params.has('bathrooms')) newSearchParams.bathrooms = params.get('bathrooms');
    if (params.has('amenities')) {
      newSearchParams.amenities = params.get('amenities').split(',').map(id => parseInt(id));
    }
    if (params.has('ordering')) {
      setSortBy(params.get('ordering'));
    }
    if (params.has('page')) {
      setCurrentPage(parseInt(params.get('page')));
    }
    
    setSearchParams(newSearchParams);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // Charger les données de filtre (villes, quartiers, équipements)
  useEffect(() => {
    const loadFilterData = async () => {
      try {
        // Chargement parallèle des données pour les filtres
        const [citiesResponse, amenitiesResponse] = await Promise.all([
          api.get('/properties/cities/'),
          api.get('/properties/amenities/')
        ]);
        
        if (citiesResponse.data.results) {
          setCities(citiesResponse.data.results);
        } else if (Array.isArray(citiesResponse.data)) {
          setCities(citiesResponse.data);
        }
        
        if (amenitiesResponse.data.results) {
          setAmenities(amenitiesResponse.data.results);
        } else if (Array.isArray(amenitiesResponse.data)) {
          setAmenities(amenitiesResponse.data);
        }
        
        // Si une ville est sélectionnée, charger ses quartiers
        if (searchParams.city) {
          const neighborhoodsResponse = await api.get('/properties/neighborhoods/', {
            params: { city: searchParams.city }
          });
          if (neighborhoodsResponse.data.results) {
            setNeighborhoods(neighborhoodsResponse.data.results);
          } else if (Array.isArray(neighborhoodsResponse.data)) {
            setNeighborhoods(neighborhoodsResponse.data);
          }
        }
      } catch (err) {
        console.error('Erreur lors du chargement des données de filtre:', err);
        setError('Une erreur est survenue lors du chargement des filtres.');
      }
    };
    
    loadFilterData();
  }, [searchParams.city]);

  // Effectuer la recherche lorsque les paramètres changent
  useEffect(() => {
    const searchProperties = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Construire les paramètres pour l'API
        const apiParams = {
          page: currentPage,
          ordering: sortBy,
        };
        
        // Ajouter les paramètres de recherche non vides
        if (searchParams.location) apiParams.search = searchParams.location;
        if (searchParams.city) apiParams.city = searchParams.city;
        if (searchParams.neighborhood) apiParams.neighborhood = searchParams.neighborhood;
        if (searchParams.checkIn) apiParams.available_start = searchParams.checkIn;
        if (searchParams.checkOut) apiParams.available_end = searchParams.checkOut;
        if (searchParams.guests) apiParams.min_capacity = searchParams.guests;
        if (searchParams.minPrice) apiParams.min_price = searchParams.minPrice;
        if (searchParams.maxPrice) apiParams.max_price = searchParams.maxPrice;
        if (searchParams.propertyType) apiParams.property_type = searchParams.propertyType;
        if (searchParams.bedrooms) apiParams.min_bedrooms = searchParams.bedrooms;
        if (searchParams.bathrooms) apiParams.min_bathrooms = searchParams.bathrooms;
        if (searchParams.amenities.length > 0) apiParams.amenities = searchParams.amenities.join(',');
        
        // Appel à l'API
        const response = await api.get('/properties/', { params: apiParams });
        
        if (response.data.results) {
          setProperties(response.data.results);
          setTotalProperties(response.data.count);
        } else if (Array.isArray(response.data)) {
          setProperties(response.data);
          setTotalProperties(response.data.length);
        } else {
          setProperties([]);
          setTotalProperties(0);
        }
      } catch (err) {
        console.error('Erreur lors de la recherche de propriétés:', err);
        setError('Une erreur est survenue lors de la recherche. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };
    
    searchProperties();
  }, [currentPage, sortBy, searchParams]);

  // Mettre à jour l'URL lorsque les paramètres de recherche changent
  const updateUrlParams = () => {
    const params = new URLSearchParams();
    
    // Ajouter les paramètres non vides à l'URL
    if (searchParams.location) params.append('location', searchParams.location);
    if (searchParams.city) params.append('city', searchParams.city);
    if (searchParams.neighborhood) params.append('neighborhood', searchParams.neighborhood);
    if (searchParams.checkIn) params.append('check_in_date', searchParams.checkIn);
    if (searchParams.checkOut) params.append('check_out_date', searchParams.checkOut);
    if (searchParams.guests > 1) params.append('guests_count', searchParams.guests);
    if (searchParams.minPrice) params.append('min_price', searchParams.minPrice);
    if (searchParams.maxPrice) params.append('max_price', searchParams.maxPrice);
    if (searchParams.propertyType) params.append('property_type', searchParams.propertyType);
    if (searchParams.bedrooms) params.append('bedrooms', searchParams.bedrooms);
    if (searchParams.bathrooms) params.append('bathrooms', searchParams.bathrooms);
    if (searchParams.amenities.length > 0) params.append('amenities', searchParams.amenities.join(','));
    
    // Ajouter les paramètres de tri et pagination
    params.append('ordering', sortBy);
    if (currentPage > 1) params.append('page', currentPage.toString());
    
    // Mettre à jour l'URL sans recharger la page
    navigate({ pathname: '/properties', search: params.toString() }, { replace: true });
  };

  // Gestion des changements dans les filtres
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  // Gestion de la sélection d'une ville
  const handleCityChange = (e) => {
    const { value } = e.target;
    setSearchParams(prev => ({ 
      ...prev, 
      city: value, 
      neighborhood: '' // Réinitialiser le quartier quand la ville change
    }));
  };

  // Gestion de la sélection d'un équipement
  const handleAmenityToggle = (id) => {
    setSearchParams(prev => {
      const amenities = [...prev.amenities];
      const index = amenities.indexOf(id);
      
      if (index === -1) {
        amenities.push(id);
      } else {
        amenities.splice(index, 1);
      }
      
      return { ...prev, amenities };
    });
  };

  // Réinitialiser tous les filtres
  const resetFilters = () => {
    setSearchParams({
      location: '',
      city: '',
      neighborhood: '',
      checkIn: '',
      checkOut: '',
      guests: 1,
      minPrice: '',
      maxPrice: '',
      propertyType: '',
      bedrooms: '',
      bathrooms: '',
      amenities: [],
    });
    setCurrentPage(1);
    setSortBy('-created_at');
  };

  // Soumettre la recherche
  const handleSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Retour à la première page lors d'une nouvelle recherche
    updateUrlParams();
  };

  // Gérer le changement de page
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Mettre à jour l'URL avec la nouvelle page
    const params = new URLSearchParams(location.search);
    params.set('page', page.toString());
    navigate({ pathname: '/properties', search: params.toString() }, { replace: true });
  };

  // Gérer le changement de tri
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    // Mettre à jour l'URL avec le nouveau tri
    const params = new URLSearchParams(location.search);
    params.set('ordering', e.target.value);
    navigate({ pathname: '/properties', search: params.toString() }, { replace: true });
  };

  // Calculer le nombre total de pages
  const totalPages = Math.ceil(totalProperties / 9); // 9 propriétés par page

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Barre de recherche principale */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="md:w-1/3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMapPin className="text-gray-500" />
                </div>
                <input
                  type="text"
                  name="location"
                  value={searchParams.location}
                  onChange={handleInputChange}
                  placeholder="Destination, ville, quartier..."
                  className="pl-10 w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            
            <div className="md:w-1/5">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiCalendar className="text-gray-500" />
                </div>
                <input
                  type="date"
                  name="checkIn"
                  value={searchParams.checkIn}
                  onChange={handleInputChange}
                  className="pl-10 w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Arrivée"
                />
              </div>
            </div>
            
            <div className="md:w-1/5">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiCalendar className="text-gray-500" />
                </div>
                <input
                  type="date"
                  name="checkOut"
                  value={searchParams.checkOut}
                  onChange={handleInputChange}
                  className="pl-10 w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Départ"
                />
              </div>
            </div>
            
            <div className="md:w-1/5">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUsers className="text-gray-500" />
                </div>
                <select
                  name="guests"
                  value={searchParams.guests}
                  onChange={handleInputChange}
                  className="pl-10 w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'voyageur' : 'voyageurs'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="md:w-auto">
              <Button 
                type="submit" 
                variant="primary" 
                className="w-full md:w-auto"
                icon={<FiSearch />}
              >
                Rechercher
              </Button>
            </div>
          </form>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filtres (côté gauche sur desktop, en modal sur mobile) */}
          <AnimatePresence>
            {filtersOpen && (
              <motion.div
                initial={{ opacity: 0, x: -300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-40 md:relative md:inset-auto bg-white md:bg-transparent md:shadow-none md:w-1/4 overflow-auto"
              >
                <div className="md:hidden flex justify-between items-center p-4 border-b">
                  <h2 className="text-lg font-semibold">Filtres</h2>
                  <button
                    onClick={() => setFiltersOpen(false)}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <FiX size={24} />
                  </button>
                </div>
                
                <div className="p-4 md:p-0 md:sticky md:top-20">
                  <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-4">Prix</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Min</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FiDollarSign className="text-gray-500" />
                            </div>
                            <input
                              type="number"
                              name="minPrice"
                              value={searchParams.minPrice}
                              onChange={handleInputChange}
                              placeholder="Min"
                              className="pl-8 w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Max</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FiDollarSign className="text-gray-500" />
                            </div>
                            <input
                              type="number"
                              name="maxPrice"
                              value={searchParams.maxPrice}
                              onChange={handleInputChange}
                              placeholder="Max"
                              className="pl-8 w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-4">Lieu</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Ville</label>
                          <select
                            name="city"
                            value={searchParams.city}
                            onChange={handleCityChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
                          >
                            <option value="">Toutes les villes</option>
                            {cities.map(city => (
                              <option key={city.id} value={city.id}>
                                {city.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        {searchParams.city && (
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Quartier</label>
                            <select
                              name="neighborhood"
                              value={searchParams.neighborhood}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            >
                              <option value="">Tous les quartiers</option>
                              {neighborhoods.map(neighborhood => (
                                <option key={neighborhood.id} value={neighborhood.id}>
                                  {neighborhood.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-4">Type de logement</h3>
                      <select
                        name="propertyType"
                        value={searchParams.propertyType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      >
                        <option value="">Tous les types</option>
                        <option value="apartment">Appartement</option>
                        <option value="house">Maison</option>
                        <option value="studio">Studio</option>
                        <option value="villa">Villa</option>
                        <option value="room">Chambre</option>
                      </select>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-4">Chambres et salles de bain</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Chambres</label>
                          <select
                            name="bedrooms"
                            value={searchParams.bedrooms}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
                          >
                            <option value="">Toutes</option>
                            <option value="1">1+</option>
                            <option value="2">2+</option>
                            <option value="3">3+</option>
                            <option value="4">4+</option>
                            <option value="5">5+</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Salles de bain</label>
                          <select
                            name="bathrooms"
                            value={searchParams.bathrooms}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
                          >
                            <option value="">Toutes</option>
                            <option value="1">1+</option>
                            <option value="2">2+</option>
                            <option value="3">3+</option>
                            <option value="4">4+</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-4">Équipements</h3>
                      <div className="space-y-3 max-h-48 overflow-y-auto">
                        {amenities.map(amenity => (
                          <div key={amenity.id} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`amenity-${amenity.id}`}
                              checked={searchParams.amenities.includes(amenity.id)}
                              onChange={() => handleAmenityToggle(amenity.id)}
                              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <label htmlFor={`amenity-${amenity.id}`} className="ml-2 text-sm text-gray-700">
                              {amenity.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-3">
                      <Button
                        variant="primary"
                        onClick={() => {
                          updateUrlParams();
                          if (window.innerWidth < 768) {
                            setFiltersOpen(false);
                          }
                        }}
                        className="w-full"
                      >
                        Appliquer les filtres
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={resetFilters}
                        className="w-full"
                      >
                        Réinitialiser
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Overlay pour mobile lorsque les filtres sont ouverts */}
          {filtersOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
              onClick={() => setFiltersOpen(false)}
            ></div>
          )}
          
          {/* Contenu principal (liste des propriétés) */}
          <div className={`w-full ${filtersOpen ? 'md:w-3/4' : 'w-full'}`}>
            {/* Barre d'outils: nombre de résultats, tri, boutons filtres/map */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="text-gray-700">
                  {loading ? (
                    <span>Recherche en cours...</span>
                  ) : (
                    <span>{totalProperties} logement{totalProperties !== 1 ? 's' : ''} trouvé{totalProperties !== 1 ? 's' : ''}</span>
                  )}
                </div>
                
                <div className="flex items-center space-x-4">
                  <div>
                    <label htmlFor="sortBy" className="sr-only">Trier par</label>
                    <select
                      id="sortBy"
                      value={sortBy}
                      onChange={handleSortChange}
                      className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      <option value="-created_at">Plus récent</option>
                      <option value="price_per_night">Prix croissant</option>
                      <option value="-price_per_night">Prix décroissant</option>
                      <option value="-avg_rating">Mieux notés</option>
                    </select>
                  </div>
                  
                  <div className="hidden md:flex items-center space-x-2 border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-primary-100 text-primary-700' : 'bg-white text-gray-600'}`}
                      aria-label="Affichage en grille"
                    >
                      <FiGrid />
                    </button>
                    <button
                      onClick={() => setViewMode('map')}
                      className={`p-2 ${viewMode === 'map' ? 'bg-primary-100 text-primary-700' : 'bg-white text-gray-600'}`}
                      aria-label="Affichage sur carte"
                    >
                      <FiMap />
                    </button>
                  </div>
                  
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<FiFilter />}
                    onClick={() => setFiltersOpen(!filtersOpen)}
                    className="md:hidden"
                  >
                    Filtres
                  </Button>

                  {!filtersOpen && (
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<FiSliders />}
                      onClick={() => setFiltersOpen(true)}
                      className="hidden md:flex"
                    >
                      Filtres
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Affichage des résultats */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg">
                <p>{error}</p>
              </div>
            ) : properties.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <FiHome className="mx-auto text-gray-400 mb-4" size={64} />
                <h3 className="text-xl font-bold mb-2">Aucun logement trouvé</h3>
                <p className="text-gray-600 mb-6">
                  Aucun logement ne correspond à vos critères de recherche. Essayez d'ajuster vos filtres.
                </p>
                <Button variant="primary" onClick={resetFilters}>
                  Réinitialiser les filtres
                </Button>
              </div>
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map(property => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-md p-4">
                    <div className="h-[600px] bg-gray-200 flex items-center justify-center">
                      <p className="text-gray-600">Carte en cours de développement</p>
                      {/* Ici, nous intégrerons Google Maps ou une autre solution de cartographie */}
                    </div>
                  </div>
                )}
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PropertySearch;