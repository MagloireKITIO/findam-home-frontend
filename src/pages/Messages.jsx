// src/pages/Messages.jsx - Mise à jour avec WebSockets
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiMessageSquare, FiUser, FiChevronLeft,
  FiSend, FiPaperclip, FiChevronRight, FiHome, FiClock
} from 'react-icons/fi';

import Layout from '../components/layout/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import api from '../services/api';
import websocketService from '../services/websocket';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const Messages = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { success, error: notifyError } = useNotification();

  // États
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [showConversationList, setShowConversationList] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [otherUserTyping, setOtherUserTyping] = useState(false);

  // Références
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Effet pour la responsivité
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobileView(mobile);
      
      // Sur desktop, toujours montrer la liste et le chat
      if (!mobile) {
        setShowConversationList(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Effet pour charger les conversations
  useEffect(() => {
    const loadConversations = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get('/communications/conversations/');
        
        if (response.data.results) {
          setConversations(response.data.results);
        } else if (Array.isArray(response.data)) {
          setConversations(response.data);
        } else {
          setConversations([]);
        }
        
        // Vérifier si une conversation spécifique est demandée (depuis une autre page)
        const conversationId = location.state?.conversationId;
        if (conversationId) {
          const selectedConversation = response.data.results?.find(conv => conv.id === conversationId) ||
                                        (Array.isArray(response.data) ? response.data.find(conv => conv.id === conversationId) : null);
          
          if (selectedConversation) {
            setActiveConversation(selectedConversation);
            setShowConversationList(false);
          }
        }
      } catch (err) {
        console.error('Erreur lors du chargement des conversations:', err);
        setError('Une erreur est survenue lors du chargement des conversations.');
      } finally {
        setLoading(false);
      }
    };

    loadConversations();

    // Se connecter aux notifications WebSocket
    websocketService.connectToNotifications((data) => {
      // Si c'est un nouveau message, mettre à jour les conversations
      if (data.type === 'notification' && data.notification.notification_type === 'new_message') {
        loadConversations();
      }
    });

    // Nettoyage à la fermeture du composant
    return () => {
      websocketService.disconnectFromNotifications();
    };
  }, [location.state?.conversationId]);

  // Effet pour charger les messages d'une conversation active et établir la connexion WebSocket
  useEffect(() => {
    if (!activeConversation) return;
    
    const loadMessages = async () => {
      setLoadingMessages(true);
      
      try {
        const response = await api.get('/communications/messages/by_conversation/', {
          params: { conversation_id: activeConversation.id }
        });
        
        if (response.data.results) {
          setMessages(response.data.results);
        } else if (Array.isArray(response.data)) {
          setMessages(response.data);
        } else {
          setMessages([]);
        }
        
        // Marquer les messages comme lus
        await api.post(`/communications/conversations/${activeConversation.id}/mark_as_read/`);
        
        // Mettre à jour le compteur de messages non lus
        setConversations(prev => prev.map(conv => 
          conv.id === activeConversation.id 
            ? { ...conv, unread_count: 0 } 
            : conv
        ));
      } catch (err) {
        console.error('Erreur lors du chargement des messages:', err);
        notifyError('Une erreur est survenue lors du chargement des messages.');
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();

    // Établir la connexion WebSocket pour la conversation active
    const handleWebSocketMessage = (data) => {
      // Gestion des différents types de messages WebSocket
      if (data.type === 'message' && data.message) {
        // Ajouter le nouveau message à la liste
        setMessages(prev => [...prev, data.message]);
        
        // Marquer comme lu si c'est un message entrant
        if (data.message.sender_id !== currentUser.id) {
          websocketService.markConversationAsRead(activeConversation.id);
        }
      } else if (data.type === 'typing') {
        // Montrer l'indicateur de frappe si c'est l'autre utilisateur
        if (data.user_id !== currentUser.id) {
          setOtherUserTyping(data.is_typing);
        }
      } else if (data.type === 'read') {
        // Marquer les messages comme lus côté UI
        setMessages(prev => prev.map(msg => ({
          ...msg,
          is_read: true
        })));
      }
    };

    websocketService.connectToConversation(activeConversation.id, handleWebSocketMessage);

    // Marquer la conversation comme lue via WebSocket
    websocketService.markConversationAsRead(activeConversation.id);

    // Nettoyage lors du changement de conversation ou fermeture du composant
    return () => {
      websocketService.disconnectFromConversation(activeConversation.id);
      setOtherUserTyping(false);
      
      // Nettoyer le timeout d'indication de frappe
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [activeConversation, currentUser.id, notifyError]);

  // Effet pour faire défiler vers le dernier message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, otherUserTyping]);

  // Filtrer les conversations selon la recherche
  const filteredConversations = conversations.filter(conversation => {
    const otherParticipantName = conversation.other_participant?.full_name || '';
    const propertyTitle = conversation.property_details?.title || '';
    
    return otherParticipantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           propertyTitle.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Sélectionner une conversation
  const selectConversation = (conversation) => {
    // Si on sélectionne la même conversation, ne rien faire
    if (activeConversation?.id === conversation.id) return;
    
    setActiveConversation(conversation);
    
    if (isMobileView) {
      setShowConversationList(false);
    }
  };

  // Gérer la saisie du message (avec notification de frappe)
  const handleMessageInput = (e) => {
    setNewMessage(e.target.value);
    
    // Envoyer une notification de frappe
    if (activeConversation) {
      // Si c'est la première frappe, envoyer tout de suite
      if (!isTyping) {
        setIsTyping(true);
        websocketService.sendTypingNotification(activeConversation.id, true);
      }
      
      // Réinitialiser le timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Définir un nouveau timeout pour arrêter l'indicateur de frappe
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        websocketService.sendTypingNotification(activeConversation.id, false);
      }, 3000);
    }
  };

  // Envoyer un message
  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;
    
    try {
      // Arrêter l'indicateur de frappe
      setIsTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      websocketService.sendTypingNotification(activeConversation.id, false);
      
      // Envoyer le message via l'API
      const response = await api.post('/communications/messages/', {
        conversation: activeConversation.id,
        content: newMessage,
        message_type: 'text'
      });
      
      // Ajouter le nouveau message à la liste (sera aussi reçu via WebSocket)
      setMessages(prev => [...prev, response.data]);
      
      // Mettre à jour les conversations pour montrer le dernier message
      setConversations(prev => prev.map(conv => 
        conv.id === activeConversation.id 
          ? { 
              ...conv, 
              last_message: {
                content: newMessage,
                sender_id: currentUser.id,
                sender_name: `${currentUser.first_name} ${currentUser.last_name}`,
                created_at: new Date().toISOString(),
                message_type: 'text'
              }
            } 
          : conv
      ));
      
      // Envoyer aussi via WebSocket pour une transmission plus rapide
      websocketService.sendMessage(activeConversation.id, newMessage);
      
      // Réinitialiser le champ de message
      setNewMessage('');
      
    } catch (err) {
      console.error('Erreur lors de l\'envoi du message:', err);
      notifyError('Une erreur est survenue lors de l\'envoi du message.');
    }
  };

  // Formater la date et l'heure
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    
    const date = new Date(dateTimeString);
    const now = new Date();
    const isToday = date.getDate() === now.getDate() &&
                    date.getMonth() === now.getMonth() &&
                    date.getFullYear() === now.getFullYear();
    
    if (isToday) {
      // Si c'est aujourd'hui, afficher seulement l'heure
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.getDate() === yesterday.getDate() &&
                         date.getMonth() === yesterday.getMonth() &&
                         date.getFullYear() === yesterday.getFullYear();
    
    if (isYesterday) {
      // Si c'est hier, afficher "Hier" et l'heure
      return `Hier, ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Sinon, afficher la date complète
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Messages</h1>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="flex h-[calc(80vh)]">
              {/* Liste des conversations */}
              <AnimatePresence>
                {(showConversationList || !isMobileView) && (
                  <motion.div
                    initial={isMobileView ? { x: -300, opacity: 0 } : false}
                    animate={{ x: 0, opacity: 1 }}
                    exit={isMobileView ? { x: -300, opacity: 0 } : false}
                    transition={{ duration: 0.3 }}
                    className="w-full md:w-1/3 border-r border-gray-200 flex flex-col"
                  >
                    <div className="p-4 border-b border-gray-200">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Rechercher une conversation..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>
                    
                    {loading ? (
                      <div className="flex-grow flex items-center justify-center">
                        <LoadingSpinner size="lg" />
                      </div>
                    ) : error ? (
                      <div className="flex-grow flex items-center justify-center p-4">
                        <div className="text-red-500">{error}</div>
                      </div>
                    ) : filteredConversations.length === 0 ? (
                      <div className="flex-grow flex flex-col items-center justify-center p-4">
                        <FiMessageSquare size={48} className="text-gray-300 mb-4" />
                        <p className="text-gray-500 text-center">
                          {searchQuery 
                            ? "Aucune conversation ne correspond à votre recherche" 
                            : "Vous n'avez pas encore de conversations"}
                        </p>
                      </div>
                    ) : (
                      <div className="flex-grow overflow-y-auto">
                        {filteredConversations.map(conversation => (
                          <button
                            key={conversation.id}
                            className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 flex items-start ${
                              activeConversation?.id === conversation.id ? 'bg-primary-50' : ''
                            }`}
                            onClick={() => selectConversation(conversation)}
                          >
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center mr-3">
                              {conversation.other_participant?.profile?.avatar ? (
                                <img 
                                  src={conversation.other_participant.profile.avatar} 
                                  alt={conversation.other_participant.full_name} 
                                  className="w-full h-full object-cover rounded-full"
                                />
                              ) : (
                                <FiUser size={24} className="text-gray-500" />
                              )}
                            </div>
                            
                            <div className="flex-grow min-w-0">
                              <div className="flex justify-between items-start">
                                <div className="font-medium truncate">
                                  {conversation.other_participant?.full_name || 'Utilisateur'}
                                </div>
                                <div className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                  {conversation.last_message?.created_at && 
                                    formatDateTime(conversation.last_message.created_at)}
                                </div>
                              </div>
                              
                              <div className="text-sm text-gray-600 truncate mt-1">
                                {conversation.property_details?.title && (
                                  <div className="flex items-center truncate">
                                    <FiHome size={12} className="mr-1 flex-shrink-0" />
                                    <span className="truncate">{conversation.property_details.title}</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex justify-between items-center mt-1">
                                <div className="text-sm text-gray-500 truncate">
                                  {conversation.last_message?.content || 'Aucun message'}
                                </div>
                                
                                {conversation.unread_count > 0 && (
                                  <div className="bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-2 flex-shrink-0">
                                    {conversation.unread_count}
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Conversation active */}
              <div className={`w-full ${(!showConversationList || !isMobileView) ? 'md:w-2/3' : 'hidden md:block md:w-2/3'} flex flex-col`}>
                {!activeConversation ? (
                  <div className="flex-grow flex flex-col items-center justify-center p-4">
                    <FiMessageSquare size={64} className="text-gray-300 mb-4" />
                    <p className="text-gray-500 text-center mb-2">Sélectionnez une conversation</p>
                    <p className="text-gray-400 text-center text-sm max-w-xs">
                      Vos messages avec les propriétaires et les locataires apparaîtront ici
                    </p>
                  </div>
                ) : (
                  <>
                    {/* En-tête de la conversation */}
                    <div className="p-4 border-b border-gray-200 flex items-center">
                      {isMobileView && (
                        <button 
                          className="mr-2"
                          onClick={() => setShowConversationList(true)}
                        >
                          <FiChevronLeft size={24} />
                        </button>
                      )}
                      
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                        {activeConversation.other_participant?.profile?.avatar ? (
                          <img 
                            src={activeConversation.other_participant.profile.avatar} 
                            alt={activeConversation.other_participant.full_name} 
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <FiUser size={20} className="text-gray-500" />
                        )}
                      </div>
                      
                      <div className="flex-grow">
                        <div className="font-medium">
                          {activeConversation.other_participant?.full_name || 'Utilisateur'}
                        </div>
                        
                        {activeConversation.property_details?.title && (
                          <div className="text-sm text-gray-600 flex items-center">
                            <FiHome size={12} className="mr-1" />
                            <span>{activeConversation.property_details.title}</span>
                          </div>
                        )}
                      </div>
                      
                      {activeConversation.property_details?.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/properties/${activeConversation.property_details.id}`)}
                        >
                          Voir le logement
                        </Button>
                      )}
                    </div>
                    
                    {/* Messages */}
                    <div className="flex-grow overflow-y-auto p-4">
                      {loadingMessages ? (
                        <div className="flex items-center justify-center h-full">
                          <LoadingSpinner size="lg" />
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <FiMessageSquare size={48} className="text-gray-300 mb-4" />
                          <p className="text-gray-500">Aucun message dans cette conversation</p>
                          <p className="text-gray-400 text-sm mt-2">
                            Envoyez un message pour démarrer la conversation
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {messages.map((message, index) => {
                            const isCurrentUser = message.sender_details?.id === currentUser.id;
                            const showAvatar = index === 0 || 
                                              messages[index - 1].sender_details?.id !== message.sender_details?.id;
                            
                            return (
                              <div 
                                key={message.id} 
                                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                              >
                                {!isCurrentUser && showAvatar && (
                                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2 flex-shrink-0">
                                    {message.sender_details?.profile?.avatar ? (
                                      <img 
                                        src={message.sender_details.profile.avatar} 
                                        alt={`${message.sender_details.first_name} ${message.sender_details.last_name}`} 
                                        className="w-full h-full object-cover rounded-full"
                                      />
                                    ) : (
                                      <FiUser size={16} className="text-gray-500" />
                                    )}
                                  </div>
                                )}
                                
                                <div 
                                  className={`max-w-[70%] ${
                                    isCurrentUser 
                                      ? 'bg-primary-500 text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg' 
                                      : 'bg-gray-100 text-gray-800 rounded-tl-lg rounded-tr-lg rounded-br-lg'
                                  } p-3`}
                                >
                                  <div className="break-words">{message.content}</div>
                                  <div className={`text-xs mt-1 flex items-center justify-end ${isCurrentUser ? 'text-primary-100' : 'text-gray-500'}`}>
                                    {formatDateTime(message.created_at)}
                                    {isCurrentUser && message.is_read && (
                                      <span className="ml-1 text-xs">✓</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          
                          {/* Indicateur de frappe */}
                          {otherUserTyping && (
                            <div className="flex justify-start">
                              <div className="max-w-[70%] bg-gray-100 text-gray-800 rounded-lg p-3">
                                <div className="flex items-center">
                                  <FiClock size={14} className="mr-2 text-gray-500" />
                                  <span className="text-sm text-gray-500 italic">
                                    {activeConversation.other_participant?.first_name || 'L\'utilisateur'} est en train d'écrire...
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div ref={messagesEndRef} />
                        </div>
                      )}
                    </div>
                    
                    {/* Saisie de message */}
                    <div className="p-4 border-t border-gray-200">
                      <div className="flex items-center">
                        <div className="relative flex-grow">
                          <input
                            type="text"
                            placeholder="Écrire un message..."
                            value={newMessage}
                            onChange={handleMessageInput}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        <button
                          className={`ml-3 p-2 rounded-full transition-colors ${
                            newMessage.trim() 
                              ? 'bg-primary-500 text-white hover:bg-primary-600' 
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                          onClick={sendMessage}
                          disabled={!newMessage.trim()}
                        >
                          <FiSend size={20} />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Messages;