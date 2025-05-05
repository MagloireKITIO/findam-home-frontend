// src/context/NotificationContext.js
import React, { createContext, useState, useCallback, useContext } from 'react';
import Toast from '../components/common/Toast';

// Création du contexte
export const NotificationContext = createContext();

// Composant Provider
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Fonction pour ajouter une notification
  const notify = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setNotifications(prevNotifications => [
      ...prevNotifications,
      { id, message, type, duration }
    ]);
    return id;
  }, []);

  // Fonctions pour les différents types de notifications
  const successNotification = useCallback((message, duration) => notify(message, 'success', duration), [notify]);
  const infoNotification = useCallback((message, duration) => notify(message, 'info', duration), [notify]);
  const warningNotification = useCallback((message, duration) => notify(message, 'warning', duration), [notify]);
  const errorNotification = useCallback((message, duration) => notify(message, 'error', duration), [notify]);

  // Fonction pour fermer une notification
  const closeNotification = useCallback((id) => {
    setNotifications(prevNotifications => 
      prevNotifications.filter(notification => notification.id !== id)
    );
  }, []);

  // Valeur du contexte
  const contextValue = {
    notify,
    success: successNotification,
    info: infoNotification,
    warning: warningNotification,
    error: errorNotification
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      
      {/* Rendu des notifications actives */}
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          message={notification.message}
          type={notification.type}
          duration={notification.duration}
          isVisible={true}
          onClose={() => closeNotification(notification.id)}
          position="top-right"
        />
      ))}
    </NotificationContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte de notification
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification doit être utilisé à l\'intérieur d\'un NotificationProvider');
  }
  return context;
};