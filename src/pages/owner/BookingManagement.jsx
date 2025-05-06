// src/pages/owner/BookingManagement.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiCalendar,
  FiFilter,
  FiSearch,
  FiChevronDown,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiClock,
  FiDollarSign,
  FiHome,
  FiUser,
  FiDownload,
  FiFlag
} from 'react-icons/fi';

import Layout from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import SectionTitle from '../../components/common/SectionTitle';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import BookingStatusBadge from '../../components/owner/BookingStatusBadge';
import Modal from '../../components/common/Modal';

const BookingManagement = () => {
  const { success, error: notifyError } = useNotification();
  
  // États
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [properties, setProperties] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all', // all, pending, confirmed, completed, cancelled
    property: 'all',
    period: 'all', // all, current, future, past
    paymentStatus: 'all', // all, paid, pending, refunded
    checkInDate: '',
    checkOutDate: ''
  });
  
  // Modals
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  // Chargement des données
  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Construire les paramètres de requête
        const params = {
          is_owner: true,
          page: page,
          ordering: sortDirection === 'asc' ? sortBy : `-${sortBy}`
        };
        
        // Ajouter les filtres si définis
        if (filters.status !== 'all') {
          params.status = filters.status;
        }
        
        if (filters.property !== 'all') {
          params.property = filters.property;
        }
        
        if (filters.paymentStatus !== 'all') {
          params.payment_status = filters.paymentStatus;
        }
        
        if (filters.period === 'current') {
          params.is_active = true;
        } else if (filters.period === 'future') {
          params.is_future = true;
        } else if (filters.period === 'past') {
          params.is_past = true;
        }
        
        if (filters.checkInDate) {
          params.start_date = filters.checkInDate;
        }
        
        if (filters.checkOutDate) {
          params.end_date = filters.checkOutDate;
        }
        
        // Charger les réservations
        const response = await api.get('/bookings/bookings/', { params });
        
        // Extraire les données de pagination
        const { count, results } = response.data;
        const totalPages = Math.ceil(count / 10); // 10 éléments par page
        
        setBookings(results);
        setFilteredBookings(results);
        setTotalPages(totalPages);
        
        // Charger les propriétés pour les filtres
        const propertiesResponse = await api.get('/properties/properties/', { 
          params: { is_owner: true, page_size: 100 }
        });
        setProperties(propertiesResponse.data.results || []);
        
      } catch (err) {
        console.error('Erreur lors du chargement des réservations:', err);
        setError('Une erreur est survenue lors du chargement des réservations.');
      } finally {
        setLoading(false);
      }
    };
    
    loadBookings();
  }, [page, sortBy, sortDirection, filters]);
  
  // Filtrer les réservations selon la recherche
  useEffect(() => {
    if (!bookings.length) return;
    
    const filtered = bookings.filter(booking => {
      if (searchQuery === '') return true;
      
      const query = searchQuery.toLowerCase();
      
      return (
        booking.property_title?.toLowerCase().includes(query) ||
        booking.tenant_name?.toLowerCase().includes(query) ||
        booking.id?.toLowerCase().includes(query) ||
        booking.city?.toLowerCase().includes(query) ||
        booking.neighborhood?.toLowerCase().includes(query)
      );
    });
    
    setFilteredBookings(filtered);
  }, [searchQuery, bookings]);
  
  // Changer l'ordre de tri
  const handleSortChange = (field) => {
    if (sortBy === field) {
      // Si on clique sur le même champ, on inverse la direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Sinon, on change le champ de tri et on met la direction par défaut
      setSortBy(field);
      setSortDirection('desc');
    }
  };
  
  // Gérer la confirmation d'une réservation
  const handleConfirmBooking = async (bookingId) => {
    try {
      setProcessing(true);
      await api.post(`/bookings/bookings/${bookingId}/confirm/`);
      
      // Mettre à jour l'état local
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'confirmed' } 
            : booking
        )
      );
      
      setFilteredBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'confirmed' } 
            : booking
        )
      );
      
      success('Réservation confirmée avec succès');
    } catch (err) {
      console.error('Erreur lors de la confirmation de la réservation:', err);
      notifyError('Une erreur est survenue lors de la confirmation de la réservation');
    } finally {
      setProcessing(false);
    }
  };
  
  // Gérer le refus d'une réservation
  const handleCancelBooking = async (bookingId) => {
    try {
      setProcessing(true);
      await api.post(`/bookings/bookings/${bookingId}/cancel/`);
      
      // Mettre à jour l'état local
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'cancelled' } 
            : booking
        )
      );
      
      setFilteredBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'cancelled' } 
            : booking
        )
      );
      
      success('Réservation annulée avec succès');
    } catch (err) {
      console.error('Erreur lors de l\'annulation de la réservation:', err);
      notifyError('Une erreur est survenue lors de l\'annulation de la réservation');
    } finally {
      setProcessing(false);
    }
  };
  
  // Gérer le marquage d'une réservation comme terminée
  const handleCompleteBooking = async (bookingId) => {
    try {
      setProcessing(true);
      await api.post(`/bookings/bookings/${bookingId}/complete/`);
      
      // Mettre à jour l'état local
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'completed' } 
            : booking
        )
      );
      
      setFilteredBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'completed' } 
            : booking
        )
      );
      
      success('Réservation marquée comme terminée avec succès');
    } catch (err) {
      console.error('Erreur lors du marquage de la réservation comme terminée:', err);
      notifyError('Une erreur est survenue lors du marquage de la réservation comme terminée');
    } finally {
      setProcessing(false);
    }
  };
  
  // Exportation des données en CSV
  const handleExportCSV = () => {
    // Formatage des données pour le CSV
    const headers = [
      'ID',
      'Client',
      'Logement',
      'Date d\'arrivée',
      'Date de départ',
      'Nuitées',
      'Voyageurs',
      'Montant',
      'Statut',
      'Paiement',
      'Date de création'
    ].join(',');
    
    const rows = filteredBookings.map(booking => [
      booking.id,
      `"${booking.tenant_name}"`,
      `"${booking.property_title}"`,
      booking.check_in_date,
      booking.check_out_date,
      // Calculer le nombre de nuitées
      Math.ceil((new Date(booking.check_out_date) - new Date(booking.check_in_date)) / (1000 * 60 * 60 * 24)),
      booking.guests_count,
      booking.total_price,
      booking.status,
      booking.payment_status,
      booking.created_at
    ].join(','));
    
    const csv = [headers, ...rows].join('\n');
    
    // Création d'un Blob et téléchargement
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    
    // Créer un URL pour le blob
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reservations-${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setShowExportModal(false);
    success('Exportation des réservations réussie');
  };
  
  // Formater une date pour l'affichage
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  
  // Calculer le nombre de nuits d'un séjour
  const calculateNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    return Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
  };
  
  // Affichage du contenu principal
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="bg-red-50 p-4 rounded-lg text-red-700">
          {error}
        </div>
      );
    }
    
    if (filteredBookings.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <FiCalendar className="mx-auto text-gray-300 mb-4" size={64} />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Aucune réservation trouvée</h2>
          <p className="text-gray-500 mb-6">
            {searchQuery || Object.values(filters).some(f => f !== 'all' && f !== '')
              ? "Aucune réservation ne correspond à vos critères de recherche"
              : "Vous n'avez pas encore reçu de réservations"}
          </p>
          <Link to="/owner/properties">
            <Button variant="primary">
              Gérer mes logements
            </Button>
          </Link>
        </div>
      );
    }
    
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSortChange('created_at')}
                >
                  <div className="flex items-center">
                    <span>Date</span>
                    {sortBy === 'created_at' && (
                      <FiChevronDown className={`ml-1 ${sortDirection === 'desc' ? '' : 'transform rotate-180'}`} />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSortChange('property_title')}
                >
                  <div className="flex items-center">
                    <span>Logement</span>
                    {sortBy === 'property_title' && (
                      <FiChevronDown className={`ml-1 ${sortDirection === 'desc' ? '' : 'transform rotate-180'}`} />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Séjour
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSortChange('total_price')}
                >
                  <div className="flex items-center">
                    <span>Montant</span>
                    {sortBy === 'total_price' && (
                      <FiChevronDown className={`ml-1 ${sortDirection === 'desc' ? '' : 'transform rotate-180'}`} />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSortChange('status')}
                >
                  <div className="flex items-center">
                    <span>Statut</span>
                    {sortBy === 'status' && (
                      <FiChevronDown className={`ml-1 ${sortDirection === 'desc' ? '' : 'transform rotate-180'}`} />
                    )}
                  </div>
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking, index) => (
                <motion.tr 
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(booking.created_at).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(booking.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        {booking.tenant_details?.profile?.avatar ? (
                          <img 
                            src={booking.tenant_details.profile.avatar}
                            alt={booking.tenant_name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <FiUser className="text-gray-500" />
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{booking.tenant_name}</div>
                        <div className="text-xs text-gray-500">{booking.tenant_details?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{booking.property_title}</div>
                    <div className="text-xs text-gray-500">{booking.city}, {booking.neighborhood}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(booking.check_in_date)} - {formatDate(booking.check_out_date)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {calculateNights(booking.check_in_date, booking.check_out_date)} nuits, {booking.guests_count} voyageurs
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {booking.total_price.toLocaleString()} FCFA
                    </div>
                    <div className={`text-xs ${
                      booking.payment_status === 'paid' ? 'text-green-600' : 
                      booking.payment_status === 'pending' ? 'text-yellow-600' : 'text-gray-500'
                    }`}>
                      {booking.payment_status === 'paid' ? 'Payé' : 
                       booking.payment_status === 'pending' ? 'En attente' : 
                       booking.payment_status === 'refunded' ? 'Remboursé' : 'Non payé'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <BookingStatusBadge status={booking.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowDetailsModal(true);
                        }}
                      >
                        Détails
                      </Button>
                      <div className="relative group">
                        <Button
                          variant="primary"
                          size="sm"
                        >
                          Actions
                        </Button>
                        <div className="absolute right-0 z-10 w-48 mt-2 origin-top-right bg-white rounded-md shadow-lg hidden group-hover:block">
                          <div className="py-1">
                            {booking.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleConfirmBooking(booking.id)}
                                  disabled={processing}
                                  className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                >
                                  <FiCheckCircle className="mr-2 text-green-500" />
                                  Confirmer
                                </button>
                                <button
                                  onClick={() => handleCancelBooking(booking.id)}
                                  disabled={processing}
                                  className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                >
                                  <FiXCircle className="mr-2 text-red-500" />
                                  Refuser
                                </button>
                              </>
                            )}
                            {booking.status === 'confirmed' && (
                              <>
                                <button
                                  onClick={() => handleCompleteBooking(booking.id)}
                                  disabled={processing}
                                  className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                >
                                  <FiCheckCircle className="mr-2 text-blue-500" />
                                  Marquer comme terminée
                                </button>
                                <button
                                  onClick={() => handleCancelBooking(booking.id)}
                                  disabled={processing}
                                  className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                >
                                  <FiXCircle className="mr-2 text-red-500" />
                                  Annuler
                                </button>
                              </>
                            )}
                            <Link 
                              to={`/messages?booking=${booking.id}`} 
                              className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                            >
                              <FiFlag className="mr-2 text-blue-500" />
                              Contacter le client
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-gray-200">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>
    );
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <SectionTitle 
            title="Gestion des réservations" 
            subtitle="Gérez les réservations de vos logements"
            align="left"
            withLine={false}
          />
          
          <div className="flex space-x-3 mt-4 md:mt-0">
            <Button
              variant="outline"
              icon={<FiCalendar />}
              onClick={() => {/* TODO: Ouvrir le calendrier */}}
            >
              Calendrier
            </Button>
            <Button
              variant="outline"
              icon={<FiDownload />}
              onClick={() => setShowExportModal(true)}
            >
              Exporter
            </Button>
          </div>
        </div>
        
        {/* Barre de recherche et filtres */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-grow">
              <Input
                type="text"
                placeholder="Rechercher par client, logement ou ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<FiSearch />}
              />
            </div>
            
            <Button
              variant="outline"
              icon={<FiFilter />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filtres
            </Button>
          </div>
          
          {/* Options de filtrage */}
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Statut
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="pending">En attente</option>
                    <option value="confirmed">Confirmée</option>
                    <option value="completed">Terminée</option>
                    <option value="cancelled">Annulée</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Logement
                  </label>
                  <select
                    value={filters.property}
                    onChange={(e) => setFilters({ ...filters, property: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">Tous les logements</option>
                    {properties.map(property => (
                      <option key={property.id} value={property.id}>
                        {property.title}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Période
                  </label>
                  <select
                    value={filters.period}
                    onChange={(e) => setFilters({ ...filters, period: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">Toutes les périodes</option>
                    <option value="current">Séjours en cours</option>
                    <option value="future">Séjours à venir</option>
                    <option value="past">Séjours passés</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Statut de paiement
                  </label>
                  <select
                    value={filters.paymentStatus}
                    onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="paid">Payé</option>
                    <option value="pending">En attente</option>
                    <option value="refunded">Remboursé</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date d'arrivée
                  </label>
                  <Input
                    type="date"
                    value={filters.checkInDate}
                    onChange={(e) => setFilters({ ...filters, checkInDate: e.target.value })}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de départ
                  </label>
                  <Input
                    type="date"
                    value={filters.checkOutDate}
                    onChange={(e) => setFilters({ ...filters, checkOutDate: e.target.value })}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({
                    status: 'all',
                    property: 'all',
                    period: 'all',
                    paymentStatus: 'all',
                    checkInDate: '',
                    checkOutDate: ''
                  })}
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Liste des réservations */}
        {renderContent()}
        
        {/* Modal d'exportation */}
        <Modal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          title="Exporter les réservations"
          size="md"
        >
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              Vous êtes sur le point d'exporter {filteredBookings.length} réservations au format CSV.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Informations incluses dans l'export :</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Identifiants de réservation</li>
                <li>Informations des clients</li>
                <li>Détails des logements</li>
                <li>Dates de séjour</li>
                <li>Montants et statuts des paiements</li>
                <li>États des réservations</li>
              </ul>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowExportModal(false)}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              icon={<FiDownload />}
              onClick={handleExportCSV}
            >
              Exporter en CSV
            </Button>
          </div>
        </Modal>
        
        {/* Modal de détails de réservation */}
        <Modal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedBooking(null);
          }}
          title="Détails de la réservation"
          size="lg"
        >
          {selectedBooking && (
            <div>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg text-gray-900">Réservation #{selectedBooking.id.slice(-6)}</h3>
                    <p className="text-gray-600 text-sm">
                      Créée le {new Date(selectedBooking.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <BookingStatusBadge status={selectedBooking.status} />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Informations sur le logement */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <FiHome className="mr-2" />
                    Logement
                  </h3>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex mb-3">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden mr-3">
                        {selectedBooking.property_image ? (
                          <img 
                            src={selectedBooking.property_image} 
                            alt={selectedBooking.property_title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FiHome className="text-gray-400" size={24} />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{selectedBooking.property_title}</h4>
                        <p className="text-gray-600 text-sm">{selectedBooking.city}, {selectedBooking.neighborhood}</p>
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-gray-600">Arrivée:</span>
                          <span className="font-medium ml-1">{formatDate(selectedBooking.check_in_date)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Départ:</span>
                          <span className="font-medium ml-1">{formatDate(selectedBooking.check_out_date)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Durée:</span>
                          <span className="font-medium ml-1">{calculateNights(selectedBooking.check_in_date, selectedBooking.check_out_date)} nuits</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Voyageurs:</span>
                          <span className="font-medium ml-1">{selectedBooking.guests_count}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Informations sur le client */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <FiUser className="mr-2" />
                    Client
                  </h3>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                        {selectedBooking.tenant_details?.profile?.avatar ? (
                          <img 
                            src={selectedBooking.tenant_details.profile.avatar}
                            alt={selectedBooking.tenant_name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <FiUser className="text-gray-500" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{selectedBooking.tenant_name}</h4>
                        {selectedBooking.tenant_details?.profile?.verification_status === 'verified' && (
                          <span className="text-green-600 text-xs">Identité vérifiée</span>
                        )}
                      </div>
                    </div>
                    <div className="text-sm space-y-1">
                      <div>
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium ml-1">{selectedBooking.tenant_details?.email}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Téléphone:</span>
                        <span className="font-medium ml-1">{selectedBooking.tenant_details?.phone_number || 'Non renseigné'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Membre depuis:</span>
                        <span className="font-medium ml-1">
                          {selectedBooking.tenant_details?.date_joined 
                            ? new Date(selectedBooking.tenant_details.date_joined).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
                            : 'Non renseigné'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Informations sur le paiement */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <FiDollarSign className="mr-2" />
                  Paiement
                </h3>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between mb-3">
                    <span className="text-gray-600">Statut du paiement:</span>
                    <span className={`font-medium ${
                      selectedBooking.payment_status === 'paid' ? 'text-green-600' : 
                      selectedBooking.payment_status === 'pending' ? 'text-yellow-600' : 
                      selectedBooking.payment_status === 'refunded' ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                      {selectedBooking.payment_status === 'paid' ? 'Payé' : 
                       selectedBooking.payment_status === 'pending' ? 'En attente' : 
                       selectedBooking.payment_status === 'refunded' ? 'Remboursé' : 'Non payé'}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Prix par nuit:</span>
                      <span>{selectedBooking.price_per_night?.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {calculateNights(selectedBooking.check_in_date, selectedBooking.check_out_date)} nuits:
                      </span>
                      <span>
                        {(selectedBooking.price_per_night * calculateNights(selectedBooking.check_in_date, selectedBooking.check_out_date))?.toLocaleString()} FCFA
                      </span>
                    </div>
                    {selectedBooking.cleaning_fee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Frais de ménage:</span>
                        <span>{selectedBooking.cleaning_fee?.toLocaleString()} FCFA</span>
                      </div>
                    )}
                    {selectedBooking.security_deposit > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Caution:</span>
                        <span>{selectedBooking.security_deposit?.toLocaleString()} FCFA</span>
                      </div>
                    )}
                    {selectedBooking.discount_amount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Remise:</span>
                        <span className="text-green-600">-{selectedBooking.discount_amount?.toLocaleString()} FCFA</span>
                      </div>
                    )}
                    {selectedBooking.service_fee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Frais de service:</span>
                        <span>{selectedBooking.service_fee?.toLocaleString()} FCFA</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-gray-200 font-medium">
                      <span>Total:</span>
                      <span>{selectedBooking.total_price?.toLocaleString()} FCFA</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Demandes spéciales */}
              {selectedBooking.special_requests && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-3">Demandes spéciales</h3>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-700">{selectedBooking.special_requests}</p>
                  </div>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex justify-between">
                <div>
                  <Link to={`/messages?booking=${selectedBooking.id}`}>
                    <Button
                      variant="outline"
                    >
                      Contacter le client
                    </Button>
                  </Link>
                </div>
                <div className="flex space-x-3">
                  {selectedBooking.status === 'pending' && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => {
                          handleCancelBooking(selectedBooking.id);
                          setShowDetailsModal(false);
                        }}
                        disabled={processing}
                      >
                        Refuser
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => {
                          handleConfirmBooking(selectedBooking.id);
                          setShowDetailsModal(false);
                        }}
                        disabled={processing}
                      >
                        Confirmer
                      </Button>
                    </>
                  )}
                  {selectedBooking.status === 'confirmed' && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => {
                          handleCancelBooking(selectedBooking.id);
                          setShowDetailsModal(false);
                        }}
                        disabled={processing}
                      >
                        Annuler
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => {
                          handleCompleteBooking(selectedBooking.id);
                          setShowDetailsModal(false);
                        }}
                        disabled={processing}
                      >
                        Marquer comme terminée
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default BookingManagement;