#!/usr/bin/env node

// ProCheff Health Logger v1 - Direct Implementation
// Autonomous health monitoring without TypeScript dependencies

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class HealthLogger {
  constructor() {
    this.logPath = path.join(process.cwd(), 'logs', 'health_report.json');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    const logDir = path.dirname(this.logPath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  getSystemStats() {
    try {
      // Get memory usage
      const memoryUsage = process.memoryUsage();
      const memoryMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
      
      // Get uptime
      const uptimeSeconds = Math.floor(process.uptime());
      const uptimeMinutes = Math.floor(uptimeSeconds / 60);
      const uptimeFormatted = uptimeMinutes > 60 
        ? `${Math.floor(uptimeMinutes / 60)}h${uptimeMinutes % 60}m`
        : `${uptimeMinutes}m`;

      // Try to get CPU (simplified)
      let cpuUsage = 'N/A';
      try {
        const topOutput = execSync("top -l 1 -n 0 | grep 'CPU usage'", { timeout: 3000 });
        const match = topOutput.toString().match(/(\d+\.?\d*)%/);
        if (match) cpuUsage = match[1] + '%';
      } catch (e) {
        cpuUsage = 'N/A';
      }

      return {
        cpu: cpuUsage,
        memory: `${memoryMB}MB`,
        uptime: uptimeFormatted
      };
    } catch (error) {
      return {
        cpu: 'N/A',
        memory: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        uptime: `${Math.floor(process.uptime() / 60)}m`
      };
    }
  }

  async checkSystemHealth() {
    return new Promise((resolve) => {
      // Test curl connection to localhost:3000
      const { spawn } = require('child_process');
      const curl = spawn('curl', ['-s', '-w', '%{http_code}', '-o', '/dev/null', 'http://localhost:3000/api/health'], {
        timeout: 5000
      });
      
      let output = '';
      curl.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      curl.on('close', (code) => {
        if (code === 0 && output.includes('200')) {
          resolve({ isHealthy: true });
        } else if (code === 7) {
          resolve({
            isHealthy: false,
            reason: 'Connection refused - sunucu kapalı',
            solution: 'npm run dev ile sunucuyu başlat'
          });
        } else {
          resolve({
            isHealthy: false,
            reason: `HTTP ${output || 'connection error'}`,
            solution: 'Sistem bağlantısını kontrol et'
          });
        }
      });
      
      curl.on('error', (error) => {
        resolve({
          isHealthy: false,
          reason: `Network error: ${error.message}`,
          solution: 'curl komutu ve network ayarlarını kontrol et'
        });
      });
    });
  }

  writeLogEntry(entry) {
    try {
      const logLine = JSON.stringify(entry) + '\n';
      fs.appendFileSync(this.logPath, logLine, 'utf8');
    } catch (error) {
      console.error('Log yazma hatası:', error);
    }
  }

  async logHealthStatus() {
    const timestamp = new Date().toISOString();
    const healthCheck = await this.checkSystemHealth();
    const systemStats = this.getSystemStats();

    let logEntry;

    if (healthCheck.isHealthy) {
      // Healthy system - log minimal info
      logEntry = {
        timestamp,
        durum: 'aktif',
        cpu: systemStats.cpu,
        memory: systemStats.memory,
        uptime: systemStats.uptime
      };
    } else {
      // Unhealthy system - log detailed error info
      logEntry = {
        timestamp,
        durum: 'pasif',
        neden: healthCheck.reason || 'Bilinmeyen sistem hatası',
        çözüm: healthCheck.solution || 'Sistem yöneticisine başvur'
      };
    }

    this.writeLogEntry(logEntry);
    console.log('✅ Health status logged:', logEntry.durum);
    return logEntry;
  }

  getRecentLogs(count = 10) {
    try {
      if (fs.existsSync(this.logPath)) {
        const content = fs.readFileSync(this.logPath, 'utf8');
        const lines = content.trim().split('\n').filter(line => line.trim());
        const logs = lines.map(line => JSON.parse(line));
        return logs.slice(-count);
      }
    } catch (error) {
      console.warn('Log okuma hatası:', error);
    }
    return [];
  }
}

// Main execution
async function main() {
  console.log('🧾 ProCheff Health Logger v1 - Autonomous Check');
  
  const logger = new HealthLogger();
  const logEntry = await logger.logHealthStatus();
  
  console.log('📄 Log dosyası:', logger.logPath);
  console.log('📊 Kayıt:', logEntry);
  
  // Show recent logs
  const recentLogs = logger.getRecentLogs(3);
  console.log('\n📋 Son health kayıtları:');
  recentLogs.forEach((log, index) => {
    console.log(`  ${index + 1}. ${log.timestamp.slice(11, 19)} - ${log.durum.toUpperCase()}`);
    if (log.durum === 'aktif') {
      console.log(`     CPU: ${log.cpu}, Memory: ${log.memory}, Uptime: ${log.uptime}`);
    } else {
      console.log(`     ❌ ${log.neden}`);
      console.log(`     🔧 ${log.çözüm}`);
    }
  });
}

main().catch(console.error);