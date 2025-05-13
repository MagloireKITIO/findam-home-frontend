// src/pages/owner/PromoCodeManagement.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiTag, 
  FiPlus, 
  FiSearch, 
  FiFilter, 
  FiCheck, 
  FiX, 
  FiCopy, 
  FiTrash2,
  FiHome,
  FiUser,
  FiInfo,
  FiCalendar,
  FiUsers,
  FiEyeOff,
  FiEye
} from 'react-icons/fi';

import Layout from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import SectionTitle from '../../components/common/SectionTitle';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const PromoCodeManagement = () => {
  const { success, error: notifyError } = useNotification();
  
  // États
  const [promoCodes, setPromoCodes] = useState([]);
  const [filteredPromoCodes, setFilteredPromoCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [properties, setProperties] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    property: 'all',
    isActive: 'all', // all, active, expired
    recipient: 'all' // all, specific, none
  });
  const [visibleCodes, setVisibleCodes] = useState(new Set());
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPromoCode, setSelectedPromoCode] = useState(null);
  const [newPromoCodeForm, setNewPromoCodeForm] = useState({
    property: '',
    tenant_email: '',
    discount_percentage: 10,
    expiry_date: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Chargement des codes promo et des propriétés
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Charger les codes promo
        const promoCodesResponse = await api.get('/bookings/promo-codes/', {
          params: {
            is_owner: true
          }
        });
        
        setPromoCodes(promoCodesResponse.data.results || []);
        setFilteredPromoCodes(promoCodesResponse.data.results || []);
        
        // Charger les propriétés pour les filtres et le formulaire
        const propertiesResponse = await api.get('/properties/properties/', {
          params: {
            is_owner: true,
            is_published: true,
            page_size: 100
          }
        });
        
        setProperties(propertiesResponse.data.results || []);
        
        // Initialiser le formulaire avec la première propriété si disponible
        if (propertiesResponse.data.results && propertiesResponse.data.results.length > 0) {
          setNewPromoCodeForm(prev => ({
            ...prev,
            property: propertiesResponse.data.results[0].id
          }));
        }
        
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Une erreur est survenue lors du chargement des données.');
        notifyError('Une erreur est survenue lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [notifyError]);
  
  // Filtrer les codes promo selon la recherche et les filtres
  useEffect(() => {
    if (!promoCodes.length) return;
    
    const filtered = promoCodes.filter(code => {
      // Filtre par recherche (code, client ou logement)
      const matchesSearch = searchQuery === '' || 
        code.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        code.property_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (code.tenant && code.tenant_name?.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Filtre par propriété
      const matchesProperty = filters.property === 'all' || code.property === filters.property;
      
      // Filtre par statut (actif/expiré)
      let matchesStatus = true;
      if (filters.isActive === 'active') {
        matchesStatus = code.is_active && code.is_valid;
      } else if (filters.isActive === 'expired') {
        matchesStatus = !code.is_active || !code.is_valid;
      }
      
      // Filtre par destinataire
      let matchesRecipient = true;
      if (filters.recipient === 'specific') {
        matchesRecipient = !!code.tenant;
      } else if (filters.recipient === 'none') {
        matchesRecipient = !code.tenant;
      }
      
      return matchesSearch && matchesProperty && matchesStatus && matchesRecipient;
    });
    
    setFilteredPromoCodes(filtered);
  }, [searchQuery, filters, promoCodes]);
  
  // Créer un nouveau code promo
  const handleCreatePromoCode = async () => {
    if (!newPromoCodeForm.property) {
      notifyError('Veuillez sélectionner un logement');
      return;
    }
    
    if (!newPromoCodeForm.discount_percentage || newPromoCodeForm.discount_percentage <= 0 || newPromoCodeForm.discount_percentage > 100) {
      notifyError('Veuillez saisir un pourcentage de remise valide (entre 1 et 100)');
      return;
    }
    
    if (!newPromoCodeForm.expiry_date) {
      notifyError('Veuillez saisir une date d\'expiration');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const payload = {
        property: newPromoCodeForm.property,
        discount_percentage: parseFloat(newPromoCodeForm.discount_percentage),
        expiry_date: new Date(newPromoCodeForm.expiry_date).toISOString()
      };
      
      // Ajouter l'email du client si spécifié
      if (newPromoCodeForm.tenant_email && newPromoCodeForm.tenant_email.trim()) {
        payload.tenant_email = newPromoCodeForm.tenant_email.trim();
      }
      
      const response = await api.post('/bookings/promo-codes/', payload);
      
      // Ajouter le nouveau code à la liste
      setPromoCodes(prev => [response.data, ...prev]);
      setFilteredPromoCodes(prev => [response.data, ...prev]);
      
      success('Code promo créé avec succès');
      
      // Réinitialiser le formulaire
      setNewPromoCodeForm({
        property: properties.length > 0 ? properties[0].id : '',
        tenant_email: '', // Changé de 'tenant' à 'tenant_email'
        discount_percentage: 10,
        expiry_date: '',
        notes: ''
      });
      
      // Fermer la modal
      setShowCreateModal(false);
      
    } catch (err) {
      console.error('Erreur lors de la création du code promo:', err);
      
      // Afficher l'erreur spécifique du serveur si disponible
      if (err.response?.data?.detail) {
        notifyError(err.response.data.detail);
      } else if (err.response?.data) {
        // Afficher les erreurs de validation
        const errors = Object.values(err.response.data).flat();
        notifyError(errors.join('. '));
      } else {
        notifyError('Une erreur est survenue lors de la création du code promo');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Supprimer un code promo
  const handleDeletePromoCode = async () => {
    if (!selectedPromoCode || !selectedPromoCode.id) return;
  
    try {
      setIsSubmitting(true);
      await api.delete(`/bookings/promo-codes/${selectedPromoCode.id}/`);
      
      setPromoCodes(prev => prev.filter(code => code.id !== selectedPromoCode.id));
      setFilteredPromoCodes(prev => prev.filter(code => code.id !== selectedPromoCode.id));
      
      success('Code promo supprimé avec succès');
      setShowDeleteModal(false);
      setSelectedPromoCode(null);
    } catch (err) {
      console.error('Erreur lors de la suppression du code promo:', err);
      notifyError('Une erreur est survenue lors de la suppression du code promo');
    } finally {
      setIsSubmitting(false);
    }
  };

   // Fonction pour basculer la visibilité du code
   const toggleCodeVisibility = (codeId) => {
    setVisibleCodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(codeId)) {
        newSet.delete(codeId);
      } else {
        newSet.add(codeId);
      }
      return newSet;
    });
  };
  
  // Copier un code promo dans le presse-papiers
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code)
      .then(() => {
        success('Code promo copié dans le presse-papiers');
      })
      .catch(err => {
        console.error('Erreur lors de la copie du code:', err);
        notifyError('Impossible de copier le code promo');
      });
  };
  
  // Formater une date pour l'affichage
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };
  
  // Vérifier si un code est actif et valide
  const isCodeActive = (code) => {
    return code.is_active && code.is_valid;
  };
  
  // Vérifier si un code est expiré
  const isCodeExpired = (code) => {
    if (!code.expiry_date) return false;
    
    const expiryDate = new Date(code.expiry_date);
    const now = new Date();
    
    return expiryDate < now;
  };
  
  // Affichage du contenu principal
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="bg-red-50 p-4 rounded-lg text-red-700">
          {error}
        </div>
      );
    }
    
    if (filteredPromoCodes.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <FiTag className="mx-auto text-gray-300 mb-4" size={64} />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Aucun code promo trouvé</h2>
          <p className="text-gray-500 mb-6">
            {searchQuery || Object.values(filters).some(f => f !== 'all')
              ? "Aucun code promo ne correspond à vos critères de recherche"
              : "Vous n'avez pas encore créé de codes promo"}
          </p>
          <Button
            variant="primary"
            icon={<FiPlus />}
            onClick={() => setShowCreateModal(true)}
          >
            Créer un code promo
          </Button>
        </div>
      );
    }
    
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Logement
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remise
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destinataire
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiration
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPromoCodes.map((code, index) => (
                <motion.tr 
                  key={code.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                   <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {visibleCodes.has(code.id) ? (
                        <span className="font-mono font-medium text-gray-900">{code.code}</span>
                      ) : (
                        <span className="font-mono font-medium text-gray-900">•••••••</span>
                      )}
                      <button 
                        onClick={() => toggleCodeVisibility(code.id)}
                        className="ml-2 text-gray-400 hover:text-gray-600"
                        title={visibleCodes.has(code.id) ? "Masquer le code" : "Afficher le code"}
                      >
                        {visibleCodes.has(code.id) ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                      <button 
                        onClick={() => handleCopyCode(code.code)}
                        className="ml-2 text-gray-400 hover:text-gray-600"
                        title="Copier le code"
                      >
                        <FiCopy size={16} />
                      </button>
                    </div>
                    <div className="text-xs text-gray-500">
                      Créé le {formatDate(code.created_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {/* CORRECTION : Utiliser un nom de propriété qui existe vraiment */}
                    <div className="text-sm font-medium text-gray-900">
                      {code.property?.title || code.property_title || 'Logement non défini'}
                    </div>
                    {/* Afichage de la ville si disponible */}
                    {code.property?.city && (
                      <div className="text-xs text-gray-500">
                        {code.property.city.name}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{code.discount_percentage}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {code.tenant ? (
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <FiUser className="text-gray-500" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{code.tenant_name}</div>
                          <div className="text-xs text-gray-500">Utilisable uniquement par ce client</div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Tout le monde</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatDate(code.expiry_date)}</div>
                    {isCodeExpired(code) && (
                      <div className="text-xs text-red-600">Expiré</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isCodeActive(code) ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <FiCheck className="mr-1" />
                        Actif
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <FiX className="mr-1" />
                        Inactif
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<FiTrash2 />}
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => {
                        setSelectedPromoCode(code);
                        setShowDeleteModal(true);
                      }}
                    >
                      Supprimer
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <SectionTitle 
            title="Codes promo" 
            subtitle="Créez et gérez des codes de réduction pour vos logements"
            align="left"
            withLine={false}
          />
          
          <div className="mt-4 md:mt-0">
            <Button
              variant="primary"
              icon={<FiPlus />}
              onClick={() => setShowCreateModal(true)}
            >
              Créer un code promo
            </Button>
          </div>
        </div>
        
        {/* Barre de recherche et filtres */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-grow">
              <Input
                type="text"
                placeholder="Rechercher par code, logement ou client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<FiSearch />}
              />
            </div>
            
            <Button
              variant="outline"
              icon={<FiFilter />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filtres
            </Button>
          </div>
          
          {/* Options de filtrage */}
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Logement
                  </label>
                  <select
                    value={filters.property}
                    onChange={(e) => setFilters({ ...filters, property: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">Tous les logements</option>
                    {properties.map(property => (
                      <option key={property.id} value={property.id}>
                        {property.title}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Statut
                  </label>
                  <select
                    value={filters.isActive}
                    onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="active">Actifs</option>
                    <option value="expired">Expirés</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Destinataire
                  </label>
                  <select
                    value={filters.recipient}
                    onChange={(e) => setFilters({ ...filters, recipient: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">Tous les destinataires</option>
                    <option value="specific">Client spécifique</option>
                    <option value="none">Tout le monde</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({
                    property: 'all',
                    isActive: 'all',
                    recipient: 'all'
                  })}
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Liste des codes promo */}
        {renderContent()}
        
        {/* Modal de création de code promo */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Créer un nouveau code promo"
          size="lg"
        >
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              Les codes promo vous permettent d'offrir des réductions à vos clients pour les encourager à réserver.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Logement <span className="text-red-600">*</span>
                </label>
                <select
                  value={newPromoCodeForm.property}
                  onChange={(e) => setNewPromoCodeForm({
                    ...newPromoCodeForm,
                    property: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">Sélectionner un logement</option>
                  {properties.map(property => (
                    <option key={property.id} value={property.id}>
                      {property.title}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pourcentage de remise <span className="text-red-600">*</span>
                </label>
                <div className="flex items-center">
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={newPromoCodeForm.discount_percentage}
                    onChange={(e) => setNewPromoCodeForm({
                      ...newPromoCodeForm,
                      discount_percentage: e.target.value
                    })}
                    className="w-full"
                    required
                  />
                  <span className="ml-2">%</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date d'expiration <span className="text-red-600">*</span>
                </label>
                <Input
                  type="date"
                  value={newPromoCodeForm.expiry_date}
                  onChange={(e) => setNewPromoCodeForm({
                    ...newPromoCodeForm,
                    expiry_date: e.target.value
                  })}
                  className="w-full"
                  required
                  min={new Date().toISOString().split('T')[0]} // Date minimum = aujourd'hui
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email du client (optionnel)
                </label>
                <Input
                  type="email"
                  placeholder="exemple@email.com"
                  value={newPromoCodeForm.tenant_email}
                  onChange={(e) => setNewPromoCodeForm({
                    ...newPromoCodeForm,
                    tenant_email: e.target.value
                  })}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Laissez vide pour rendre le code utilisable par tous les clients
                </p>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optionnel)
              </label>
              <textarea
                value={newPromoCodeForm.notes}
                onChange={(e) => setNewPromoCodeForm({
                  ...newPromoCodeForm,
                  notes: e.target.value
                })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Notes privées sur ce code promo"
              ></textarea>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                <FiInfo className="mr-2" />
                Informations importantes
              </h3>
              <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                <li>Le code sera généré automatiquement</li>
                <li>Le code sera actif jusqu'à la date d'expiration</li>
                <li>Un client ne peut utiliser un code qu'une seule fois</li>
                <li>La remise s'applique sur le prix total de la réservation</li>
              </ul>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(false)}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleCreatePromoCode}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Création en cours..." : "Créer le code promo"}
            </Button>
          </div>
        </Modal>
        
        {/* Modal de suppression de code promo */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedPromoCode(null);
          }}
          title="Supprimer le code promo"
          size="md"
        >
          {selectedPromoCode && (
            <div>
              <p className="text-gray-700 mb-4">
                Êtes-vous sûr de vouloir supprimer ce code promo ? Cette action est irréversible.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex items-center">
                  <span className="font-mono font-medium text-gray-900 mr-2">{selectedPromoCode.code}</span>
                  {isCodeActive(selectedPromoCode) ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <FiCheck className="mr-1" />
                      Actif
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <FiX className="mr-1" />
                      Inactif
                    </span>
                  )}
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <div>{selectedPromoCode.property_title}</div>
                  <div>{selectedPromoCode.discount_percentage}% de remise</div>
                  <div>Expire le {formatDate(selectedPromoCode.expiry_date)}</div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedPromoCode(null);
                  }}
                >
                  Annuler
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDeletePromoCode}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Suppression..." : "Supprimer"}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default PromoCodeManagement;