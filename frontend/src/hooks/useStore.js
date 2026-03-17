import { create } from 'zustand'
import { entreprisesAPI, configAPI } from '../services/api.js'

export const useStore = create((set, get) => ({
  // State
  entreprises: [],
  config: null,
  loading: false,
  error: null,
  stats: {
    total: 0,
    envoyes: 0,
    non_envoyes: 0,
    echecs: 0
  },

  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Entreprises
  fetchEntreprises: async (params) => {
    set({ loading: true, error: null })
    try {
      const response = await entreprisesAPI.getAll(params)
      set({ entreprises: response.data.data, loading: false })
      return response.data.data
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  fetchStats: async () => {
    try {
      const response = await entreprisesAPI.getStats()
      set({ stats: response.data })
      return response.data
    } catch (error) {
      console.error('Erreur stats:', error)
    }
  },

  // Configuration
  fetchConfig: async () => {
    try {
      const response = await configAPI.get()
      set({ config: response.data })
      return response.data
    } catch (error) {
      console.error('Erreur config:', error)
    }
  },

  updateConfig: async (data) => {
    try {
      const response = await configAPI.update(data)
      set({ config: response.data })
      return response.data
    } catch (error) {
      set({ error: error.message })
    }
  }
}))
