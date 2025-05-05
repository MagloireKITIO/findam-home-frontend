// src/components/features/ReviewCard.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiStar, FiThumbsUp, FiThumbsDown, FiFlag, FiUser } from 'react-icons/fi';
import { Link } from 'react-router-dom';

import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

const ReviewCard = ({ 
  review, 
  showProperty = false,
  showDetailedRatings = false,
  allowVoting = true,
  allowReporting = true,
  className = '',
  onReported = null
}) => {
  const { currentUser } = useAuth();
  const { success, error } = useNotification();
  
  // États
  const [votes, setVotes] = useState({
    helpful: review?.helpful_votes || 0,
    unhelpful: review?.unhelpful_votes || 0
  });
  const [userVote, setUserVote] = useState(review?.user_vote || null);
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  // Formatage de la date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Gérer le vote sur un avis
  const handleVote = async (isHelpful) => {
    if (!currentUser) {
      error('Vous devez être connecté pour voter');
      return;
    }

    // Si l'utilisateur a déjà voté de la même manière, annuler son vote
    if (userVote === (isHelpful ? 'helpful' : 'unhelpful')) {
      try {
        await api.delete(`/reviews/votes/?review=${review.id}`);
        
        setVotes(prev => ({
          ...prev,
          [userVote]: prev[userVote] - 1
        }));
        setUserVote(null);
        
        success('Vote retiré');
      } catch (err) {
        console.error('Erreur lors du retrait du vote:', err);
        error('Une erreur est survenue lors du retrait de votre vote');
      }
      return;
    }

    // Si l'utilisateur a voté différemment avant, mettre à jour son vote
    try {
      const response = await api.post('/reviews/votes/', {
        review: review.id,
        is_helpful: isHelpful
      });
      
      const newVotes = { ...votes };
      
      // Si l'utilisateur avait déjà voté, retirer son ancien vote
      if (userVote) {
        newVotes[userVote] = newVotes[userVote] - 1;
      }
      
      // Ajouter le nouveau vote
      const newVoteType = isHelpful ? 'helpful' : 'unhelpful';
      newVotes[newVoteType] = newVotes[newVoteType] + 1;
      
      setVotes(newVotes);
      setUserVote(newVoteType);
      
      success('Vote enregistré');
    } catch (err) {
      console.error('Erreur lors du vote:', err);
      error('Une erreur est survenue lors de l\'enregistrement de votre vote');
    }
  };

  // Gérer le signalement d'un avis
  const handleReport = async () => {
    if (!currentUser) {
      error('Vous devez être connecté pour signaler un avis');
      return;
    }

    if (!reportReason) {
      error('Veuillez indiquer une raison pour le signalement');
      return;
    }

    setIsReporting(true);

    try {
      await api.post('/reviews/reported-reviews/', {
        review: review.id,
        reason: 'other', // Nous utilisons "other" comme raison par défaut et donnons les détails
        details: reportReason
      });
      
      success('Avis signalé avec succès');
      setIsReporting(false);
      setReportReason('');
      
      if (onReported) {
        onReported(review.id);
      }
    } catch (err) {
      console.error('Erreur lors du signalement:', err);
      error('Une erreur est survenue lors du signalement de cet avis');
      setIsReporting(false);
    }
  };

  // Vérifier si le commentaire est long et nécessite d'être tronqué
  const isCommentLong = review?.comment && review.comment.length > 200;
  const displayedComment = isCommentLong && !isExpanded 
    ? `${review.comment.substring(0, 200)}...` 
    : review.comment;

  return (
    <div className={`bg-white rounded-lg p-4 ${className}`}>
      {/* En-tête de l'avis */}
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-3">
          {review.reviewer_details?.profile?.avatar ? (
            <img 
              src={review.reviewer_details.profile.avatar} 
              alt={review.reviewer_details.first_name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <FiUser size={20} className="text-gray-500" />
          )}
        </div>
        
        <div>
          <div className="font-medium">
            {review.reviewer_details?.first_name} {review.reviewer_details?.last_name?.charAt(0)}.
          </div>
          <div className="text-sm text-gray-500">
            {formatDate(review.created_at)}
            {review.is_verified_stay && (
              <span className="ml-2 text-green-600">· Séjour vérifié</span>
            )}
          </div>
        </div>
      </div>
      
      {/* Détails de la propriété si nécessaire */}
      {showProperty && review.property && (
        <div className="mb-4 pb-4 border-b border-gray-200">
          <Link to={`/properties/${review.property}`} className="text-primary-600 hover:underline">
            {review.property_title}
          </Link>
          {review.stay_date && (
            <div className="text-sm text-gray-500 mt-1">
              Séjour en {new Date(review.stay_date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </div>
          )}
        </div>
      )}
      
      {/* Notes */}
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <div className="flex">
            {[...Array(5)].map((_, index) => (
              <FiStar
                key={index}
                className={index < review.rating ? "text-yellow-500 fill-current" : "text-gray-300"}
              />
            ))}
          </div>
          <span className="ml-2 font-medium">{review.rating}/5</span>
        </div>
        
        {/* Notes détaillées */}
        {showDetailedRatings && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            {review.cleanliness_rating && (
              <div className="text-sm">
                <span className="text-gray-600">Propreté:</span> {review.cleanliness_rating}/5
              </div>
            )}
            {review.location_rating && (
              <div className="text-sm">
                <span className="text-gray-600">Emplacement:</span> {review.location_rating}/5
              </div>
            )}
            {review.value_rating && (
              <div className="text-sm">
                <span className="text-gray-600">Rapport qualité-prix:</span> {review.value_rating}/5
              </div>
            )}
            {review.communication_rating && (
              <div className="text-sm">
                <span className="text-gray-600">Communication:</span> {review.communication_rating}/5
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Titre et commentaire */}
      {review.title && (
        <h3 className="font-medium mb-2">{review.title}</h3>
      )}
      
      <p className="text-gray-700 whitespace-pre-line">{displayedComment}</p>
      
      {isCommentLong && (
        <button 
          className="text-primary-600 text-sm mt-2"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Voir moins" : "Voir plus"}
        </button>
      )}
      
      {/* Images de l'avis */}
      {review.images && review.images.length > 0 && (
        <div className="mt-4 flex space-x-2 overflow-x-auto pb-2">
          {review.images.map((image, index) => (
            <img 
              key={index}
              src={image.image} 
              alt={image.caption || `Photo ${index + 1}`} 
              className="h-24 w-24 object-cover rounded-lg"
            />
          ))}
        </div>
      )}
      
      {/* Réponse du propriétaire */}
      {review.owner_reply && (
        <div className="mt-4 bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-2">
              {review.owner_reply.owner_details?.profile?.avatar ? (
                <img 
                  src={review.owner_reply.owner_details.profile.avatar} 
                  alt={review.owner_reply.owner_details.first_name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <FiUser size={16} className="text-gray-500" />
              )}
            </div>
            <div>
              <div className="font-medium text-sm">
                {review.owner_reply.owner_details?.first_name} {review.owner_reply.owner_details?.last_name?.charAt(0)}.
                <span className="ml-1 text-xs text-gray-500">(Propriétaire)</span>
              </div>
              <div className="text-xs text-gray-500">
                {formatDate(review.owner_reply.created_at)}
              </div>
            </div>
          </div>
          <p className="text-gray-700 text-sm">{review.owner_reply.content}</p>
        </div>
      )}
      
      {/* Actions (votes, signalement) */}
      {(allowVoting || allowReporting) && (
        <div className="mt-4 flex items-center justify-between">
          {allowVoting && (
            <div className="flex items-center space-x-4">
              <button 
                className={`flex items-center text-sm ${userVote === 'helpful' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => handleVote(true)}
              >
                <FiThumbsUp className="mr-1" />
                <span>Utile ({votes.helpful})</span>
              </button>
              
              <button 
                className={`flex items-center text-sm ${userVote === 'unhelpful' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => handleVote(false)}
              >
                <FiThumbsDown className="mr-1" />
                <span>Pas utile ({votes.unhelpful})</span>
              </button>
            </div>
          )}
          
          {allowReporting && (
            <div>
              {isReporting ? (
                <div className="flex items-center space-x-2">
                  <input 
                    type="text" 
                    value={reportReason} 
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder="Raison du signalement"
                    className="text-sm px-3 py-1 border border-gray-300 rounded"
                  />
                  <button 
                    className="text-sm text-primary-600 hover:underline"
                    onClick={handleReport}
                  >
                    Envoyer
                  </button>
                  <button 
                    className="text-sm text-gray-500 hover:underline"
                    onClick={() => {
                      setIsReporting(false);
                      setReportReason('');
                    }}
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <button 
                  className="flex items-center text-sm text-gray-500 hover:text-gray-700"
                  onClick={() => setIsReporting(true)}
                >
                  <FiFlag className="mr-1" />
                  <span>Signaler</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewCard;