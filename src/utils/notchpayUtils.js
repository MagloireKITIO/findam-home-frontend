// src/utils/notchpayUtils.js
// Utilitaires pour la gestion NotchPay côté frontend

/**
 * Validation des numéros de téléphone camerounais
 */
export const validateCameroonPhone = (phone) => {
    // Nettoyer le numéro (retirer espaces, tirets, parenthèses)
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    // Expressions régulières pour validation
    const patterns = [
      /^\+237[6][5-9]\d{7}$/, // Format international
      /^237[6][5-9]\d{7}$/,   // Sans le +
      /^[6][5-9]\d{7}$/       // Format local
    ];
    
    return patterns.some(pattern => pattern.test(cleanPhone));
  };
  
  /**
   * Formatage des numéros de téléphone
   */
  export const formatCameroonPhone = (phone) => {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    // Si le numéro commence par +237
    if (cleanPhone.startsWith('+237')) {
      return cleanPhone;
    }
    
    // Si le numéro commence par 237
    if (cleanPhone.startsWith('237')) {
      return `+${cleanPhone}`;
    }
    
    // Si le numéro commence par 6
    if (cleanPhone.startsWith('6') && cleanPhone.length === 9) {
      return `+237${cleanPhone}`;
    }
    
    return cleanPhone;
  };
  
  /**
   * Détection automatique de l'opérateur Mobile Money
   */
  export const detectMobileOperator = (phone) => {
    const cleanPhone = phone.replace(/[^\d]/g, '');
    
    // Extraire les deux premiers chiffres (après 237)
    let firstTwo = '';
    if (cleanPhone.startsWith('237')) {
      firstTwo = cleanPhone.substring(3, 5);
    } else if (cleanPhone.startsWith('6')) {
      firstTwo = cleanPhone.substring(0, 2);
    }
    
    // Détection de l'opérateur
    if (['69', '65'].includes(firstTwo)) {
      return {
        operator: 'orange',
        name: 'Orange Money',
        color: 'orange'
      };
    } else if (['67', '68', '66'].includes(firstTwo)) {
      return {
        operator: 'mtn',
        name: 'MTN MoMo',
        color: 'yellow'
      };
    }
    
    return {
      operator: null,
      name: 'Mobile Money',
      color: 'blue'
    };
  };
  
  /**
   * Masquage des numéros de téléphone
   */
  export const maskPhoneNumber = (phone) => {
    if (!phone || phone.length < 9) {
      return 'Numéro invalide';
    }
    
    const cleanPhone = phone.replace(/[^\d]/g, '');
    
    if (cleanPhone.length >= 9) {
      // Format: +237 XX***XXX
      if (cleanPhone.startsWith('237')) {
        return `+237 ${cleanPhone.substring(3, 5)}***${cleanPhone.substring(cleanPhone.length - 3)}`;
      } else if (cleanPhone.startsWith('6')) {
        return `+237 ${cleanPhone.substring(0, 2)}***${cleanPhone.substring(6)}`;
      }
    }
    
    return phone;
  };
  
  /**
   * Masquage des numéros de compte bancaire
   */
  export const maskAccountNumber = (accountNumber) => {
    if (!accountNumber || accountNumber.length < 4) {
      return 'Compte invalide';
    }
    
    const length = accountNumber.length;
    const visibleStart = Math.min(4, Math.floor(length / 4));
    const visibleEnd = Math.min(4, Math.floor(length / 4));
    
    return `${accountNumber.substring(0, visibleStart)}${'*'.repeat(length - visibleStart - visibleEnd)}${accountNumber.substring(length - visibleEnd)}`;
  };
  
  /**
   * Validation des informations de compte bancaire
   */
  export const validateBankAccount = (accountData) => {
    const errors = {};
    
    if (!accountData.account_number) {
      errors.account_number = 'Numéro de compte requis';
    } else if (accountData.account_number.length < 8) {
      errors.account_number = 'Numéro de compte trop court';
    }
    
    if (!accountData.account_name) {
      errors.account_name = 'Nom du titulaire requis';
    } else if (accountData.account_name.length < 2) {
      errors.account_name = 'Nom du titulaire trop court';
    }
    
    if (!accountData.bank_name) {
      errors.bank_name = 'Nom de la banque requis';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };
  
  /**
   * Obtenir la couleur d'un statut de méthode de paiement
   */
  export const getStatusColor = (status) => {
    const colors = {
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        icon: 'text-yellow-600'
      },
      verified: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: 'text-green-600'
      },
      failed: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: 'text-red-600'
      },
      disabled: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        icon: 'text-gray-600'
      }
    };
    
    return colors[status] || colors.pending;
  };
  
  /**
   * Formater l'affichage d'une méthode de paiement
   */
  export const formatPaymentMethodDisplay = (method) => {
    switch (method.payment_type) {
      case 'mobile_money':
        const operatorInfo = detectMobileOperator(method.phone_number || '');
        return {
          title: operatorInfo.name,
          subtitle: maskPhoneNumber(method.phone_number),
          icon: 'smartphone'
        };
        
      case 'bank_account':
        return {
          title: method.bank_name || 'Compte bancaire',
          subtitle: maskAccountNumber(method.account_number),
          icon: 'bank'
        };
        
      case 'credit_card':
        return {
          title: 'Carte bancaire',
          subtitle: `**** **** **** ${method.last_digits || '****'}`,
          icon: 'credit-card'
        };
        
      default:
        return {
          title: 'Méthode de paiement',
          subtitle: method.nickname || '',
          icon: 'credit-card'
        };
    }
  };
  
  /**
   * Obtenir l'URL d'icône pour un opérateur
   */
  export const getOperatorIconUrl = (operator) => {
    const baseUrl = '/images/operators/';
    
    switch (operator) {
      case 'orange':
        return `${baseUrl}orange-money.png`;
      case 'mtn':
        return `${baseUrl}mtn-momo.png`;
      default:
        return `${baseUrl}mobile-money.png`;
    }
  };
  
  /**
   * Formater la date de dernière vérification
   */
  export const formatLastVerification = (date) => {
    if (!date) return 'Jamais vérifiée';
    
    const now = new Date();
    const verificationDate = new Date(date);
    const diffInMs = now - verificationDate;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Aujourd\'hui';
    } else if (diffInDays === 1) {
      return 'Hier';
    } else if (diffInDays < 7) {
      return `Il y a ${diffInDays} jours`;
    } else {
      return verificationDate.toLocaleDateString('fr-FR');
    }
  };
  
  /**
   * Vérifier si une méthode peut être activée
   */
  export const canActivateMethod = (method) => {
    return method.status === 'verified' && !method.is_active;
  };
  
  /**
   * Vérifier si une méthode peut être vérifiée
   */
  export const canVerifyMethod = (method) => {
    return method.status !== 'verified' && method.verification_attempts < 3;
  };
  
  /**
   * Obtenir le message d'aide pour un statut
   */
  export const getStatusHelpMessage = (status, attempts = 0) => {
    switch (status) {
      case 'pending':
        return 'Vérification en cours avec NotchPay. Cela peut prendre quelques minutes.';
      case 'verified':
        return 'Cette méthode a été vérifiée et peut être utilisée pour recevoir des paiements.';
      case 'failed':
        if (attempts >= 3) {
          return 'Vérification échouée. Contactez le support pour obtenir de l\'aide.';
        }
        return 'Vérification échouée. Vérifiez les informations et réessayez.';
      case 'disabled':
        return 'Cette méthode a été désactivée et ne peut pas être utilisée.';
      default:
        return 'Statut inconnu';
    }
  };