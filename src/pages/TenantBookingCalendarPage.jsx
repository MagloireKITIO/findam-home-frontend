// src/pages/TenantBookingCalendarPage.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { FiCalendar } from 'react-icons/fi';

import Layout from '../components/layout/Layout';
import SectionTitle from '../components/common/SectionTitle';
import TenantBookingCalendar from '../components/booking/TenantBookingCalendar';

const TenantBookingCalendarPage = () => {
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
              title="Calendrier de mes réservations"
              subtitle="Visualisez toutes vos réservations en un coup d'œil"
              align="left"
              withLine={false}
              className="mb-4 md:mb-0"
            />
          </div>
          
          <TenantBookingCalendar />
        </motion.div>
      </div>
    </Layout>
  );
};

export default TenantBookingCalendarPage;