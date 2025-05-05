// src/pages/Notifications.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiBell, FiMessageSquare, FiHome, FiCalendar,
  FiStar, FiCheck, FiClock, FiAlertCircle
} from 'react-icons/fi';

import Layout from '../components/layout/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';

const Notifications = () => {
  const navigate = useNavigate();
  const { success, error: notifyError } = useNotification();

  // États
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'booking', 'message', 'review'

  // Effet pour charger les notifications
  useEffect(() => {
    const loadNotifications = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = { page: 1 };
        
        // Appliquer les filtres si nécessaire
        if (filter === 'unread') {
          params.is_read = false;
        } else if (filter !== 'all') {
          params.notification_type = filter;
        }
        
        const response = await api.get('/communications/notifications/', { params });
        
        if (response.data.results) {
          setNotifications(response.data.results);
          setHasMore(!!response.data.next);
        } else if (Array.isArray(response.data)) {
          setNotifications(response.data);
          setHasMore(false);
        } else {
          setNotifications([]);
          setHasMore(false);
        }
        
        setPage(1);
      } catch (err) {
        console.error('Erreur lors du chargement des notifications:', err);
        setError('Une erreur est survenue lors du chargement des notifications.');
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [filter]);

  // Charger plus de notifications
  const loadMoreNotifications = async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    
    try {
      const nextPage = page + 1;
      const params = { page: nextPage };
      
      // Appliquer les filtres si nécessaire
      if (filter === 'unread') {
        params.is_read = false;
      } else if (filter !== 'all') {
        params.notification_type = filter;
      }
      
      const response = await api.get('/communications/notifications/', { params });
      
      if (response.data.results) {
        setNotifications(prev => [...prev, ...response.data.results]);
        setHasMore(!!response.data.next);
        setPage(nextPage);
      } else if (Array.isArray(response.data)) {
        setNotifications(prev => [...prev, ...response.data]);
        setHasMore(false);
      }
    } catch (err) {
      console.error('Erreur lors du chargement de plus de notifications:', err);
      notifyError('Une erreur est survenue lors du chargement de plus de notifications.');
    } finally {
      setLoadingMore(false);
    }
  };

  // Marquer toutes les notifications comme lues
  const markAllAsRead = async () => {
    try {
      await api.post('/communications/notifications/mark_all_as_read/');
      
      // Mettre à jour l'état local
      setNotifications(prev => prev.map(notification => ({
        ...notification,
        is_read: true
      })));
      
      success('Toutes les notifications ont été marquées comme lues');
    } catch (err) {
      console.error('Erreur lors du marquage des notifications comme lues:', err);
      notifyError('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  // Marquer une notification comme lue
  const markAsRead = async (notificationId) => {
    try {
      // L'API ne fournit pas d'endpoint pour marquer une seule notification,
      // donc nous mettons simplement à jour l'état local
      setNotifications(prev => prev.map(notification => 
        notification.id === notificationId ? { ...notification, is_read: true } : notification
      ));
    } catch (err) {
      console.error('Erreur lors du marquage de la notification comme lue:', err);
      notifyError('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  // Naviguer vers l'élément lié à la notification
  const navigateToNotificationTarget = (notification) => {
    // Marquer comme lu
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    
    // Rediriger selon le type et l'objet lié
    switch (notification.notification_type) {
      case 'new_message':
        if (notification.related_conversation) {
          navigate('/messages', { state: { conversationId: notification.related_conversation } });
        } else {
          navigate('/messages');
        }
        break;
      case 'new_booking':
      case 'booking_confirmed':
      case 'booking_cancelled':
        if (notification.related_object_id && notification.related_object_type === 'booking') {
          navigate(`/bookings/${notification.related_object_id}`);
        } else {
          navigate('/bookings');
        }
        break;
      case 'new_review':
        if (notification.related_object_id && notification.related_object_type === 'property') {
          navigate(`/properties/${notification.related_object_id}/reviews`);
        } else {
          navigate('/properties');
        }
        break;
      case 'payment_received':
        if (notification.related_object_id && notification.related_object_type === 'booking') {
          navigate(`/bookings/${notification.related_object_id}`);
        } else {
          navigate('/bookings');
        }
        break;
      default:
        // Pour les autres types, rediriger vers la page d'accueil
        navigate('/');
    }
  };

  // Obtenir l'icône selon le type de notification
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_message':
        return <FiMessageSquare className="text-blue-500" />;
      case 'new_booking':
      case 'booking_confirmed':
      case 'booking_cancelled':
        return <FiCalendar className="text-primary-500" />;
      case 'new_review':
        return <FiStar className="text-yellow-500" />;
      case 'payment_received':
        return <FiCheck className="text-green-500" />;
      case 'payment_failed':
        return <FiAlertCircle className="text-red-500" />;
      default:
        return <FiBell className="text-gray-500" />;
    }
  };

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffMinutes < 1) {
      return 'À l\'instant';
    }
    
    if (diffMinutes < 60) {
      return `Il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    }
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    }
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) {
      return 'Hier';
    }
    
    if (diffDays < 7) {
      return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    }
    
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Obtenir le libellé du filtre actif
  const getFilterLabel = () => {
    switch (filter) {
      case 'all':
        return 'Toutes les notifications';
      case 'unread':
        return 'Non lues';
      case 'new_message':
        return 'Messages';
      case 'new_booking':
      case 'booking_confirmed':
      case 'booking_cancelled':
        return 'Réservations';
      case 'new_review':
        return 'Avis';
      default:
        return 'Toutes les notifications';
    }
  };

  // Vérifier s'il y a des notifications non lues
  const hasUnreadNotifications = notifications.some(notification => !notification.is_read);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">Notifications</h1>
            
            <div className="flex space-x-3">
              {hasUnreadNotifications && (
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                >
                  Tout marquer comme lu
                </Button>
              )}
              
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                >
                  {getFilterLabel()}
                </Button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-20">
                  <div className="py-1">
                    <button
                      className={`w-full text-left px-4 py-2 text-sm ${filter === 'all' ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-100'}`}
                      onClick={() => setFilter('all')}
                    >
                      Toutes les notifications
                    </button>
                    <button
                      className={`w-full text-left px-4 py-2 text-sm ${filter === 'unread' ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-100'}`}
                      onClick={() => setFilter('unread')}
                    >
                      Non lues
                    </button>
                    <button
                      className={`w-full text-left px-4 py-2 text-sm ${filter === 'new_message' ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-100'}`}
                      onClick={() => setFilter('new_message')}
                    >
                      Messages
                    </button>
                    <button
                      className={`w-full text-left px-4 py-2 text-sm ${filter === 'new_booking' ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-100'}`}
                      onClick={() => setFilter('new_booking')}
                    >
                      Réservations
                    </button>
                    <button
                      className={`w-full text-left px-4 py-2 text-sm ${filter === 'new_review' ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-100'}`}
                      onClick={() => setFilter('new_review')}
                    >
                      Avis
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Liste des notifications */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {loading ? (
              <div className="py-12 flex justify-center">
                <LoadingSpinner size="lg" />
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <div className="text-red-500 mb-4">{error}</div>
                <Button
                  variant="primary"
                  onClick={() => setFilter('all')}
                >
                  Réessayer
                </Button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center">
                <FiBell size={48} className="text-gray-300 mb-4" />
                <p className="text-gray-500 text-center">
                  {filter === 'all' 
                    ? "Vous n'avez pas de notifications" 
                    : filter === 'unread'
                      ? "Vous n'avez pas de notifications non lues"
                      : `Vous n'avez pas de notifications de type "${getFilterLabel()}"`}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map(notification => (
                  <motion.div
                    key={notification.id}
                    initial={{ backgroundColor: notification.is_read ? 'white' : 'rgb(243, 244, 246)' }}
                    animate={{ backgroundColor: notification.is_read ? 'white' : 'rgb(243, 244, 246)' }}
                    whileHover={{ backgroundColor: 'rgb(243, 244, 246)' }}
                    className="p-4 cursor-pointer"
                    onClick={() => navigateToNotificationTarget(notification)}
                  >
                    <div className="flex items-start">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3 flex-shrink-0">
                        {getNotificationIcon(notification.notification_type)}
                      </div>
                      
                      <div className="flex-grow">
                        <div className="flex justify-between items-center mb-1">
                          <h3 className={`font-medium ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {formatDate(notification.created_at)}
                          </span>
                        </div>
                        
                        <p className={`text-sm ${!notification.is_read ? 'text-gray-800' : 'text-gray-600'}`}>
                          {notification.content}
                        </p>
                        
                        {/* Si la notification est liée à une conversation */}
                        {notification.notification_type === 'new_message' && notification.related_conversation && (
                          <div className="mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('/messages', { state: { conversationId: notification.related_conversation } });
                              }}
                            >
                              Répondre
                            </Button>
                          </div>
                        )}
                        
                        {/* Si la notification est liée à une réservation */}
                        {['new_booking', 'booking_confirmed', 'booking_cancelled', 'payment_received'].includes(notification.notification_type) && 
                          notification.related_object_id && 
                          notification.related_object_type === 'booking' && (
                          <div className="mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/bookings/${notification.related_object_id}`);
                              }}
                            >
                              Voir la réservation
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {!notification.is_read && (
                        <div className="w-3 h-3 rounded-full bg-primary-500 ml-2 mt-2 flex-shrink-0"></div>
                      )}
                    </div>
                  </motion.div>
                ))}
                
                {/* Bouton pour charger plus */}
                {hasMore && (
                  <div className="p-4 text-center">
                    <Button
                      variant="outline"
                      onClick={loadMoreNotifications}
                      disabled={loadingMore}
                    >
                      {loadingMore ? (
                        <span className="flex items-center">
                          <LoadingSpinner size="sm" className="mr-2" />
                          Chargement...
                        </span>
                      ) : (
                        "Charger plus de notifications"
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Notifications;