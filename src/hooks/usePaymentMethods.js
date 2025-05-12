// src/hooks/usePaymentMethods.js
// Hook personnalisé pour gérer les méthodes de paiement

import { useState, useCallback } from 'react';
import { useNotification } from '../context/NotificationContext';
import useApi from './useApi';

const usePaymentMethods = () => {
  const { fetchData, postData, patchData, deleteData, loading } = useApi();
  const { success, error: notifyError } = useNotification();
  
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [activeMethod, setActiveMethod] = useState(null);
  const [summary, setSummary] = useState(null);

  // Charger toutes les méthodes de paiement
  const loadPaymentMethods = useCallback(async () => {
    try {
      const data = await fetchData('/payments/payment-methods/');
      setPaymentMethods(data.results || data);
      
      // Identifier la méthode active
      const active = data.results ? 
        data.results.find(method => method.is_active) : 
        data.find(method => method.is_active);
      setActiveMethod(active);
      
      return data;
    } catch (err) {
      console.error('Erreur lors du chargement des méthodes:', err);
      notifyError('Erreur lors du chargement des méthodes de paiement');
      throw err;
    }
  }, [fetchData, notifyError]);

  // Charger le résumé des méthodes
  const loadSummary = useCallback(async () => {
    try {
      const data = await fetchData('/payments/payment-methods/summary/');
      setSummary(data);
      return data;
    } catch (err) {
      console.error('Erreur lors du chargement du résumé:', err);
      throw err;
    }
  }, [fetchData]);

  // Ajouter une nouvelle méthode
  const addPaymentMethod = useCallback(async (methodData) => {
    try {
      console.log('Données envoyées:', methodData); // Debug
      const newMethod = await postData('/payments/payment-methods/', methodData);
      success('Méthode de paiement ajoutée avec succès. Vérification en cours...');
      
      // Recharger les données
      await Promise.all([loadPaymentMethods(), loadSummary()]);
      
      return newMethod;
    } catch (err) {
      console.error('Erreur lors de l\'ajout:', err);
      console.error('Response data:', err.response?.data); // Debug
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.non_field_errors?.[0] ||
                          'Erreur lors de l\'ajout de la méthode de paiement';
      notifyError(errorMessage);
      throw err;
    }
  }, [postData, success, notifyError, loadPaymentMethods, loadSummary]);

  // Activer une méthode
  const activateMethod = useCallback(async (methodId) => {
    try {
      await postData(`/payments/payment-methods/${methodId}/activate/`);
      success('Méthode de paiement activée avec succès');
      
      // Recharger les données
      await Promise.all([loadPaymentMethods(), loadSummary()]);
    } catch (err) {
      console.error('Erreur lors de l\'activation:', err);
      notifyError(err.response?.data?.detail || 'Erreur lors de l\'activation');
      throw err;
    }
  }, [postData, success, notifyError, loadPaymentMethods, loadSummary]);

  // Désactiver une méthode
  const deactivateMethod = useCallback(async (methodId) => {
    try {
      await postData(`/payments/payment-methods/${methodId}/deactivate/`);
      success('Méthode de paiement désactivée');
      
      // Recharger les données
      await Promise.all([loadPaymentMethods(), loadSummary()]);
    } catch (err) {
      console.error('Erreur lors de la désactivation:', err);
      notifyError(err.response?.data?.detail || 'Erreur lors de la désactivation');
      throw err;
    }
  }, [postData, success, notifyError, loadPaymentMethods, loadSummary]);

  // Vérifier une méthode
  const verifyMethod = useCallback(async (methodId) => {
    try {
      const result = await postData(`/payments/payment-methods/${methodId}/verify/`);
      success(result.verification_success ? 'Vérification réussie' : 'Vérification en cours');
      
      // Recharger les données
      await Promise.all([loadPaymentMethods(), loadSummary()]);
      
      return result;
    } catch (err) {
      console.error('Erreur lors de la vérification:', err);
      notifyError(err.response?.data?.detail || 'Erreur lors de la vérification');
      throw err;
    }
  }, [postData, success, notifyError, loadPaymentMethods, loadSummary]);

  // Définir comme méthode par défaut
  const setDefaultMethod = useCallback(async (methodId) => {
    try {
      await postData(`/payments/payment-methods/${methodId}/set_default/`);
      success('Méthode définie comme méthode par défaut');
      
      // Recharger les données
      await loadPaymentMethods();
    } catch (err) {
      console.error('Erreur lors de la définition par défaut:', err);
      notifyError(err.response?.data?.detail || 'Erreur lors de la définition comme méthode par défaut');
      throw err;
    }
  }, [postData, success, notifyError, loadPaymentMethods]);

  // Supprimer une méthode
  const deleteMethod = useCallback(async (methodId) => {
    try {
      await deleteData(`/payments/payment-methods/${methodId}/`);
      success('Méthode de paiement supprimée avec succès');
      
      // Recharger les données
      await Promise.all([loadPaymentMethods(), loadSummary()]);
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      notifyError(err.response?.data?.detail || 'Erreur lors de la suppression');
      throw err;
    }
  }, [deleteData, success, notifyError, loadPaymentMethods, loadSummary]);

  // Mettre à jour une méthode
  const updateMethod = useCallback(async (methodId, updateData) => {
    try {
      const updatedMethod = await patchData(`/payments/payment-methods/${methodId}/`, updateData);
      success('Méthode mise à jour avec succès');
      
      // Recharger les données
      await loadPaymentMethods();
      
      return updatedMethod;
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
      notifyError(err.response?.data?.detail || 'Erreur lors de la mise à jour');
      throw err;
    }
  }, [patchData, success, notifyError, loadPaymentMethods]);

  // Vérifier le statut d'une méthode
  const checkMethodStatus = useCallback(async (methodId) => {
    try {
      const status = await fetchData(`/payments/payment-methods/${methodId}/verify_status/`);
      return status;
    } catch (err) {
      console.error('Erreur lors de la vérification du statut:', err);
      throw err;
    }
  }, [fetchData]);

  return {
    // État
    paymentMethods,
    activeMethod,
    summary,
    loading,
    
    // Actions
    loadPaymentMethods,
    loadSummary,
    addPaymentMethod,
    activateMethod,
    deactivateMethod,
    verifyMethod,
    setDefaultMethod,
    deleteMethod,
    updateMethod,
    checkMethodStatus
  };
};

export default usePaymentMethods;