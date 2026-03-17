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
  update: (data) => client.put('/config', data),
  uploadCV: (formData) => {
    // Pour l'upload, nous créons une requête spéciale sans Content-Type
    return axios.post(
      `${API_BASE}/config/upload-cv`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
  }
}

// Emails
export const emailsAPI = {
  envoyer: (entrepriseId, appPassword) => client.post(`/emails/envoyer-candidature/${entrepriseId}`, { appPassword }),
  envoyerTous: (appPassword) => client.post('/emails/envoyer-toutes', { appPassword })
}

// Historique
export const historiqueAPI = {
  getAll: () => client.get('/historique'),
  getByEntreprise: (entrepriseId) => client.get(`/historique/entreprise/${entrepriseId}`)
}

export default client
