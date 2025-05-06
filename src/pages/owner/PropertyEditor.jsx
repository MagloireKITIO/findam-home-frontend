// src/pages/owner/PropertyEditor.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiHome, FiChevronRight, FiChevronLeft, FiMap,
  FiDollarSign, FiCamera, FiList, FiCheck, FiInfo
} from 'react-icons/fi';

import Layout from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PropertyBasicInfoForm from '../../components/owner/PropertyBasicInfoForm';
import PropertyLocationForm from '../../components/owner/PropertyLocationForm';
import PropertyPricingForm from '../../components/owner/PropertyPricingForm';
import PropertyImagesUploader from '../../components/owner/PropertyImagesUploader';
import PropertyAmenitiesForm from '../../components/owner/PropertyAmenitiesForm';
import PropertyPublishForm from '../../components/owner/PropertyPublishForm';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const PropertyEditor = () => {
  const { id } = useParams(); // id présent uniquement en mode édition
  const navigate = useNavigate();
  const { success, error: notifyError } = useNotification();
  const isEditMode = !!id;

  // États
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [propertyData, setPropertyData] = useState({
    // Étape 1 : Informations de base
    title: '',
    description: '',
    property_type: 'apartment',
    capacity: 1,
    bedrooms: 1,
    bathrooms: 1,
    
    // Étape 2 : Emplacement
    city: '',
    neighborhood: '',
    address: '',
    latitude: null,
    longitude: null,
    
    // Étape 3 : Tarification
    price_per_night: 20000,
    price_per_week: null,
    price_per_month: null,
    cleaning_fee: 0,
    security_deposit: 0,
    allow_discount: false,
    cancellation_policy: 'flexible',
    long_stay_discounts: [],
    
    // Étape 4 : Images (sera géré séparément)
    
    // Étape 5 : Équipements
    amenities: [],
    
    // Étape 6 : Publication
    is_published: false
  });
  
  // Étape 4 : Images - liste séparée pour une meilleure gestion
  const [propertyImages, setPropertyImages] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [amenitiesList, setAmenitiesList] = useState([]);
  const [cities, setCities] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  
  // Chargement des données en mode édition
  useEffect(() => {
    const loadProperty = async () => {
      if (!isEditMode) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Charger les détails du logement
        const response = await api.get(`/properties/properties/${id}/`);
        const propertyDetails = response.data;
        
        // Formater les données reçues pour correspondre à notre état
        setPropertyData({
          title: propertyDetails.title || '',
          description: propertyDetails.description || '',
          property_type: propertyDetails.property_type || 'apartment',
          capacity: propertyDetails.capacity || 1,
          bedrooms: propertyDetails.bedrooms || 1,
          bathrooms: propertyDetails.bathrooms || 1,
          
          city: propertyDetails.city || '',
          neighborhood: propertyDetails.neighborhood || '',
          address: propertyDetails.address || '',
          latitude: propertyDetails.latitude || null,
          longitude: propertyDetails.longitude || null,
          
          price_per_night: propertyDetails.price_per_night || 20000,
          price_per_week: propertyDetails.price_per_week || null,
          price_per_month: propertyDetails.price_per_month || null,
          cleaning_fee: propertyDetails.cleaning_fee || 0,
          security_deposit: propertyDetails.security_deposit || 0,
          allow_discount: propertyDetails.allow_discount || false,
          cancellation_policy: propertyDetails.cancellation_policy || 'flexible',
          long_stay_discounts: propertyDetails.long_stay_discounts || [],
          
          amenities: propertyDetails.amenities?.map(amenity => amenity.id) || [],
          
          is_published: propertyDetails.is_published || false
        });
        
        // Charger les images existantes
        if (propertyDetails.images && propertyDetails.images.length > 0) {
          setPropertyImages(propertyDetails.images);
        }
        
      } catch (err) {
        console.error('Erreur lors du chargement des données du logement:', err);
        setError('Une erreur est survenue lors du chargement des données du logement.');
      } finally {
        setLoading(false);
      }
    };
    
    loadProperty();
  }, [id, isEditMode]);
  
  // Chargement des données de référence (villes, quartiers, équipements)
  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        // Charger les équipements
        const amenitiesResponse = await api.get('/properties/amenities/');
        if (amenitiesResponse.data.results) {
          setAmenitiesList(amenitiesResponse.data.results);
        } else if (Array.isArray(amenitiesResponse.data)) {
          setAmenitiesList(amenitiesResponse.data);
        }
        
        // Charger les villes
        const citiesResponse = await api.get('/properties/cities/');
        if (citiesResponse.data.results) {
          setCities(citiesResponse.data.results);
        } else if (Array.isArray(citiesResponse.data)) {
          setCities(citiesResponse.data);
        }
        
      } catch (err) {
        console.error('Erreur lors du chargement des données de référence:', err);
        notifyError('Une erreur est survenue lors du chargement des données de référence.');
      }
    };
    
    loadReferenceData();
  }, [notifyError]);
  
  // Charger les quartiers lorsque la ville change
  useEffect(() => {
    const loadNeighborhoods = async () => {
      if (!propertyData.city) {
        setNeighborhoods([]);
        return;
      }
      
      try {
        const response = await api.get('/properties/neighborhoods/', {
          params: { city: propertyData.city }
        });
        
        if (response.data.results) {
          setNeighborhoods(response.data.results);
        } else if (Array.isArray(response.data)) {
          setNeighborhoods(response.data);
        } else {
          setNeighborhoods([]);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des quartiers:', err);
        setNeighborhoods([]);
      }
    };
    
    loadNeighborhoods();
  }, [propertyData.city]);
  
  // Fonction pour mettre à jour les données du logement
  const updatePropertyData = useCallback((field, value) => {
    setPropertyData(prev => ({ ...prev, [field]: value }));
  }, []);
  
  // Fonction pour mettre à jour un objet entier (par exemple, pour les formulaires)
  const updateFormData = useCallback((formData) => {
    setPropertyData(prev => ({ ...prev, ...formData }));
  }, []);
  
  // Navigation entre les étapes
  const goToNextStep = () => {
    // Vérification des données selon l'étape actuelle
    if (currentStep === 1) {
      // Validation de l'étape 1 (Informations de base)
      if (!propertyData.title) {
        notifyError('Veuillez saisir un titre pour votre logement');
        return;
      }
    } else if (currentStep === 2) {
      // Validation de l'étape 2 (Emplacement)
      if (!propertyData.city) {
        notifyError('Veuillez sélectionner une ville');
        return;
      }
    } else if (currentStep === 3) {
      // Validation de l'étape 3 (Tarification)
      if (!propertyData.price_per_night || propertyData.price_per_night <= 0) {
        notifyError('Veuillez saisir un prix par nuit valide');
        return;
      }
    } else if (currentStep === 4) {
      // Validation de l'étape 4 (Images)
      if (propertyImages.length === 0 && uploadedImages.length === 0) {
        notifyError('Veuillez ajouter au moins une image');
        return;
      }
    }
    
    // Passer à l'étape suivante
    setCurrentStep(prev => Math.min(prev + 1, 6)); // 6 étapes au total
  };
  
  const goToPreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1)); // Minimum étape 1
  };
  
  // Soumission du formulaire
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);
      
      // Préparer les données pour l'API
      const formData = new FormData();
      
      // Ajouter les champs de base
      Object.keys(propertyData).forEach(key => {
        // Ignorer les champs qui seront traités séparément
        if (key === 'long_stay_discounts' || key === 'amenities' || key === 'images') {
          return;
        }
        
        if (propertyData[key] !== null && propertyData[key] !== undefined) {
          formData.append(key, propertyData[key]);
        }
      });
      
      // Ajouter les équipements
      propertyData.amenities.forEach(amenityId => {
        formData.append('amenities', amenityId);
      });
      
      let propertyId;
      
      if (isEditMode) {
        // Mise à jour d'un logement existant
        const response = await api.put(`/properties/properties/${id}/`, formData);
        propertyId = response.data.id;
        
        success('Logement mis à jour avec succès');
      } else {
        // Création d'un nouveau logement
        const response = await api.post('/properties/properties/', formData);
        propertyId = response.data.id;
        
        success('Logement créé avec succès');
      }
      
      // Traiter les nouvelles images à télécharger
      if (uploadedImages.length > 0) {
        for (const image of uploadedImages) {
          const imageFormData = new FormData();
          imageFormData.append('property', propertyId.toString()); // Assurez-vous que c'est bien une chaîne
          imageFormData.append('image', image.file);
          imageFormData.append('is_main', image.isMain ? 'true' : 'false'); // Convertir boolean en string
          imageFormData.append('caption', image.caption || '');
          
          try {
            await api.post('/properties/images/', imageFormData);
          } catch (err) {
            console.error('Erreur lors de l\'upload de l\'image:', err.response?.data || err);
            // Continuer avec les autres images même si l'une échoue
          }
        }
      }
      
      // Traiter les remises pour les longs séjours
      if (propertyData.long_stay_discounts.length > 0) {
        await api.patch(`/properties/properties/${propertyId}/`, {
          long_stay_discounts: propertyData.long_stay_discounts
        });
      }
      
      // Publier le logement si demandé
      if (propertyData.is_published) {
        await api.post(`/properties/properties/${propertyId}/publish/`);
      }
      
      // Redirection vers la page de détail ou de gestion
      navigate('/owner/properties');
      
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement du logement:', err);
      setError('Une erreur est survenue lors de l\'enregistrement du logement.');
      notifyError('Une erreur est survenue lors de l\'enregistrement du logement.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Gestion de la soumission finale
  const handlePublish = (shouldPublish) => {
    updatePropertyData('is_published', shouldPublish);
    handleSubmit();
  };
  
  // Affichage de l'étape actuelle
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PropertyBasicInfoForm
            formData={propertyData}
            updateFormData={updateFormData}
            updateField={updatePropertyData}
          />
        );
      case 2:
        return (
          <PropertyLocationForm
            formData={propertyData}
            updateFormData={updateFormData}
            updateField={updatePropertyData}
            cities={cities}
            neighborhoods={neighborhoods}
          />
        );
      case 3:
        return (
          <PropertyPricingForm
            formData={propertyData}
            updateFormData={updateFormData}
            updateField={updatePropertyData}
          />
        );
      case 4:
        return (
          <PropertyImagesUploader
            existingImages={propertyImages}
            uploadedImages={uploadedImages}
            setUploadedImages={setUploadedImages}
            isEditMode={isEditMode}
          />
        );
      case 5:
        return (
          <PropertyAmenitiesForm
            selectedAmenities={propertyData.amenities}
            updateAmenities={(amenities) => updatePropertyData('amenities', amenities)}
            amenitiesList={amenitiesList}
          />
        );
      case 6:
        return (
          <PropertyPublishForm
            propertyData={propertyData}
            handlePublish={handlePublish}
            loading={submitting}
          />
        );
      default:
        return null;
    }
  };
  
  // Liste des étapes
  const steps = [
    { id: 1, title: 'Informations de base', icon: <FiHome /> },
    { id: 2, title: 'Emplacement', icon: <FiMap /> },
    { id: 3, title: 'Tarification', icon: <FiDollarSign /> },
    { id: 4, title: 'Images', icon: <FiCamera /> },
    { id: 5, title: 'Équipements', icon: <FiList /> },
    { id: 6, title: 'Publication', icon: <FiCheck /> }
  ];
  
  // Si en mode édition et les données sont en cours de chargement
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-screen">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* En-tête */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditMode ? 'Modifier le logement' : 'Ajouter un nouveau logement'}
            </h1>
            <p className="text-gray-600 mt-2">
              {isEditMode 
                ? 'Mettez à jour les informations de votre logement'
                : 'Remplissez les informations suivantes pour ajouter votre logement'}
            </p>
          </div>
          
          {/* Erreur globale */}
          {error && (
            <div className="bg-red-50 p-4 rounded-lg text-red-700 mb-6">
              {error}
            </div>
          )}
          
          {/* Étapes de progression */}
          <div className="mb-8 overflow-x-auto">
            <div className="flex min-w-max">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  {/* Connecteur entre les étapes */}
                  {index > 0 && (
                    <div className="flex items-center flex-grow max-w-[50px]">
                      <div className={`h-[2px] w-full ${
                        currentStep > index ? 'bg-primary-500' : 'bg-gray-200'
                      }`}></div>
                    </div>
                  )}
                  
                  {/* Étape */}
                  <div 
                    className={`flex flex-col items-center cursor-pointer`}
                    onClick={() => setCurrentStep(step.id)}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                      ${currentStep === step.id 
                        ? 'bg-primary-100 text-primary-600 border-2 border-primary-500' 
                        : currentStep > step.id 
                          ? 'bg-primary-500 text-white' 
                          : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                      }`}
                    >
                      {step.icon}
                    </div>
                    <div className={`text-xs mt-2 font-medium ${
                      currentStep === step.id 
                        ? 'text-primary-600' 
                        : currentStep > step.id 
                          ? 'text-gray-700' 
                          : 'text-gray-400'
                    }`}>
                      {step.title}
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
          
          {/* Contenu de l'étape actuelle */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            {renderCurrentStep()}
          </motion.div>
          
          {/* Boutons de navigation */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={goToPreviousStep}
              disabled={currentStep === 1 || submitting}
              icon={<FiChevronLeft />}
              iconPosition="left"
            >
              Précédent
            </Button>
            
            {currentStep < 6 ? (
              <Button
                variant="primary"
                onClick={goToNextStep}
                disabled={submitting}
                icon={<FiChevronRight />}
                iconPosition="right"
              >
                Suivant
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PropertyEditor;