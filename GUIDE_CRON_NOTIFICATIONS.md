# Guide : Système de Vérification Automatique des Notifications

## ✅ Ce qui a été créé

J'ai créé une **route API cron** qui vérifie automatiquement toutes les machines et envoie les notifications nécessaires.

**Route créée** : `/api/cron/check-notifications`

---

## 🔧 Configuration

### Option 1 : Vercel Cron (Recommandé si vous déployez sur Vercel)

Si vous déployez sur **Vercel**, le fichier `vercel.json` que j'ai créé configurera automatiquement un cron qui s'exécute **toutes les 5 minutes**.

**Aucune configuration supplémentaire nécessaire** - ça marchera automatiquement après le déploiement !

### Option 2 : Service Cron Externe

Si vous n'êtes pas sur Vercel, vous pouvez utiliser un service externe pour appeler cette route périodiquement :

#### A. GitHub Actions (Gratuit)

Créez `.github/workflows/check-notifications.yml` :

```yaml
name: Check Notifications
on:
  schedule:
    - cron: '*/5 * * * *'  # Toutes les 5 minutes
  workflow_dispatch:  # Permet de déclencher manuellement

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - name: Call API
        run: |
          curl -X GET "${{ secrets.APP_URL }}/api/cron/check-notifications?secret=${{ secrets.CRON_SECRET_KEY }}"
```

Dans les secrets GitHub :
- `APP_URL` : Votre URL (ex: `https://votre-app.vercel.app`)
- `CRON_SECRET_KEY` : Une clé secrète (ex: `votre-cle-secrete-123`)

#### B. EasyCron ou Cron-Job.org (Gratuit)

1. Créez un compte sur [cron-job.org](https://cron-job.org) ou [EasyCron](https://www.easycron.com)
2. Créez un nouveau job cron :
   - **URL** : `https://votre-app.com/api/cron/check-notifications?secret=VOTRE_CLE_SECRETE`
   - **Fréquence** : Toutes les 5 minutes (`*/5 * * * *`)
   - **Méthode** : GET

#### C. Script Node.js local (Pour développement)

Créez `scripts/run-cron.ts` :

```typescript
import { setInterval } from 'timers';

const API_URL = process.env.APP_URL || 'http://localhost:3000';
const SECRET = process.env.CRON_SECRET_KEY || '';

async function checkNotifications() {
  try {
    const response = await fetch(`${API_URL}/api/cron/check-notifications?secret=${SECRET}`);
    const data = await response.json();
    console.log('✅ Vérification terminée:', data);
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Exécuter toutes les 5 minutes
setInterval(checkNotifications, 5 * 60 * 1000);

// Exécuter immédiatement au démarrage
checkNotifications();

console.log('🔄 Cron démarré - Vérification toutes les 5 minutes');
```

Puis dans `package.json` :

```json
{
  "scripts": {
    "cron:dev": "tsx scripts/run-cron.ts"
  }
}
```

---

## 🔐 Sécurité

Pour protéger votre route cron, ajoutez une clé secrète dans votre `.env` :

```env
CRON_SECRET_KEY=votre-cle-secrete-tres-longue-et-aleatoire
```

Puis appelez la route avec :
```
GET /api/cron/check-notifications?secret=votre-cle-secrete-tres-longue-et-aleatoire
```

**⚠️ Important** : Si vous n'ajoutez pas `CRON_SECRET_KEY` dans `.env`, la route fonctionnera sans authentification (pour le développement local).

---

## 🧪 Test Manuel

Vous pouvez tester la route manuellement :

```bash
# Sans secret (si CRON_SECRET_KEY n'est pas défini)
curl http://localhost:3000/api/cron/check-notifications

# Avec secret
curl "http://localhost:3000/api/cron/check-notifications?secret=votre-cle"
```

Ou dans votre navigateur :
```
http://localhost:3000/api/cron/check-notifications?secret=votre-cle
```

---

## 📊 Réponse de l'API

La route retourne un JSON avec les résultats :

```json
{
  "success": true,
  "timestamp": "2025-01-02T14:30:00.000Z",
  "machinesChecked": 5,
  "notificationsCreated": 2,
  "details": [
    {
      "machineId": "abc-123",
      "machineName": "Machine 1",
      "notificationsCreated": 1
    },
    {
      "machineId": "def-456",
      "machineName": "Machine 2",
      "notificationsCreated": 1
    }
  ]
}
```

---

## ⚙️ Fréquence recommandée

- **Toutes les 5 minutes** : Pour des alertes rapides (comme votre test de 5 minutes)
- **Toutes les heures** : Pour la plupart des cas d'usage
- **Toutes les 6 heures** : Pour des alertes moins urgentes

Pour changer la fréquence dans `vercel.json` :

```json
{
  "crons": [
    {
      "path": "/api/cron/check-notifications",
      "schedule": "0 * * * *"  // Toutes les heures
    }
  ]
}
```

Format cron : `minute heure jour mois jour-semaine`
- `*/5 * * * *` = Toutes les 5 minutes
- `0 * * * *` = Toutes les heures
- `0 */6 * * *` = Toutes les 6 heures
- `0 9 * * *` = Tous les jours à 9h00

---

## 🎯 Résumé

**Avant** : Vous deviez toujours faire une action manuelle (modifier les heures d'opération, etc.)

**Maintenant** : 
- ✅ Si vous êtes sur **Vercel** : Ça marche automatiquement après déploiement
- ✅ Si vous êtes ailleurs : Configurez un service cron externe (GitHub Actions, cron-job.org, etc.)
- ✅ Vous pouvez aussi tester manuellement en appelant la route

Plus besoin d'action manuelle ! 🎉

