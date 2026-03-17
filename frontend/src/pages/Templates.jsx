import React, { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { templatesAPI } from '../services/api.js'

export default function Templates() {
  const [templates, setTemplates] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ nom: '', description: '', contenu: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const response = await templatesAPI.getAll()
      setTemplates(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Erreur:', error)
      setError('Erreur lors du chargement des templates')
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      await templatesAPI.create(formData)
      setFormData({ nom: '', description: '', contenu: '' })
      setShowForm(false)
      setError('')
      await loadTemplates()
    } catch (error) {
      console.error('Erreur:', error)
      setError('Erreur lors de la création du template')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Confirmer la suppression ?')) {
      try {
        await templatesAPI.delete(id)
        await loadTemplates()
        setError('')
      } catch (error) {
        console.error('Erreur:', error)
        setError('Erreur lors de la suppression')
      }
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <p className="text-gray-600">Chargement...</p>
    </div>
  )

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestion des templates</h1>
          <p className="text-sm text-gray-600 mt-1">{templates.length} template(s)</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition font-semibold text-sm sm:text-base"
        >
          <Plus className="w-4 h-4" /> Ajouter template
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h3 className="text-lg font-bold mb-4">Créer un nouveau template</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-2 text-sm sm:text-base">Nom du template</label>
              <input
                type="text"
                placeholder="ex: Candidature spontanée tech"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-2 text-sm sm:text-base">Description</label>
              <input
                type="text"
                placeholder="Brève description du template"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-2 text-sm sm:text-base">Contenu</label>
              <p className="text-xs text-gray-600 mb-2">Utilisez les variables: {'{entreprise}'}, {'{ville}'}, {'{date}'}</p>
              <textarea
                placeholder="Rédigez votre contenu..."
                value={formData.contenu}
                onChange={(e) => setFormData({ ...formData, contenu: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                rows={6}
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition font-semibold text-sm"
              >
                 Créer template
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setFormData({ nom: '', description: '', contenu: '' })
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition font-semibold text-sm"
              >
                 Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {templates.length === 0 && !showForm ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600 mb-3">Aucun template créé</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 text-sm font-semibold transition"
          >
            <Plus className="w-4 h-4" /> Créer un template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {templates.map(t => (
            <div key={t.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-4 sm:p-6 flex flex-col">
              <h3 className="font-bold text-lg text-gray-900 mb-2">{t.nom}</h3>
              <p className="text-gray-600 text-sm mb-3">{t.description}</p>
              <p className="text-gray-700 text-sm mb-4 flex-grow line-clamp-4 bg-gray-50 p-3 rounded">{t.contenu}</p>
              <button
                onClick={() => handleDelete(t.id)}
                className="text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-2 rounded transition flex items-center justify-center gap-2 font-semibold text-sm"
              >
                <Trash2 className="w-4 h-4" /> Supprimer
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
