// src/components/owner/RecentBookingsList.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiCalendar, FiCheckCircle, FiClock, FiXCircle, FiAlertCircle } from 'react-icons/fi';

import LoadingSpinner from '../common/LoadingSpinner';
import Button from '../common/Button';

const RecentBookingsList = ({ bookings = [], loading = false }) => {
  // Fonction pour formater les dates
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  // Fonction pour obtenir les détails du statut
  const getStatusDetails = (status) => {
    const statusInfo = {
      pending: {
        icon: <FiClock className="text-yellow-500" />,
        label: "En attente",
        bgColor: "bg-yellow-50",
        textColor: "text-yellow-700"
      },
      confirmed: {
        icon: <FiCheckCircle className="text-green-500" />,
        label: "Confirmée",
        bgColor: "bg-green-50",
        textColor: "text-green-700"
      },
      cancelled: {
        icon: <FiXCircle className="text-red-500" />,
        label: "Annulée",
        bgColor: "bg-red-50",
        textColor: "text-red-700"
      },
      completed: {
        icon: <FiCheckCircle className="text-blue-500" />,
        label: "Terminée",
        bgColor: "bg-blue-50",
        textColor: "text-blue-700"
      },
      default: {
        icon: <FiAlertCircle className="text-gray-500" />,
        label: "Inconnu",
        bgColor: "bg-gray-50",
        textColor: "text-gray-700"
      }
    };
    
    return statusInfo[status] || statusInfo.default;
  };

  // Fonction pour obtenir les détails du statut de paiement
  const getPaymentStatusDetails = (paymentStatus) => {
    const paymentStatusInfo = {
      paid: {
        label: "Payée",
        textColor: "text-green-600"
      },
      pending: {
        label: "En attente",
        textColor: "text-yellow-600"
      },
      refunded: {
        label: "Remboursée",
        textColor: "text-blue-600"
      },
      failed: {
        label: "Échec",
        textColor: "text-red-600"
      },
      default: {
        label: "Inconnu",
        textColor: "text-gray-600"
      }
    };
    
    return paymentStatusInfo[paymentStatus] || paymentStatusInfo.default;
  };

  // Afficher un spinner lors du chargement
  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Afficher un message si aucune réservation
  if (bookings.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <FiCalendar size={36} className="mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500">Aucune réservation récente</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Locataire
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Dates
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Logement
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Statut
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Paiement
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {bookings.map((booking, index) => {
            const statusDetails = getStatusDetails(booking.status);
            const paymentStatusDetails = getPaymentStatusDetails(booking.payment_status);
            
            return (
              <motion.tr 
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                      {booking.tenant_details?.profile?.avatar ? (
                        <img 
                          src={booking.tenant_details.profile.avatar} 
                          alt={booking.tenant_name} 
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <FiUser className="text-gray-500" />
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.tenant_name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 flex items-center">
                    <FiCalendar className="mr-1 text-gray-400" />
                    <span>
                      {formatDate(booking.check_in_date)} - {formatDate(booking.check_out_date)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {booking.guests_count} {booking.guests_count > 1 ? 'voyageurs' : 'voyageur'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {booking.property_title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {booking.city}, {booking.neighborhood}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusDetails.bgColor} ${statusDetails.textColor}`}>
                    {statusDetails.icon}
                    <span className="ml-1">{statusDetails.label}</span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-medium ${paymentStatusDetails.textColor}`}>
                    {paymentStatusDetails.label}
                  </div>
                  <div className="text-xs text-gray-500">
                    {booking.total_price.toLocaleString()} FCFA
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link to={`/owner/bookings/${booking.id}`}>
                    <Button variant="outline" size="sm">
                      Détails
                    </Button>
                  </Link>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default RecentBookingsList;