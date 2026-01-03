# Configuration GitHub Actions pour les Cron Jobs

## 🎯 Problème résolu

Les comptes **Vercel Hobby** sont limités à un seul cron job par jour. Pour des vérifications toutes les 5 minutes, nous utilisons **GitHub Actions** (gratuit et illimité).

---

## ✅ Ce qui a été configuré

1. **Fichier `.github/workflows/check-notifications.yml`** : Workflow GitHub Actions déjà créé
2. **Fichier `vercel.json`** : Modifié pour un cron quotidien (backup)

---

## 🚀 Configuration en 3 étapes

### Étape 1 : Ajouter les secrets GitHub

1. Allez sur votre repository GitHub
2. Cliquez sur **Settings** (en haut à droite)
3. Dans le menu de gauche, cliquez sur **Secrets and variables** → **Actions**
4. Cliquez sur **New repository secret**

Ajoutez ces deux secrets :

#### Secret 1 : `APP_URL`
- **Name** : `APP_URL`
- **Secret** : Votre URL Vercel (ex: `https://votre-app.vercel.app`)
- Cliquez sur **Add secret**

#### Secret 2 : `CRON_SECRET_KEY`
- **Name** : `CRON_SECRET_KEY`
- **Secret** : La même clé que dans votre `.env` (ex: `votre-cle-secrete-123`)
- Cliquez sur **Add secret**

> 💡 **Astuce** : Si vous n'avez pas encore de `CRON_SECRET_KEY` dans votre `.env`, générez-en une :
> ```bash
> openssl rand -base64 32
> ```

---

### Étape 2 : Pousser les changements

```bash
git add .
git commit -m "Configure GitHub Actions for cron jobs"
git push
```

---

### Étape 3 : Vérifier que ça fonctionne

1. Allez sur votre repository GitHub
2. Cliquez sur l'onglet **Actions**
3. Vous devriez voir le workflow "Check Notifications" qui s'exécute toutes les 5 minutes

**Pour tester immédiatement** :
- Cliquez sur "Check Notifications" dans la liste
- Cliquez sur **Run workflow** → **Run workflow** (bouton vert)

---

## 🔍 Vérification

### Vérifier que le workflow fonctionne

1. **Dans GitHub Actions** :
   - Allez dans l'onglet **Actions**
   - Cliquez sur le dernier workflow "Check Notifications"
   - Vérifiez que le job "check" est vert (succès)

2. **Dans les logs Vercel** :
   - Allez sur votre dashboard Vercel
   - Ouvrez les logs de votre application
   - Vous devriez voir les logs de vérification toutes les 5 minutes

3. **Tester manuellement** :
   ```bash
   curl "https://votre-app.vercel.app/api/cron/check-notifications?secret=VOTRE_CLE_SECRETE"
   ```

---

## ⚙️ Configuration actuelle

### GitHub Actions
- **Fréquence** : Toutes les 5 minutes (`*/5 * * * *`)
- **Fichier** : `.github/workflows/check-notifications.yml`

### Vercel Cron (Backup)
- **Fréquence** : Tous les jours à 9h00 (`0 9 * * *`)
- **Fichier** : `vercel.json`

---

## 🛠️ Dépannage

### Le workflow ne s'exécute pas

1. **Vérifiez les secrets** :
   - Allez dans **Settings** → **Secrets and variables** → **Actions**
   - Vérifiez que `APP_URL` et `CRON_SECRET_KEY` sont bien définis

2. **Vérifiez les permissions** :
   - Le workflow doit avoir les permissions pour s'exécuter
   - Par défaut, GitHub Actions est activé pour tous les repositories

3. **Vérifiez les logs** :
   - Allez dans **Actions** → Cliquez sur le workflow
   - Regardez les erreurs dans les logs

### Erreur 401 (Non autorisé)

- Vérifiez que `CRON_SECRET_KEY` dans GitHub correspond à celui dans votre `.env` Vercel
- Vérifiez que vous passez bien le paramètre `secret` dans l'URL

### Le workflow s'exécute mais ne trouve pas l'URL

- Vérifiez que `APP_URL` dans GitHub correspond à votre URL Vercel
- Vérifiez que votre application Vercel est bien déployée et accessible

---

## 📊 Monitoring

### Voir l'historique des exécutions

1. Allez dans **Actions** sur GitHub
2. Cliquez sur "Check Notifications"
3. Vous verrez toutes les exécutions avec leur statut (succès/échec)

### Voir les logs détaillés

1. Cliquez sur une exécution dans l'historique
2. Cliquez sur le job "check"
3. Cliquez sur "Call Notification API" pour voir les logs détaillés

---

## 🎯 Résumé

✅ **GitHub Actions** : Vérifications toutes les 5 minutes (gratuit)  
✅ **Vercel Cron** : Backup quotidien (compatible Hobby)  
✅ **Configuration** : Ajoutez juste les secrets GitHub et poussez le code

C'est tout ! 🎉

