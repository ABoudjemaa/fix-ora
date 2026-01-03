# Tester le Cron Localement

## 🚀 Démarrage rapide

### Étape 1 : Démarrer votre serveur Next.js

Dans un premier terminal :

```bash
npm run dev
```

Votre serveur doit tourner sur `http://localhost:3000`

### Étape 2 : Démarrer le cron local

Dans un **deuxième terminal** :

```bash
npm run cron:dev
```

Le cron va :
- ✅ Vérifier toutes les notifications **immédiatement**
- ✅ Puis vérifier **toutes les 5 minutes** automatiquement
- ✅ Afficher les résultats dans la console

### Étape 3 : Arrêter le cron

Appuyez sur **Ctrl+C** dans le terminal du cron pour l'arrêter.

---

## 📊 Exemple de sortie

```
🚀 Démarrage du cron local...
📍 URL: http://localhost:3000/api/cron/check-notifications
⏰ Fréquence: Toutes les 5 minutes

💡 Appuyez sur Ctrl+C pour arrêter

🔄 [14:30:00] Vérification des notifications...
✅ Vérification terminée:
   - Machines vérifiées: 3
   - Notifications créées: 1
   - Détails:
     • Machine Test: 1 notification(s)

🔄 [14:35:00] Vérification des notifications...
✅ Vérification terminée:
   - Machines vérifiées: 3
   - Notifications créées: 0
```

---

## 🧪 Test complet : Vérifier une alerte dans 5 minutes

### 1. Configurez une machine pour le test

Allez sur : `http://localhost:3000/dashboard/machines/[id]/edit`

- **Heures d'avance de notification** : `0.083`
- Ajoutez une maintenance avec :
  - **Intervalle** : `100` heures
  - **Date du dernier remplacement** : Il y a 99.917 heures (≈ 4 jours)

### 2. Démarrez le cron

```bash
npm run cron:dev
```

### 3. Attendez 5 minutes

Le cron vérifiera automatiquement et enverra l'email quand la maintenance sera due !

---

## ⚙️ Configuration optionnelle

### Changer la fréquence

Modifiez `scripts/run-cron-local.ts` :

```typescript
// Toutes les 5 minutes (par défaut)
setInterval(checkNotifications, 5 * 60 * 1000);

// Toutes les minutes (pour tester plus vite)
setInterval(checkNotifications, 60 * 1000);

// Toutes les 30 secondes (pour tester très vite)
setInterval(checkNotifications, 30 * 1000);
```

### Ajouter une clé secrète

Dans votre `.env` :

```env
CRON_SECRET_KEY=ma-cle-secrete-123
```

Le script utilisera automatiquement cette clé.

---

## 🔍 Dépannage

### Le cron ne trouve pas le serveur

Vérifiez que votre serveur Next.js tourne sur `http://localhost:3000`

Ou définissez l'URL dans `.env` :

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Aucune notification n'est créée

- Vérifiez que vous avez des machines avec des maintenances
- Vérifiez que les dates de remplacement sont correctes
- Regardez les logs du serveur Next.js pour voir les erreurs

### Le cron s'arrête tout seul

C'est normal si vous fermez le terminal. Relancez simplement :

```bash
npm run cron:dev
```

---

## 💡 Astuce

Pour tester **immédiatement** sans attendre 5 minutes :

1. Modifiez temporairement `scripts/run-cron-local.ts` pour vérifier toutes les 30 secondes
2. Ou appelez manuellement : `http://localhost:3000/api/cron/check-notifications`

---

## 📝 Résumé

**Deux terminaux nécessaires** :

1. **Terminal 1** : `npm run dev` (serveur Next.js)
2. **Terminal 2** : `npm run cron:dev` (cron local)

C'est tout ! Le système vérifiera automatiquement toutes les 5 minutes. 🎉

