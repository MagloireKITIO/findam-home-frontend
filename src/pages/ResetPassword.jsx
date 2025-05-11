// src/pages/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLock, FiEye, FiEyeOff, FiCheck, FiAlertCircle, FiArrowLeft } from 'react-icons/fi';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';
import Lottie from 'react-lottie';
import successAnimation from '../assets/animations/success-animation.json'; // Placez un fichier d'animation JSON ici

const ResetPassword = () => {
  const { token } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { success, error: notifyError } = useNotification();
  
  // Récupérer l'UID depuis les paramètres d'URL
  const queryParams = new URLSearchParams(location.search);
  const uid = queryParams.get('uid');

  // États
  const [formData, setFormData] = useState({
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [tokenValidated, setTokenValidated] = useState(false);
  const [tokenError, setTokenError] = useState('');
  const [validatingToken, setValidatingToken] = useState(true);

  // Configuration de l'animation Lottie
  const defaultOptions = {
    loop: false,
    autoplay: true,
    animationData: successAnimation,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  // Vérifier la validité du token au chargement
  useEffect(() => {
    const validateToken = async () => {
      if (!token || !uid) {
        setTokenError('Lien de réinitialisation invalide ou expiré.');
        setValidatingToken(false);
        return;
      }

      try {
        // Appel à l'API pour valider le token
        await api.post('/accounts/password-reset/validate-token/', {
          token,
          uid
        });
        
        setTokenValidated(true);
      } catch (err) {
        console.error('Erreur de validation du token:', err);
        setTokenError('Ce lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien.');
      } finally {
        setValidatingToken(false);
      }
    };

    validateToken();
  }, [token, uid]);

  // Gestion des changements dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  // Validation du formulaire
  const validateForm = () => {
    if (!formData.new_password) {
      setError('Veuillez saisir un nouveau mot de passe.');
      return false;
    }
    
    if (formData.new_password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return false;
    }
    
    if (formData.new_password !== formData.confirm_password) {
      setError('Les mots de passe ne correspondent pas.');
      return false;
    }
    
    return true;
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Appel à l'API pour réinitialiser le mot de passe
      await api.post('/accounts/password-reset/confirm/', {
        token,
        uid,
        new_password: formData.new_password
      });
      
      // Afficher le message de succès
      setIsSubmitted(true);
      success('Votre mot de passe a été réinitialisé avec succès.');
      
      // Rediriger vers la page de connexion après un délai
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', err);
      const errorMessage = err.response?.data?.detail || 
                          'Une erreur est survenue. Veuillez réessayer plus tard.';
      setError(errorMessage);
      notifyError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Animation des éléments
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
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  // Calcul de la force du mot de passe
  const calculatePasswordStrength = (password) => {
    if (!password) return 0;
    
    let strength = 0;
    
    // Critères de force du mot de passe
    if (password.length >= 8) strength += 1;
    if (password.length >= 10) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    return Math.min(strength, 4); // Maximum de 4
  };

  const passwordStrength = calculatePasswordStrength(formData.new_password);
  
  // Texte et couleur en fonction de la force du mot de passe
  const getStrengthInfo = () => {
    switch (passwordStrength) {
      case 0: return { text: 'Trop court', color: 'bg-gray-200' };
      case 1: return { text: 'Faible', color: 'bg-red-500' };
      case 2: return { text: 'Moyen', color: 'bg-yellow-500' };
      case 3: return { text: 'Fort', color: 'bg-blue-500' };
      case 4: return { text: 'Très fort', color: 'bg-green-500' };
      default: return { text: '', color: 'bg-gray-200' };
    }
  };
  
  const strengthInfo = getStrengthInfo();

  // Affichage selon l'état de validation du token
  if (validatingToken) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
            <div className="flex justify-center">
              <svg className="animate-spin h-10 w-10 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="mt-4 text-center text-gray-600">Validation du lien de réinitialisation...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!tokenValidated && tokenError) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50 px-4">
          <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
            <div className="flex justify-center text-red-500">
              <FiAlertCircle size={48} />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-center text-gray-900">Lien invalide</h2>
            <p className="mt-2 text-center text-gray-600">{tokenError}</p>
            <div className="mt-6">
              <Link to="/forgot-password">
                <Button
                  variant="primary"
                  fullWidth
                >
                  Demander un nouveau lien
                </Button>
              </Link>
              <div className="mt-4 text-center">
                <Link to="/login" className="text-primary-600 hover:text-primary-800 font-medium transition-colors">
                  Retour à la connexion
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="w-full max-w-md">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="bg-white rounded-xl shadow-lg overflow-hidden p-8"
          >
            {isSubmitted ? (
              // Écran après soumission
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <div className="mx-auto w-32 h-32">
                  <Lottie options={defaultOptions} height={128} width={128} />
                </div>
                
                <h2 className="mt-4 text-2xl font-bold text-gray-900">Mot de passe réinitialisé !</h2>
                
                <p className="mt-2 text-gray-600">
                  Votre mot de passe a été changé avec succès. Vous allez être redirigé vers la page de connexion.
                </p>
                
                <div className="mt-6">
                  <Link to="/login">
                    <Button
                      variant="primary"
                      fullWidth
                    >
                      Se connecter maintenant
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ) : (
              // Formulaire de réinitialisation de mot de passe
              <>
                <motion.div variants={itemVariants} className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-gray-900">Réinitialiser votre mot de passe</h1>
                  <p className="mt-2 text-gray-600">
                    Créez un nouveau mot de passe pour votre compte
                  </p>
                </motion.div>

                <form onSubmit={handleSubmit}>
                  <motion.div variants={itemVariants}>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        label="Nouveau mot de passe"
                        name="new_password"
                        value={formData.new_password}
                        onChange={handleChange}
                        placeholder="Votre nouveau mot de passe"
                        icon={<FiLock />}
                        required
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
                    
                    {/* Indicateur de force du mot de passe */}
                    {formData.new_password && (
                      <div className="mt-3">
                        <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${strengthInfo.color} transition-all duration-300`}
                            style={{ width: `${(passwordStrength / 4) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs mt-1 ml-1 text-gray-500">
                          {strengthInfo.text}
                        </p>
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500 mt-1 ml-1">
                      Le mot de passe doit contenir au moins 8 caractères.
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="mt-4">
                    <Input
                      type={showPassword ? "text" : "password"}
                      label="Confirmer le mot de passe"
                      name="confirm_password"
                      value={formData.confirm_password}
                      onChange={handleChange}
                      placeholder="Confirmez votre nouveau mot de passe"
                      icon={<FiLock />}
                      required
                    />
                  </motion.div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-start"
                    >
                      <FiAlertCircle className="flex-shrink-0 mr-2 mt-0.5" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  <motion.div variants={itemVariants} className="mt-6">
                    <Button
                      type="submit"
                      variant="primary"
                      fullWidth
                      disabled={loading}
                      className="py-3"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Enregistrement...
                        </span>
                      ) : (
                        "Réinitialiser le mot de passe"
                      )}
                    </Button>
                  </motion.div>
                </form>

                <motion.div variants={itemVariants} className="mt-6 text-center">
                  <Link to="/login" className="inline-flex items-center text-primary-600 hover:text-primary-800 font-medium transition-colors">
                    <FiArrowLeft className="mr-2" />
                    Retour à la connexion
                  </Link>
                </motion.div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default ResetPassword;