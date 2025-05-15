// src/pages/UserProfile.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiEdit, 
  FiShield, FiCreditCard, FiCheck, FiX, FiSave, FiUpload 
} from 'react-icons/fi';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import useApi from '../hooks/useApi';
import PaymentMethods from '../components/payment/PaymentMethods';

const UserProfile = () => {
  const { currentUser } = useAuth();
  const { success, error: notifyError } = useNotification();
  const { fetchData, patchData, loading, error } = useApi();

  // États pour les différentes sections
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    profile: {
      bio: '',
      birth_date: '',
      city: '',
      country: 'Cameroun',
      avatar: null
    }
  });

  // Récupération des données du profil
  useEffect(() => {
    const getUserProfile = async () => {
      try {
        const data = await fetchData('/accounts/profile/');
        setProfileData(data);
        if (data.profile?.avatar) {
          setProfileImage(data.profile.avatar);
        }
      } catch (err) {
        console.error('Erreur lors de la récupération du profil:', err);
      }
    };

    getUserProfile();
  }, [fetchData]);

  // Gestion des changements dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Gestion des champs imbriqués (profile.xxx)
      const [parent, child] = name.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      // Champs simples
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Gestion du téléchargement d'avatar
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validation côté client
      if (file.size > 5 * 1024 * 1024) {
        notifyError('L\'image ne doit pas dépasser 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        setProfileData(prev => ({
          ...prev,
          profile: {
            ...prev.profile,
            avatar: file
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Soumission du formulaire de profil
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Création d'un FormData pour les fichiers
      const formData = new FormData();
      
      // Ajout des champs de base
      formData.append('first_name', profileData.first_name);
      formData.append('last_name', profileData.last_name);
      formData.append('phone_number', profileData.phone_number);
      
      // Ajout des champs du profil avec formatage de la date
      formData.append('bio', profileData.profile.bio || '');
      
      // Formater la date correctement si elle existe
      if (profileData.profile.birth_date) {
        // S'assurer que la date est au format YYYY-MM-DD
        const date = new Date(profileData.profile.birth_date);
        if (!isNaN(date.getTime())) {
          const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
          formData.append('birth_date', formattedDate);
        }
      }
      
      formData.append('city', profileData.profile.city || '');
      formData.append('country', profileData.profile.country || '');
      
      // Ajout de l'avatar si modifié
      if (profileData.profile.avatar instanceof File) {
        formData.append('avatar', profileData.profile.avatar);
      }
      
      // Utiliser patchData avec FormData
      await patchData('/accounts/profile/', formData);
      
      success('Profil mis à jour avec succès');
      setIsEditing(false);
    } catch (err) {
      console.error('Erreur lors de la mise à jour du profil:', err);
      notifyError('Une erreur est survenue lors de la mise à jour du profil');
    }
  };

  // Animations
  const tabVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.3 } }
  };

  // Rendu conditionnel selon l'onglet actif
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <motion.div
            key="profile"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={tabVariants}
          >
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {/* En-tête */}
              <div className="p-6 bg-primary-50 border-b">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Informations personnelles</h2>
                  <Button
                    variant={isEditing ? "secondary" : "outline"}
                    size="sm"
                    icon={isEditing ? <FiX /> : <FiEdit />}
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? "Annuler" : "Modifier"}
                  </Button>
                </div>
                <p className="text-gray-600">
                  Gérez vos informations personnelles et comment elles sont partagées sur FINDAM.
                </p>
              </div>

              {/* Formulaire de profil */}
              <form onSubmit={handleSubmit}>
                <div className="p-6">
                  {/* Photo de profil */}
                  <div className="mb-6 flex flex-col items-center">
                    <div className="relative rounded-full overflow-hidden w-24 h-24 mb-4">
                      {profileImage ? (
                        <img 
                          src={profileImage} 
                          alt="Profil" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary-100 flex items-center justify-center">
                          <FiUser size={40} className="text-primary-600" />
                        </div>
                      )}
                      
                      {isEditing && (
                        <label className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center cursor-pointer transition-opacity hover:bg-opacity-70">
                          <FiUpload className="text-white" size={20} />
                          <input 
                            type="file" 
                            className="sr-only" 
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>
                      )}
                    </div>
                    <h3 className="text-lg font-medium">
                      {profileData.first_name} {profileData.last_name}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {profileData.user_type === 'owner' ? 'Propriétaire' : 'Locataire'}
                    </p>
                  </div>

                  {/* Informations personnelles */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <Input
                      label="Prénom"
                      name="first_name"
                      value={profileData.first_name}
                      onChange={handleChange}
                      icon={<FiUser />}
                      disabled={!isEditing}
                    />
                    <Input
                      label="Nom"
                      name="last_name"
                      value={profileData.last_name}
                      onChange={handleChange}
                      icon={<FiUser />}
                      disabled={!isEditing}
                    />
                    <Input
                      label="Email"
                      name="email"
                      value={profileData.email}
                      icon={<FiMail />}
                      disabled={true} // L'email ne peut pas être modifié
                    />
                    <Input
                      label="Téléphone"
                      name="phone_number"
                      value={profileData.phone_number}
                      onChange={handleChange}
                      icon={<FiPhone />}
                      disabled={!isEditing}
                    />
                    <Input
                      label="Date de naissance"
                      name="profile.birth_date"
                      type="date"
                      value={profileData.profile.birth_date || ''}
                      onChange={handleChange}
                      icon={<FiCalendar />}
                      disabled={!isEditing}
                    />
                    <Input
                      label="Ville"
                      name="profile.city"
                      value={profileData.profile.city || ''}
                      onChange={handleChange}
                      icon={<FiMapPin />}
                      disabled={!isEditing}
                    />
                  </div>

                  {/* Biographie */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Biographie
                    </label>
                    <textarea
                      name="profile.bio"
                      value={profileData.profile.bio || ''}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`
                        w-full px-3 py-2 border rounded-lg shadow-sm
                        ${!isEditing ? 'bg-gray-50' : 'bg-white'}
                        ${!isEditing ? 'cursor-not-allowed' : ''}
                        focus:outline-none focus:ring-1 focus:ring-primary-500
                      `}
                      rows={4}
                    ></textarea>
                  </div>

                  {/* Statut de vérification */}
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg mb-6">
                    <div className={`
                      flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4
                      ${profileData.is_verified ? 'bg-green-100' : 'bg-yellow-100'}
                    `}>
                      {profileData.is_verified ? (
                        <FiCheck className="text-green-600" size={20} />
                      ) : (
                        <FiShield className="text-yellow-600" size={20} />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">
                        {profileData.is_verified 
                          ? 'Identité vérifiée' 
                          : 'Vérification d\'identité requise'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {profileData.is_verified 
                          ? 'Votre identité a été vérifiée par notre équipe.' 
                          : 'Pour plus de sécurité, veuillez vérifier votre identité.'}
                      </p>
                    </div>
                    {!profileData.is_verified && (
                      <div className="ml-auto">
                        <Link to="/profile/verify">
                          <Button variant="outline" size="sm">
                            Vérifier
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Boutons d'action */}
                  {isEditing && (
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        variant="primary"
                        icon={<FiSave />}
                        disabled={loading}
                      >
                        {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                      </Button>
                    </div>
                  )}

                  {/* Message d'erreur */}
                  {error && (
                    <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg">
                      {error}
                    </div>
                  )}
                </div>
              </form>
            </div>
          </motion.div>
        );

        case 'paymentMethods':
          return (
            <motion.div
              key="paymentMethods"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={tabVariants}
            >
              <PaymentMethods />
            </motion.div>
          );

      case 'security':
        return (
          <motion.div
            key="security"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={tabVariants}
          >
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 bg-primary-50 border-b">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Sécurité</h2>
                <p className="text-gray-600">
                  Gérez vos paramètres de sécurité et de connexion.
                </p>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-4">Changement de mot de passe</h3>
                  <Button
                    variant="outline"
                    onClick={() => { /* À implémenter */ }}
                  >
                    Changer de mot de passe
                  </Button>
                </div>
                
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">Sessions actives</h3>
                  <p className="text-gray-600 mb-4">
                    Vous êtes actuellement connecté sur cet appareil.
                  </p>
                  <Button
                    variant="danger"
                    onClick={() => { /* À implémenter */ }}
                  >
                    Se déconnecter de tous les appareils
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  // Si chargement initial
  if (loading && !profileData.first_name) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Mon compte</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Onglets de navigation */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <nav className="divide-y">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full p-4 text-left flex items-center ${
                      activeTab === 'profile' ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-50'
                    }`}
                  >
                    <FiUser className="mr-3" />
                    <span>Profil</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('paymentMethods')}
                    className={`w-full p-4 text-left flex items-center ${
                      activeTab === 'paymentMethods' ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-50'
                    }`}
                  >
                    <FiCreditCard className="mr-3" />
                    <span>Méthodes de paiement</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('security')}
                    className={`w-full p-4 text-left flex items-center ${
                      activeTab === 'security' ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-50'
                    }`}
                  >
                    <FiShield className="mr-3" />
                    <span>Sécurité</span>
                  </button>
                </nav>
              </div>
            </div>
            
            {/* Contenu */}
            <div className="md:col-span-3">
              <AnimatePresence mode="wait">
                {renderTabContent()}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserProfile;