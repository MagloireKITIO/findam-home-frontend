// src/pages/IdentityVerification.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUpload, FiChevronLeft, FiChevronRight, FiCheck, FiInfo, FiX, FiCamera } from 'react-icons/fi';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useNotification } from '../context/NotificationContext';
import useApi from '../hooks/useApi';

const IdentityVerification = () => {
  const navigate = useNavigate();
  const { success, error: notifyError } = useNotification();
  const { patchData, loading, error } = useApi();

  // Références pour les entrées de fichier
  const idCardInputRef = useRef(null);
  const selfieInputRef = useRef(null);

  // États
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    id_card_number: '',
    id_card_image: null,
    selfie_image: null,
  });
  const [preview, setPreview] = useState({
    id_card: null,
    selfie: null,
  });

  // Navigation entre les étapes
  const nextStep = () => {
    // Validation par étape
    if (currentStep === 1 && !formData.id_card_number) {
      notifyError('Veuillez saisir le numéro de votre carte d\'identité');
      return;
    }
    if (currentStep === 2 && !formData.id_card_image) {
      notifyError('Veuillez télécharger une photo de votre carte d\'identité');
      return;
    }
    setCurrentStep(prevStep => prevStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(prevStep => Math.max(1, prevStep - 1));
  };

  // Gestion des entrées textuelles
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Gestion des téléchargements d'images
  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Vérification du type de fichier
    if (!file.type.startsWith('image/')) {
      notifyError('Veuillez télécharger un fichier image valide');
      return;
    }

    // Vérification de la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      notifyError('L\'image ne doit pas dépasser 5MB');
      return;
    }

    // Mise à jour de l'état et de l'aperçu
    setFormData(prev => ({ ...prev, [`${type}_image`]: file }));
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(prev => ({ ...prev, [type]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // Prise de selfie via webcam
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch (err) {
      notifyError('Impossible d\'accéder à la caméra. Veuillez vérifier vos permissions.');
      console.error('Erreur d\'accès à la caméra:', err);
    }
  };

  const takeSelfie = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Configurer le canvas pour capturer l'image
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    // Convertir en Blob puis en File
    canvas.toBlob(blob => {
      const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
      setFormData(prev => ({ ...prev, selfie_image: file }));
      
      // Créer un aperçu
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(prev => ({ ...prev, selfie: reader.result }));
      };
      reader.readAsDataURL(blob);
    }, 'image/jpeg', 0.8);
    
    // Arrêter la caméra
    const stream = video.srcObject;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Vérification finale
    if (!formData.id_card_number || !formData.id_card_image || !formData.selfie_image) {
      notifyError('Veuillez compléter toutes les étapes de vérification');
      return;
    }
    
    try {
      // Création d'un FormData pour l'envoi des fichiers
      const data = new FormData();
      data.append('id_card_number', formData.id_card_number);
      data.append('id_card_image', formData.id_card_image);
      data.append('selfie_image', formData.selfie_image);
      
      // Envoi au serveur
      await patchData('/accounts/verify-identity/', data);
      
      success('Votre demande de vérification a été soumise avec succès. Nous la traiterons dans les plus brefs délais.');
      navigate('/profile');
    } catch (err) {
      console.error('Erreur lors de la soumission:', err);
      notifyError('Une erreur est survenue lors de la soumission de votre demande de vérification.');
    }
  };

  // Variantes d'animation
  const pageVariants = {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 }
  };

  // Rendu des étapes
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div 
            key="step1"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">Étape 1: Informations d'identité</h2>
              <p className="text-gray-600 mt-2">
                Veuillez entrer le numéro de votre carte nationale d'identité
              </p>
            </div>
            
            <div className="p-6 bg-blue-50 rounded-lg text-blue-800 flex items-start mb-6">
              <FiInfo className="mt-1 mr-3 flex-shrink-0" />
              <div>
                <p className="font-medium">Pourquoi avons-nous besoin de vérifier votre identité ?</p>
                <p className="mt-1">
                  Pour garantir la sécurité de notre communauté, nous devons vérifier l'identité de tous nos utilisateurs. 
                  Vos informations seront traitées en toute confidentialité et ne seront utilisées qu'à des fins de vérification.
                </p>
              </div>
            </div>
            
            <Input
              label="Numéro de carte d'identité"
              name="id_card_number"
              value={formData.id_card_number}
              onChange={handleChange}
              placeholder="Entrez le numéro de votre CNI"
              required
            />
            
            <div className="pt-4 flex justify-end">
              <Button
                variant="primary"
                onClick={nextStep}
                icon={<FiChevronRight />}
                iconPosition="right"
              >
                Continuer
              </Button>
            </div>
          </motion.div>
        );
        
      case 2:
        return (
          <motion.div 
            key="step2"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">Étape 2: Photo de la CNI</h2>
              <p className="text-gray-600 mt-2">
                Téléchargez une photo claire et lisible de votre carte d'identité
              </p>
            </div>
            
            <div className="p-6 bg-yellow-50 rounded-lg text-yellow-800 mb-6">
              <p className="font-medium">Conseils pour une bonne photo :</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Assurez-vous que toutes les informations sont clairement lisibles</li>
                <li>Prenez la photo dans un environnement bien éclairé</li>
                <li>Évitez les reflets et les ombres sur le document</li>
                <li>La carte doit occuper la majeure partie de l'image</li>
              </ul>
            </div>
            
            <div className="flex flex-col items-center">
              {preview.id_card ? (
                <div className="relative mb-4">
                  <img 
                    src={preview.id_card} 
                    alt="Aperçu CNI" 
                    className="max-h-64 rounded-lg border"
                  />
                  <button
                    onClick={() => {
                      setFormData(prev => ({ ...prev, id_card_image: null }));
                      setPreview(prev => ({ ...prev, id_card: null }));
                    }}
                    className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => idCardInputRef.current.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-12 mb-4 text-center cursor-pointer hover:bg-gray-50"
                >
                  <FiUpload className="mx-auto text-gray-400" size={48} />
                  <p className="mt-4 text-gray-600">Cliquez pour télécharger la photo</p>
                  <p className="text-sm text-gray-500 mt-2">Formats acceptés: JPG, PNG, HEIC</p>
                </div>
              )}
              
              <input
                type="file"
                ref={idCardInputRef}
                onChange={(e) => handleImageUpload(e, 'id_card')}
                accept="image/*"
                className="hidden"
              />
              
              <Button
                variant={preview.id_card ? "secondary" : "primary"}
                onClick={() => idCardInputRef.current.click()}
                className="mt-4"
              >
                {preview.id_card ? "Changer la photo" : "Télécharger la photo"}
              </Button>
            </div>
            
            <div className="pt-4 flex justify-between">
              <Button
                variant="secondary"
                onClick={prevStep}
                icon={<FiChevronLeft />}
                iconPosition="left"
              >
                Retour
              </Button>
              <Button
                variant="primary"
                onClick={nextStep}
                icon={<FiChevronRight />}
                iconPosition="right"
                disabled={!formData.id_card_image}
              >
                Continuer
              </Button>
            </div>
          </motion.div>
        );
        case 3:
        return (
          <motion.div 
            key="step3"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">Étape 3: Selfie avec CNI</h2>
              <p className="text-gray-600 mt-2">
                Prenez un selfie en tenant votre carte d'identité à côté de votre visage
              </p>
            </div>
            
            <div className="p-6 bg-yellow-50 rounded-lg text-yellow-800 mb-6">
              <p className="font-medium">Conseils pour un bon selfie :</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Votre visage et la carte doivent être clairement visibles</li>
                <li>Prenez la photo dans un environnement bien éclairé</li>
                <li>Regardez droit vers la caméra avec une expression neutre</li>
                <li>Ne portez pas de lunettes de soleil ou de chapeau</li>
              </ul>
            </div>
            
            <div className="flex flex-col items-center">
              {showCamera ? (
                <div className="relative mb-4 w-full max-w-md">
                  <video 
                    ref={videoRef}
                    autoPlay 
                    playsInline
                    className="w-full rounded-lg border"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                    <Button
                      variant="primary"
                      onClick={takeSelfie}
                      className="px-6"
                    >
                      Prendre la photo
                    </Button>
                  </div>
                  
                  <button
                    onClick={() => {
                      if (videoRef.current && videoRef.current.srcObject) {
                        const stream = videoRef.current.srcObject;
                        stream.getTracks().forEach(track => track.stop());
                      }
                      setShowCamera(false);
                    }}
                    className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ) : preview.selfie ? (
                <div className="relative mb-4">
                  <img 
                    src={preview.selfie} 
                    alt="Aperçu Selfie" 
                    className="max-h-64 rounded-lg border"
                  />
                  <button
                    onClick={() => {
                      setFormData(prev => ({ ...prev, selfie_image: null }));
                      setPreview(prev => ({ ...prev, selfie: null }));
                    }}
                    className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ) : (
                <div className="mb-4 flex flex-col space-y-4 items-center">
                  <Button
                    variant="primary"
                    onClick={startCamera}
                    icon={<FiCamera />}
                  >
                    Utiliser la caméra
                  </Button>
                  
                  <div className="flex items-center">
                    <div className="border-t w-16 border-gray-300"></div>
                    <span className="mx-4 text-gray-500 text-sm">ou</span>
                    <div className="border-t w-16 border-gray-300"></div>
                  </div>
                  
                  <div 
                    onClick={() => selfieInputRef.current.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:bg-gray-50 w-full"
                  >
                    <FiUpload className="mx-auto text-gray-400" size={48} />
                    <p className="mt-4 text-gray-600">Télécharger une photo existante</p>
                  </div>
                </div>
              )}
              
              <input
                type="file"
                ref={selfieInputRef}
                onChange={(e) => handleImageUpload(e, 'selfie')}
                accept="image/*"
                className="hidden"
              />
              
              {preview.selfie && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, selfie_image: null }));
                    setPreview(prev => ({ ...prev, selfie: null }));
                  }}
                  className="mt-4"
                >
                  Prendre une autre photo
                </Button>
              )}
            </div>
            
            <div className="pt-4 flex justify-between">
              <Button
                variant="secondary"
                onClick={prevStep}
                icon={<FiChevronLeft />}
                iconPosition="left"
              >
                Retour
              </Button>
              <Button
                variant="primary"
                onClick={nextStep}
                icon={<FiChevronRight />}
                iconPosition="right"
                disabled={!formData.selfie_image}
              >
                Continuer
              </Button>
            </div>
          </motion.div>
        );
        
      case 4:
        return (
          <motion.div 
            key="step4"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">Vérification finale</h2>
              <p className="text-gray-600 mt-2">
                Vérifiez que toutes les informations sont correctes avant de soumettre
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-medium mb-4">Récapitulatif</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500">Numéro de carte d'identité</div>
                  <div className="font-medium">{formData.id_card_number}</div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-2">Photo de CNI</div>
                    {preview.id_card ? (
                      <img 
                        src={preview.id_card} 
                        alt="CNI" 
                        className="h-40 object-contain border rounded"
                      />
                    ) : (
                      <div className="text-red-600">Photo manquante</div>
                    )}
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500 mb-2">Selfie avec CNI</div>
                    {preview.selfie ? (
                      <img 
                        src={preview.selfie} 
                        alt="Selfie" 
                        className="h-40 object-contain border rounded"
                      />
                    ) : (
                      <div className="text-red-600">Photo manquante</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-blue-50 rounded-lg text-blue-800">
              <div className="flex items-start">
                <FiInfo className="mt-1 mr-3 flex-shrink-0" />
                <div>
                  <p className="font-medium">Prochaines étapes</p>
                  <p className="mt-1">
                    Après soumission, notre équipe examinera vos documents dans un délai de 24 à 48 heures. 
                    Vous recevrez une notification par email dès que votre identité sera vérifiée.
                  </p>
                </div>
              </div>
            </div>
            
            {error && (
              <div className="p-4 bg-red-50 rounded-lg text-red-700">
                {error}
              </div>
            )}
            
            <div className="pt-4 flex justify-between">
              <Button
                variant="secondary"
                onClick={prevStep}
                icon={<FiChevronLeft />}
                iconPosition="left"
              >
                Retour
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                icon={<FiCheck />}
                iconPosition="right"
                disabled={loading}
              >
                {loading ? "Soumission en cours..." : "Soumettre ma demande"}
              </Button>
            </div>
          </motion.div>
        );
        
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Vérification d'identité</h1>
            <p className="text-gray-600 mt-2">
              Pour assurer la sécurité de notre communauté, nous devons vérifier votre identité.
            </p>
          </div>
          
          {/* Indicateur de progression */}
          <div className="mb-10">
            <div className="flex justify-between mb-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div 
                  key={index} 
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    currentStep > index + 1 
                      ? 'bg-primary-600 text-white' 
                      : currentStep === index + 1 
                        ? 'bg-primary-100 text-primary-600 border border-primary-600' 
                        : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {currentStep > index + 1 ? <FiCheck /> : index + 1}
                </div>
              ))}
            </div>
            <div className="overflow-hidden h-2 mb-4 rounded-full bg-gray-200">
              <div 
                className="h-2 rounded-full bg-primary-600 transition-all duration-500 ease-out"
                style={{ width: `${(currentStep - 1) * 33.33}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Informations</span>
              <span>Photo CNI</span>
              <span>Selfie</span>
              <span>Confirmation</span>
            </div>
          </div>
          
          {/* Contenu de l'étape actuelle */}
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            {renderStep()}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default IdentityVerification;