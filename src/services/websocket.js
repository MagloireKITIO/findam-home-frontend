// src/services/websocket.js
/**
 * Service WebSocket pour la messagerie en temps réel
 * 
 * Ce service gère la connexion WebSocket aux notifications et conversations
 * pour permettre des mises à jour en temps réel sans rafraîchissement.
 */

import notificationCache from './notificationCache';

// Configuration
const WS_BASE_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.notificationSocket = null;
    this.conversationSockets = new Map(); // Map des connexions par ID de conversation
    this.onMessageCallbacks = new Map(); // Map des callbacks par ID de conversation
    this.onNotificationCallbacks = []; // Liste des callbacks pour les notifications
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimeout = null;
  }

  /**
   * Récupérer le token JWT depuis le localStorage
   * @returns {string|null} Token JWT ou null si non connecté
   */
  getToken() {
    return localStorage.getItem('access_token');
  }

  /**
   * Se connecter au WebSocket de notifications
   * @param {function} callback - Fonction à appeler lors de la réception d'une notification
   * @returns {boolean} - true si la connexion a réussi, false sinon
   */
  connectToNotifications(callback) {
    const token = this.getToken();
    if (!token) return false;

    if (callback && typeof callback === 'function') {
      this.onNotificationCallbacks.push(callback);
    }

    // Fermer la connexion existante si nécessaire
    if (this.notificationSocket) {
      this.notificationSocket.close();
    }

    // Créer une nouvelle connexion
    this.notificationSocket = new WebSocket(`${WS_BASE_URL}/notifications/?token=${token}`);

    // Configurer les gestionnaires d'événements
    this.notificationSocket.onopen = () => {
      console.log('Connexion WebSocket aux notifications établie');
      this.reconnectAttempts = 0;
    };

    this.notificationSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Si c'est une notification, mettre à jour le cache
        if (data.type === 'notification') {
          // Invalidider le cache du compteur
          notificationCache.invalidateCache(notificationCache.NOTIFICATION_COUNT_CACHE_KEY);
          
          // Mettre à jour les notifications récentes dans le cache
          const cachedNotifications = notificationCache.getCachedRecentNotifications();
          if (cachedNotifications) {
            // Ajouter la nouvelle notification au début et garder les 4 premières
            const updatedNotifications = [
              data.notification,
              ...cachedNotifications.slice(0, 4)
            ];
            notificationCache.setCachedRecentNotifications(updatedNotifications);
          }
          
          // Appeler tous les callbacks enregistrés
          this.onNotificationCallbacks.forEach(callback => {
            try {
              callback(data);
            } catch (callbackError) {
              console.error('Erreur dans le callback de notification:', callbackError);
            }
          });
        }
      } catch (error) {
        console.error('Erreur lors du traitement du message WebSocket:', error);
      }
    };

    this.notificationSocket.onerror = (error) => {
      console.error('Erreur WebSocket (notifications):', error);
    };

    this.notificationSocket.onclose = (event) => {
      console.log('Connexion WebSocket aux notifications fermée:', event.code, event.reason);
      
      // Tentative de reconnexion en cas d'erreur
      if (event.code !== 1000 && event.code !== 1001) {
        this.attemptReconnectNotifications();
      }
    };

    return true;
  }

  /**
   * Tentative de reconnexion au WebSocket de notifications
   */
  attemptReconnectNotifications() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * (2 ** this.reconnectAttempts), 30000);
      
      console.log(`Tentative de reconnexion aux notifications dans ${delay / 1000} secondes...`);
      
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = setTimeout(() => {
        this.connectToNotifications();
      }, delay);
    } else {
      console.error('Nombre maximal de tentatives de reconnexion atteint pour les notifications.');
    }
  }

  /**
   * Se connecter au WebSocket d'une conversation spécifique
   * @param {string} conversationId - ID de la conversation
   * @param {function} callback - Fonction à appeler lors de la réception d'un message
   * @returns {boolean} - true si la connexion a réussi, false sinon
   */
  connectToConversation(conversationId, callback) {
    const token = this.getToken();
    if (!token || !conversationId) return false;

    // Stocker le callback
    if (callback && typeof callback === 'function') {
      this.onMessageCallbacks.set(conversationId, callback);
    }

    // Fermer la connexion existante pour cette conversation si nécessaire
    if (this.conversationSockets.has(conversationId)) {
      this.conversationSockets.get(conversationId).close();
    }

    // Créer une nouvelle connexion
    const socket = new WebSocket(`${WS_BASE_URL}/chat/${conversationId}/?token=${token}`);
    this.conversationSockets.set(conversationId, socket);

    // Configurer les gestionnaires d'événements
    socket.onopen = () => {
      console.log(`Connexion WebSocket à la conversation ${conversationId} établie`);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const callback = this.onMessageCallbacks.get(conversationId);
        
        if (callback && typeof callback === 'function') {
          callback(data);
        }
      } catch (error) {
        console.error('Erreur lors du traitement du message de conversation:', error);
      }
    };

    socket.onerror = (error) => {
      console.error(`Erreur WebSocket (conversation ${conversationId}):`, error);
    };

    socket.onclose = (event) => {
      console.log(`Connexion WebSocket à la conversation ${conversationId} fermée:`, event.code, event.reason);
      
      // Supprimer la connexion fermée
      this.conversationSockets.delete(conversationId);
      
      // Tentative de reconnexion en cas d'erreur
      if (event.code !== 1000 && event.code !== 1001) {
        setTimeout(() => {
          this.connectToConversation(conversationId, this.onMessageCallbacks.get(conversationId));
        }, 3000);
      }
    };

    return true;
  }

  /**
   * Envoyer un message à une conversation spécifique
   * @param {string} conversationId - ID de la conversation
   * @param {string} content - Contenu du message
   * @param {string} type - Type de message (texte, image, etc.)
   * @returns {boolean} - true si l'envoi a réussi, false sinon
   */
  sendMessage(conversationId, content, type = 'message') {
    if (!this.conversationSockets.has(conversationId)) {
      return false;
    }

    const socket = this.conversationSockets.get(conversationId);
    if (socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    socket.send(JSON.stringify({
      type,
      content
    }));

    return true;
  }

  /**
   * Envoyer une notification de frappe à une conversation
   * @param {string} conversationId - ID de la conversation
   * @param {boolean} isTyping - true si l'utilisateur est en train de taper
   * @returns {boolean} - true si l'envoi a réussi, false sinon
   */
  sendTypingNotification(conversationId, isTyping) {
    if (!this.conversationSockets.has(conversationId)) {
      return false;
    }

    const socket = this.conversationSockets.get(conversationId);
    if (socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    socket.send(JSON.stringify({
      type: 'typing',
      is_typing: isTyping
    }));

    return true;
  }

  /**
   * Marquer tous les messages d'une conversation comme lus
   * @param {string} conversationId - ID de la conversation
   * @returns {boolean} - true si l'envoi a réussi, false sinon
   */
  markConversationAsRead(conversationId) {
    if (!this.conversationSockets.has(conversationId)) {
      return false;
    }

    const socket = this.conversationSockets.get(conversationId);
    if (socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    socket.send(JSON.stringify({
      type: 'read'
    }));

    return true;
  }

  /**
   * Se déconnecter d'une conversation spécifique
   * @param {string} conversationId - ID de la conversation
   */
  disconnectFromConversation(conversationId) {
    if (this.conversationSockets.has(conversationId)) {
      const socket = this.conversationSockets.get(conversationId);
      socket.close();
      this.conversationSockets.delete(conversationId);
      this.onMessageCallbacks.delete(conversationId);
    }
  }

  /**
   * Se déconnecter de toutes les conversations
   */
  disconnectFromAllConversations() {
    this.conversationSockets.forEach((socket, id) => {
      socket.close();
    });
    
    this.conversationSockets.clear();
    this.onMessageCallbacks.clear();
  }

  /**
   * Se déconnecter des notifications
   */
  disconnectFromNotifications() {
    if (this.notificationSocket) {
      this.notificationSocket.close();
      this.notificationSocket = null;
    }
    
    this.onNotificationCallbacks = [];
    clearTimeout(this.reconnectTimeout);
  }

  /**
   * Se déconnecter de tout
   */
  disconnectAll() {
    this.disconnectFromAllConversations();
    this.disconnectFromNotifications();
  }
}

// Exporter une instance singleton du service
export default new WebSocketService();