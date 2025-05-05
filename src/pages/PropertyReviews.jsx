// src/pages/PropertyReviews.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiStar, FiFilter, FiArrowDown, FiArrowUp } from 'react-icons/fi';

import Layout from '../components/layout/Layout';
import ReviewCard from '../components/features/ReviewCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import Pagination from '../components/common/Pagination';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';

const PropertyReviews = () => {
  const { id } = useParams();
  const { error: notifyError } = useNotification();
  
  // États
  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratings, setRatings] = useState({
    overall: 0,
    cleanliness: 0,
    location: 0,
    value: 0,
    communication: 0
  });
  
  // Filtres et tri
  const [filters, setFilters] = useState({
    rating: 0, // 0 = tous
    hasPhotos: false,
    verifiedStay: false
  });
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest', 'oldest', 'highest', 'lowest'
  
  // Chargement de la propriété et des avis
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Charger les détails de la propriété
        const propertyResponse = await api.get(`/properties/${id}/`);
        setProperty(propertyResponse.data);
        
        // Préparer les paramètres de requête pour les avis
        const params = {
          property: id,
          page: currentPage,
          is_public: true
        };
        
        // Ajouter les filtres
        if (filters.rating > 0) {
          params.rating = filters.rating;
        }
        if (filters.hasPhotos) {
          params.has_photos = true;
        }
        if (filters.verifiedStay) {
          params.is_verified_stay = true;
        }
        
        // Ajouter le tri
        switch (sortOrder) {
          case 'newest':
            params.ordering = '-created_at';
            break;
          case 'oldest':
            params.ordering = 'created_at';
            break;
          case 'highest':
            params.ordering = '-rating';
            break;
          case 'lowest':
            params.ordering = 'rating';
            break;
          default:
            params.ordering = '-created_at';
        }
        
        // Charger les avis
        const reviewsResponse = await api.get('/reviews/reviews/', { params });
        
        if (reviewsResponse.data.results) {
          setReviews(reviewsResponse.data.results);
          setTotalReviews(reviewsResponse.data.count);
        } else if (Array.isArray(reviewsResponse.data)) {
          setReviews(reviewsResponse.data);
          setTotalReviews(reviewsResponse.data.length);
        } else {
          setReviews([]);
          setTotalReviews(0);
        }
        
        // Calculer les moyennes des notes
        if (propertyResponse.data && propertyResponse.data.ratings_summary) {
          const summary = propertyResponse.data.ratings_summary;
          setRatings({
            overall: summary.avg_rating || 0,
            cleanliness: summary.avg_cleanliness_rating || 0,
            location: summary.avg_location_rating || 0,
            value: summary.avg_value_rating || 0,
            communication: summary.avg_communication_rating || 0
          });
        }
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Une erreur est survenue lors du chargement des avis.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, currentPage, filters, sortOrder]);
  
  // Gérer le changement de page
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };
  
  // Gérer le changement de filtres
  const handleFilterChange = (filter, value) => {
    setFilters(prev => ({ ...prev, [filter]: value }));
    setCurrentPage(1); // Réinitialiser la pagination
  };
  
  // Gérer le changement de tri
  const handleSortChange = (order) => {
    setSortOrder(order);
    setCurrentPage(1); // Réinitialiser la pagination
  };
  
  // Calculer le nombre total de pages
  const totalPages = Math.ceil(totalReviews / 10); // 10 avis par page
  
  // Rendu lors du chargement ou erreur
  if (loading && !property) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }
  
  if (error && !property) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto bg-red-50 text-red-700 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Erreur</h2>
            <p>{error}</p>
            <Link to={`/properties/${id}`}>
              <Button variant="primary" className="mt-4">
                Retour à la propriété
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Bouton de retour */}
          <div className="mb-6">
            <Link to={`/properties/${id}`} className="text-primary-600 hover:underline flex items-center">
              &larr; Retour à la propriété
            </Link>
          </div>
          
          {/* Titre et note globale */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Avis sur {property?.title}
            </h1>
            <div className="flex items-center">
              <div className="flex">
                {[...Array(5)].map((_, index) => (
                  <FiStar
                    key={index}
                    className={index < Math.round(ratings.overall) ? "text-yellow-500 fill-current" : "text-gray-300"}
                    size={24}
                  />
                ))}
              </div>
              <span className="ml-2 text-xl font-bold">{ratings.overall.toFixed(1)}</span>
              <span className="ml-2 text-gray-600">({totalReviews} avis)</span>
            </div>
          </div>
          
          {/* Résumé des notes */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Détail des notes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Propreté', value: ratings.cleanliness },
                { label: 'Emplacement', value: ratings.location },
                { label: 'Rapport qualité-prix', value: ratings.value },
                { label: 'Communication', value: ratings.communication }
              ].map((category, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700">{category.label}</span>
                    <span className="font-medium">{category.value.toFixed(1)}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-yellow-500 rounded-full" 
                      style={{ width: `${(category.value / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Barre de filtres et de tri */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Filtres */}
              <div className="flex flex-wrap gap-3">
                {/* Filtre par note */}
                <div className="relative">
                  <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md">
                    <FiFilter className="mr-2" />
                    <span>Note: {filters.rating === 0 ? 'Toutes' : `${filters.rating} étoiles`}</span>
                  </button>
                  <div className="absolute left-0 top-12 z-10 bg-white rounded-lg shadow-lg p-3 border border-gray-200">
                    {[0, 5, 4, 3, 2, 1].map(rating => (
                      <button
                        key={rating}
                        className={`block w-full text-left px-3 py-2 rounded-md ${
                          filters.rating === rating ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleFilterChange('rating', rating)}
                      >
                        {rating === 0 ? 'Toutes les notes' : (
                          <div className="flex items-center">
                            {[...Array(5)].map((_, index) => (
                              <FiStar
                                key={index}
                                className={index < rating ? "text-yellow-500 fill-current" : "text-gray-300"}
                                size={14}
                              />
                            ))}
                            <span className="ml-2">{rating} étoiles</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Filtre par photos */}
                <button
                  className={`px-3 py-2 border rounded-md ${
                    filters.hasPhotos 
                      ? 'bg-primary-50 text-primary-600 border-primary-500' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleFilterChange('hasPhotos', !filters.hasPhotos)}
                >
                  Avec photos
                </button>
                
                {/* Filtre par séjour vérifié */}
                <button
                  className={`px-3 py-2 border rounded-md ${
                    filters.verifiedStay 
                      ? 'bg-primary-50 text-primary-600 border-primary-500' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleFilterChange('verifiedStay', !filters.verifiedStay)}
                >
                  Séjours vérifiés
                </button>
              </div>
              
              {/* Tri */}
              <div className="relative">
                <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md">
                  <span>Trier par: </span>
                  <span className="font-medium ml-1">
                    {sortOrder === 'newest' 
                      ? 'Plus récents' 
                      : sortOrder === 'oldest' 
                        ? 'Plus anciens' 
                        : sortOrder === 'highest' 
                          ? 'Meilleures notes' 
                          : 'Notes les plus basses'}
                  </span>
                  <FiArrowDown className="ml-2" />
                </button>
                <div className="absolute right-0 top-12 z-10 bg-white rounded-lg shadow-lg p-3 border border-gray-200 w-48">
                  <button
                    className={`block w-full text-left px-3 py-2 rounded-md ${
                      sortOrder === 'newest' ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleSortChange('newest')}
                  >
                    Plus récents
                  </button>
                  <button
                    className={`block w-full text-left px-3 py-2 rounded-md ${
                      sortOrder === 'oldest' ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleSortChange('oldest')}
                  >
                    Plus anciens
                  </button>
                  <button
                    className={`block w-full text-left px-3 py-2 rounded-md ${
                      sortOrder === 'highest' ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleSortChange('highest')}
                  >
                    Meilleures notes
                  </button>
                  <button
                    className={`block w-full text-left px-3 py-2 rounded-md ${
                      sortOrder === 'lowest' ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleSortChange('lowest')}
                  >
                    Notes les plus basses
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Liste des avis */}
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <FiStar className="mx-auto text-gray-400 mb-4" size={64} />
              <h3 className="text-xl font-bold mb-2">Aucun avis trouvé</h3>
              <p className="text-gray-600 mb-6">
                Aucun avis ne correspond à vos critères de recherche. Essayez d'ajuster vos filtres.
              </p>
              <Button 
                variant="primary" 
                onClick={() => {
                  setFilters({ rating: 0, hasPhotos: false, verifiedStay: false });
                  setSortOrder('newest');
                }}
              >
                Réinitialiser les filtres
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map(review => (
                <ReviewCard 
                  key={review.id}
                  review={review}
                  showDetailedRatings
                  className="shadow-md"
                />
              ))}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PropertyReviews;