import React, { useState, useEffect } from 'react'
import { useStore } from '../hooks/useStore.js'
import { Plus, Edit2, Trash2, Mail, Search } from 'lucide-react'
import { entreprisesAPI, emailsAPI } from '../services/api.js'

export default function Entreprises() {
  const { entreprises, fetchEntreprises } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [recherche, setRecherche] = useState('')
  const [formData, setFormData] = useState({ nom_entreprise: '', email: '', ville: '', type_candidature: 'recrutement' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadData = async () => {
      await fetchEntreprises()
      setLoading(false)
    }
    loadData()
  }, [])

  const filtred = entreprises.filter(e =>
    e.nom_entreprise.toLowerCase().includes(recherche.toLowerCase()) ||
    e.email.toLowerCase().includes(recherche.toLowerCase()) ||
    e.ville.toLowerCase().includes(recherche.toLowerCase())
  )

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        // Mise à jour
        await entreprisesAPI.update(editingId, formData)
        setError('')
      } else {
        // Création
        await entreprisesAPI.create(formData)
        setError('')
      }
      setFormData({ nom_entreprise: '', email: '', ville: '', type_candidature: 'recrutement' })
      setShowForm(false)
      setEditingId(null)
      await fetchEntreprises()
    } catch (error) {
      console.error('Erreur:', error)
      setError('Erreur lors de l\'opération')
    }
  }

  const handleEdit = (entreprise) => {
    setFormData({
      nom_entreprise: entreprise.nom_entreprise,
      email: entreprise.email,
      ville: entreprise.ville,
      type_candidature: entreprise.type_candidature
    })
    setEditingId(entreprise.id)
    setShowForm(true)
    setError('')
  }

  const handleCancel = () => {
    setFormData({ nom_entreprise: '', email: '', ville: '', type_candidature: 'recrutement' })
    setShowForm(false)
    setEditingId(null)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Confirmer la suppression ?')) {
      try {
        await entreprisesAPI.delete(id)
        await fetchEntreprises()
      } catch (error) {
        console.error('Erreur:', error)
        setError('Erreur lors de la suppression')
      }
    }
  }

  const handleSendEmail = async (id) => {
    try {
      const password = localStorage.getItem('gmail_app_password')
      if (!password) {
        setError('Veuillez configurer votre mot de passe d\'application Gmail')
        return
      }
      await emailsAPI.envoyer(id, password)
      await fetchEntreprises()
      alert('✅ Email envoyé avec succès')
      setError('')
    } catch (error) {
      console.error('Erreur:', error)
      setError('Erreur lors de l\'envoi: ' + error.response?.data?.error || error.message)
    }
  }

  const handleSendAll = async () => {
    if (window.confirm('Envoyer les candidatures à toutes les entreprises non contactées ?')) {
      try {
        const password = localStorage.getItem('gmail_app_password')
        if (!password) {
          setError('Veuillez configurer votre mot de passe d\'application Gmail')
          return
        }
        const result = await emailsAPI.envoyerTous(password)
        alert(`✅ ${result.data.sent} envoyées\n❌ ${result.data.failed} échouées`)
        await fetchEntreprises()
        setError('')
      } catch (error) {
        console.error('Erreur:', error)
        setError('Erreur lors de l\'envoi en masse')
      }
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <p className="text-gray-600">Chargement...</p>
    </div>
  )

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestion des entreprises</h1>
          <p className="text-sm text-gray-600 mt-1">{filtred.length} entreprise(s) affichée(s)</p>
        </div>
        <button
          onClick={handleSendAll}
          className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition font-semibold text-sm sm:text-base"
        >
          Envoyer tout
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
           {error}
        </div>
      )}

      {/* Barre de recherche */}
      <div className="bg-white rounded-lg shadow p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition font-semibold text-sm sm:text-base"
        >
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-lg font-bold mb-4">{editingId ? '✏️ Modifier l\'entreprise' : '➕ Ajouter une entreprise'}</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nom entreprise"
                value={formData.nom_entreprise}
                onChange={(e) => setFormData({ ...formData, nom_entreprise: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                required
              />
              <input
                type="text"
                placeholder="Ville"
                value={formData.ville}
                onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                required
              />
              <select
                value={formData.type_candidature}
                onChange={(e) => setFormData({ ...formData, type_candidature: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="recrutement">Recrutement</option>
                <option value="spontanee">Spontanée</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition font-semibold text-sm">
                {editingId ? '✅ Mettre à jour' : '✅ Ajouter'}
              </button>
              <button type="button" onClick={handleCancel} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition font-semibold text-sm">
                ❌ Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Affichage desktop - Table */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Entreprise</th>
                <th className="px-6 py-3 text-left font-semibold">Email</th>
                <th className="px-6 py-3 text-left font-semibold">Ville</th>
                <th className="px-6 py-3 text-left font-semibold">Type</th>
                <th className="px-6 py-3 text-left font-semibold">Statut</th>
                <th className="px-6 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtred.map(e => (
                <tr key={e.id} className="border-b hover:bg-gray-50 transition">
                  <td className="px-6 py-3 font-medium">{e.nom_entreprise}</td>
                  <td className="px-6 py-3 text-gray-600 text-xs sm:text-sm break-all">{e.email}</td>
                  <td className="px-6 py-3">{e.ville}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${e.type_candidature === 'recrutement' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                      {e.type_candidature}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${e.statut === 'envoye' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {e.statut}
                    </span>
                  </td>
                  <td className="px-6 py-3 flex gap-2">
                    <button onClick={() => handleSendEmail(e.id)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition" title="Envoyer">
                      <Mail className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleEdit(e)} className="p-2 text-gray-600 hover:bg-gray-100 rounded transition" title="Modifier">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(e.id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition" title="Supprimer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Affichage mobile - Cartes */}
      <div className="md:hidden space-y-3">
        {filtred.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-600">
            Aucune entreprise trouvée
          </div>
        ) : (
          filtred.map(e => (
            <div key={e.id} className="bg-white rounded-lg shadow p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{e.nom_entreprise}</h3>
                  <p className="text-xs text-gray-600 break-all">{e.email}</p>
                </div>
                <span className={`ml-2 px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${e.statut === 'envoye' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {e.statut}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Ville</p>
                  <p className="font-medium">{e.ville}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Type</p>
                  <span className={`px-2 py-1 rounded text-xs font-medium inline-block ${e.type_candidature === 'recrutement' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                    {e.type_candidature}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <button onClick={() => handleSendEmail(e.id)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-semibold transition flex items-center justify-center gap-1">
                  <Mail className="w-4 h-4" /> Envoyer
                </button>
                <button onClick={() => handleEdit(e)} className="flex-1 bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 rounded text-sm font-semibold transition flex items-center justify-center gap-1">
                  <Edit2 className="w-4 h-4" /> Modifier
                </button>
                <button onClick={() => handleDelete(e.id)} className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-semibold transition flex items-center justify-center gap-1">
                  <Trash2 className="w-4 h-4" /> Supp
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
