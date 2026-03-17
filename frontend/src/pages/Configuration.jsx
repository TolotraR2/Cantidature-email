import React, { useState, useEffect } from 'react'
import { configAPI } from '../services/api.js'
import { Eye, EyeOff } from 'lucide-react'

export default function Configuration() {
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [appPassword, setAppPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadConfig()
    // Charger le mot de passe stocké localement
    const savedPassword = localStorage.getItem('gmail_app_password')
    if (savedPassword) {
      setAppPassword(savedPassword)
    }
  }, [])

  const loadConfig = async () => {
    try {
      const response = await configAPI.get()
      setConfig(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Erreur:', error)
      setError('Erreur lors du chargement de la configuration')
    }
  }

  const handleChange = (field, value) => {
    setConfig({ ...config, [field]: value })
    setSaved(false)
    setError('')
  }

  const handlePasswordChange = (value) => {
    setAppPassword(value)
    setSaved(false)
    setError('')
  }

  const handleCVUpload = async (e) => {
    try {
      const file = e.target.files?.[0]
      if (!file) return

      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setError('Seuls les fichiers PDF sont acceptés')
        return
      }

      const formData = new FormData()
      formData.append('cv', file)

      const response = await configAPI.uploadCV(formData)
      
      // Mettre à jour la config avec le chemin du CV
      setConfig({ ...config, cv_path: response.data.filename })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Erreur upload:', error)
      setError('Erreur lors de l\'upload du CV')
    }
  }

  const handleSave = async () => {
    try {
      if (appPassword.trim()) {
        // Sauvegarder le mot de passe localement
        localStorage.setItem('gmail_app_password', appPassword)
      } else {
        localStorage.removeItem('gmail_app_password')
      }

      await configAPI.update(config)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Erreur:', error)
      setError('Erreur lors de la sauvegarde')
    }
  }

  if (loading) return (
    <div className="text-center py-12">
      <p className="text-gray-600">Chargement...</p>
    </div>
  )

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="px-4 sm:px-0">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Configuration</h1>
        <p className="mt-2 text-gray-600 text-sm sm:text-base">Gérez vos paramètres personnels et vos identifiants</p>
      </div>

      {saved && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg text-sm sm:text-base">
          Configuration sauvegardée avec succès
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm sm:text-base">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Section Profil Personnel */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 border-b pb-4">Profil Personnel</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block font-semibold text-gray-700 mb-2 text-sm sm:text-base">Prénom</label>
              <input
                type="text"
                value={config?.prenom || ''}
                onChange={(e) => handleChange('prenom', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                placeholder="Votre prénom"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-2 text-sm sm:text-base">Nom</label>
              <input
                type="text"
                value={config?.nom || ''}
                onChange={(e) => handleChange('nom', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                placeholder="Votre nom"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-gray-700 mb-2 text-sm sm:text-base">Nom complet</label>
              <input
                type="text"
                value={config?.nom_complet || ''}
                onChange={(e) => handleChange('nom_complet', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                placeholder="Votre nom complet"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-2 text-sm sm:text-base">Email</label>
              <input
                type="email"
                value={config?.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                placeholder="votre.email@example.com"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-2 text-sm sm:text-base">Téléphone</label>
              <input
                type="tel"
                value={config?.telephone || ''}
                onChange={(e) => handleChange('telephone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                placeholder="+33 6 12 34 56 78"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-gray-700 mb-2 text-sm sm:text-base">Adresse</label>
              <textarea
                value={config?.adresse || ''}
                onChange={(e) => handleChange('adresse', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                placeholder="Votre adresse complète"
                rows="3"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-gray-700 mb-2 text-sm sm:text-base">Poste recherché</label>
              <input
                type="text"
                value={config?.poste_recherche || ''}
                onChange={(e) => handleChange('poste_recherche', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                placeholder="ex: Développeur Full Stack"
              />
            </div>
          </div>
        </div>

        {/* Section Email & Mot de passe */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Paramètres Email</h2>
            <p className="text-xs sm:text-sm text-gray-600">Pour envoyer vos candidatures, vous devez configurer un mot de passe d'application Gmail</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <p className="text-xs sm:text-sm text-blue-900">
              <strong>Note:</strong> Cet identifiant est stocké localement dans votre navigateur et jamais envoyé au serveur.
              <br/>
              <a href="https://support.google.com/accounts/answer/185833" target="_blank" rel="noopener noreferrer" className="underline text-blue-700">Créer un mot de passe d'application</a>
            </p>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-2 text-sm sm:text-base">Mot de passe d'application Gmail</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={appPassword}
                onChange={(e) => handlePasswordChange(e.target.value)}
                className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                placeholder="Entrez votre mot de passe d'application"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Section Lettre de Motivation */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 border-b pb-4">Lettre de Motivation</h2>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <p className="text-xs sm:text-sm text-blue-900">
              <strong>📝 Variables disponibles:</strong>
              <br/>
              {'{'}ENTREPRISE{'}'} - Nom de l'entreprise
              <br/>
              {'{'}VILLE{'}'} - Ville de l'entreprise
              <br/>
              {'{'}DATE{'}'} - Date d'aujourd'hui
              <br/>
              {'{'}NOM{'}'} - Votre nom
              <br/>
              {'{'}POSTE{'}'} - Le poste recherché
            </p>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-2 text-sm sm:text-base">Votre Lettre de Motivation</label>
            <textarea
              value={config?.lettre_motivation || ''}
              onChange={(e) => handleChange('lettre_motivation', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              placeholder="Rédigez votre lettre de motivation ici. Utilisez les variables ci-dessus pour personnaliser automatiquement les emails."
              rows={10}
            />
            <p className="text-xs text-gray-500 mt-2">Cette lettre sera envoyée automatiquement à toutes les entreprises</p>
          </div>
        </div>

        {/* Section CV Upload */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 border-b pb-4">Votre CV</h2>
          <p className="text-xs sm:text-sm text-gray-600">Téléchargez votre CV en PDF. Il sera joint automatiquement à chaque candidature</p>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-gray-700 mb-2 text-sm sm:text-base">Fichier CV (PDF)</label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleCVUpload}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
            {config?.cv_path && (
              <p className="text-xs text-green-600 mt-2">✓ CV sélectionné: {config.cv_path}</p>
            )}
          </div>
        </div>

        {/* Section Paramètres d'envoi */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 border-b pb-4">Paramètres d'Envoi</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block font-semibold text-gray-700 mb-2 text-sm sm:text-base">Délai entre envois (secondes)</label>
              <input
                type="number"
                min="1"
                max="300"
                value={config?.delai_entre_envois || 5}
                onChange={(e) => handleChange('delai_entre_envois', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
              <p className="text-xs text-gray-500 mt-1">Pause entre deux envois pour éviter le blocage</p>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-2 text-sm sm:text-base">Max envois par jour</label>
              <input
                type="number"
                min="1"
                max="500"
                value={config?.max_envois_par_jour || 50}
                onChange={(e) => handleChange('max_envois_par_jour', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
              <p className="text-xs text-gray-500 mt-1">Limite quotidienne de candidatures</p>
            </div>
          </div>
        </div>

        {/* Bouton Sauvegarder */}
        <button
          onClick={handleSave}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm sm:text-base active:scale-95"
        >
          Sauvegarder la configuration
        </button>
      </div>
    </div>
  )
}
