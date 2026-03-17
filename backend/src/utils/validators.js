export const validateEntreprise = (data) => {
  const errors = [];

  if (!data.nom_entreprise?.trim()) {
    errors.push('Le nom de l\'entreprise est requis');
  }
  
  if (!data.email?.trim()) {
    errors.push('L\'email est requis');
  } else if (!isValidEmail(data.email)) {
    errors.push('L\'email n\'est pas valide');
  }

  if (!data.ville?.trim()) {
    errors.push('La ville est requise');
  }

  if (!data.type_candidature) {
    errors.push('Le type de candidature est requis');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export default {
  validateEntreprise,
  isValidEmail
};
