// src/pages/owner/BookingCalendarPage.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiHome } from 'react-icons/fi';

import Layout from '../../components/layout/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SectionTitle from '../../components/common/SectionTitle';
import BookingCalendar from '../../components/owner/BookingCalendar';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const BookingCalendarPage = () => {
  const { error: notifyError } = useNotification();
  
  // États
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  
  // Chargement des propriétés du propriétaire
  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get('/properties/properties/', {
          params: {
            is_owner: true,
            page_size: 100 // Charger un maximum de propriétés
          }
        });
        
        const propertiesData = response.data.results || [];
        setProperties(propertiesData);
        
        // Sélectionner la première propriété par défaut
        if (propertiesData.length > 0) {
          setSelectedPropertyId(propertiesData[0].id);
        }
        
      } catch (err) {
        console.error('Erreur lors du chargement des propriétés:', err);
        setError('Une erreur est survenue lors du chargement des propriétés.');
        notifyError('Une erreur est survenue lors du chargement des propriétés');
      } finally {
        setLoading(false);
      }
    };
    
    loadProperties();
  }, [notifyError]);
  
  // Gérer le changement de propriété sélectionnée
  const handlePropertyChange = (propertyId) => {
    setSelectedPropertyId(propertyId);
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <SectionTitle
              title="Calendrier des réservations"
              subtitle="Visualisez et gérez les disponibilités de vos logements"
              align="left"
              withLine={false}
              className="mb-4 md:mb-0"
            />
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-lg text-red-700">
              {error}
            </div>
          ) : (
            <BookingCalendar
              properties={properties}
              selectedPropertyId={selectedPropertyId}
              onPropertyChange={handlePropertyChange}
            />
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default BookingCalendarPage;