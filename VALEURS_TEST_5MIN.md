# Valeurs exactes pour tester une alerte dans 5 minutes

## ✅ Modifications effectuées

J'ai modifié le code pour accepter des valeurs décimales dans le champ "Heures d'avance de notification", vous pouvez maintenant mettre **0.083** (5 minutes).

---

## 📝 Valeurs exactes à entrer

### Étape 1 : Modifier la machine

Allez sur : `http://localhost:3000/dashboard/machines/d7070618-e7d5-45c2-81b1-453eebc4c533/edit`

Dans la section **"Modifier la machine"** :

- **Heures d'avance de notification** : `0.083`
  - (5 minutes = 5 ÷ 60 = 0.083 heures)

Cliquez sur **"Enregistrer les modifications"**

---

### Étape 2 : Ajouter une maintenance

Dans la section **"Maintenances"**, cliquez sur **"Ajouter une maintenance"**

Remplissez avec ces valeurs :

- **Nom de la maintenance** : `Test Maintenance 5min`
- **Type** : `PART` (ou `OIL`, peu importe)
- **Intervalle de remplacement (heures)** : `100`
- **Date du dernier remplacement** : **Il y a 99.917 heures**

#### Comment calculer la date exacte ?

**Formule** : Date actuelle - 99.917 heures

**Exemple de calcul** :
- Si maintenant c'est le **2 janvier 2025 à 14:00**
- 99.917 heures = environ **4 jours, 3 heures et 55 minutes**
- Donc la date à mettre : **29 décembre 2024 à 10:05**

**Ou plus simplement** :
- Prenez la date d'aujourd'hui
- Retirez 4 jours
- Retirez 3 heures et 55 minutes

**Exemple concret** :
- Maintenant : 2 janvier 2025, 14:00
- Moins 4 jours : 29 décembre 2024, 14:00
- Moins 3h55 : 29 décembre 2024, 10:05
- **Date à mettre** : `2024-12-29` (et l'heure sera automatiquement à 00:00, ce qui est proche)

> ⚠️ **Note** : Le champ date ne permet que la date (pas l'heure). Donc si vous mettez `2024-12-29`, le système utilisera `2024-12-29 00:00:00`. C'est suffisant pour le test car la différence sera de quelques heures, ce qui est acceptable.

Cliquez sur **"Ajouter"**

---

## ⏰ Étape 3 : Attendre et déclencher

1. **Attendez 5 minutes** (ou un peu plus pour être sûr)

2. **Déclencher l'évaluation** en mettant à jour les heures d'exploitation :
   - Retournez dans "Modifier la machine"
   - Changez les **"Heures d'exploitation"** (ajoutez 1 par exemple)
   - Cliquez sur **"Enregistrer les modifications"**

3. **L'email sera envoyé immédiatement** si la maintenance est due dans 5 minutes ou moins !

---

## 🔍 Vérification

1. **Vérifiez les logs du serveur** : Vous devriez voir :
   ```
   ✅ Email de notification envoyé avec succès
   ```

2. **Vérifiez votre email** : L'email devrait arriver à `boudjemaa.amine.2003@gmail.com`

3. **Vérifiez les notifications** : Allez sur `/dashboard/notifications` pour voir la notification créée

---

## 📊 Résumé des valeurs

| Champ | Valeur |
|-------|--------|
| **Heures d'avance de notification** | `0.083` |
| **Nom de la maintenance** | `Test Maintenance 5min` |
| **Type** | `PART` ou `OIL` |
| **Intervalle de remplacement** | `100` heures |
| **Date du dernier remplacement** | Il y a **99.917 heures** (≈ 4 jours et 4 heures) |

---

## 💡 Astuce

Si vous voulez tester **immédiatement** sans attendre 5 minutes, vous pouvez :

1. Mettre **"Heures d'avance de notification"** à `0.083`
2. Mettre **"Date du dernier remplacement"** à une date qui fait que la maintenance est **déjà due** (par exemple, il y a 100 heures ou plus)
3. Enregistrer et mettre à jour les heures d'exploitation
4. L'email sera envoyé immédiatement avec l'urgence "REQUIRED" (en retard)

