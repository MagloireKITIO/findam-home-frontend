// src/pages/Register.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const Register = () => {
  const { register, currentUser } = useAuth();
  const { success, error } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Récupérer le type d'utilisateur depuis les paramètres d'URL
  const queryParams = new URLSearchParams(location.search);
  const defaultUserType = queryParams.get('type') === 'owner' ? 'owner' : 'tenant';

  // Rediriger si déjà connecté
  useEffect(() => {
    if (currentUser) {
      navigate('/', { replace: true });
    }
  }, [currentUser, navigate]);

  // État pour suivre l'étape actuelle du formulaire
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
  });

  // États UI
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Gestion des changements dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Réinitialiser les erreurs pour ce champ
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
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

  // Passer à l'étape suivante
  const nextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  // Revenir à l'étape précédente
  const prevStep = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step === 1) {
      nextStep();
      return;
    }
    
    if (!validateStep2()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Appel à l'API d'inscription
      await register(formData);
      
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
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      } 
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  // Contenu par étape
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
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

            <motion.div variants={itemVariants} className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de compte
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div 
                  onClick={() => setFormData(prev => ({ ...prev, user_type: 'tenant' }))}
                  className={`
                    border rounded-lg p-4 cursor-pointer transition-colors
                    ${formData.user_type === 'tenant' 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-300 hover:border-primary-300'}
                  `}
                >
                  <div className="font-medium">Locataire</div>
                  <div className="text-sm text-gray-500">Je cherche un logement</div>
                </div>
                <div 
                  onClick={() => setFormData(prev => ({ ...prev, user_type: 'owner' }))}
                  className={`
                    border rounded-lg p-4 cursor-pointer transition-colors
                    ${formData.user_type === 'owner' 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-300 hover:border-primary-300'}
                  `}
                >
                  <div className="font-medium">Propriétaire</div>
                  <div className="text-sm text-gray-500">Je loue mon logement</div>
                </div>
              </div>
            </motion.div>
          </>
        );

      case 2:
        return (
          <>
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
                  className="absolute right-3 top-9 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Le mot de passe doit contenir au moins 8 caractères.
              </div>
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
              className="mt-4 p-4 bg-blue-50 rounded-lg text-sm text-blue-800"
            >
              En vous inscrivant, vous acceptez nos{' '}
              <Link to="/terms" className="text-primary-600 hover:underline">
                Conditions d'utilisation
              </Link>{' '}
              et notre{' '}
              <Link to="/privacy" className="text-primary-600 hover:underline">
                Politique de confidentialité
              </Link>
              .
            </motion.div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className="p-8">
              {/* Titre */}
              <motion.div variants={itemVariants} className="text-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Inscription</h1>
                <p className="mt-2 text-gray-600">
                  {step === 1 ? "Créez votre compte FINDAM" : "Sécurisez votre compte"}
                </p>
              </motion.div>

              {/* Indicateur d'étape */}
              <motion.div variants={itemVariants} className="mb-8">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div 
                      className={`h-2 rounded-l-full ${
                        step >= 1 ? 'bg-primary-500' : 'bg-gray-200'
                      }`}
                    ></div>
                  </div>
                  <div className="flex-1">
                    <div 
                      className={`h-2 rounded-r-full ${
                        step >= 2 ? 'bg-primary-500' : 'bg-gray-200'
                      }`}
                    ></div>
                  </div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>Informations personnelles</span>
                  <span>Sécurité</span>
                </div>
              </motion.div>

              {/* Formulaire */}
              <form onSubmit={handleSubmit}>
                {renderStepContent()}

                {/* Boutons */}
                <motion.div variants={itemVariants} className="mt-6 flex flex-col space-y-4">
                  {step === 1 ? (
                    <Button
                      type="submit"
                      variant="primary"
                      fullWidth
                    >
                      Continuer
                    </Button>
                  ) : (
                    <div className="flex flex-col space-y-3">
                      <Button
                        type="submit"
                        variant="primary"
                        fullWidth
                        disabled={loading}
                      >
                        {loading ? "Inscription en cours..." : "S'inscrire"}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        fullWidth
                        onClick={prevStep}
                        disabled={loading}
                      >
                        Retour
                      </Button>
                    </div>
                  )}
                </motion.div>
              </form>

              {/* Lien de connexion */}
              <motion.div variants={itemVariants} className="text-center mt-6">
                <p className="text-gray-600">
                  Vous avez déjà un compte ?{' '}
                  <Link to="/login" className="text-primary-600 hover:underline">
                    Se connecter
                  </Link>
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Register;