// src/components/owner/PropertyImagesUploader.jsx
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUpload, FiImage, FiStar, FiX, FiInfo,
  FiArrowLeft, FiArrowRight, FiEdit, FiPlus
} from 'react-icons/fi';

import Button from '../common/Button';
import Input from '../common/Input';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

/**
 * Composant pour télécharger et gérer les images d'un logement
 * @param {Array} existingImages - Images existantes (mode édition)
 * @param {Array} uploadedImages - Images téléchargées pendant la session actuelle
 * @param {Function} setUploadedImages - Fonction pour mettre à jour les images téléchargées
 * @param {boolean} isEditMode - Mode édition ou création
 */
const PropertyImagesUploader = ({ 
  existingImages = [], 
  uploadedImages = [], 
  setUploadedImages,
  isEditMode = false 
}) => {
  const { success, error: notifyError } = useNotification();
  const fileInputRef = useRef(null);
  
  // États
  const [dragging, setDragging] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [imageToEdit, setImageToEdit] = useState(null);
  const [imageCaption, setImageCaption] = useState('');
  
  // Compteur d'images combinées (existantes + nouvelles)
  const totalImages = existingImages.length + uploadedImages.length;
  
  // Vérifier si une image est définie comme principale
  const hasMainImage = 
    existingImages.some(img => img.is_main) || 
    uploadedImages.some(img => img.isMain);
  
  // Gérer le glisser-déposer de fichiers
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };
  
  const handleDragLeave = () => {
    setDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  };
  
  // Gérer la sélection de fichiers via l'explorateur
  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  };
  
  // Traiter les fichiers sélectionnés
  const handleFiles = async (files) => {
    // Convertir FileList en Array
    const fileArray = Array.from(files);
    
    // Vérifier si ce sont des images et les préparer
    const validFiles = fileArray.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length === 0) {
      notifyError('Veuillez sélectionner des fichiers image valides (JPG, PNG, etc.)');
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Simuler la progression du téléchargement
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 5;
          if (newProgress >= 100) {
            clearInterval(interval);
            return 100;
          }
          return newProgress;
        });
      }, 100);
      
      // Traiter chaque fichier
      const newImages = await Promise.all(validFiles.map(async (file, index) => {
        // Créer une URL temporaire pour la prévisualisation
        const previewUrl = URL.createObjectURL(file);
        
        // Définir la première image comme principale si aucune image principale n'est définie
        const isMain = !hasMainImage && 
          existingImages.length === 0 && 
          uploadedImages.length === 0 && 
          index === 0;
        
        return {
          id: `temp-${Date.now()}-${index}`,
          file,
          preview: previewUrl,
          isMain,
          caption: '',
          name: file.name
        };
      }));
      
      // Ajouter les nouvelles images à la liste
      setUploadedImages([...uploadedImages, ...newImages]);
      
      // Terminer le téléchargement simulé
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setProgress(0);
      }, 500);
      
      success(`${validFiles.length} image(s) téléchargée(s) avec succès`);
      
    } catch (err) {
      console.error('Erreur lors du traitement des images:', err);
      notifyError('Une erreur est survenue lors du téléchargement des images');
      setIsUploading(false);
      setProgress(0);
    }
  };
  
  // Supprimer une image
  const handleRemoveImage = (image, isExisting = false) => {
    if (isExisting) {
      // Pour les images existantes en mode édition, appeler l'API
      if (isEditMode) {
        // TODO: Ajouter la suppression d'image via l'API
        // api.delete(`/properties/images/${image.id}/`).then(() => {
        //   success('Image supprimée avec succès');
        // }).catch(err => {
        //   console.error('Erreur lors de la suppression de l\'image:', err);
        //   notifyError('Une erreur est survenue lors de la suppression de l\'image');
        // });
        
        // En attendant, on supprime juste de l'état local
        const updatedExistingImages = existingImages.filter(img => img.id !== image.id);
        // Mettre à jour l'état parent
      }
    } else {
      // Pour les images nouvellement téléchargées
      const updatedImages = uploadedImages.filter(img => img.id !== image.id);
      setUploadedImages(updatedImages);
      
      // Si c'était l'image principale, définir une autre comme principale
      if (image.isMain && updatedImages.length > 0) {
        const newMainIndex = 0; // Première image
        const updatedImagesWithMain = updatedImages.map((img, idx) => ({
          ...img,
          isMain: idx === newMainIndex
        }));
        setUploadedImages(updatedImagesWithMain);
      }
    }
  };
  
  // Définir une image comme principale
  const setAsMainImage = (image, isExisting = false) => {
    if (isExisting) {
      // Pour les images existantes en mode édition
      if (isEditMode) {
        // TODO: Mettre à jour via l'API
        // api.patch(`/properties/images/${image.id}/`, { is_main: true }).then(() => {
        //   success('Image principale mise à jour');
        // }).catch(err => {
        //   console.error('Erreur lors de la mise à jour de l\'image principale:', err);
        //   notifyError('Une erreur est survenue lors de la mise à jour de l\'image principale');
        // });
        
        // En attendant, mise à jour de l'état local
        const updatedExistingImages = existingImages.map(img => ({
          ...img,
          is_main: img.id === image.id
        }));
        
        // Mettre à jour l'état parent
        
        // S'assurer qu'aucune image téléchargée n'est définie comme principale
        const updatedUploadedImages = uploadedImages.map(img => ({
          ...img,
          isMain: false
        }));
        setUploadedImages(updatedUploadedImages);
      }
    } else {
      // Pour les images nouvellement téléchargées
      const updatedImages = uploadedImages.map(img => ({
        ...img,
        isMain: img.id === image.id
      }));
      setUploadedImages(updatedImages);
      
      // S'assurer qu'aucune image existante n'est définie comme principale
      if (isEditMode) {
        // TODO: Mettre à jour via l'API pour les images existantes
      }
    }
  };
  
  // Ouvrir la dialogue d'édition pour une image
  const openEditDialog = (image, isExisting = false) => {
    setImageToEdit({ ...image, isExisting });
    setImageCaption(isExisting ? image.caption || '' : image.caption);
  };
  
  // Sauvegarder les modifications d'une image
  const saveImageChanges = () => {
    if (!imageToEdit) return;
    
    if (imageToEdit.isExisting) {
      // Pour les images existantes, mettre à jour via l'API
      if (isEditMode) {
        // TODO: Mettre à jour via l'API
        // api.patch(`/properties/images/${imageToEdit.id}/`, { caption: imageCaption }).then(() => {
        //   success('Légende mise à jour avec succès');
        // }).catch(err => {
        //   console.error('Erreur lors de la mise à jour de la légende:', err);
        //   notifyError('Une erreur est survenue lors de la mise à jour de la légende');
        // });
        
        // En attendant, mise à jour de l'état local
        const updatedExistingImages = existingImages.map(img => 
          img.id === imageToEdit.id ? { ...img, caption: imageCaption } : img
        );
        
        // Mettre à jour l'état parent
      }
    } else {
      // Pour les images nouvellement téléchargées
      const updatedImages = uploadedImages.map(img => 
        img.id === imageToEdit.id ? { ...img, caption: imageCaption } : img
      );
      setUploadedImages(updatedImages);
    }
    
    // Fermer la dialogue
    setImageToEdit(null);
    setImageCaption('');
  };

  // Prévisualiser une image en grand
  const openImagePreview = (image) => {
    setSelectedImage(image);
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800 mb-6 flex items-start">
        <FiInfo className="mt-1 mr-3 flex-shrink-0" />
        <div>
          <h3 className="font-medium">Images de votre logement</h3>
          <p className="mt-1 text-sm">
            Ajoutez des photos attrayantes et représentatives de votre logement.
            La première image définie comme principale apparaîtra en priorité dans les résultats de recherche.
          </p>
        </div>
      </div>
      
      {/* Zone de téléchargement */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          dragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          multiple
          accept="image/*"
          className="hidden"
        />
        
        <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-lg font-medium text-gray-700">
          Déposez vos images ici ou cliquez pour parcourir
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Formats acceptés: JPG, PNG, WEBP. Taille maximum: 10 MB par image.
        </p>
      </div>
      
      {/* Barre de progression */}
      {isUploading && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-primary-600 h-2.5 rounded-full transition-all duration-150" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-center text-sm text-gray-600 mt-2">
            Téléchargement en cours... {progress}%
          </p>
        </div>
      )}
      
      {/* Compteur d'images */}
      <div className="text-center text-sm text-gray-600">
        {totalImages} image{totalImages !== 1 ? 's' : ''} ({totalImages < 5 ? 'minimum 5 recommandé' : 'parfait!'})
      </div>
      
      {/* Aperçu des images */}
      {(existingImages.length > 0 || uploadedImages.length > 0) && (
        <div>
          <h4 className="text-lg font-medium text-gray-700 mb-2">
            Images du logement
          </h4>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {/* Images existantes */}
            {existingImages.map((image) => (
              <div 
                key={image.id}
                className="relative group rounded-lg overflow-hidden shadow-sm border border-gray-200"
              >
                <div 
                  className="w-full aspect-square bg-gray-100 cursor-pointer"
                  onClick={() => openImagePreview(image)}
                >
                  <img 
                    src={image.image} 
                    alt={image.caption || 'Image du logement'}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Indicateur d'image principale */}
                {image.is_main && (
                  <div className="absolute top-2 left-2 bg-primary-500 text-white text-xs py-1 px-2 rounded-full flex items-center">
                    <FiStar className="mr-1" /> Principale
                  </div>
                )}
                
                {/* Actions sur l'image */}
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex space-x-2">
                    {!image.is_main && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAsMainImage(image, true)
                        }}
                        className="bg-white"
                      >
                        <FiStar />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditDialog(image, true)
                      }}
                      className="bg-white"
                    >
                      <FiEdit />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(image, true)
                      }}
                      className="bg-white"
                    >
                      <FiX />
                    </Button>
                  </div>
                </div>
                
                {/* Légende */}
                {image.caption && (
                  <div className="p-2 text-sm text-gray-600 truncate">
                    {image.caption}
                  </div>
                )}
              </div>
            ))}
            
            {/* Images téléchargées */}
            {uploadedImages.map((image) => (
              <div 
                key={image.id}
                className="relative group rounded-lg overflow-hidden shadow-sm border border-gray-200"
              >
                <div 
                  className="w-full aspect-square bg-gray-100 cursor-pointer"
                  onClick={() => openImagePreview(image)}
                >
                  <img 
                    src={image.preview} 
                    alt={image.caption || 'Image du logement'}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Badge "Nouveau" */}
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs py-1 px-2 rounded-full">
                  Nouveau
                </div>
                
                {/* Indicateur d'image principale */}
                {image.isMain && (
                  <div className="absolute top-2 left-2 bg-primary-500 text-white text-xs py-1 px-2 rounded-full flex items-center">
                    <FiStar className="mr-1" /> Principale
                  </div>
                )}
                
                {/* Actions sur l'image */}
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex space-x-2">
                    {!image.isMain && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAsMainImage(image)
                        }}
                        className="bg-white"
                      >
                        <FiStar />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditDialog(image)
                      }}
                      className="bg-white"
                    >
                      <FiEdit />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(image)
                      }}
                      className="bg-white"
                    >
                      <FiX />
                    </Button>
                  </div>
                </div>
                
                {/* Légende */}
                {image.caption && (
                  <div className="p-2 text-sm text-gray-600 truncate">
                    {image.caption}
                  </div>
                )}
              </div>
            ))}
            
            {/* Bouton d'ajout supplémentaire */}
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center aspect-square cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="text-center">
                <FiPlus className="mx-auto h-8 w-8 text-gray-400" />
                <span className="mt-2 block text-sm font-medium text-gray-500">
                  Ajouter plus d'images
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de prévisualisation */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={selectedImage.isExisting ? selectedImage.image : selectedImage.preview} 
                alt={selectedImage.caption || 'Image du logement'}
                className="max-w-full max-h-[90vh] object-contain"
              />
              
              <button
                className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70"
                onClick={() => setSelectedImage(null)}
              >
                <FiX size={24} />
              </button>
              
              {/* Caption */}
              {selectedImage.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-3">
                  {selectedImage.caption}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Modal d'édition de légende */}
      <AnimatePresence>
        {imageToEdit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75"
            onClick={() => setImageToEdit(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Modifier la légende
              </h3>
              
              <div className="mb-4">
                <img 
                  src={imageToEdit.isExisting ? imageToEdit.image : imageToEdit.preview} 
                  alt="Aperçu"
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
                
                <Input
                  label="Légende"
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  placeholder="Décrivez brièvement cette image"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setImageToEdit(null)}
                >
                  Annuler
                </Button>
                <Button
                  variant="primary"
                  onClick={saveImageChanges}
                >
                  Enregistrer
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PropertyImagesUploader;