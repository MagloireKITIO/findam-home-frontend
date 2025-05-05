// src/components/common/NotificationBadge.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBell, FiMessageSquare, FiCalendar, FiStar,
  FiCheck, FiAlertCircle, FiX
} from 'react-icons/fi';

import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const NotificationBadge = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const dropdownRef = useRef(null);
  
  // États
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Fermer le dropdown si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Charger le nombre de notifications non lues
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!currentUser) return;
      
      try {
        const response = await api.get('/communications/notifications/unread_count/');
        if (response.data && response.data.unread_count !== undefined) {
          setUnreadCount(response.data.unread_count);
        }
      } catch (err) {
        console.error('Erreur lors de la récupération du nombre de notifications non lues:', err);
      }
    };
    
    fetchUnreadCount();
    
    // Mettre à jour toutes les minutes
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [currentUser]);
  
  // Charger les notifications récentes
  const loadRecentNotifications = async () => {
    if (!currentUser || loading) return;
    
    setLoading(true);
    
    try {
      const response = await api.get('/communications/notifications/', {
        params: { page: 1, page_size: 5 }
      });
      
      if (response.data && response.data.results) {
        setRecentNotifications(response.data.results);
      } else if (Array.isArray(response.data)) {
        setRecentNotifications(response.data.slice(0, 5));
      } else {
        setRecentNotifications([]);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des notifications récentes:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Ouvrir/fermer le dropdown
  const toggleDropdown = () => {
    const newState = !isDropdownOpen;
    setIsDropdownOpen(newState);
    
    if (newState) {
      loadRecentNotifications();
    }
  };
  
  // Naviguer vers l'élément lié à la notification
  const navigateToNotificationTarget = (notification) => {
    setIsDropdownOpen(false);
    
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
      default:
        navigate('/notifications');
    }
  };
  
  // Marquer toutes les notifications comme lues
  const markAllAsRead = async (e) => {
    e.stopPropagation();
    
    try {
      await api.post('/communications/notifications/mark_all_as_read/');
      setUnreadCount(0);
      setRecentNotifications(prev => prev.map(notification => ({
        ...notification,
        is_read: true
      })));
    } catch (err) {
      console.error('Erreur lors du marquage des notifications comme lues:', err);
    }
  };
  
  // Voir toutes les notifications
  const viewAllNotifications = (e) => {
    e.stopPropagation();
    setIsDropdownOpen(false);
    navigate('/notifications');
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
      return `Il y a ${diffMinutes} min`;
    }
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `Il y a ${diffHours}h`;
    }
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) {
      return 'Hier';
    }
    
    if (diffDays < 7) {
      return `Il y a ${diffDays}j`;
    }
    
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'short'
    });
  };
  
  // Si l'utilisateur n'est pas connecté, ne rien afficher
  if (!currentUser) return null;
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none"
        onClick={toggleDropdown}
        aria-label="Notifications"
      >
        <FiBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20 origin-top-right"
          >
            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-medium">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  className="text-xs text-primary-600 hover:text-primary-700"
                  onClick={markAllAsRead}
                >
                  Tout marquer comme lu
                </button>
              )}
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="py-4 text-center text-gray-500">Chargement...</div>
              ) : recentNotifications.length === 0 ? (
                <div className="py-4 text-center text-gray-500">Aucune notification</div>
              ) : (
                <div>
                  {recentNotifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                        !notification.is_read ? 'bg-gray-50' : ''
                      }`}
                      onClick={() => navigateToNotificationTarget(notification)}
                    >
                      <div className="flex">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3 flex-shrink-0">
                          {getNotificationIcon(notification.notification_type)}
                        </div>
                        
                        <div className="flex-grow">
                          <div className="flex justify-between items-start">
                            <h4 className={`text-sm font-medium ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notification.title}
                            </h4>
                            <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                              {formatDate(notification.created_at)}
                            </span>
                          </div>
                          
                          <p className={`text-xs mt-1 line-clamp-2 ${!notification.is_read ? 'text-gray-800' : 'text-gray-600'}`}>
                            {notification.content}
                          </p>
                        </div>
                        
                        {!notification.is_read && (
                          <div className="w-2 h-2 rounded-full bg-primary-500 mt-1 ml-1 flex-shrink-0"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-100 p-2">
              <button
                className="w-full text-center py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-md"
                onClick={viewAllNotifications}
              >
                Voir toutes les notifications
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBadge;