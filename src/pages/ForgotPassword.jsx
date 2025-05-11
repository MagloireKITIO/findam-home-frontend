// src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft, FiCheck, FiAlertCircle } from 'react-icons/fi';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';
import Lottie from 'react-lottie';
import emailSentAnimation from '../assets/animations/email-sent-animation.json'; // Placez un fichier d'animation JSON ici

const ForgotPassword = () => {
  const { success, error: notifyError } = useNotification();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Configuration de l'animation Lottie
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: emailSentAnimation,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  // Gestion du changement dans le champ email
  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  // Validation de l'email
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation basique de l'email
    if (!email) {
      setError('Veuillez saisir votre adresse email.');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Veuillez saisir une adresse email valide.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Appel à l'API pour demander la réinitialisation du mot de passe
      await api.post('/accounts/password-reset/', { email });
      
      // Mettre à jour l'état pour afficher le message de succès
      setIsSubmitted(true);
      success('Un email de réinitialisation de mot de passe a été envoyé à votre adresse email.');
    } catch (err) {
      console.error('Erreur lors de la demande de réinitialisation de mot de passe:', err);
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
                <div className="w-full max-w-xs mx-auto">
                  <Lottie options={defaultOptions} height={180} width={180} />
                </div>
                
                <h2 className="mt-4 text-2xl font-bold text-gray-900">Email envoyé !</h2>
                
                <p className="mt-2 text-gray-600">
                  Si un compte existe avec l'adresse email <span className="font-medium">{email}</span>, 
                  vous recevrez un lien pour réinitialiser votre mot de passe.
                </p>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg text-blue-800 text-sm">
                  <p>
                    Veuillez vérifier votre boîte de réception et vos spams. 
                    Le lien expirera dans 24 heures.
                  </p>
                </div>
                
                <div className="mt-6">
                  <Link to="/login">
                    <Button
                      variant="primary"
                      fullWidth
                      icon={<FiArrowLeft />}
                      iconPosition="left"
                    >
                      Retour à la connexion
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ) : (
              // Formulaire de demande de réinitialisation
              <>
                <motion.div variants={itemVariants} className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-gray-900">Mot de passe oublié ?</h1>
                  <p className="mt-2 text-gray-600">
                    Nous vous enverrons un lien pour réinitialiser votre mot de passe
                  </p>
                </motion.div>

                <form onSubmit={handleSubmit}>
                  <motion.div variants={itemVariants}>
                    <Input
                      type="email"
                      label="Adresse email"
                      name="email"
                      value={email}
                      onChange={handleChange}
                      placeholder="Votre adresse email"
                      icon={<FiMail />}
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
                          Envoi en cours...
                        </span>
                      ) : (
                        "Envoyer le lien de réinitialisation"
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

export default ForgotPassword;