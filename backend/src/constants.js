export const STATUT_CANDIDATURE = {
  NON_ENVOYE: 'non_envoye',
  ENVOYE: 'envoye',
  ECHEC: 'echec'
};

export const TYPE_CANDIDATURE = {
  RECRUTEMENT: 'recrutement',
  SPONTANEE: 'spontanee'
};

export const DB_CONFIG = {
  // Sera géré par des fichiers JSON si pas de MongoDB
  dataDir: './data'
};

export default {
  STATUT_CANDIDATURE,
  TYPE_CANDIDATURE,
  DB_CONFIG
};
