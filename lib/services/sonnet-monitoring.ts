// Monitoring & Alerting for Sonnet Integration
// SONNET_DELIVERY_SPEC.md'deki monitoring requirements implementasyonu

export interface SonnetMetrics {
  extraction_job_count: number;
  extraction_success_rate: number;
  avg_latency_seconds: number;
  needs_review_rate: number;
  validation_failure_rate: number;
  api_timeout_count: number;
  critical_field_confidence_rate: number;
}

export interface AlertThresholds {
  needs_review_rate_threshold: number; // > 5% (24h)
  extraction_success_rate_threshold: number; // < 90%
  avg_latency_threshold_seconds: number; // > 120s
  validation_failure_rate_threshold: number; // > 2%
}

export class SonnetMonitoringService {
  private metrics: SonnetMetrics;
  private thresholds: AlertThresholds;
  private metricHistory: Array<{ timestamp: Date; metrics: SonnetMetrics }> = [];

  constructor() {
    this.metrics = this.resetMetrics();
    this.thresholds = {
      needs_review_rate_threshold: 0.05, // 5%
      extraction_success_rate_threshold: 0.90, // 90%
      avg_latency_threshold_seconds: 120, // 2 minutes
      validation_failure_rate_threshold: 0.02 // 2%
    };
  }

  private resetMetrics(): SonnetMetrics {
    return {
      extraction_job_count: 0,
      extraction_success_rate: 0,
      avg_latency_seconds: 0,
      needs_review_rate: 0,
      validation_failure_rate: 0,
      api_timeout_count: 0,
      critical_field_confidence_rate: 0
    };
  }

  // Record successful extraction
  recordExtractionSuccess(latencyMs: number, needsReview: boolean, validationPassed: boolean, criticalFieldsOk: boolean) {
    this.metrics.extraction_job_count++;
    
    // Update success rate (rolling average)
    const currentSuccessRate = this.metrics.extraction_success_rate;
    this.metrics.extraction_success_rate = 
      (currentSuccessRate * (this.metrics.extraction_job_count - 1) + 1) / this.metrics.extraction_job_count;
    
    // Update average latency
    const currentLatency = this.metrics.avg_latency_seconds;
    const newLatencySeconds = latencyMs / 1000;
    this.metrics.avg_latency_seconds = 
      (currentLatency * (this.metrics.extraction_job_count - 1) + newLatencySeconds) / this.metrics.extraction_job_count;
    
    // Update needs review rate
    if (needsReview) {
      const currentNeedsReview = this.metrics.needs_review_rate * (this.metrics.extraction_job_count - 1);
      this.metrics.needs_review_rate = (currentNeedsReview + 1) / this.metrics.extraction_job_count;
    } else {
      const currentNeedsReview = this.metrics.needs_review_rate * (this.metrics.extraction_job_count - 1);
      this.metrics.needs_review_rate = currentNeedsReview / this.metrics.extraction_job_count;
    }
    
    // Update validation failure rate
    if (!validationPassed) {
      const currentValidationFailures = this.metrics.validation_failure_rate * (this.metrics.extraction_job_count - 1);
      this.metrics.validation_failure_rate = (currentValidationFailures + 1) / this.metrics.extraction_job_count;
    } else {
      const currentValidationFailures = this.metrics.validation_failure_rate * (this.metrics.extraction_job_count - 1);
      this.metrics.validation_failure_rate = currentValidationFailures / this.metrics.extraction_job_count;
    }
    
    // Update critical field confidence rate
    if (criticalFieldsOk) {
      const currentCriticalOk = this.metrics.critical_field_confidence_rate * (this.metrics.extraction_job_count - 1);
      this.metrics.critical_field_confidence_rate = (currentCriticalOk + 1) / this.metrics.extraction_job_count;
    } else {
      const currentCriticalOk = this.metrics.critical_field_confidence_rate * (this.metrics.extraction_job_count - 1);
      this.metrics.critical_field_confidence_rate = currentCriticalOk / this.metrics.extraction_job_count;
    }
    
    console.log(`[Monitoring] Extraction recorded: latency=${newLatencySeconds.toFixed(2)}s, needsReview=${needsReview}`);
  }

  // Record extraction failure
  recordExtractionFailure(errorType: 'timeout' | 'api_error' | 'validation_error' | 'unknown') {
    this.metrics.extraction_job_count++;
    
    // Update success rate
    const currentSuccessRate = this.metrics.extraction_success_rate;
    this.metrics.extraction_success_rate = 
      (currentSuccessRate * (this.metrics.extraction_job_count - 1)) / this.metrics.extraction_job_count;
    
    // Track specific error types
    if (errorType === 'timeout') {
      this.metrics.api_timeout_count++;
    }
    
    if (errorType === 'validation_error') {
      const currentValidationFailures = this.metrics.validation_failure_rate * (this.metrics.extraction_job_count - 1);
      this.metrics.validation_failure_rate = (currentValidationFailures + 1) / this.metrics.extraction_job_count;
    }
    
    console.log(`[Monitoring] Extraction failure recorded: type=${errorType}`);
  }

  // Check if alerts should be triggered
  checkAlerts(): Array<{ level: 'warning' | 'critical'; message: string; metric: string; value: number; threshold: number }> {
    const alerts: Array<{ level: 'warning' | 'critical'; message: string; metric: string; value: number; threshold: number }> = [];
    
    // Only check alerts if we have enough data
    if (this.metrics.extraction_job_count < 10) {
      return alerts;
    }
    
    // Needs review rate alert
    if (this.metrics.needs_review_rate > this.thresholds.needs_review_rate_threshold) {
      alerts.push({
        level: 'warning' as const,
        message: `High needs review rate detected`,
        metric: 'needs_review_rate',
        value: this.metrics.needs_review_rate,
        threshold: this.thresholds.needs_review_rate_threshold
      });
    }
    
    // Success rate alert
    if (this.metrics.extraction_success_rate < this.thresholds.extraction_success_rate_threshold) {
      alerts.push({
        level: 'critical' as const,
        message: `Low extraction success rate detected`,
        metric: 'extraction_success_rate',
        value: this.metrics.extraction_success_rate,
        threshold: this.thresholds.extraction_success_rate_threshold
      });
    }
    
    // Latency alert
    if (this.metrics.avg_latency_seconds > this.thresholds.avg_latency_threshold_seconds) {
      alerts.push({
        level: 'warning' as const,
        message: `High average latency detected`,
        metric: 'avg_latency_seconds',
        value: this.metrics.avg_latency_seconds,
        threshold: this.thresholds.avg_latency_threshold_seconds
      });
    }
    
    // Validation failure alert
    if (this.metrics.validation_failure_rate > this.thresholds.validation_failure_rate_threshold) {
      alerts.push({
        level: 'critical' as const,
        message: `High validation failure rate detected`,
        metric: 'validation_failure_rate',
        value: this.metrics.validation_failure_rate,
        threshold: this.thresholds.validation_failure_rate_threshold
      });
    }
    
    return alerts;
  }

  // Send alerts to PagerDuty/Slack
  async sendAlerts(alerts: Array<{ level: 'warning' | 'critical'; message: string; metric: string; value: number; threshold: number }>) {
    if (alerts.length === 0) return;
    
    const criticalAlerts = alerts.filter(a => a.level === 'critical');
    const warningAlerts = alerts.filter(a => a.level === 'warning');
    
    if (criticalAlerts.length > 0) {
      await this.sendPagerDutyAlert(criticalAlerts);
    }
    
    if (alerts.length > 0) {
      await this.sendSlackAlert([...criticalAlerts, ...warningAlerts]);
    }
    
    console.log(`[Monitoring] Sent ${alerts.length} alerts (${criticalAlerts.length} critical, ${warningAlerts.length} warning)`);
  }

  private async sendPagerDutyAlert(alerts: Array<{ level: string; message: string; metric: string; value: number; threshold: number }>) {
    const pagerDutyKey = process.env.PAGERDUTY_INTEGRATION_KEY;
    if (!pagerDutyKey) {
      console.warn('[Monitoring] PagerDuty integration key not configured');
      return;
    }
    
    try {
      const payload = {
        routing_key: pagerDutyKey,
        event_action: 'trigger',
        payload: {
          summary: `ProCheff Sonnet Integration Alert: ${alerts.length} critical issues`,
          source: 'procheff-sonnet-monitoring',
          severity: 'critical',
          custom_details: {
            alerts: alerts.map(a => `${a.metric}: ${a.value.toFixed(3)} (threshold: ${a.threshold})`),
            current_metrics: this.metrics
          }
        }
      };
      
      const response = await fetch('https://events.pagerduty.com/v2/enqueue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        console.error('[Monitoring] Failed to send PagerDuty alert:', response.statusText);
      }
      
    } catch (error) {
      console.error('[Monitoring] PagerDuty alert error:', error);
    }
  }

  private async sendSlackAlert(alerts: Array<{ level: string; message: string; metric: string; value: number; threshold: number }>) {
    const slackWebhook = process.env.SLACK_WEBHOOK_URL;
    if (!slackWebhook) {
      console.warn('[Monitoring] Slack webhook URL not configured');
      return;
    }
    
    try {
      const criticalCount = alerts.filter(a => a.level === 'critical').length;
      const warningCount = alerts.filter(a => a.level === 'warning').length;
      
      const color = criticalCount > 0 ? 'danger' : 'warning';
      const title = `ProCheff Sonnet Integration Alert`;
      
      const fields = alerts.map(alert => ({
        title: alert.metric,
        value: `${alert.message}\n📊 Current: ${alert.value.toFixed(3)}\n🎯 Threshold: ${alert.threshold}`,
        short: true
      }));
      
      const payload = {
        attachments: [{
          color,
          title,
          fields,
          footer: 'ProCheff Monitoring',
          ts: Math.floor(Date.now() / 1000)
        }]
      };
      
      const response = await fetch(slackWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        console.error('[Monitoring] Failed to send Slack alert:', response.statusText);
      }
      
    } catch (error) {
      console.error('[Monitoring] Slack alert error:', error);
    }
  }

  // Audit logging
  logAuditEvent(event: {
    action: 'spec_extraction_started' | 'spec_extraction_completed' | 'spec_extraction_approved' | 'spec_extraction_rejected';
    user_id?: string;
    spec_id: string;
    extraction_id?: string;
    changes_made?: Record<string, any>;
    confidence_override?: boolean;
    processing_time_ms?: number;
    ip_address?: string;
    user_agent?: string;
  }) {
    const auditLog = {
      ...event,
      timestamp: new Date().toISOString(),
      service: 'sonnet-extraction'
    };
    
    // In production, this would go to a dedicated audit log storage
    console.log('[Audit]', JSON.stringify(auditLog));
    
    // Could also send to external logging service
    // await this.sendToLogService(auditLog);
  }

  // Get current metrics
  getCurrentMetrics(): SonnetMetrics {
    return { ...this.metrics };
  }
  
  // Get metrics history for dashboard
  getMetricsHistory(hours: number = 24): Array<{ timestamp: Date; metrics: SonnetMetrics }> {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.metricHistory.filter(entry => entry.timestamp > cutoff);
  }
  
  // Snapshot metrics for history
  snapshotMetrics() {
    this.metricHistory.push({
      timestamp: new Date(),
      metrics: { ...this.metrics }
    });
    
    // Keep only last 7 days of snapshots
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    this.metricHistory = this.metricHistory.filter(entry => entry.timestamp > weekAgo);
  }
  
  // Reset metrics (for new time period)
  resetPeriodMetrics() {
    this.snapshotMetrics();
    this.metrics = this.resetMetrics();
    console.log('[Monitoring] Metrics reset for new period');
  }
}

// Singleton instance
export const sonnetMonitoring = new SonnetMonitoringService();

// Periodic monitoring task (to be called by cron job or scheduler)
export const runPeriodicMonitoring = async () => {
  console.log('[Monitoring] Running periodic check...');
  
  const alerts = sonnetMonitoring.checkAlerts();
  if (alerts.length > 0) {
    await sonnetMonitoring.sendAlerts(alerts);
  }
  
  sonnetMonitoring.snapshotMetrics();
  
  const metrics = sonnetMonitoring.getCurrentMetrics();
  console.log('[Monitoring] Current metrics:', {
    jobs: metrics.extraction_job_count,
    success_rate: (metrics.extraction_success_rate * 100).toFixed(1) + '%',
    avg_latency: metrics.avg_latency_seconds.toFixed(2) + 's',
    needs_review: (metrics.needs_review_rate * 100).toFixed(1) + '%'
  });
};