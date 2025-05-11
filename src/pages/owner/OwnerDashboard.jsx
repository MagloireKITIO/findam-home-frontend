// src/pages/owner/OwnerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiHome, FiCalendar, FiUsers, FiDollarSign, 
  FiTrendingUp, FiStar, FiPlusCircle, FiTag
} from 'react-icons/fi';

import Layout from '../../components/layout/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import StatCard from '../../components/owner/StatCard';
import RevenueChart from '../../components/owner/RevenueChart';
import OccupancyChart from '../../components/owner/OccupancyChart';
import RecentBookingsList from '../../components/owner/RecentBookingsList';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import SubscriptionStatusCheck from '../../components/owner/SubscriptionStatusCheck';
import ScheduledPayoutsWidget from '../../components/owner/ScheduledPayoutsWidget';
import CancelledBookingsWidget from '../../components/owner/CancelledBookingsWidget';
import CompensationPayoutsWidget from '../../components/owner/CompensationPayoutsWidget';

const OwnerDashboard = () => {
  const { currentUser } = useAuth();
  const { error: notifyError } = useNotification();
  
  // États
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingPayouts: 0,
    propertyCount: 0,
    activeBookings: 0,
    completedBookings: 0,
    averageRating: 0,
    occupancyRate: 0,
  });
  const [revenueData, setRevenueData] = useState([]);
  const [occupancyData, setOccupancyData] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  
  // Charger les données du tableau de bord
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Charger le profil et les statistiques en parallèle
        const [profileResponse, transactionsResponse, propertiesResponse, bookingsResponse] = await Promise.all([
          api.get('/accounts/profile/'),
          api.get('/payments/transactions/summary/'),
          api.get('/properties/properties/', { params: { owner: currentUser.id } }),
          api.get('/bookings/bookings/', { params: { is_owner: true } })
        ]);
                
        // Calculer les statistiques à partir des données reçues
        if (propertiesResponse.data.results) {
          const properties = propertiesResponse.data.results;
          const propertyCount = properties.length;
          
          // Calculer la note moyenne
          const totalRating = properties.reduce((sum, property) => sum + (property.avg_rating || 0), 0);
          const averageRating = propertyCount > 0 ? totalRating / propertyCount : 0;
          
          // Mettre à jour les statistiques
          setStats(prev => ({
            ...prev,
            propertyCount,
            averageRating
          }));
        }
        
        if (bookingsResponse.data.results) {
          const bookings = bookingsResponse.data.results;
          
          // Compter les réservations actives et terminées
          const activeBookings = bookings.filter(booking => 
            ['pending', 'confirmed'].includes(booking.status)).length;
          const completedBookings = bookings.filter(booking => 
            booking.status === 'completed').length;
          
          // Calculer le taux d'occupation (simple pour l'instant)
          // Pour un calcul plus précis, il faudrait analyser les dates de séjour
          const totalBookingDays = bookings.reduce((sum, booking) => {
            if (booking.check_in_date && booking.check_out_date) {
              const checkIn = new Date(booking.check_in_date);
              const checkOut = new Date(booking.check_out_date);
              return sum + Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
            }
            return sum;
          }, 0);
          
          // Taux d'occupation sur les 30 derniers jours
          // Hypothèse : chaque propriété a 30 jours disponibles par mois
          const potentialDays = stats.propertyCount * 30;
          const occupancyRate = potentialDays > 0 
            ? Math.min(100, (totalBookingDays / potentialDays) * 100) 
            : 0;
          
          // Récupérer les réservations récentes pour l'affichage
          const sortedBookings = [...bookings].sort((a, b) => 
            new Date(b.created_at) - new Date(a.created_at));
          setRecentBookings(sortedBookings.slice(0, 5));
          setBookingsLoading(false);
          
          // Mettre à jour les statistiques
          setStats(prev => ({
            ...prev,
            activeBookings,
            completedBookings,
            occupancyRate
          }));
        }
        
        if (transactionsResponse.data) {
          const { total_amount, by_month } = transactionsResponse.data;
          
          // Mettre à jour les revenus totaux
          setStats(prev => ({
            ...prev,
            totalRevenue: total_amount || 0
          }));
          if (by_month && Array.isArray(by_month)) {
            const chartData = by_month.map(item => ({
              name: new Date(item.month).toLocaleDateString('fr-FR', { month: 'short' }),
              revenue: item.total
            })).reverse(); // Plus ancien au plus récent
            
            setRevenueData(chartData);
          }
        }
        
        // Générer des données d'occupation fictives pour le graphique
        // Dans une vraie application, ces données viendraient de l'API
        const occupancyChartData = generateOccupancyData();
        setOccupancyData(occupancyChartData);
        
      } catch (err) {
        console.error('Erreur lors du chargement des données du dashboard:', err);
        notifyError('Une erreur est survenue lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, [currentUser.id, notifyError]);
  
  // Fonction pour générer des données d'occupation fictives
  const generateOccupancyData = () => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const currentMonth = new Date().getMonth();
    
    // Générer des données pour les 6 derniers mois
    return Array.from({ length: 6 }, (_, index) => {
      const monthIndex = (currentMonth - 5 + index + 12) % 12; // Garantir un index positif
      return {
        name: months[monthIndex],
        occupancy: Math.floor(40 + Math.random() * 60) // Entre 40% et 100%
      };
    });
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">Tableau de bord propriétaire</h1>
          
          <div className="flex space-x-3">
            <Link to="/owner/properties/new">
              <Button
                variant="primary"
                icon={<FiPlusCircle />}
              >
                Ajouter un logement
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Remplacer la bannière d'abonnement par le composant SubscriptionStatusCheck */}
        {/* Abonnements désactivés - système basé uniquement sur commission */}
        {/* <SubscriptionStatusCheck /> */}
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>            
            {/* Statistiques principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard 
                title="Revenu total" 
                value={`${stats.totalRevenue.toLocaleString()} FCFA`} 
                icon={<FiDollarSign className="text-green-500" />}
                color="green"
              />
              <StatCard 
                title="Taux d'occupation" 
                value={`${stats.occupancyRate.toFixed(1)}%`} 
                icon={<FiTrendingUp className="text-blue-500" />}
                color="blue"
              />
              <StatCard 
                title="Logements" 
                value={stats.propertyCount} 
                icon={<FiHome className="text-purple-500" />}
                color="purple"
              />
              <StatCard 
                title="Réservations actives" 
                value={stats.activeBookings} 
                icon={<FiCalendar className="text-orange-500" />}
                color="orange"
              />
            </div>
            
            {/* Graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <h2 className="text-xl font-semibold mb-4">Revenus mensuels</h2>
                <RevenueChart data={revenueData} />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <h2 className="text-xl font-semibold mb-4">Taux d'occupation</h2>
                <OccupancyChart data={occupancyData} />
              </motion.div>
            </div>

            {/* Versements programmés */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mb-8"
            >
              <ScheduledPayoutsWidget />
            </motion.div>

            {/* Compensations d'annulation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mb-8"
            >
              <CompensationPayoutsWidget />
            </motion.div>

            {/* Réservations annulées */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <CancelledBookingsWidget />
            </motion.div>

            {/* Réservations récentes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Réservations récentes</h2>
                <Link to="/owner/bookings">
                  <Button variant="outline" size="sm">
                    Voir toutes les réservations
                  </Button>
                </Link>
              </div>
              
              <RecentBookingsList 
                bookings={recentBookings} 
                loading={bookingsLoading} 
              />
            </motion.div>
            
            {/* Liens rapides */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <Link to="/owner/properties">
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md p-6 flex items-center"
                >
                  <FiHome className="text-3xl mr-4" />
                  <div>
                    <h3 className="font-semibold text-lg">Mes logements</h3>
                    <p className="text-blue-100">Gérer vos biens immobiliers</p>
                  </div>
                </motion.div>
              </Link>
              
              <Link to="/owner/bookings">
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-md p-6 flex items-center"
                >
                  <FiCalendar className="text-3xl mr-4" />
                  <div>
                    <h3 className="font-semibold text-lg">Réservations</h3>
                    <p className="text-purple-100">Gérer les séjours et disponibilités</p>
                  </div>
                </motion.div>
              </Link>
              
              <Link to="/owner/promo-codes">
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-md p-6 flex items-center"
                >
                  <FiTag className="text-3xl mr-4" />
                  <div>
                    <h3 className="font-semibold text-lg">Codes promo</h3>
                    <p className="text-green-100">Créer des offres spéciales</p>
                  </div>
                </motion.div>
              </Link>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default OwnerDashboard;