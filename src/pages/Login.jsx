// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiArrowRight } from 'react-icons/fi';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import SocialAuthButtons from '../components/auth/SocialAuthButtons';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import Lottie from 'react-lottie'; // Vous devrez installer cette dépendance
import loginAnimation from '../assets/animations/login-animation.json'; // Placez un fichier d'animation JSON ici

const Login = () => {
  const { login, loginWithGoogle, loginWithFacebook, currentUser, socialAuthLoading } = useAuth();
  const { error } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  // Rediriger si déjà connecté
  useEffect(() => {
    if (currentUser) {
      // Rediriger vers la page souhaitée avec l'état complet
      const from = location.state?.from || '/';
      
      // Si from est une chaîne (chemin simple), naviguer normalement
      if (typeof from === 'string') {
        navigate(from, { replace: true });
      } 
      // Si from est un objet (chemin avec state), préserver l'état
      else {
        navigate(from.pathname + (from.search || ''), { 
          replace: true,
          state: location.state
        });
      }
    }
  }, [currentUser, navigate, location]);

  // État du formulaire
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // États UI
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [slideIn, setSlideIn] = useState(true);

  // Configuration de l'animation Lottie
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: loginAnimation,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  // Gestion des changements dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Réinitialiser les erreurs lorsque l'utilisateur modifie le formulaire
    setFormError('');
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation basique
    if (!formData.email || !formData.password) {
      setFormError('Veuillez remplir tous les champs.');
      return;
    }
    
    try {
      setLoading(true);
      setFormError('');
      
      // Tentative de connexion
      await login(formData.email, formData.password);
      
      // Redirection gérée par le useEffect lorsque currentUser est mis à jour
    } catch (err) {
      console.error('Erreur de connexion:', err);
      const errorMessage = err.response?.data?.detail || 
                          'Une erreur est survenue lors de la connexion. Veuillez réessayer.';
      setFormError(errorMessage);
      error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Gestion de l'authentification via Google
  const handleGoogleAuth = () => {
    loginWithGoogle();
  };

  // Gestion de l'authentification via Facebook
  const handleFacebookAuth = () => {
    loginWithFacebook();
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
    },
    exit: { 
      opacity: 0,
      transition: { 
        duration: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="w-full max-w-5xl flex overflow-hidden">
          <AnimatePresence mode="wait">
            {slideIn ? (
              <motion.div 
                key="content"
                className="flex w-full"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={containerVariants}
              >
                {/* Partie animation / illustration */}
                <motion.div 
                  variants={itemVariants}
                  className="hidden lg:flex lg:w-1/2 bg-primary-600 text-white rounded-l-2xl justify-center items-center p-12 overflow-hidden"
                >
                  <div className="text-center">
                    <h2 className="text-3xl font-bold mb-6">Bienvenue sur FINDAM</h2>
                    <p className="mb-8 text-primary-100">
                      Votre solution pour trouver et louer facilement des logements au Cameroun.
                    </p>
                    <div className="w-full max-w-xs mx-auto">
                      <Lottie options={defaultOptions} height={250} width={250} />
                    </div>
                  </div>
                </motion.div>

                {/* Formulaire de connexion */}
                <motion.div 
                  variants={itemVariants}
                  className="w-full lg:w-1/2 bg-white rounded-2xl lg:rounded-l-none lg:rounded-r-2xl shadow-xl p-8"
                >
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Connexion</h1>
                    <p className="mt-2 text-gray-600">
                      Heureux de vous revoir sur FINDAM !
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <motion.div variants={itemVariants}>
                      <Input
                        type="email"
                        label="Adresse email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Votre adresse email"
                        icon={<FiMail />}
                        required
                      />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          label="Mot de passe"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Votre mot de passe"
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
                    </motion.div>

                    {/* Lien mot de passe oublié */}
                    <motion.div variants={itemVariants} className="text-right">
                      <Link
                        to="/forgot-password"
                        className="text-sm text-primary-600 hover:text-primary-800 transition-colors"
                      >
                        Mot de passe oublié ?
                      </Link>
                    </motion.div>

                    {/* Message d'erreur */}
                    {formError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-start"
                      >
                        <span className="flex-shrink-0 mr-2 mt-0.5">⚠️</span>
                        <span>{formError}</span>
                      </motion.div>
                    )}

                    {/* Bouton de connexion */}
                    <motion.div variants={itemVariants}>
                      <Button
                        type="submit"
                        variant="primary"
                        fullWidth
                        disabled={loading}
                        icon={loading ? null : <FiArrowRight />}
                        iconPosition="right"
                        className="py-3"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Connexion en cours...
                          </span>
                        ) : (
                          "Se connecter"
                        )}
                      </Button>
                    </motion.div>

                    {/* Séparateur */}
                    <motion.div 
                      variants={itemVariants}
                      className="relative my-6"
                    >
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">ou connectez-vous avec</span>
                      </div>
                    </motion.div>

                    {/* Boutons de connexion sociale */}
                    <motion.div variants={itemVariants}>
                      <SocialAuthButtons 
                        onGoogleAuth={handleGoogleAuth}
                        onFacebookAuth={handleFacebookAuth}
                        layout="grid"
                        isLoading={socialAuthLoading}
                      />
                    </motion.div>

                    {/* Lien d'inscription */}
                    <motion.div variants={itemVariants} className="text-center mt-6">
                      <p className="text-gray-600">
                        Vous n'avez pas encore de compte ?{' '}
                        <Link to="/register" className="text-primary-600 hover:text-primary-800 font-medium transition-colors">
                          Créer un compte
                        </Link>
                      </p>
                    </motion.div>
                  </form>
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
};

export default Login;