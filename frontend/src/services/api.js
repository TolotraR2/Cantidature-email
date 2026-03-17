import axios from 'axios'

// Use VITE_API_URL for production, fallback to /api for development
const API_BASE = import.meta.env.VITE_API_URL || '/api'

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Entreprises
export const entreprisesAPI = {
  getAll: (params) => client.get('/entreprises', { params }),
  getOne: (id) => client.get(`/entreprises/${id}`),
  create: (data) => client.post('/entreprises', data),
  update: (id, data) => client.put(`/entreprises/${id}`, data),
  delete: (id) => client.delete(`/entreprises/${id}`),
  getStats: () => client.get('/entreprises/stats')
}

// Templates
export const templatesAPI = {
  getAll: () => client.get('/templates'),
  getOne: (id) => client.get(`/templates/${id}`),
  create: (data) => client.post('/templates', data),
  update: (id, data) => client.put(`/templates/${id}`, data),
  delete: (id) => client.delete(`/templates/${id}`)
}

// Configuration
export const configAPI = {
  get: () => client.get('/config'),
  update: (data) => client.put('/config', data)
}

// Emails
export const emailsAPI = {
  envoyer: (entrepriseId, appPassword) => client.post(`/emails/envoyer-candidature/${entrepriseId}`, { appPassword }),
  envoyerTous: (appPassword) => client.post('/emails/envoyer-toutes', { appPassword }),
  telechargerLettre: (entrepriseId) => {
    // Pour le téléchargement de fichier
    return axios.get(
      `${API_BASE}/emails/lettre/${entrepriseId}`,
      { responseType: 'blob' }
    )
  }
}

// Historique
export const historiqueAPI = {
  getAll: () => client.get('/historique'),
  getByEntreprise: (entrepriseId) => client.get(`/historique/entreprise/${entrepriseId}`)
}

export default client
