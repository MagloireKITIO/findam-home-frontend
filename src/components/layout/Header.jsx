// src/components/layout/Header.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { FiMenu, FiX, FiUser, FiHome, FiSearch, FiCalendar, FiMessageSquare, FiLogOut, FiBell } from 'react-icons/fi';
import NotificationBadge from '../common/NotificationBadge';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Vérifier le défilement pour changer l'apparence du header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fermer le menu lors d'un changement de route
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Navigation links based on user role
  const getNavLinks = () => {
    const commonLinks = [
      { to: '/', icon: <FiHome />, text: 'Accueil' },
      { to: '/properties', icon: <FiSearch />, text: 'Explorer' },
    ];

    if (!currentUser) {
      return commonLinks;
    }

    const authenticatedLinks = [
      ...commonLinks,
      { to: '/bookings', icon: <FiCalendar />, text: 'Réservations' },
      { to: '/messages', icon: <FiMessageSquare />, text: 'Messages' },
    ];

    if (currentUser.user_type === 'owner') {
      return [
        ...authenticatedLinks,
        { to: '/owner/dashboard', icon: <FiHome />, text: 'Dashboard' },
      ];
    }

    return authenticatedLinks;
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-2xl font-bold text-primary-600"
            >
              FINDAM
            </motion.div>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            {getNavLinks().map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center space-x-1 text-sm font-medium transition-colors hover:text-primary-600 ${
                  location.pathname === link.to
                    ? 'text-primary-600'
                    : 'text-gray-700'
                }`}
              >
                <span>{link.icon}</span>
                <span>{link.text}</span>
              </Link>
            ))}
          </nav>

          {/* Authentication Actions - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <NotificationBadge />
                <Link to="/messages">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-primary-600"
                  >
                    <FiMessageSquare />
                    <span>Messages</span>
                  </motion.button>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={logout}
                  className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-primary-600"
                >
                  <FiLogOut />
                  <span>Déconnexion</span>
                </motion.button>
                <Link to="/profile">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center"
                  >
                    {currentUser.profile?.avatar ? (
                      <img
                        src={currentUser.profile.avatar}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <FiUser size={20} />
                    )}
                  </motion.div>
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn btn-secondary"
                  >
                    Connexion
                  </motion.button>
                </Link>
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn btn-primary"
                  >
                    Inscription
                  </motion.button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="md:hidden bg-white border-t mt-2"
              >
                <div className="container mx-auto px-4 py-4">
                  <nav className="flex flex-col space-y-4">
                    {getNavLinks().map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        className={`flex items-center space-x-2 p-2 rounded-lg ${
                          location.pathname === link.to
                            ? 'bg-primary-50 text-primary-600'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>{link.icon}</span>
                        <span>{link.text}</span>
                      </Link>
                    ))}

                    {currentUser ? (
                      <>
                        <Link
                          to="/messages"
                          className="flex items-center space-x-2 p-2 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                          <FiMessageSquare />
                          <span>Messages</span>
                        </Link>
                        <Link
                          to="/notifications"
                          className="flex items-center space-x-2 p-2 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                          <FiBell />
                          <span>Notifications</span>
                        </Link>
                        <Link
                          to="/profile"
                          className="flex items-center space-x-2 p-2 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                          <FiUser />
                          <span>Mon profil</span>
                        </Link>
                        <button
                          onClick={logout}
                          className="flex items-center space-x-2 p-2 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                          <FiLogOut />
                          <span>Déconnexion</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          className="w-full btn btn-secondary"
                        >
                          Connexion
                        </Link>
                        <Link
                          to="/register"
                          className="w-full btn btn-primary"
                        >
                          Inscription
                        </Link>
                      </>
                    )}
                  </nav>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
    </header>
  );
};

export default Header;