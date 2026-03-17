import React, { useState, useEffect } from 'react'
import { historiqueAPI } from '../services/api.js'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function Historique() {
  const [historique, setHistorique] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHistorique()
  }, [])

  const loadHistorique = async () => {
    try {
      const response = await historiqueAPI.getAll()
      setHistorique(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <p className="text-gray-600">Chargement...</p>
    </div>
  )

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Historique des envois</h1>
        <p className="text-sm text-gray-600 mt-1">{historique.length} envoi(s)</p>
      </div>

      {historique.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">Aucun historique d'envoi pour le moment.</p>
          <p className="text-sm text-gray-500">Les envois apparaitront ici une fois que vous enverrez des candidatures.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold">Entreprise</th>
                    <th className="px-6 py-3 text-left font-semibold">Statut</th>
                    <th className="px-6 py-3 text-left font-semibold">Message</th>
                    <th className="px-6 py-3 text-left font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {historique.map((h, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50 transition">
                      <td className="px-6 py-3 font-medium">{h.entreprise_nom}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${h.statut === 'succes' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {h.statut}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-600">{h.message}</td>
                      <td className="px-6 py-3 text-gray-500 text-sm">
                        {format(new Date(h.date_envoi), 'dd MMM yyyy HH:mm', { locale: fr })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {historique.map((h, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{h.entreprise_nom}</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      {format(new Date(h.date_envoi), 'dd MMM yyyy HH:mm', { locale: fr })}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ml-2 ${h.statut === 'succes' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {h.statut}
                  </span>
                </div>
                <div className="border-t pt-2">
                  <p className="text-sm text-gray-600">{h.message}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
