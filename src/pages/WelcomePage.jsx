// src/pages/WelcomePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiHome, FiUser, FiSearch, FiMapPin, FiCalendar, 
  FiChevronRight, FiCheckCircle 
} from 'react-icons/fi';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import Lottie from 'react-lottie';
import welcomeAnimation from '../assets/animations/welcome-animation.json'; // Placez un fichier d'animation JSON ici

const WelcomePage = () => {
  const { currentUser, isOwner, isTenant } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [completed, setCompleted] = useState([]);

  // Configuration de l'animation Lottie
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: welcomeAnimation,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  // Rediriger si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  // Marquer une étape comme complétée
  const completeStep = (stepNumber) => {
    if (!completed.includes(stepNumber)) {
      setCompleted(prev => [...prev, stepNumber]);
    }
  };

  // Passer à l'étape suivante
  const nextStep = () => {
    completeStep(step);
    setStep(prev => prev + 1);
  };

  // Sauter l'onboarding et aller à la page d'accueil
  const skipOnboarding = () => {
    navigate('/');
  };

  // Aller à la page de profil pour compléter les informations
  const goToProfile = () => {
    completeStep(2);
    navigate('/profile');
  };

  // Aller à la page de recherche de logements (locataires)
  const goToSearch = () => {
    completeStep(3);
    navigate('/properties');
  };

  // Aller à la page d'ajout de logement (propriétaires)
  const goToAddProperty = () => {
    completeStep(3);
    navigate('/owner/properties/new');
  };

  // Style pour les étapes complétées/non complétées
  const getStepStyle = (stepNumber) => {
    return completed.includes(stepNumber)
      ? 'bg-green-500 text-white'
      : step === stepNumber
        ? 'bg-primary-500 text-white'
        : 'bg-gray-200 text-gray-500';
  };

  return (
    <Layout>
      <div className="min-h-screen py-12 bg-gray-50">
        <div className="container mx-auto max-w-4xl px-4">
          {/* Bannière de bienvenue avec animation */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-2xl shadow-lg p-8 mb-8"
          >
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-6 md:mb-0">
                <h1 className="text-3xl font-bold mb-4">
                  Bienvenue sur FINDAM, {currentUser?.first_name || 'Nouvel Utilisateur'} !
                </h1>
                <p className="text-lg mb-4 text-primary-100">
                  {isOwner() 
                    ? 'Félicitations pour votre inscription ! Configurons votre compte pour mettre en location vos biens immobiliers.'
                    : 'Félicitations pour votre inscription ! Commençons à configurer votre compte pour trouver votre prochain logement.'}
                </p>
                <Button
                  variant="white"
                  onClick={skipOnboarding}
                >
                  Aller directement à la page d'accueil
                </Button>
              </div>
              <div className="md:w-1/2 flex justify-center">
                <div className="w-48 h-48">
                  <Lottie options={defaultOptions} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Indicateur d'étapes */}
          <div className="flex justify-between items-center mb-8 px-4">
            <div className="flex-grow flex items-center">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getStepStyle(1)}`}>
                <FiUser size={18} />
              </div>
              <div className="flex-grow h-1 mx-2 bg-gray-200">
                <div 
                  className="h-full bg-primary-500 transition-all duration-300"
                  style={{ width: step > 1 ? '100%' : '0%' }}
                ></div>
              </div>
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getStepStyle(2)}`}>
                <FiHome size={18} />
              </div>
              <div className="flex-grow h-1 mx-2 bg-gray-200">
                <div 
                  className="h-full bg-primary-500 transition-all duration-300"
                  style={{ width: step > 2 ? '100%' : '0%' }}
                ></div>
              </div>
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getStepStyle(3)}`}>
                {isOwner() ? <FiHome size={18} /> : <FiSearch size={18} />}
              </div>
            </div>
          </div>

          {/* Contenu de l'étape */}
          <motion.div
            key={`step-${step}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-md p-8"
          >
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Commençons l'aventure !</h2>
                <p className="text-gray-600 mb-6">
                  Nous allons vous guider à travers quelques étapes pour configurer rapidement votre compte et 
                  commencer à utiliser FINDAM.
                </p>

                <div className="bg-blue-50 p-6 rounded-lg mb-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">Voici ce que vous pourrez faire sur FINDAM</h3>
                  <ul className="space-y-3">
                    {isTenant() && (
                      <>
                        <li className="flex items-start">
                          <FiCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                          <span>Rechercher parmi une large sélection de logements au Cameroun</span>
                        </li>
                        <li className="flex items-start">
                          <FiCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                          <span>Filtrer les résultats selon vos critères (prix, localisation, équipements)</span>
                        </li>
                        <li className="flex items-start">
                          <FiCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                          <span>Réserver des visites et effectuer des réservations en ligne</span>
                        </li>
                      </>
                    )}
                    {isOwner() && (
                      <>
                        <li className="flex items-start">
                          <FiCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                          <span>Publier vos logements et les rendre visibles pour des milliers de locataires potentiels</span>
                        </li>
                        <li className="flex items-start">
                          <FiCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                          <span>Gérer vos réservations et vos disponibilités facilement</span>
                        </li>
                        <li className="flex items-start">
                          <FiCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                          <span>Recevoir des paiements en ligne sécurisés</span>
                        </li>
                      </>
                    )}
                    <li className="flex items-start">
                      <FiCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                      <span>Échanger avec d'autres utilisateurs via notre système de messagerie</span>
                    </li>
                  </ul>
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="primary"
                    icon={<FiChevronRight />}
                    iconPosition="right"
                    onClick={nextStep}
                  >
                    Continuer
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Complétez votre profil</h2>
                <p className="text-gray-600 mb-6">
                  Un profil complet augmente votre visibilité et la confiance des autres utilisateurs.
                </p>

                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
                  <div className="p-6 flex items-start">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <FiUser className="text-primary-600" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">Infos personnelles</h3>
                      <p className="text-gray-600 mb-3">
                        Ajoutez votre photo de profil, une bio et vos informations de contact complètes.
                      </p>
                      <p className="text-sm text-gray-500">
                        {currentUser?.profile?.avatar ? '✅' : '❌'} Photo de profil<br />
                        {currentUser?.profile?.bio ? '✅' : '❌'} Biographie<br />
                        {currentUser?.profile?.city ? '✅' : '❌'} Ville
                      </p>
                    </div>
                  </div>
                  {isOwner() && (
                    <div className="border-t p-6 flex items-start">
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                        <FiMapPin className="text-orange-600" size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 mb-1">Vérification d'identité</h3>
                        <p className="text-gray-600 mb-3">
                          Pour gagner la confiance des locataires, nous vous recommandons de vérifier votre identité.
                        </p>
                        <p className="text-sm text-gray-500">
                          {currentUser?.is_verified ? '✅' : '❌'} Vérification d'identité
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="secondary"
                    className="mr-3"
                    onClick={nextStep}
                  >
                    Ignorer pour l'instant
                  </Button>
                  <Button
                    variant="primary"
                    icon={<FiUser />}
                    iconPosition="left"
                    onClick={goToProfile}
                  >
                    Compléter mon profil
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && isTenant() && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Trouvez votre logement</h2>
                <p className="text-gray-600 mb-6">
                  Vous êtes prêt à commencer votre recherche ! Explorez notre catalogue de logements.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden p-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <FiSearch className="text-blue-600" size={20} />
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">Recherchez</h3>
                    <p className="text-gray-600">
                      Utilisez notre moteur de recherche avancé avec des filtres pour trouver exactement ce que vous cherchez.
                    </p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden p-6">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <FiCalendar className="text-green-600" size={20} />
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">Réservez</h3>
                    <p className="text-gray-600">
                      Planifiez des visites ou réservez directement en ligne avec notre système de paiement sécurisé.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="primary"
                    icon={<FiSearch />}
                    iconPosition="left"
                    onClick={goToSearch}
                  >
                    Rechercher un logement
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && isOwner() && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Ajoutez votre premier logement</h2>
                <p className="text-gray-600 mb-6">
                  Commencez à gagner de l'argent en ajoutant votre premier logement sur FINDAM.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden p-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <FiHome className="text-blue-600" size={20} />
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">Publiez</h3>
                    <p className="text-gray-600">
                      Ajoutez des photos, une description détaillée et définissez votre prix pour attirer les locataires.
                    </p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden p-6">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <FiCalendar className="text-green-600" size={20} />
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">Gérez</h3>
                    <p className="text-gray-600">
                      Définissez vos disponibilités et gérez facilement vos réservations depuis votre tableau de bord.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="secondary"
                    className="mr-3"
                    onClick={skipOnboarding}
                  >
                    Plus tard
                  </Button>
                  <Button
                    variant="primary"
                    icon={<FiHome />}
                    iconPosition="left"
                    onClick={goToAddProperty}
                  >
                    Ajouter un logement
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default WelcomePage;