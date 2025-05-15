// src/components/layout/OwnerLayout.jsx
import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiBell, FiUser, FiSearch, FiLogOut } from 'react-icons/fi';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';

const OwnerLayout = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  // Obtenir le titre de la page basé sur le chemin
  const getPageTitle = (path) => {
    const titles = {
      '/owner/dashboard': 'Tableau de bord',
      '/owner/properties': 'Mes logements',
      '/owner/bookings': 'Réservations',
      '/owner/calendar': 'Calendrier',
      '/owner/promo-codes': 'Codes promo',
      '/owner/analytics': 'Analytics',
      '/owner/settings': 'Paramètres'
    };
    return titles[path] || 'Dashboard';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Zone de contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Breadcrumb / Titre de page */}
              <div className="flex items-center">
                <motion.h1 
                  key={location.pathname}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xl font-semibold text-gray-800"
                >
                  {getPageTitle(location.pathname)}
                </motion.h1>
              </div>

              {/* Actions du header */}
              <div className="flex items-center space-x-4">
                {/* Barre de recherche */}
                <div className="hidden md:flex relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Notifications */}
                <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <FiBell size={20} />
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
                </button>

                {/* Profil utilisateur */}
                <div className="flex items-center space-x-3">
                  <div className="hidden md:block text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {currentUser?.first_name} {currentUser?.last_name}
                    </div>
                    <div className="text-xs text-gray-500">{currentUser?.email}</div>
                  </div>
                  
                  <div className="relative group">
                    <button className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                        {currentUser?.profile?.avatar ? (
                          <img
                            src={currentUser.profile.avatar}
                            alt="Profile"
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <FiUser size={16} />
                        )}
                      </div>
                    </button>

                    {/* Menu déroulant du profil */}
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto z-50">
                      <div className="py-1">
                        <Link to="/profile" className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                          <FiUser className="mr-2" size={16} />
                          Mon profil
                        </Link>
                        <button 
                          onClick={logout}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                        >
                          <FiLogOut className="mr-2" size={16} />
                          Déconnexion
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Contenu principal */}
        <main className="flex-1 overflow-y-auto">
          <motion.div 
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="p-6"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default OwnerLayout;