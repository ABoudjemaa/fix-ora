# Guide : Tester une alerte dans 5 minutes

## ⚠️ Limitation actuelle

Le champ **"Heures d'avance de notification"** n'accepte que des **nombres entiers** (minimum 1 heure). Il n'est donc pas possible de mettre 0.083 heures (5 minutes) directement.

## Option 1 : Tester avec 1 heure (recommandé pour tester rapidement)

### Étape 1 : Modifier la machine

1. Allez sur `http://localhost:3000/dashboard/machines/d7070618-e7d5-45c2-81b1-453eebc4c533/edit`
2. Dans la section **"Modifier la machine"** :
   - **Heures d'avance de notification** : `1`

3. Cliquez sur **"Enregistrer les modifications"**

### Étape 2 : Ajouter une maintenance

1. Dans la section **"Maintenances"**, cliquez sur **"Ajouter une maintenance"**

2. Remplissez le formulaire avec ces valeurs :

   - **Nom de la maintenance** : `Test Maintenance`
   - **Type** : `PART` (ou `OIL`, peu importe)
   - **Intervalle de remplacement (heures)** : `100`
   - **Date du dernier remplacement** : **Il y a 99 heures**

   Pour calculer la date exacte :
   - Date actuelle : Aujourd'hui
   - Il y a 99 heures = il y a environ 4 jours et 3 heures
   - **Exemple** : Si aujourd'hui est le 2 janvier 2025 à 14h00, mettez : `29 décembre 2024` (ou utilisez le calculateur ci-dessous)

3. Cliquez sur **"Ajouter"**

### Étape 3 : Attendre et déclencher

1. **Attendez 1 heure** (ou moins si vous avez calculé pour moins)
2. **Mettez à jour les heures d'exploitation** de la machine (cela déclenchera l'évaluation)
   - Allez dans "Modifier la machine"
   - Changez les "Heures d'exploitation" (ajoutez 1 par exemple)
   - Sauvegardez
3. L'email devrait être envoyé immédiatement

---

## Option 2 : Modifier pour accepter 5 minutes (nécessite modification du code)

Si vous voulez vraiment tester avec **exactement 5 minutes**, vous devez modifier la validation pour accepter des décimales.

### Modification nécessaire

Dans `lib/validations/machine.ts`, ligne 73-77, changez :

```typescript
notificationAdvanceHours: z
  .number()
  .int("Le nombre d'heures d'avance de notification doit être un nombre entier")
  .positive("Le nombre d'heures d'avance de notification doit être positif")
```

En :

```typescript
notificationAdvanceHours: z
  .number()
  .positive("Le nombre d'heures d'avance de notification doit être positif")
  .min(0.001, "Le nombre d'heures d'avance doit être au moins 0.001 heure (36 secondes)")
```

Et dans `app/dashboard/machines/[id]/edit/page.tsx`, ligne 384, changez :

```typescript
min="1"
```

En :

```typescript
min="0.001"
step="0.001"
```

### Puis utilisez ces valeurs :

1. **Heures d'avance de notification** : `0.083` (5 minutes = 5/60 = 0.083 heures)

2. **Intervalle de remplacement** : `100` heures

3. **Date du dernier remplacement** : Il y a **99.917 heures**
   - 99.917 heures = environ 4 jours, 3 heures et 55 minutes
   - **Exemple** : Si maintenant c'est le 2 janvier 2025 à 14:00, mettez : `29 décembre 2024 à 10:05`

---

## Calculateur de date rapide

Pour calculer la date exacte du dernier remplacement :

**Formule** : `Date actuelle - (Intervalle - Heures d'avance)`

**Exemple pour 1 heure d'avance** :
- Intervalle : 100 heures
- Heures d'avance : 1 heure
- Date du dernier remplacement = Maintenant - (100 - 1) = Maintenant - 99 heures

**Exemple pour 5 minutes (0.083 heures)** :
- Intervalle : 100 heures  
- Heures d'avance : 0.083 heures
- Date du dernier remplacement = Maintenant - (100 - 0.083) = Maintenant - 99.917 heures

---

## Vérification

Après avoir configuré et attendu, vérifiez :

1. **Logs du serveur** : Vous devriez voir `✅ Email de notification envoyé avec succès`
2. **Email** : Vérifiez la boîte `boudjemaa.amine.2003@gmail.com`
3. **Notifications** : Allez sur `/dashboard/notifications` pour voir la notification créée

