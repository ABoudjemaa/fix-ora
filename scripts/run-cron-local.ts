/**
 * Script pour tester le système de vérification automatique des notifications en local
 * 
 * Usage: npm run cron:dev
 * 
 * Ce script appelle la route /api/cron/check-notifications toutes les 5 minutes
 */

const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const SECRET = process.env.CRON_SECRET_KEY || '';

async function checkNotifications() {
  const url = `${API_URL}/api/cron/check-notifications${SECRET ? `?secret=${SECRET}` : ''}`;
  
  try {
    console.log(`\n🔄 [${new Date().toLocaleTimeString('fr-FR')}] Vérification des notifications...`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log(`✅ Vérification terminée:`);
      console.log(`   - Machines vérifiées: ${data.machinesChecked}`);
      console.log(`   - Notifications créées: ${data.notificationsCreated}`);
      
      if (data.details && data.details.length > 0) {
        console.log(`   - Détails:`);
        data.details.forEach((detail: any) => {
          console.log(`     • ${detail.machineName}: ${detail.notificationsCreated} notification(s)`);
        });
      }
    } else {
      console.error(`❌ Erreur:`, data.error || 'Erreur inconnue');
    }
  } catch (error) {
    console.error(`❌ Erreur lors de l'appel:`, error);
  }
}

// Exécuter immédiatement au démarrage
console.log('🚀 Démarrage du cron local...');
console.log(`📍 URL: ${API_URL}/api/cron/check-notifications`);
console.log(`⏰ Fréquence: Toutes les 5 minutes`);
console.log(`\n💡 Appuyez sur Ctrl+C pour arrêter\n`);

checkNotifications();

// Exécuter toutes les 5 minutes (300000 ms)
const interval = setInterval(checkNotifications, 5 * 60 * 1000);

// Gérer l'arrêt propre
process.on('SIGINT', () => {
  console.log('\n\n🛑 Arrêt du cron local...');
  clearInterval(interval);
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Arrêt du cron local...');
  clearInterval(interval);
  process.exit(0);
});

