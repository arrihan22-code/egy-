export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface AlertRule {
  name: string;
  description: string;
  severity: AlertSeverity;
  condition: (metrics: Record<string, number>) => boolean;
  cooldownMs: number;
}

export interface Alert {
  name: string;
  description: string;
  severity: AlertSeverity;
  timestamp: Date;
}

export class AlertManager {
  private rules: AlertRule[] = [];
  private lastFired: Map<string, number> = new Map();

  registerRule(rule: AlertRule): void {
    this.rules.push(rule);
  }

  evaluate(metrics: Record<string, number>): Alert[] {
    const alerts: Alert[] = [];
    const now = Date.now();

    for (const rule of this.rules) {
      if (rule.condition(metrics)) {
        const lastFired = this.lastFired.get(rule.name) || 0;
        if (now - lastFired >= rule.cooldownMs) {
          alerts.push({
            name: rule.name,
            description: rule.description,
            severity: rule.severity,
            timestamp: new Date(),
          });
          this.lastFired.set(rule.name, now);
        }
      }
    }

    return alerts;
  }
}
