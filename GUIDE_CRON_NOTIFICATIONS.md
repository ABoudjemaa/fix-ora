# Guide : Système de Vérification Automatique des Notifications

## ✅ Ce qui a été créé

J'ai créé une **route API cron** qui vérifie automatiquement toutes les machines et envoie les notifications nécessaires.

**Route créée** : `/api/cron/check-notifications`

---

## 🔧 Configuration

### ⚠️ Limitation Vercel Hobby

Les comptes **Vercel Hobby** sont limités à **un seul cron job par jour maximum**. Pour des vérifications plus fréquentes (toutes les 5 minutes), utilisez **GitHub Actions** (gratuit) ou un autre service externe.

### Option 1 : GitHub Actions (Recommandé - Gratuit) ✅

**Solution recommandée** pour les vérifications toutes les 5 minutes.

Le fichier `.github/workflows/check-notifications.yml` est déjà configuré. Il vous suffit d'ajouter les secrets GitHub :

1. Allez dans votre repository GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Ajoutez ces secrets :
   - `APP_URL` : Votre URL Vercel (ex: `https://votre-app.vercel.app`)
   - `CRON_SECRET_KEY` : La même clé que dans votre `.env` (ex: `votre-cle-secrete-123`)

Le workflow s'exécutera automatiquement **toutes les 5 minutes** après le prochain push.

**Avantages** :
- ✅ Gratuit et illimité
- ✅ Vérifications toutes les 5 minutes
- ✅ Peut être déclenché manuellement depuis GitHub
- ✅ Logs disponibles dans GitHub Actions

### Option 2 : Vercel Cron (Backup quotidien)

Le fichier `vercel.json` est configuré pour un cron **quotidien à 9h00** (compatible avec le plan Hobby). Cela sert de backup si GitHub Actions échoue.

**Note** : Si vous avez un plan Vercel Pro, vous pouvez modifier `vercel.json` pour utiliser `*/5 * * * *` et désactiver GitHub Actions.

### Option 3 : Autres Services Cron Externes

Si vous n'êtes pas sur Vercel, vous pouvez utiliser un service externe pour appeler cette route périodiquement :

#### A. Cron-Job.org (Alternative gratuite)

Si vous préférez ne pas utiliser GitHub Actions :

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
- ✅ **GitHub Actions** : Vérifications automatiques toutes les 5 minutes (gratuit)
- ✅ **Vercel Cron** : Backup quotidien à 9h00 (compatible plan Hobby)
- ✅ Vous pouvez aussi tester manuellement en appelant la route

### 📋 Checklist de configuration

1. ✅ Fichier `.github/workflows/check-notifications.yml` créé
2. ✅ Fichier `vercel.json` configuré pour un cron quotidien
3. ⚠️ **À faire** : Ajouter les secrets GitHub (`APP_URL` et `CRON_SECRET_KEY`)
4. ⚠️ **À faire** : Pousser les changements sur GitHub

Plus besoin d'action manuelle ! 🎉

