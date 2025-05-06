// src/pages/VerificationPendingPage.jsx
import React from 'react';
import Layout from '../components/layout/Layout';
import { FiClock } from 'react-icons/fi';

const VerificationPendingPage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
          <div className="text-center">
            <FiClock className="mx-auto text-primary-500 h-16 w-16" />
            <h1 className="text-2xl font-bold mt-4">Vérification en cours</h1>
            <p className="mt-2 text-gray-600">
              Votre demande de vérification a été soumise et est en cours d'examen par notre équipe.
              Ce processus peut prendre jusqu'à 24-48 heures ouvrables.
            </p>
            <p className="mt-4 text-gray-700">
              Vous recevrez une notification par email dès que votre compte sera vérifié.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VerificationPendingPage;