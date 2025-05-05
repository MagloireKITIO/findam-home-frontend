// src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/common/Button';
import Layout from '../components/layout/Layout';

const NotFound = () => {
  return (
    <Layout>
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-16">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-9xl font-bold text-primary-600">404</h1>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h2 className="text-3xl font-semibold text-gray-900 mt-4 mb-6">
                Page introuvable
              </h2>
              
              <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                La page que vous recherchez n'existe pas ou a été déplacée.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/">
                  <Button variant="primary">
                    Retour à l'accueil
                  </Button>
                </Link>
                <Link to="/properties">
                  <Button variant="secondary">
                    Explorer les logements
                  </Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;