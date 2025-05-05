// src/hooks/useApi.js
import { useState, useCallback } from 'react';
import api from '../services/api';

/**
 * Hook personnalisé pour gérer les appels API avec gestion des états de chargement et des erreurs
 * @returns {Object} Objet contenant les fonctions fetchData, postData, putData, patchData, deleteData et les états loading et error
 */
const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Récupère des données depuis l'API
   * @param {string} url - L'URL de l'endpoint
   * @param {Object} params - Les paramètres de la requête
   * @returns {Promise<Object>} Les données de la réponse
   */
  const fetchData = useCallback(async (url, params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(url, { params });
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                           err.response?.data?.message || 
                           'Une erreur est survenue lors de la récupération des données.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Envoie des données à l'API avec la méthode POST
   * @param {string} url - L'URL de l'endpoint
   * @param {Object} data - Les données à envoyer
   * @returns {Promise<Object>} Les données de la réponse
   */
  const postData = useCallback(async (url, data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post(url, data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                           err.response?.data?.message || 
                           'Une erreur est survenue lors de l\'envoi des données.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Met à jour des données dans l'API avec la méthode PUT
   * @param {string} url - L'URL de l'endpoint
   * @param {Object} data - Les données à mettre à jour
   * @returns {Promise<Object>} Les données de la réponse
   */
  const putData = useCallback(async (url, data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.put(url, data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                           err.response?.data?.message || 
                           'Une erreur est survenue lors de la mise à jour des données.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Met à jour partiellement des données dans l'API avec la méthode PATCH
   * @param {string} url - L'URL de l'endpoint
   * @param {Object} data - Les données à mettre à jour
   * @returns {Promise<Object>} Les données de la réponse
   */
  const patchData = useCallback(async (url, data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.patch(url, data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                           err.response?.data?.message || 
                           'Une erreur est survenue lors de la mise à jour partielle des données.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Supprime des données dans l'API avec la méthode DELETE
   * @param {string} url - L'URL de l'endpoint
   * @returns {Promise<Object>} Les données de la réponse
   */
  const deleteData = useCallback(async (url) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.delete(url);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                           err.response?.data?.message || 
                           'Une erreur est survenue lors de la suppression des données.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchData,
    postData,
    putData,
    patchData,
    deleteData,
  };
};

export default useApi;