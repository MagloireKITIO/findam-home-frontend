// src/pages/CompleteProfile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiPhone, FiHome, FiCheck, FiMapPin } from 'react-icons/fi';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { currentUser, completeProfile, isNewSocialUser } = useAuth();
  const { success, error: notifyError } = useNotification();
  
  // États pour stocker les données du formulaire
  const [formData, setFormData] = useState({
    phone_number: '',
    city: '',
    country: 'Cameroun',
    user_type: '',
    bio: ''
  });
  
  const [loading, setLoading] = useState(false);
  
  // Vérifier si l'utilisateur est bien un nouvel utilisateur social
  useEffect(() => {
    console.log("CompleteProfile - Vérification de l'état de l'utilisateur");
    console.log("CompleteProfile - isNewSocialUser:", isNewSocialUser());
    console.log("CompleteProfile - currentUser:", !!currentUser);
    
    // Si l'utilisateur n'est pas un nouvel utilisateur social et n'est pas en cours de chargement
    if (!isNewSocialUser() && !loading) {
      console.log("CompleteProfile - Utilisateur non nouveau, redirection vers /");
      navigate('/', { replace: true });
      return;
    }
    
    // Préremplir le formulaire avec les données disponibles
    if (currentUser) {
      console.log("CompleteProfile - Préremplissage du formulaire avec les données existantes");
      setFormData(prev => ({
        ...prev,
        phone_number: currentUser.phone_number !== "+0000000000" ? currentUser.phone_number : '',
        city: currentUser.profile?.city || '',
        country: currentUser.profile?.country || 'Cameroun',
        user_type: currentUser.user_type && currentUser.user_type !== 'tenant' ? currentUser.user_type : '',
        bio: currentUser.profile?.bio || ''
      }));
    }
  }, [currentUser, navigate, isNewSocialUser, loading]);
  
  // Gestion des changements dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log("CompleteProfile - Début de la soumission du formulaire");
    
    if (!formData.user_type) {
      notifyError('Veuillez sélectionner votre type de compte (locataire ou propriétaire)');
      return;
    }
    
    if (!formData.phone_number) {
      notifyError('Veuillez saisir votre numéro de téléphone');
      return;
    }
    
    try {
      setLoading(true);
      
      // Mettre à jour le profil utilisateur via la méthode completeProfile du contexte
      const updatedData = {
        phone_number: formData.phone_number,
        user_type: formData.user_type,
        profile: {
          city: formData.city,
          country: formData.country,
          bio: formData.bio
        }
      };
      
      console.log("CompleteProfile - Envoi des données:", updatedData);
      
      // Attendre que la complétion du profil soit terminée
      const updatedUser = await completeProfile(updatedData);
      
      console.log("CompleteProfile - Profil complété, utilisateur mis à jour:", !!updatedUser);
      
      success('Profil complété avec succès!');
      
      // Attendre un court moment pour s'assurer que l'état est mis à jour
      setTimeout(() => {
        console.log("CompleteProfile - Redirection vers /welcome");
        navigate('/welcome', { replace: true });
      }, 500);
      
    } catch (err) {
      console.error('Erreur lors de la complétion du profil:', err);
      notifyError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };
  
  // Si nous ne sommes pas censés être sur cette page (pas de nouvel utilisateur social)
  if (!isNewSocialUser()) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Redirection en cours...</h1>
            <p className="text-gray-600 mt-2">Vous allez être redirigé vers la page d'accueil.</p>
          </div>
        </div>
      </Layout>
    );
  }
  
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
  
  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="w-full max-w-2xl">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="bg-white rounded-xl shadow-lg p-8"
          >
            <motion.div variants={itemVariants} className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Compléter votre profil</h1>
              <p className="text-gray-600 mt-2">
                Pour profiter pleinement de FINDAM, veuillez compléter ces informations
              </p>
            </motion.div>
            
            <form onSubmit={handleSubmit}>
              <motion.div variants={itemVariants} className="mb-6">
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
              
              <motion.div variants={itemVariants} className="mb-6">
                <Input
                  type="tel"
                  label="Numéro de téléphone"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="+237 612345678"
                  icon={<FiPhone />}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ce numéro sera utilisé pour les communications concernant vos réservations.
                </p>
              </motion.div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <motion.div variants={itemVariants}>
                  <Input
                    type="text"
                    label="Ville"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Votre ville"
                    icon={<FiMapPin />}
                  />
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pays
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
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
                </motion.div>
              </div>
              
              <motion.div variants={itemVariants} className="mb-6">
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
                    "Compléter mon profil"
                  )}
                </Button>
              </motion.div>
            </form>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default CompleteProfile;