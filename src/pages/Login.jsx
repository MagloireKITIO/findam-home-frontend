// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const Login = () => {
  const { login, currentUser } = useAuth();
  const { error } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  // Rediriger si déjà connecté
  useEffect(() => {
    if (currentUser) {
      // Rediriger vers la page souhaitée ou par défaut vers l'accueil
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
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
    visible: { y: 0, opacity: 1 }
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
              <motion.div variants={itemVariants} className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Connexion</h1>
                <p className="mt-2 text-gray-600">
                  Heureux de vous revoir sur FINDAM !
                </p>
              </motion.div>

              {/* Formulaire */}
              <form onSubmit={handleSubmit}>
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
                      className="absolute right-3 top-9 text-gray-500"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </motion.div>

                {/* Lien mot de passe oublié */}
                <motion.div variants={itemVariants} className="text-right mb-4">
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
                    className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm"
                  >
                    {formError}
                  </motion.div>
                )}

                {/* Bouton de connexion */}
                <motion.div variants={itemVariants}>
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    disabled={loading}
                  >
                    {loading ? "Connexion en cours..." : "Se connecter"}
                  </Button>
                </motion.div>
              </form>

              {/* Séparateur */}
              <motion.div 
                variants={itemVariants}
                className="flex items-center my-6"
              >
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="px-3 text-gray-500 text-sm">ou</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </motion.div>

              {/* Lien d'inscription */}
              <motion.div variants={itemVariants} className="text-center">
                <p className="text-gray-600 mb-4">
                  Vous n'avez pas encore de compte ?
                </p>
                <Link to="/register">
                  <Button variant="outline" fullWidth>
                    Créer un compte
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;