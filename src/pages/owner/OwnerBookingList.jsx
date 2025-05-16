// src/pages/owner/OwnerBookingList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiCalendar, FiHome, FiUser, FiEye, FiMessageSquare,
  FiDollarSign, FiClock, FiCheck, FiX, FiFilter
} from 'react-icons/fi';

import Layout from '../../components/layout/Layout';
import Sidebar from '../../components/layout/Sidebar';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const OwnerBookingList = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending', 'confirmed', 'completed'

  // Filtres
  const [filters, setFilters] = useState({
    status: '',
    payment_status: '',
    property: '',
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
            ordering: '-created_at',
            is_owner: 'true', // Ajouter cette ligne
            ...filters
          };

        // Ajouter le filtre selon l'onglet actif
        if (activeTab !== 'all') {
          params.status = activeTab;
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
        setError('Une erreur est survenue lors du chargement des réservations.');
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [currentPage, filters, activeTab]);

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Obtenir le badge de statut
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
      confirmed: { label: 'Confirmée', color: 'bg-green-100 text-green-800' },
      completed: { label: 'Terminée', color: 'bg-blue-100 text-blue-800' },
      cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Obtenir l'icône de statut
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FiClock className="text-yellow-500" />;
      case 'confirmed': return <FiCheck className="text-green-500" />;
      case 'completed': return <FiCheck className="text-blue-500" />;
      case 'cancelled': return <FiX className="text-red-500" />;
      default: return <FiClock className="text-gray-500" />;
    }
  };

  // Calculer le nombre total de pages
  const totalPages = Math.ceil(totalBookings / 10);

  // Gérer le changement de page
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <Layout>
      <div className="flex h-screen bg-gray-50">
        <Sidebar 
          isCollapsed={sidebarCollapsed} 
          setIsCollapsed={setSidebarCollapsed} 
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            <div className="p-6">
              <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900">Réservations de mes logements</h1>
                  <p className="text-gray-600 mt-2">Gérez toutes les réservations de vos propriétés</p>
                </div>

                {/* Onglets */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                  <div className="flex border-b border-gray-200">
                    {[
                      { key: 'all', label: 'Toutes', count: totalBookings },
                      { key: 'pending', label: 'En attente' },
                      { key: 'confirmed', label: 'Confirmées' },
                      { key: 'completed', label: 'Terminées' }
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => {
                          setActiveTab(tab.key);
                          setCurrentPage(1);
                        }}
                        className={`px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === tab.key
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {tab.label}
                        {tab.count !== undefined && (
                          <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            {tab.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

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
                  <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <FiCalendar className="mx-auto text-gray-400 mb-4" size={64} />
                    <h3 className="text-xl font-semibold mb-2">Aucune réservation trouvée</h3>
                    <p className="text-gray-600">
                      {activeTab === 'all' 
                        ? 'Vous n\'avez pas encore de réservations pour vos logements.' 
                        : `Aucune réservation ${activeTab} trouvée.`}
                    </p>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Réservation
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Logement
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Locataire
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Dates
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Statut
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Montant
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {bookings.map((booking) => (
                            <motion.tr
                              key={booking.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {getStatusIcon(booking.status)}
                                  <div className="ml-3">
                                    <div className="text-sm font-medium text-gray-900">
                                      #{booking.id.substring(0, 8)}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {formatDate(booking.created_at)}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 flex-shrink-0">
                                    {booking.property_image ? (
                                      <img
                                        className="h-10 w-10 rounded-lg object-cover"
                                        src={booking.property_image}
                                        alt=""
                                      />
                                    ) : (
                                      <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                        <FiHome className="text-gray-400" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="ml-3">
                                    <div className="text-sm font-medium text-gray-900">
                                      {booking.property_title}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {booking.city}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                    <FiUser className="text-gray-500" size={16} />
                                  </div>
                                  <div className="ml-3">
                                    <div className="text-sm font-medium text-gray-900">
                                      {booking.tenant_name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {booking.guests_count} {booking.guests_count > 1 ? 'personnes' : 'personne'}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  <div>{formatDate(booking.check_in_date)}</div>
                                  <div className="text-gray-500">au {formatDate(booking.check_out_date)}</div>
                                </div>
                              </td>
                              
                              <td className="px-6 py-4 whitespace-nowrap">
                                {getStatusBadge(booking.status)}
                              </td>
                              
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {booking.total_price?.toLocaleString()} FCFA
                                </div>
                                <div className="text-sm text-gray-500">
                                  {booking.payment_status === 'paid' ? '✓ Payé' : 'En attente'}
                                </div>
                              </td>
                              
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <Link to={`/owner/bookings/${booking.id}`}>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      icon={<FiEye />}
                                    >
                                      Voir
                                    </Button>
                                  </Link>
                                  
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    icon={<FiMessageSquare />}
                                  >
                                    Contact
                                  </Button>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="px-6 py-4 border-t border-gray-200">
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={handlePageChange}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default OwnerBookingList;