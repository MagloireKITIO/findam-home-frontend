// src/pages/BookingList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiClock, FiCheck, FiX, FiCalendar, FiHome,
  FiFilter, FiChevronDown, FiSearch, FiMapPin
} from 'react-icons/fi';

import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Pagination from '../components/common/Pagination';
import api from '../services/api';
import useApi from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const BookingList = () => {
  const { currentUser } = useAuth();
  const { success, error: notifyError } = useNotification();
  const { fetchData, loading: apiLoading, error: apiError } = useApi();

  // États
  const [bookings, setBookings] = useState([]);
  const [totalBookings, setTotalBookings] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'past', 'all'

  // Filtres
  const [filters, setFilters] = useState({
    status: '',
    payment_status: '',
    start_date: '',
    end_date: ''
  });

  // Charger les réservations
  useEffect(() => {
    const loadBookings = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = {
          page: currentPage,
          ...filters
        };

        // Ajouter les paramètres selon l'onglet actif
        switch (activeTab) {
          case 'upcoming':
            params.is_future = true;
            break;
          case 'past':
            params.is_past = true;
            break;
          // 'all' n'a pas besoin de paramètre supplémentaire
        }

        const response = await api.get('/bookings/bookings/', { params });

        if (response.data.results) {
          setBookings(response.data.results);
          setTotalBookings(response.data.count);
        } else if (Array.isArray(response.data)) {
          setBookings(response.data);
          setTotalBookings(response.data.length);
        } else {
          setBookings([]);
          setTotalBookings(0);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des réservations:', err);
        setError('Une erreur est survenue lors du chargement de vos réservations.');
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [currentPage, filters, activeTab]);

  // Gestion des changements de filtre
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Réinitialiser la pagination
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      status: '',
      payment_status: '',
      start_date: '',
      end_date: ''
    });
    setCurrentPage(1);
  };

  // Appliquer les filtres
  const applyFilters = () => {
    setShowFilters(false);
    setCurrentPage(1);
  };

  // Changer d'onglet
  const changeTab = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  // Gérer le changement de page
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // Obtenir le statut formaté
  const getStatusElement = (status, paymentStatus) => {
    // Vérifier d'abord le statut de paiement
    if (paymentStatus === 'pending' || paymentStatus === 'failed') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <FiClock className="mr-1" />
          Paiement en attente
        </span>
      );
    }

    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <FiClock className="mr-1" />
            En attente
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FiCheck className="mr-1" />
            Confirmée
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FiCheck className="mr-1" />
            Terminée
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <FiX className="mr-1" />
            Annulée
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  // Obtenir la liste des statuts disponibles
  const getStatusOptions = () => [
    { value: '', label: 'Tous les statuts' },
    { value: 'pending', label: 'En attente' },
    { value: 'confirmed', label: 'Confirmée' },
    { value: 'completed', label: 'Terminée' },
    { value: 'cancelled', label: 'Annulée' }
  ];

  // Obtenir la liste des statuts de paiement disponibles
  const getPaymentStatusOptions = () => [
    { value: '', label: 'Tous les statuts de paiement' },
    { value: 'pending', label: 'En attente' },
    { value: 'paid', label: 'Payé' },
    { value: 'failed', label: 'Échoué' },
    { value: 'refunded', label: 'Remboursé' }
  ];

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Calculer le nombre total de pages
  const totalPages = Math.ceil(totalBookings / 10); // 10 réservations par page

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">Mes réservations</h1>
            
            <div className="flex space-x-4">
              <Button
                variant="outline"
                size="sm"
                icon={<FiFilter />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filtres
              </Button>
              
              <Link to="/bookings/calendar">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<FiCalendar />}
                >
                  Calendrier
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Onglets */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => changeTab('upcoming')}
              className={`py-3 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'upcoming'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              À venir
            </button>
            
            <button
              onClick={() => changeTab('past')}
              className={`py-3 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'past'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Passées
            </button>
            
            <button
              onClick={() => changeTab('all')}
              className={`py-3 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Toutes
            </button>
          </div>
          
          {/* Filtres */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-lg shadow-md p-4 mb-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Statut
                  </label>
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    {getStatusOptions().map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Statut de paiement
                  </label>
                  <select
                    name="payment_status"
                    value={filters.payment_status}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    {getPaymentStatusOptions().map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de début (au plus tôt)
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={filters.start_date}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de fin (au plus tard)
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={filters.end_date}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={resetFilters}
                >
                  Réinitialiser
                </Button>
                
                <Button
                  variant="primary"
                  size="sm"
                  onClick={applyFilters}
                >
                  Appliquer
                </Button>
              </div>
            </motion.div>
          )}
          
          {/* Contenu principal */}
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg">
              <p>{error}</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <FiCalendar className="mx-auto text-gray-400 mb-4" size={64} />
              <h3 className="text-xl font-bold mb-2">Aucune réservation trouvée</h3>
              <p className="text-gray-600 mb-6">
                {activeTab === 'upcoming' 
                  ? 'Vous n\'avez pas de réservations à venir.' 
                  : activeTab === 'past' 
                    ? 'Vous n\'avez pas de réservations passées.' 
                    : 'Vous n\'avez pas encore effectué de réservation.'}
              </p>
              <Link to="/properties">
                <Button variant="primary">
                  Explorer les logements
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map(booking => (
                <Link 
                  key={booking.id} 
                  to={`/bookings/${booking.id}`}
                  className="block"
                >
                  <motion.div
                    whileHover={{ y: -3, transition: { duration: 0.2 } }}
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                  >
                    <div className="md:flex">
                      <div className="md:w-1/3 h-48 md:h-auto">
                        {booking.property_image ? (
                          <img 
                            src={booking.property_image} 
                            alt={booking.property_title} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <FiHome size={48} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="p-6 md:w-2/3">
                        <div className="flex flex-col md:flex-row md:justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-1">
                              {booking.property_title}
                            </h3>
                            <div className="flex items-center text-gray-600 text-sm mb-2">
                              <FiMapPin className="mr-1" />
                              <span>{booking.city}, {booking.neighborhood}</span>
                            </div>
                          </div>
                          
                          <div className="mt-2 md:mt-0">
                            {getStatusElement(booking.status, booking.payment_status)}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="text-sm text-gray-600">Arrivée</div>
                            <div className="font-medium">
                              {formatDate(booking.check_in_date)}
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-sm text-gray-600">Départ</div>
                            <div className="font-medium">
                              {formatDate(booking.check_out_date)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-end">
                          <div className="text-gray-600 text-sm">
                            Réservation effectuée le {formatDate(booking.created_at)}
                          </div>
                          
                          <div className="font-bold text-lg">
                            {booking.total_price?.toLocaleString()} FCFA
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
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

export default BookingList;