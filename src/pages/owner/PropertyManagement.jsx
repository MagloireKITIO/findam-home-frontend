// src/pages/owner/PropertyManagement.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiHome, FiPlus, FiSearch, FiFilter, FiChevronDown,
  FiEye, FiEyeOff, FiEdit, FiTrash2, FiCalendar
} from 'react-icons/fi';

import Layout from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import PropertyStatusBadge from '../../components/owner/PropertyStatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const PropertyManagement = () => {
  const { success, error: notifyError } = useNotification();
  
  // États
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: 'all', // all, published, unpublished, pending
    propertyType: 'all', // all, apartment, house, villa, studio
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [isDeletingProperty, setIsDeletingProperty] = useState(false);
  
  // Charger les logements
  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get('/properties/properties/', {
          params: {
            is_owner: true,
            ordering: sortDirection === 'asc' ? sortBy : `-${sortBy}`
          }
        });
        
        if (response.data.results) {
          setProperties(response.data.results);
          setFilteredProperties(response.data.results);
        } else if (Array.isArray(response.data)) {
          setProperties(response.data);
          setFilteredProperties(response.data);
        } else {
          setProperties([]);
          setFilteredProperties([]);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des logements:', err);
        setError('Une erreur est survenue lors du chargement des logements.');
      } finally {
        setLoading(false);
      }
    };
    
    loadProperties();
  }, [sortBy, sortDirection]);
  
  // Filtrer les logements selon la recherche et les filtres
  useEffect(() => {
    if (!properties.length) return;
    
    const filtered = properties.filter(property => {
      // Filtre par recherche (titre ou lieu)
      const matchesSearch = searchQuery === '' || 
        property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (property.city_name && property.city_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (property.neighborhood_name && property.neighborhood_name.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Filtre par statut
      const matchesStatus = filters.status === 'all' || 
        (filters.status === 'published' && property.is_published) ||
        (filters.status === 'unpublished' && !property.is_published) ||
        (filters.status === 'pending' && property.status === 'pending');
      
      // Filtre par type de propriété
      const matchesType = filters.propertyType === 'all' || 
        property.property_type === filters.propertyType;
      
      return matchesSearch && matchesStatus && matchesType;
    });
    
    setFilteredProperties(filtered);
  }, [searchQuery, filters, properties]);
  
  // Changer l'ordre de tri
  const handleSortChange = (field) => {
    if (sortBy === field) {
      // Si on clique sur le même champ, on inverse la direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Sinon, on change le champ de tri et on met la direction par défaut (desc)
      setSortBy(field);
      setSortDirection('desc');
    }
  };
  
  // Basculer la visibilité d'un logement (publier/dépublier)
  const togglePropertyVisibility = async (propertyId, currentStatus) => {
    try {
      if (currentStatus) {
        // Dépublier
        await api.post(`/properties/properties/${propertyId}/unpublish/`);
        success('Logement dépublié avec succès');
      } else {
        // Publier
        await api.post(`/properties/properties/${propertyId}/publish/`);
        success('Logement publié avec succès');
      }
      
      // Mettre à jour l'état local
      setProperties(prev => prev.map(property => 
        property.id === propertyId 
          ? { ...property, is_published: !currentStatus }
          : property
      ));
    } catch (err) {
      console.error('Erreur lors du changement de visibilité:', err);
      notifyError(
        currentStatus 
          ? 'Une erreur est survenue lors de la dépublication du logement' 
          : 'Une erreur est survenue lors de la publication du logement'
      );
    }
  };
  
  // Supprimer un logement
  const handleDeleteProperty = async () => {
    if (!propertyToDelete) return;
    
    try {
      setIsDeletingProperty(true);
      await api.delete(`/properties/properties/${propertyToDelete.id}/`);
      
      // Mettre à jour l'état local
      setProperties(prev => prev.filter(property => property.id !== propertyToDelete.id));
      setFilteredProperties(prev => prev.filter(property => property.id !== propertyToDelete.id));
      
      success('Logement supprimé avec succès');
      setPropertyToDelete(null);
    } catch (err) {
      console.error('Erreur lors de la suppression du logement:', err);
      notifyError('Une erreur est survenue lors de la suppression du logement');
    } finally {
      setIsDeletingProperty(false);
    }
  };
  
  // Formater le prix pour l'affichage
  const formatPrice = (price) => {
    return `${price.toLocaleString()} FCFA`;
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">Mes logements</h1>
          
          <Link to="/owner/properties/new">
            <Button
              variant="primary"
              icon={<FiPlus />}
            >
              Ajouter un logement
            </Button>
          </Link>
        </div>
        
        {/* Barre de recherche et filtres */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-grow">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Rechercher par titre ou lieu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={<FiSearch />}
                />
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                icon={<FiFilter />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filtres
              </Button>
              
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => {}}
                  iconPosition="right"
                  icon={<FiChevronDown />}
                >
                  Trier par: {
                    sortBy === 'created_at' ? 'Date de création' :
                    sortBy === 'price_per_night' ? 'Prix' :
                    sortBy === 'title' ? 'Titre' : 'Date de création'
                  }
                </Button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded shadow-lg z-10 border border-gray-200">
                  <ul className="py-1">
                    <li>
                      <button
                        onClick={() => handleSortChange('created_at')}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Date de création
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleSortChange('price_per_night')}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Prix
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleSortChange('title')}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Titre
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {/* Options de filtrage */}
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Statut
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="published">Publiés</option>
                    <option value="unpublished">Non publiés</option>
                    <option value="pending">En attente de vérification</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de logement
                  </label>
                  <select
                    value={filters.propertyType}
                    onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">Tous les types</option>
                    <option value="apartment">Appartement</option>
                    <option value="house">Maison</option>
                    <option value="villa">Villa</option>
                    <option value="studio">Studio</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Liste des logements */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-lg text-red-700">
            {error}
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <FiHome className="mx-auto text-gray-300 mb-4" size={64} />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Aucun logement trouvé</h2>
            <p className="text-gray-500 mb-6">
              {searchQuery || filters.status !== 'all' || filters.propertyType !== 'all'
                ? "Aucun logement ne correspond à vos critères de recherche"
                : "Vous n'avez pas encore ajouté de logements"}
            </p>
            <Link to="/owner/properties/new">
              <Button
                variant="primary"
                icon={<FiPlus />}
              >
                Ajouter votre premier logement
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                {/* Image du logement */}
                <div className="relative h-48">
                  {property.main_image ? (
                    <img 
                      src={property.main_image} 
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <FiHome size={48} className="text-gray-400" />
                    </div>
                  )}
                  
                  {/* Badge de statut */}
                  <div className="absolute top-2 right-2">
                    <PropertyStatusBadge status={property.is_published ? 'published' : 'draft'} />
                  </div>
                </div>
                
                {/* Contenu */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                    {property.title}
                  </h3>
                  
                  <div className="text-sm text-gray-500 mb-3">
                    {property.city_name && property.neighborhood_name ? 
                      `${property.city_name}, ${property.neighborhood_name}` : 
                      property.city_name || property.neighborhood_name || 'Emplacement non spécifié'}
                  </div>
                  
                  <div className="flex justify-between mb-4">
                    <div className="text-primary-600 font-bold">
                      {formatPrice(property.price_per_night)} <span className="text-gray-500 font-normal text-sm">/ nuit</span>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      {property.bedrooms} ch · {property.bathrooms} sdb · {property.capacity} pers.
                    </div>
                  </div>
                  
                  {/* Statistiques rapides */}
                  <div className="grid grid-cols-3 gap-2 mb-4 text-center text-sm">
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="font-semibold">{property.booking_count || 0}</div>
                      <div className="text-gray-500">Réservations</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="font-semibold">{property.views_count || 0}</div>
                      <div className="text-gray-500">Vues</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="font-semibold">{property.avg_rating || '-'}</div>
                      <div className="text-gray-500">Note</div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={property.is_published ? <FiEyeOff /> : <FiEye />}
                      onClick={() => togglePropertyVisibility(property.id, property.is_published)}
                    >
                      {property.is_published ? 'Dépublier' : 'Publier'}
                    </Button>
                    
                    <Link to={`/owner/properties/${property.id}/edit`}>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<FiEdit />}
                      >
                        Modifier
                      </Button>
                    </Link>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<FiCalendar />}
                      onClick={() => {/* TODO: Ouvrir le calendrier de disponibilité */}}
                    >
                      Disponibilité
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<FiTrash2 />}
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => setPropertyToDelete(property)}
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        {/* Modal de confirmation de suppression */}
        <Modal
          isOpen={!!propertyToDelete}
          onClose={() => setPropertyToDelete(null)}
          title="Confirmer la suppression"
          size="md"
        >
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              Êtes-vous sûr de vouloir supprimer le logement suivant ?
            </p>
            {propertyToDelete && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <strong className="block mb-1">{propertyToDelete.title}</strong>
                <span className="text-gray-500">
                  {propertyToDelete.city_name && propertyToDelete.neighborhood_name ? 
                    `${propertyToDelete.city_name}, ${propertyToDelete.neighborhood_name}` : 
                    propertyToDelete.city_name || propertyToDelete.neighborhood_name || 'Emplacement non spécifié'}
                </span>
              </div>
            )}
            <p className="mt-4 text-gray-700">
              Cette action est irréversible et supprimera définitivement toutes les données associées à ce logement.
            </p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setPropertyToDelete(null)}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteProperty}
              disabled={isDeletingProperty}
            >
              {isDeletingProperty ? "Suppression..." : "Supprimer"}
            </Button>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default PropertyManagement;