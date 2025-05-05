// src/components/layout/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiFacebook, FiTwitter, FiInstagram, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-bold mb-4">FINDAM</h3>
            <p className="text-gray-400 mb-4">
              Votre plateforme de location de logements meublés au Cameroun. Trouvez le logement parfait pour 
              vos séjours courts, moyens ou longs.
            </p>
            <div className="flex space-x-4">
              <motion.a 
                href="https://facebook.com" 
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -3, color: "#4267B2" }}
                className="text-gray-400 hover:text-white"
              >
                <FiFacebook size={20} />
              </motion.a>
              <motion.a 
                href="https://twitter.com" 
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -3, color: "#1DA1F2" }}
                className="text-gray-400 hover:text-white"
              >
                <FiTwitter size={20} />
              </motion.a>
              <motion.a 
                href="https://instagram.com" 
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -3, color: "#E1306C" }}
                className="text-gray-400 hover:text-white"
              >
                <FiInstagram size={20} />
              </motion.a>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-bold mb-4">Liens Rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/properties" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Explorer
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors duration-200">
                  À propos
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-white transition-colors duration-200">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Contact
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* For Property Owners */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-bold mb-4">Propriétaires</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/register?type=owner" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Devenir Hôte
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Comment ça marche
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Tarification
                </Link>
              </li>
              <li>
                <Link to="/host-resources" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Ressources
                </Link>
              </li>
              <li>
                <Link to="/owner/login" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Espace Propriétaire
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-bold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <FiMapPin className="mt-1 text-primary-500" />
                <span className="text-gray-400">123 Avenue de l'Indépendance, Yaoundé, Cameroun</span>
              </li>
              <li className="flex items-center space-x-3">
                <FiPhone className="text-primary-500" />
                <span className="text-gray-400">+237 123 456 789</span>
              </li>
              <li className="flex items-center space-x-3">
                <FiMail className="text-primary-500" />
                <a href="mailto:contact@findam.com" className="text-gray-400 hover:text-white transition-colors duration-200">
                  contact@findam.com
                </a>
              </li>
            </ul>
          </motion.div>
        </div>

        <hr className="border-gray-800 my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-gray-500 text-sm">
            &copy; {currentYear} FINDAM. Tous droits réservés.
          </p>
          <div className="flex space-x-6">
            <Link to="/terms" className="text-gray-500 text-sm hover:text-white transition-colors duration-200">
              Conditions d'utilisation
            </Link>
            <Link to="/privacy" className="text-gray-500 text-sm hover:text-white transition-colors duration-200">
              Politique de confidentialité
            </Link>
            <Link to="/cookies" className="text-gray-500 text-sm hover:text-white transition-colors duration-200">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;