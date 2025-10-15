#!/usr/bin/env node

// ProCheff Health Logger v1 - Test Runner
// Runs autonomous health check and logs to /logs/health_report.json

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🧾 ProCheff Health Logger v1 - Test Başlatılıyor...');

// Import and run health logger
async function runHealthCheck() {
  try {
    // Check if we can import the health logger
    const { healthLogger } = await import('../lib/services/healthLogger.js');
    
    console.log('📊 Sistem durumu analiz ediliyor...');
    await healthLogger.logHealthStatus();
    
    console.log('📄 Log dosyası:', healthLogger.getLogPath());
    
    // Display recent logs
    const recentLogs = healthLogger.getRecentLogs(3);
    console.log('📋 Son health kayıtları:');
    recentLogs.forEach((log, index) => {
      console.log(`  ${index + 1}. ${log.timestamp} - ${log.durum}`);
      if (log.durum === 'aktif') {
        console.log(`     CPU: ${log.cpu}, Memory: ${log.memory}, Uptime: ${log.uptime}`);
      } else {
        console.log(`     Neden: ${log.neden}`);
        console.log(`     Çözüm: ${log.çözüm}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Health Logger hatası:', error.message);
    
    // Manual fallback log
    const fallbackLog = {
      timestamp: new Date().toISOString(),
      durum: 'pasif',
      neden: 'Health Logger import hatası',
      çözüm: 'TypeScript build kontrol et: npm run build'
    };
    
    const logPath = path.join(process.cwd(), 'logs', 'health_report.json');
    const logDir = path.dirname(logPath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    fs.appendFileSync(logPath, JSON.stringify(fallbackLog) + '\n');
    console.log('📄 Fallback log yazıldı:', logPath);
  }
}

runHealthCheck().catch(console.error);