// Health Logger v1 for ProCheff System
// Autonomous health monitoring and logging utility

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface HealthLogEntry {
  timestamp: string;
  durum: 'aktif' | 'pasif';
  cpu?: string;
  memory?: string;
  uptime?: string;
  neden?: string;
  çözüm?: string;
}

export class ProCheffHealthLogger {
  private logPath: string;
  private readonly maxFileSize = 1024 * 1024; // 1 MB
  private readonly maxEntries = 100;

  constructor() {
    this.logPath = path.join(process.cwd(), 'logs', 'health_report.json');
    this.ensureLogDirectory();
  }

  private ensureLogDirectory(): void {
    const logDir = path.dirname(this.logPath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  private async getSystemStats(): Promise<{ cpu: string; memory: string; uptime: string }> {
    try {
      // Get CPU usage (macOS compatible)
      const { stdout: cpuOut } = await execAsync("top -l 1 -n 0 | grep 'CPU usage' | awk '{print $3}' | sed 's/%//'");
      const cpuUsage = cpuOut.trim() || '0';
      
      // Get memory usage
      const memoryUsage = process.memoryUsage();
      const memoryMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
      
      // Get uptime
      const uptimeSeconds = Math.floor(process.uptime());
      const uptimeMinutes = Math.floor(uptimeSeconds / 60);
      const uptimeFormatted = uptimeMinutes > 60 
        ? `${Math.floor(uptimeMinutes / 60)}h${uptimeMinutes % 60}m`
        : `${uptimeMinutes}m`;

      return {
        cpu: `${cpuUsage}%`,
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

  private async checkSystemHealth(): Promise<{ isHealthy: boolean; reason?: string; solution?: string }> {
    try {
      // Test localhost connection with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('http://localhost:3000/api/health', {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        return { isHealthy: true };
      } else {
        return { 
          isHealthy: false, 
          reason: `HTTP ${response.status} - Health endpoint erişilemez`,
          solution: 'npm run dev ile sunucuyu yeniden başlat'
        };
      }
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED') {
        return {
          isHealthy: false,
          reason: 'Port binding hatası - sunucu kapalı',
          solution: 'PORT=3000 npm run dev veya alternatif port kullan'
        };
      } else {
        return {
          isHealthy: false,
          reason: `Network hatası: ${error.message}`,
          solution: 'Sistem network ayarlarını kontrol et'
        };
      }
    }
  }

  private readExistingLogs(): HealthLogEntry[] {
    try {
      if (fs.existsSync(this.logPath)) {
        const content = fs.readFileSync(this.logPath, 'utf8');
        const lines = content.trim().split('\n').filter(line => line.trim());
        return lines.map(line => JSON.parse(line));
      }
    } catch (error) {
      console.warn('Health log okuma hatası, yeni dosya oluşturuluyor:', error);
    }
    return [];
  }

  private writeLogEntry(entry: HealthLogEntry): void {
    try {
      const logLine = JSON.stringify(entry) + '\n';
      fs.appendFileSync(this.logPath, logLine, 'utf8');
      
      // Check file size and rotate if needed
      this.rotateLogIfNeeded();
    } catch (error) {
      console.error('Health log yazma hatası:', error);
    }
  }

  private rotateLogIfNeeded(): void {
    try {
      const stats = fs.statSync(this.logPath);
      if (stats.size > this.maxFileSize) {
        const logs = this.readExistingLogs();
        const recentLogs = logs.slice(-this.maxEntries);
        
        // Rewrite file with only recent entries
        const newContent = recentLogs.map(log => JSON.stringify(log)).join('\n') + '\n';
        fs.writeFileSync(this.logPath, newContent, 'utf8');
        
        console.log(`Health log rotated: kept last ${recentLogs.length} entries`);
      }
    } catch (error) {
      console.error('Health log rotation hatası:', error);
    }
  }

  public async logHealthStatus(): Promise<void> {
    const timestamp = new Date().toISOString();
    const healthCheck = await this.checkSystemHealth();
    const systemStats = await this.getSystemStats();

    let logEntry: HealthLogEntry;

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
    console.log('Health status logged:', logEntry.durum);
  }

  public getRecentLogs(count: number = 10): HealthLogEntry[] {
    const logs = this.readExistingLogs();
    return logs.slice(-count);
  }

  public getLogPath(): string {
    return this.logPath;
  }
}

// Export singleton instance
export const healthLogger = new ProCheffHealthLogger();