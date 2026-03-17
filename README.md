# 📧 Job Auto Apply - Envoi Automatique de Candidatures

Application moderne pour automatiser l'envoi de candidatures à plusieurs entreprises. **100% responsive** (mobile, tablette, desktop) et **sécurisé** (authentification locale).

> **Version 2.0** : Lettre de motivation personnalisée, stockage sécurisé du mot de passe, responsive design complet.

---

## 🎯 Fonctionnalités

| Fonctionnalité | Description |
|---|---|
| 📋 **Gestion d'Entreprises** | Ajouter, modifier, supprimer, rechercher des entreprises |
| 📝 **Lettre de Motivation** | Rédigez une lettre unique avec variables ({ENTREPRISE}, {VILLE}, {DATE}, etc.) |
| 📧 **Envoi d'Emails** | Envoi unitaire ou en masse avec délai configurable |
| 📊 **Dashboard** | Statistiques en temps réel (graphiques, cartes) |
| 📜 **Historique** | Suivi complet des envois réussis/échoués |
| ⚙️ **Configuration** | Paramètres personnalisés + stockage sécurisé du mot de passe |
| 📱 **100% Responsive** | Mobile, tablette, desktop optimisés |
| 🔐 **Sécurité** | Mot de passe stocké localement (localStorage), jamais sur le serveur |

---

## 🛠️ Technologies

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool ultra-rapide
- **Tailwind CSS** - Design responsive
- **React Router DOM** - Navigation
- **Zustand** - State management
- **Recharts** - Graphiques
- **Lucide React** - Icons
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Web framework
- **Nodemailer** - Envoi d'emails
- **UUID** - ID uniques
- **JSON** - Stockage de données

---

## 🚀 Installation Rapide

### Prérequis
- **Node.js** 16+ ([télécharger](https://nodejs.org))
- **npm** ou **yarn**

### Étapes

```bash
# 1. Cloner/ouvrir le projet
cd email-en-masse-react

# 2. Installer les dépendances
npm install

# 3. Lancer l'application
npm run dev
```

**Résultat:**
- Frontend : http://localhost:5173
- Backend : http://localhost:3000

---

## ⚡ Configuration Gmail (Obligatoire)

Votre mot de passe d'application est stocké **localement dans votre navigateur**, jamais sur le serveur.

### Créer un Mot de Passe d'Application

1. Allez sur https://myaccount.google.com
2. **Sécurité** (menu gauche)
3. Activez **"Vérification en deux étapes"** (si besoin)
4. Cherchez **"Mots de passe d'application"** (tout en bas)
5. Sélectionnez :
   - **Logiciel** : Mail
   - **Appareil** : Windows/Mac/Linux
6. Cliquez **"Générer"**
7. Copiez le code **16 caractères** (sans espaces)

### Configurer dans l'App

1. Ouvrez l'app → **Configuration**
2. Collez le mot de passe dans **"Mot de passe d'application Gmail"**
3. Cliquez **"Sauvegarder"** ✅

**C'est fait!** Le mot de passe est stocké localement.

---

## 📋 Guide d'Utilisation

### 1️⃣ Remplir Votre Profil (Configuration)

Onglet **Configuration** :
- Nom complet
- Email Gmail
- Téléphone
- Adresse
- Poste recherché

### 2️⃣ Rédiger Votre Lettre de Motivation

Dans **Configuration** → **"Lettre de Motivation"** :

Rédigez votre lettre une fois. Les variables suivantes sont remplacées automatiquement :
- `{ENTREPRISE}` → Nom de l'entreprise
- `{VILLE}` → Ville
- `{DATE}` → Date du jour
- `{NOM}` → Votre nom
- `{POSTE}` → Votre poste recherché

**Exemple :**
```
Madame, Monsieur,

Je suis très intéressé par {ENTREPRISE} basée à {VILLE}.
Je suis candidat pour le poste de {POSTE}.

Cordialement,
{NOM}
```

Chaque email sera automatiquement personnalisé! 🎯

### 3️⃣ Ajouter des Entreprises

Onglet **Entreprises** → **+ Ajouter** :
- Nom entreprise
- Email de contact
- Ville
- Type : Recrutement / Spontanée

### 4️⃣ Envoyer des Candidatures

**Envoyer une :**
- Cliquez 📧 sur l'entreprise

**Envoyer toutes en masse :**
- Cliquez **📧 Envoyer tout**
- Envoi automatique avec délai (par défaut : 5 sec)
- Protection : max 50/jour (configurable)

### 5️⃣ Suivre l'Historique

Onglet **Historique** :
- Voir tous les envois
- Status : Succès / Échec
- Date/heure précise

### 6️⃣ Visualiser les Stats

**Tableau de Bord** :
- Total entreprises
- Envoyées / En attente
- Taux de succès
- Graphiques (pie chart)

---

## 📱 Responsive Design

L'app s'adapte automatiquement à votre appareil :

| Mobile | Tablette | Desktop |
|--------|----------|---------|
| Menu coulissant ☰ | Menu réduit | Sidebar fixe |
| Cartes une à une | Grille 2 colonnes | Tableaux complets |
| Boutons larges | Boutons adaptés | Actions compactes |

Testez sur votre téléphone ou avec DevTools (F12 → 📱).

---

## 🔒 Sécurité du Mot de Passe

### Où est stocké votre mot de passe?
✅ **Localement** dans votre navigateur (`localStorage`)
❌ **PAS** en dur dans le code
❌ **PAS** envoyé au serveur par défaut
❌ **PAS** en clair dans les fichiers

### Comment ça marche?
1. Vous saisissez le mot de passe dans Configuration
2. Votre navigateur le sauvegarde localement
3. Lors d'un envoi, il est inclus dans la requête
4. Le serveur l'utilise **uniquement pour cet envoi**
5. Le serveur ne le stocke jamais

### Conseils 🛡️

✅ **À faire:**
- Créer un mot de passe d'application spécial (pas votre vrai mot de passe Gmail)
- Ne pas cocher "Se souvenir" sur ordinateur partagé
- Vider localStorage régulièrement

❌ **À ne pas faire:**
- Partager votre mot de passe avec quelqu'un
- Le copier en clair dans un email
- Réutiliser ce mot de passe ailleurs

---

## ⚙️ Configuration Avancée

### Paramètres d'Envoi (Configuration)

| Paramètre | Défaut | Description |
|-----------|--------|-------------|
| **Délai entre envois** | 5 sec | Pause entre emails (évite spam) |
| **Max envois/jour** | 50 | Limite quotidienne (protection compte) |

### Variables d'Environnement (Optionnel)

Backend (`.env`) :
```env
PORT=3000
NODE_ENV=development
```

Pas besoin de stocker email/mot de passe en .env! 🔐

---

## 📁 Structure du Projet

```
📦 email-en-masse-react/
├── 📂 frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.jsx          # Layout + menu mobile
│   │   ├── pages/
│   │   │   ├── Configuration.jsx   # 🔐 Lettre de motivation + mot de passe
│   │   │   ├── Entreprises.jsx     # CRUD entreprises (responsive)
│   │   │   ├── Dashboard.jsx       # Statistiques et graphiques
│   │   │   ├── Historique.jsx      # Suivi des envois
│   │   ├── services/
│   │   │   └── api.js             # Appels API
│   │   ├── hooks/
│   │   │   └── useStore.js        # Zustand store
│   │   ├── App.jsx                # Routes
│   │   └── main.jsx               # Entry point
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── 📂 backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── emails.js          # 📧 Envoi avec lettre personnalisée
│   │   │   ├── entreprises.js     # CRUD
│   │   │   ├── config.js          # Configuration
│   │   │   └── historique.js      # Historique
│   │   ├── controllers/
│   │   │   └── entreprisesController.js
│   │   ├── utils/
│   │   │   ├── emailService.js    # Nodemailer
│   │   │   ├── pdfGenerator.js    # PDF
│   │   │   └── validators.js      # Validation
│   │   ├── models/
│   │   │   └── fileDb.js          # Lecture/écriture JSON
│   │   ├── server.js              # Server Express
│   │   └── constants.js           # Constantes
│   ├── data/                      # Données JSON
│   │   ├── entreprises.json
│   │   ├── config.json
│   │   ├── historique.json
│   │   └── templates.json
│   ├── package.json
│   └── .env (optionnel)
│
└── README.md (CE FICHIER!)
```

---

## 🐛 Dépannage

### ❌ "Erreur: Mot de passe manquant"
→ Allez dans **Configuration** et collez le mot de passe d'application

### ❌ "Erreur: Identifiants Gmail"
→ Vérifiez votre email dans Configuration

### ❌ Email ne s'envoie pas
→ **Checklist:**
1. Mot de passe d'application configuré? ✓
2. Email de l'entreprise correct? ✓
3. Lettre de motivation remplie? ✓
4. Connexion internet? ✓
5. Vérifiez le spam 📧

### ❌ L'app ne démarre pas
```bash
# Réinstaller les dépendances
npm install

# Vérifier les ports
# Port 3000 (backend) disponible?
# Port 5173 (frontend) disponible?
```

### ❌ Backend tourne pas
```bash
cd backend
npm start    # ou npm run dev
```

---

## 🚀 Fonctionnalités Avancées

### Éditer une Entreprise
1. Onglet **Entreprises**
2. Cliquez ✏️ **Modifier** sur une ligne
3. Changez les infos
4. Cliquez **Mettre à jour** ✅

### Rechercher une Entreprise
- Utilisez la barre de recherche
- Recherche par nom, email, ou ville

### Exports (Historique)
- Consultez l'onglet **Historique**
- Voir toutes les candidatures envoyées

---

## 📚 FAQ

**Q: Mon mot de passe Gmail est-il sûr?**
R: Oui! Il ne figure que dans le localStorage de votre navigateur. Jamais sur le serveur.

**Q: Puis-je modifier les emails après envoi?**
R: Non, mais vous pouvez modifier la lettre dans Configuration pour les prochains envois.

**Q: Combien d'emails puis-je envoyer?**
R: Par défaut 50/jour (configurable). Gmail peut bloquer au-delà.

**Q: La lettre est-elle vraiment personnalisée?**
R: Oui! Les variables `{ENTREPRISE}`, `{VILLE}`, etc. sont remplacées pour chaque email.

**Q: Je peux utiliser autre chose que Gmail?**
R: Actuellement, seul Gmail est configuré. Extension possible.

---

## 📞 Besoin d'Aide?

1. Vérifiez ce README 📖
2. Consultez l'**Historique** pour les erreurs d'envoi
3. Vérifiez les logs du backend (terminal)
4. Testez avec une entreprise de test d'abord

---

## 📄 Licence

MIT

## ✨ Dernières Améliorations (v2.0)

- ✅ Lettre de motivation personnalisée avec variables
- ✅ Mot de passe stocké localement (localStorage)
- ✅ 100% responsive design (mobile/tablette/desktop)
- ✅ CRUD complet pour entreprises (ajouter/modifier/supprimer)
- ✅ Menu mobile coulissant
- ✅ Cartes adaptatives sur mobile
- ✅ Boutons tactiles optimisés

---

**Bienvenue dans JobAutoApply!** 🎉 Bonne chance avec vos candidatures! 🚀
