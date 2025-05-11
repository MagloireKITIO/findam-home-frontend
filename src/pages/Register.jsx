// src/pages/Register.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff, 
  FiChevronRight, FiChevronLeft, FiCheck, FiHome, FiMapPin
} from 'react-icons/fi';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import SocialAuthButtons from '../components/auth/SocialAuthButtons';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import Lottie from 'react-lottie';
import registerAnimation from '../assets/animations/register-animation.json'; // Placez un fichier d'animation JSON ici

const Register = () => {
  const { register, loginWithGoogle, loginWithFacebook, currentUser, socialAuthLoading } = useAuth();
  const { success, error } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const formRef = useRef(null);
  
  // Récupérer le type d'utilisateur depuis les paramètres d'URL
  const queryParams = new URLSearchParams(location.search);
  const defaultUserType = queryParams.get('type') === 'owner' ? 'owner' : 'tenant';

  // Rediriger si déjà connecté
  useEffect(() => {
    if (currentUser) {
      navigate('/', { replace: true });
    }
  }, [currentUser, navigate]);

  // État pour suivre l'étape actuelle du formulaire (maintenant 3 étapes)
  const [step, setStep] = useState(1);

  // État du formulaire
  const [formData, setFormData] = useState({
    email: '',
    phone_number: '',
    first_name: '',
    last_name: '',
    password: '',
    password2: '',
    user_type: defaultUserType,
    // Nouvelles informations de profil
    city: '',
    country: 'Cameroun',
    bio: '',
    preferences: {
      notifications_email: true,
      notifications_sms: false,
      language: 'fr'
    }
  });

  // États UI
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [progress, setProgress] = useState(33); // Progression du formulaire en pourcentage

  // Configuration de l'animation Lottie
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: registerAnimation,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  // Gestion de l'authentification via Google
  const handleGoogleAuth = () => {
    loginWithGoogle();
  };

  // Gestion de l'authentification via Facebook
  const handleFacebookAuth = () => {
    loginWithFacebook();
  };

  // Gestion des changements dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Gestion des champs imbriqués (preferences.xxx)
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      // Champs simples
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    // Réinitialiser les erreurs pour ce champ
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Gestion des changements dans les checkboxes
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    
    if (name.includes('.')) {
      // Gestion des champs imbriqués (preferences.xxx)
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: checked
        }
      }));
    } else {
      // Champs simples
      setFormData((prev) => ({ ...prev, [name]: checked }));
    }
  };

  // Validation de l'étape 1
  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'L\'adresse email est requise';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'L\'adresse email est invalide';
    }
    
    if (!formData.phone_number) {
      newErrors.phone_number = 'Le numéro de téléphone est requis';
    } else if (!/^\+?[0-9]{9,15}$/.test(formData.phone_number)) {
      newErrors.phone_number = 'Le numéro de téléphone est invalide';
    }
    
    if (!formData.first_name) {
      newErrors.first_name = 'Le prénom est requis';
    }
    
    if (!formData.last_name) {
      newErrors.last_name = 'Le nom est requis';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validation de l'étape 2
  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }
    
    if (!formData.password2) {
      newErrors.password2 = 'La confirmation du mot de passe est requise';
    } else if (formData.password !== formData.password2) {
      newErrors.password2 = 'Les mots de passe ne correspondent pas';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validation de l'étape 3
  const validateStep3 = () => {
    const newErrors = {};
    
    if (!formData.city) {
      newErrors.city = 'La ville est requise';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fonction pour mettre à jour la progression
  const updateProgress = (currentStep) => {
    if (currentStep === 1) setProgress(33);
    else if (currentStep === 2) setProgress(66);
    else if (currentStep === 3) setProgress(100);
  };

  // Passer à l'étape suivante
  const nextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
      updateProgress(2);
      setTimeout(() => {
        formRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
      updateProgress(3);
      setTimeout(() => {
        formRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  };

  // Revenir à l'étape précédente
  const prevStep = () => {
    if (step === 2) {
      setStep(1);
      updateProgress(1);
    } else if (step === 3) {
      setStep(2);
      updateProgress(2);
    }
    setTimeout(() => {
      formRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step === 1) {
      nextStep();
      return;
    } else if (step === 2) {
      nextStep();
      return;
    }
    
    if (!validateStep3()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Préparation des données pour l'API (sans les champs de profil supplémentaires)
      const apiData = {
        email: formData.email,
        phone_number: formData.phone_number,
        first_name: formData.first_name,
        last_name: formData.last_name,
        password: formData.password,
        password2: formData.password2,
        user_type: formData.user_type
      };

      // Appel à l'API d'inscription
      await register(apiData);
      
      // Les données de profil seraient enregistrées après la connexion dans une implémentation complète
      
      success('Inscription réussie ! Vous pouvez maintenant vous connecter.');
      navigate('/login');
    } catch (err) {
      console.error('Erreur d\'inscription:', err);
      
      // Traitement des erreurs de validation du backend
      if (err.response?.data) {
        const backendErrors = err.response.data;
        const formattedErrors = {};
        
        // Convertir les erreurs du backend en format compatible avec notre état d'erreurs
        Object.keys(backendErrors).forEach(key => {
          formattedErrors[key] = Array.isArray(backendErrors[key]) 
            ? backendErrors[key][0] 
            : backendErrors[key];
        });
        
        setErrors(formattedErrors);
      } else {
        error('Une erreur est survenue lors de l\'inscription. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Animations
  const pageVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        type: 'spring',
        damping: 25,
        stiffness: 180
      }
    },
    exit: { 
      opacity: 0, 
      x: -100,
      transition: { 
        type: 'spring',
        damping: 25,
        stiffness: 180
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05,
        delayChildren: 0.1
      } 
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
  };

  // Contenu par étape
  const renderStepContent = () => {
    switch (step) {
      // Étape 1: Informations de base
      case 1:
        return (
          <motion.div
            key="step1"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={pageVariants}
            className="space-y-6"
          >
            <motion.div variants={containerVariants} className="space-y-6">
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl font-bold text-gray-900">Commencez votre aventure</h2>
                <p className="mt-2 text-gray-600">
                  Partagez vos informations de base pour créer votre compte
                </p>
              </motion.div>

              {/* Boutons d'authentification sociale en haut du formulaire */}
              <motion.div variants={itemVariants} className="mb-2">
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600">Inscrivez-vous plus rapidement avec</p>
                </div>
                <SocialAuthButtons 
                  onGoogleAuth={handleGoogleAuth}
                  onFacebookAuth={handleFacebookAuth}
                  layout="grid"
                  isLoading={socialAuthLoading}
                />
              </motion.div>

              {/* Séparateur */}
              <motion.div 
                variants={itemVariants}
                className="relative my-4"
              >
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">ou avec votre email</span>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Input
                  type="email"
                  label="Adresse email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="exemple@email.com"
                  icon={<FiMail />}
                  required
                  error={errors.email}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <Input
                  type="tel"
                  label="Numéro de téléphone"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="+237 612345678"
                  icon={<FiPhone />}
                  required
                  error={errors.phone_number}
                />
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div variants={itemVariants}>
                  <Input
                    type="text"
                    label="Prénom"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="Votre prénom"
                    icon={<FiUser />}
                    required
                    error={errors.first_name}
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Input
                    type="text"
                    label="Nom"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Votre nom"
                    icon={<FiUser />}
                    required
                    error={errors.last_name}
                  />
                </motion.div>
              </div>

              <motion.div variants={itemVariants} className="py-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de compte
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    onClick={() => setFormData(prev => ({ ...prev, user_type: 'tenant' }))}
                    className={`
                      border-2 rounded-lg p-4 cursor-pointer transition-all duration-300
                      ${formData.user_type === 'tenant' 
                        ? 'border-primary-500 bg-primary-50 shadow-md' 
                        : 'border-gray-300 hover:border-primary-300 hover:bg-gray-50'}
                    `}
                  >
                    <div className="font-medium flex items-center">
                      <FiUser className="mr-2" /> 
                      <span>Locataire</span>
                      {formData.user_type === 'tenant' && (
                        <FiCheck className="ml-auto text-primary-600" />
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">Je cherche un logement</div>
                  </div>
                  <div 
                    onClick={() => setFormData(prev => ({ ...prev, user_type: 'owner' }))}
                    className={`
                      border-2 rounded-lg p-4 cursor-pointer transition-all duration-300
                      ${formData.user_type === 'owner' 
                        ? 'border-primary-500 bg-primary-50 shadow-md' 
                        : 'border-gray-300 hover:border-primary-300 hover:bg-gray-50'}
                    `}
                  >
                    <div className="font-medium flex items-center">
                      <FiHome className="mr-2" /> 
                      <span>Propriétaire</span>
                      {formData.user_type === 'owner' && (
                        <FiCheck className="ml-auto text-primary-600" />
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">Je loue mon logement</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        );

      // Étape 2: Sécurité
      case 2:
        return (
          <motion.div
            key="step2"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={pageVariants}
            className="space-y-6"
          >
            <motion.div variants={containerVariants} className="space-y-6">
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl font-bold text-gray-900">Sécurisez votre compte</h2>
                <p className="mt-2 text-gray-600">
                  Créez un mot de passe fort pour protéger votre compte
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    label="Mot de passe"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="********"
                    icon={<FiLock />}
                    required
                    error={errors.password}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
                <div className="text-xs text-gray-500 mt-1 ml-1">
                  Le mot de passe doit contenir au moins 8 caractères.
                </div>

                {/* Indicateur de force du mot de passe */}
                {formData.password && (
                  <div className="mt-3">
                    <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          formData.password.length < 6 
                            ? 'bg-red-500 w-1/4' 
                            : formData.password.length < 8 
                              ? 'bg-yellow-500 w-2/4' 
                              : formData.password.length < 10 
                                ? 'bg-blue-500 w-3/4' 
                                : 'bg-green-500 w-full'
                        }`}
                      ></div>
                    </div>
                    <p className="text-xs mt-1 ml-1 text-gray-500">
                      {formData.password.length < 6 
                        ? 'Mot de passe faible' 
                        : formData.password.length < 8 
                          ? 'Mot de passe moyen' 
                          : formData.password.length < 10 
                            ? 'Mot de passe fort' 
                            : 'Mot de passe très fort'}
                    </p>
                  </div>
                )}
              </motion.div>

              <motion.div variants={itemVariants}>
                <Input
                  type={showPassword ? "text" : "password"}
                  label="Confirmer le mot de passe"
                  name="password2"
                  value={formData.password2}
                  onChange={handleChange}
                  placeholder="********"
                  icon={<FiLock />}
                  required
                  error={errors.password2}
                />
              </motion.div>

              <motion.div 
                variants={itemVariants}
                className="p-4 bg-blue-50 rounded-lg text-sm text-blue-800 flex items-start border border-blue-100"
              >
                <div className="flex-shrink-0 text-blue-500 mt-0.5 mr-3">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p>
                    Choisissez un mot de passe unique pour votre compte FINDAM. Un bon mot de passe doit contenir des lettres, des chiffres, et des caractères spéciaux.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        );

      // Étape 3: Informations de profil
      case 3:
        return (
          <motion.div
            key="step3"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={pageVariants}
            className="space-y-6"
          >
            <motion.div variants={containerVariants} className="space-y-6">
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl font-bold text-gray-900">Personnalisez votre expérience</h2>
                <p className="mt-2 text-gray-600">
                  Ajoutez quelques détails pour compléter votre profil
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div variants={itemVariants}>
                  <Input
                    type="text"
                    label="Ville"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Votre ville"
                    icon={<FiMapPin />}
                    required
                    error={errors.city}
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pays
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-3 text-gray-500">
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="Cameroun">Cameroun</option>
                      <option value="Senegal">Sénégal</option>
                      <option value="Cote d'Ivoire">Côte d'Ivoire</option>
                      <option value="Mali">Mali</option>
                      <option value="Burkina Faso">Burkina Faso</option>
                      <option value="Benin">Bénin</option>
                      <option value="Togo">Togo</option>
                      <option value="Gabon">Gabon</option>
                      <option value="Congo">Congo</option>
                      <option value="Guinee">Guinée</option>
                    </select>
                  </div>
                </motion.div>
              </div>

              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Biographie
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Parlez-nous un peu de vous..."
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  rows={3}
                ></textarea>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Préférences de notification
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="notifications_email"
                      name="preferences.notifications_email"
                      checked={formData.preferences.notifications_email}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="notifications_email" className="ml-2 text-sm text-gray-700">
                      Recevoir des notifications par email
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="notifications_sms"
                      name="preferences.notifications_sms"
                      checked={formData.preferences.notifications_sms}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="notifications_sms" className="ml-2 text-sm text-gray-700">
                      Recevoir des notifications par SMS
                    </label>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                className="mt-2 p-4 bg-green-50 rounded-lg text-sm text-green-800 flex items-start border border-green-100"
              >
                <div className="flex-shrink-0 text-green-500 mt-0.5 mr-3">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p>
                    En vous inscrivant, vous acceptez nos{' '}
                    <Link to="/terms" className="text-primary-600 hover:underline font-medium">
                      Conditions d'utilisation
                    </Link>{' '}
                    et notre{' '}
                    <Link to="/privacy" className="text-primary-600 hover:underline font-medium">
                      Politique de confidentialité
                    </Link>.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="w-full max-w-5xl flex overflow-hidden">
          {/* Partie illustration / animation - Visible sur grand écran uniquement */}
          <div className="hidden lg:block lg:w-2/5">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="h-full flex flex-col justify-center items-center p-8 bg-primary-600 text-white rounded-l-2xl"
            >
              <h2 className="text-3xl font-bold mb-6 text-center">Rejoignez FINDAM</h2>
              <p className="text-center text-primary-100 mb-8">
                {formData.user_type === 'tenant'
                  ? 'Trouvez facilement votre prochain logement au Cameroun.'
                  : 'Louez facilement votre logement et gagnez un revenu complémentaire.'}
              </p>
              <div className="mt-4">
                <Lottie options={defaultOptions} height={300} width={300} />
              </div>
            </motion.div>
          </div>

          {/* Formulaire d'inscription */}
          <div 
            className="w-full lg:w-3/5 bg-white rounded-2xl lg:rounded-l-none lg:rounded-r-2xl shadow-xl"
            ref={formRef}
          >
            <div className="p-8">
              {/* Indicateur d'étape */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-500">Étape {step} sur 3</span>
                  <span className="text-xs font-medium text-primary-600">{progress}%</span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-600 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span className={step >= 1 ? 'text-primary-600 font-medium' : ''}>Informations</span>
                  <span className={step >= 2 ? 'text-primary-600 font-medium' : ''}>Sécurité</span>
                  <span className={step >= 3 ? 'text-primary-600 font-medium' : ''}>Profil</span>
                </div>
              </div>

              {/* Titre mobile uniquement */}
              <div className="lg:hidden text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Créez votre compte</h1>
                <p className="mt-2 text-gray-600">Rejoignez notre communauté</p>
              </div>

              {/* Formulaire */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <AnimatePresence mode="wait">
                  {renderStepContent()}
                </AnimatePresence>

                {/* Boutons de navigation */}
                <div className="flex justify-between mt-8">
                  {step > 1 ? (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={prevStep}
                      icon={<FiChevronLeft />}
                      iconPosition="left"
                    >
                      Retour
                    </Button>
                  ) : (
                    <div></div> // Pour maintenir l'espacement flex
                  )}

                  {step < 3 ? (
                    <Button
                      type="button"
                      variant="primary"
                      onClick={nextStep}
                      icon={<FiChevronRight />}
                      iconPosition="right"
                    >
                      Continuer
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={loading}
                      icon={<FiCheck />}
                      iconPosition="right"
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Inscription en cours...
                        </span>
                      ) : "S'inscrire"}
                    </Button>
                  )}
                </div>
              </form>

              {/* Lien de connexion */}
              <div className="text-center mt-6">
                <p className="text-gray-600">
                  Vous avez déjà un compte ?{' '}
                  <Link to="/login" className="text-primary-600 hover:text-primary-800 font-medium transition-colors">
                    Se connecter
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Register;