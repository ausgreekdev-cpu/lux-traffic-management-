import { permits } from '../data/mockData';
import { logAction } from './agentLogger';
import { isAgentEnabled, getAgentConfig } from './agentsConfig';

function checkEnabled() {
  if (!isAgentEnabled('permit-monitor')) {
    logAction('Permit Monitor', 'Blocked', 'Agent is disabled in Automation Control Center', 'fail');
    return false;
  }
  return true;
}

export function getPermitAlerts() {
  if (!checkEnabled()) return [];
  const now = new Date();
  const alerts = [];

  permits.forEach(p => {
    if (p.status === 'Expired' || p.status === 'Rejected') return;

    const expiry = new Date(p.expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry <= 0 && p.status === 'Approved') {
      alerts.push({
        permitId: p.id,
        jobId: p.jobId,
        authority: p.authority,
        reference: p.reference,
        severity: 'critical',
        message: `Permit ${p.id} for ${p.jobId} has EXPIRED (expired ${Math.abs(daysUntilExpiry)} days ago)`,
        daysUntilExpiry,
      });
      logAction('Permit Monitor', 'Permit Expired', `Permit ${p.id} (${p.reference}) for ${p.jobId} expired ${Math.abs(daysUntilExpiry)} days ago`, 'fail');
    } else if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
      alerts.push({
        permitId: p.id,
        jobId: p.jobId,
        authority: p.authority,
        reference: p.reference,
        severity: 'warning',
        message: `Permit ${p.id} for ${p.jobId} expires in ${daysUntilExpiry} days (${p.expiryDate})`,
        daysUntilExpiry,
      });
      logAction('Permit Monitor', 'Permit Expiring Soon', `Permit ${p.id} expires in ${daysUntilExpiry} days`, 'warning');
    } else if (daysUntilExpiry <= 14 && daysUntilExpiry > 7) {
      alerts.push({
        permitId: p.id,
        jobId: p.jobId,
        authority: p.authority,
        reference: p.reference,
        severity: 'info',
        message: `Permit ${p.id} for ${p.jobId} expires in ${daysUntilExpiry} days (${p.expiryDate})`,
        daysUntilExpiry,
      });
    }

    if (p.status === 'Pending') {
      const applied = new Date(p.appliedDate);
      const daysSinceApplied = Math.ceil((now - applied) / (1000 * 60 * 60 * 24));
      if (daysSinceApplied > 14) {
        alerts.push({
          permitId: p.id,
          jobId: p.jobId,
          authority: p.authority,
          reference: p.reference,
          severity: 'warning',
          message: `Permit ${p.id} still PENDING after ${daysSinceApplied} days — needs escalation`,
          daysUntilExpiry: null,
        });
        logAction('Permit Monitor', 'Permit Stalled', `Permit ${p.id} pending for ${daysSinceApplied} days — escalation recommended`, 'warning');
      }
    }
  });

  return alerts.sort((a, b) => {
    const w = { critical: 0, warning: 1, info: 2 };
    return (w[a.severity] || 3) - (w[b.severity] || 3);
  });
}

export function checkAllPermits() {
  const alerts = getPermitAlerts();
  const critical = alerts.filter(a => a.severity === 'critical').length;
  const warning = alerts.filter(a => a.severity === 'warning').length;
  logAction('Permit Monitor', 'Full Check Complete', `${alerts.length} alerts (${critical} critical, ${warning} warnings)`);
  return { alerts, critical, warning, total: alerts.length };
}