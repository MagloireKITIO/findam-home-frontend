// src/services/notificationCache.js
/**
 * Service de cache pour les notifications afin d'optimiser les performances
 * et réduire les appels API inutiles
 */

// Configuration du cache
const CACHE_DURATION = 60000; // Durée de validité du cache en ms (1 minute)
const NOTIFICATION_COUNT_CACHE_KEY = 'unread_notification_count';
const RECENT_NOTIFICATIONS_CACHE_KEY = 'recent_notifications';

// Structure de données pour le cache
const cache = {
  [NOTIFICATION_COUNT_CACHE_KEY]: {
    data: null,
    timestamp: null,
  },
  [RECENT_NOTIFICATIONS_CACHE_KEY]: {
    data: null,
    timestamp: null,
  }
};

/**
 * Vérifie si les données en cache sont encore valides
 * @param {string} key - Clé du cache à vérifier
 * @returns {boolean} - true si les données sont valides, false sinon
 */
const isCacheValid = (key) => {
  const cacheEntry = cache[key];
  if (!cacheEntry || !cacheEntry.data || !cacheEntry.timestamp) {
    return false;
  }
  
  const now = Date.now();
  return (now - cacheEntry.timestamp) < CACHE_DURATION;
};

/**
 * Met à jour le cache avec de nouvelles données
 * @param {string} key - Clé du cache à mettre à jour
 * @param {any} data - Données à stocker
 */
const updateCache = (key, data) => {
  cache[key] = {
    data,
    timestamp: Date.now(),
  };
};

/**
 * Invalide une entrée spécifique du cache
 * @param {string} key - Clé du cache à invalider
 */
const invalidateCache = (key) => {
  if (cache[key]) {
    cache[key] = {
      data: null,
      timestamp: null,
    };
  }
};

/**
 * Invalide toutes les entrées du cache liées aux notifications
 */
const invalidateAllCache = () => {
  invalidateCache(NOTIFICATION_COUNT_CACHE_KEY);
  invalidateCache(RECENT_NOTIFICATIONS_CACHE_KEY);
};

/**
 * Récupère le nombre de notifications non lues depuis le cache si valide
 * @returns {number|null} - Nombre de notifications non lues ou null si le cache est invalide
 */
const getCachedUnreadCount = () => {
  if (isCacheValid(NOTIFICATION_COUNT_CACHE_KEY)) {
    return cache[NOTIFICATION_COUNT_CACHE_KEY].data;
  }
  return null;
};

/**
 * Stocke le nombre de notifications non lues dans le cache
 * @param {number} count - Nombre de notifications non lues
 */
const setCachedUnreadCount = (count) => {
  updateCache(NOTIFICATION_COUNT_CACHE_KEY, count);
};

/**
 * Récupère les notifications récentes depuis le cache si valide
 * @returns {Array|null} - Liste des notifications récentes ou null si le cache est invalide
 */
const getCachedRecentNotifications = () => {
  if (isCacheValid(RECENT_NOTIFICATIONS_CACHE_KEY)) {
    return cache[RECENT_NOTIFICATIONS_CACHE_KEY].data;
  }
  return null;
};

/**
 * Stocke les notifications récentes dans le cache
 * @param {Array} notifications - Liste des notifications récentes
 */
const setCachedRecentNotifications = (notifications) => {
  updateCache(RECENT_NOTIFICATIONS_CACHE_KEY, notifications);
};

/**
 * Met à jour le statut de lecture d'une notification spécifique dans le cache
 * @param {string} notificationId - ID de la notification à mettre à jour
 */
const markNotificationAsRead = (notificationId) => {
  // Mise à jour du compteur
  if (isCacheValid(NOTIFICATION_COUNT_CACHE_KEY) && cache[NOTIFICATION_COUNT_CACHE_KEY].data > 0) {
    cache[NOTIFICATION_COUNT_CACHE_KEY].data--;
  }
  
  // Mise à jour des notifications récentes
  if (isCacheValid(RECENT_NOTIFICATIONS_CACHE_KEY)) {
    const updatedNotifications = cache[RECENT_NOTIFICATIONS_CACHE_KEY].data.map(notification => {
      if (notification.id === notificationId) {
        return { ...notification, is_read: true };
      }
      return notification;
    });
    
    updateCache(RECENT_NOTIFICATIONS_CACHE_KEY, updatedNotifications);
  }
};

/**
 * Met à jour le statut de lecture de toutes les notifications dans le cache
 */
const markAllNotificationsAsRead = () => {
  // Mise à jour du compteur
  updateCache(NOTIFICATION_COUNT_CACHE_KEY, 0);
  
  // Mise à jour des notifications récentes
  if (isCacheValid(RECENT_NOTIFICATIONS_CACHE_KEY)) {
    const updatedNotifications = cache[RECENT_NOTIFICATIONS_CACHE_KEY].data.map(notification => ({
      ...notification,
      is_read: true
    }));
    
    updateCache(RECENT_NOTIFICATIONS_CACHE_KEY, updatedNotifications);
  }
};

export default {
  getCachedUnreadCount,
  setCachedUnreadCount,
  getCachedRecentNotifications,
  setCachedRecentNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  invalidateCache,
  invalidateAllCache,
  NOTIFICATION_COUNT_CACHE_KEY,
  RECENT_NOTIFICATIONS_CACHE_KEY
};