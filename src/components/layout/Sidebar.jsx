// src/components/layout/Sidebar.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHome, 
  FiCalendar, 
  FiDollarSign, 
  FiTag, 
  FiActivity,
  FiSettings,
  FiChevronLeft,
  FiMenu,
  FiUsers,
  FiList,
  FiCreditCard,
  FiTrendingUp,
  FiGift
} from 'react-icons/fi';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({});

  // Configuration du menu
  const menuItems = [
    {
      id: 'dashboard',
      to: '/owner/dashboard',
      icon: <FiHome />,
      label: 'Tableau de bord',
      badge: null
    },
    {
      id: 'properties',
      to: '/owner/properties',
      icon: <FiHome />,
      label: 'Mes logements',
      badge: null
    },
    {
      id: 'bookings',
      icon: <FiCalendar />,
      label: 'Réservations',
      badge: null,
      submenu: [
        {
          to: '/owner/bookings',
          icon: <FiList />,
          label: 'Liste des réservations'
        },
        {
          to: '/owner/calendar',
          icon: <FiCalendar />,
          label: 'Calendrier'
        }
      ]
    },
    {
      id: 'finances',
      icon: <FiDollarSign />,
      label: 'Finances',
      badge: null,
      submenu: [
        {
          to: '/owner/revenues',
          icon: <FiTrendingUp />,
          label: 'Revenus'
        },
        {
          to: '/owner/payouts',
          icon: <FiCreditCard />,
          label: 'Versements'
        }
      ]
    },
    {
      id: 'promo-codes',
      to: '/owner/promo-codes',
      icon: <FiTag />,
      label: 'Codes promo',
      badge: null
    },
    {
      id: 'analytics',
      to: '/owner/analytics',
      icon: <FiActivity />,
      label: 'Analytics',
      badge: null
    },
    {
      id: 'settings',
      to: '/owner/settings',
      icon: <FiSettings />,
      label: 'Paramètres',
      badge: null
    }
  ];

  // Vérifier si un menu est actif
  const isActiveMenu = (item) => {
    if (item.to) {
      return location.pathname === item.to;
    }
    if (item.submenu) {
      return item.submenu.some(subItem => location.pathname === subItem.to);
    }
    return false;
  };

  // Gérer l'expansion des sous-menus
  const toggleSubmenu = (menuId) => {
    if (isCollapsed) return;
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  // Simuler navigation (remplacer par Link dans l'implémentation réelle)
  const handleNavigation = (to) => {
    console.log(`Navigation vers: ${to}`);
  };

  // Rendu d'un élément de menu
  const renderMenuItem = (item, isSubItem = false) => {
    const isActive = isActiveMenu(item);
    const hasSubmenu = item.submenu && !isSubItem;
    const isExpanded = expandedMenus[item.id];

    return (
      <div key={item.id || item.to}>
        {item.to ? (
          <Link
            to={item.to}
            className={`
              flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
              ${isSubItem ? 'ml-6 pl-6' : ''}
              ${isActive 
                ? 'bg-primary-500 text-white shadow-md' 
                : 'text-gray-700 hover:bg-gray-100 hover:text-primary-600'
              }
              ${isCollapsed && !isSubItem ? 'justify-center px-2' : ''}
            `}
          >
            <span className={`text-lg ${!isCollapsed && !isSubItem ? 'mr-3' : ''}`}>
              {item.icon}
            </span>
            
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="truncate"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>

            {item.badge && !isCollapsed && (
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                {item.badge}
              </span>
            )}
          </Link>
        ) : (
          <button
            onClick={() => toggleSubmenu(item.id)}
            className={`
              w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 text-left
              ${isActive 
                ? 'bg-primary-50 text-primary-600' 
                : 'text-gray-700 hover:bg-gray-100 hover:text-primary-600'
              }
              ${isCollapsed ? 'justify-center px-2' : ''}
            `}
          >
            <span className={`text-lg ${!isCollapsed ? 'mr-3' : ''}`}>
              {item.icon}
            </span>
            
            <AnimatePresence>
              {!isCollapsed && (
                <>
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="truncate flex-1"
                  >
                    {item.label}
                  </motion.span>
                  
                  <motion.span
                    initial={{ rotate: 0 }}
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    className="ml-auto"
                  >
                    <FiChevronLeft size={16} />
                  </motion.span>
                </>
              )}
            </AnimatePresence>

            {item.badge && !isCollapsed && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                {item.badge}
              </span>
            )}
          </button>
        )}

        {/* Sous-menu */}
        {hasSubmenu && (
          <AnimatePresence>
            {(isExpanded && !isCollapsed) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-1 space-y-1"
              >
                {item.submenu.map(subItem => renderMenuItem(subItem, true))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    );
  };

  return (
    <motion.div
      animate={{ 
        width: isCollapsed ? 60 : 240 
      }}
      transition={{ 
        duration: 0.3,
        ease: "easeInOut"
      }}
      className="bg-white shadow-lg border-r border-gray-200 h-screen flex-shrink-0 relative"
    >
      {/* En-tête */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center"
              >
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">F</span>
                </div>
                <span className="ml-3 text-xl font-bold text-gray-800">FINDAM</span>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isCollapsed ? <FiMenu size={20} /> : <FiChevronLeft size={20} />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-2">
          {menuItems.map(item => renderMenuItem(item))}
        </div>
      </nav>

      {/* Pied de page */}
      <div className="p-4 border-t border-gray-200">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs text-gray-500 text-center"
            >
              Version 1.0.0
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Sidebar;