const STORAGE_KEY = 'lux_automation_config';

const defaults = {
  agents: {
    'dispatch-agent': {
      enabled: true,
      name: 'Dispatch Agent',
      description: 'Selects best crew and equipment for new/active jobs based on utilization and availability',
      icon: 'Zap',
      schedule: 'on-demand',
      config: {
        maxJobsPerCrew: 3,
        autoDispatchUrgent: true,
        preferredCrews: [],
        equipmentBuffer: 1,
      },
    },
    'permit-monitor': {
      enabled: true,
      name: 'Permit Monitor',
      description: 'Monitors permit expiry dates and alerts when permits are expiring or applications are stalled',
      icon: 'AlertTriangle',
      schedule: 'every-6h',
      config: {
        warningDays: 7,
        criticalDays: 0,
        escalationDays: 14,
        checkIntervalHours: 6,
      },
    },
    'reporting-agent': {
      enabled: true,
      name: 'Reporting Agent',
      description: 'Auto-generates daily, weekly, and crew performance reports on schedule',
      icon: 'Activity',
      schedule: 'daily',
      config: {
        generateDailyAt: '06:00',
        generateWeeklyOn: 'Monday',
        autoExport: false,
        recipients: 'ops@lux-traffic.com.au',
      },
    },
    'auto-email': {
      enabled: true,
      name: 'Auto-Email Engine',
      description: 'Fires automated emails when job status changes, based on trigger rules configured below',
      icon: 'Mail',
      schedule: 'event-driven',
      config: {
        logAllEmails: true,
        bccOperations: true,
        defaultCc: 'operations@lux-traffic.com.au',
      },
    },
    'notification-agent': {
      enabled: false,
      name: 'Notification Agent',
      description: 'Routes notifications to the right channel — email for clients, SMS for urgent crew alerts, in-app for managers',
      icon: 'Bell',
      schedule: 'event-driven',
      config: {
        smsEnabled: false,
        smsProvider: '',
        smsApiKey: '',
        emailEnabled: true,
        pushEnabled: true,
      },
    },
    'compliance-agent': {
      enabled: false,
      name: 'Compliance Agent',
      description: 'Scans active jobs daily and checks permits, TMP status, equipment service, SWMS currency',
      icon: 'ShieldCheck',
      schedule: 'daily',
      config: {
        scanAt: '05:00',
        flagNonCompliant: true,
        notifyManager: true,
      },
    },
    'monitoring-agent': {
      enabled: false,
      name: 'Monitoring Agent',
      description: 'Watches dashboard thresholds and alerts when crew overloaded, equipment short, or budget exceeded',
      icon: 'Activity',
      schedule: 'every-1h',
      config: {
        maxJobsPerCrewAlert: 4,
        equipmentShortageThreshold: 2,
        budgetAlertPercent: 90,
      },
    },
  },

  workflows: {
    'job-lifecycle': {
      enabled: true,
      name: 'Job Lifecycle',
      description: 'End-to-end job workflow from Planning through to Completed',
      stages: ['Planning', 'Scheduled', 'Active', 'Completed', 'Cancelled'],
      autoTransitions: {
        'Planning-Scheduled': { condition: 'permit_approved', auto: false },
        'Scheduled-Active': { condition: 'crew_ready', auto: true },
        'Active-Completed': { condition: 'all_work_done', auto: false },
      },
    },
    'incident-response': {
      enabled: true,
      name: 'Incident Response',
      description: 'Multi-stage incident handling from report to closure',
      stages: ['Reported', 'Investigating', 'Corrective Actions', 'Sign-off', 'Closed'],
      autoTransitions: {
        'Reported-Investigating': { condition: 'assigned', auto: true },
        'Investigating-Corrective Actions': { condition: 'root_cause_found', auto: false },
        'Corrective Actions-Sign-off': { condition: 'actions_complete', auto: false },
        'Sign-off-Closed': { condition: 'approved', auto: false },
      },
    },
    'permit-application': {
      enabled: true,
      name: 'Permit Application',
      description: 'Permit application tracking from submission to approval/rejection',
      stages: ['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Expired'],
      autoTransitions: {
        'Submitted-Under Review': { condition: 'acknowledged', auto: true },
        'Under Review-Approved': { condition: 'authority_approval', auto: false },
      },
    },
    'equipment-lifecycle': {
      enabled: false,
      name: 'Equipment Lifecycle',
      description: 'Equipment from purchase through maintenance to decommission',
      stages: ['Available', 'In Use', 'Maintenance', 'Decommissioned'],
      autoTransitions: {},
    },
  },

  automations: [
    {
      id: 'auto-001',
      enabled: true,
      name: 'Job Status → Auto-Email',
      trigger: { type: 'job.status_change', from: 'Planning', to: 'Scheduled' },
      action: { type: 'send_email', template: 'TMP Approval Request', recipients: ['client', 'crew'] },
    },
    {
      id: 'auto-002',
      enabled: true,
      name: 'Job Activated → Crew Dispatch',
      trigger: { type: 'job.status_change', from: 'Scheduled', to: 'Active' },
      action: { type: 'send_email', template: 'Job Notification', recipients: ['client', 'crew', 'authority'] },
    },
    {
      id: 'auto-003',
      enabled: true,
      name: 'Job Completed → Completion Report',
      trigger: { type: 'job.status_change', from: 'Active', to: 'Completed' },
      action: { type: 'send_email', template: 'Job Completion Report', recipients: ['client', 'crew'] },
    },
    {
      id: 'auto-004',
      enabled: false,
      name: 'Permit Expiring → Alert Manager',
      trigger: { type: 'permit.expiring', daysBefore: 7 },
      action: { type: 'notify', channel: 'email', recipients: 'ops@lux-traffic.com.au', message: 'Permit {permit.id} expiring in {days} days' },
    },
    {
      id: 'auto-005',
      enabled: false,
      name: 'High Severity Incident → SMS Supervisor',
      trigger: { type: 'incident.created', severity: 'High' },
      action: { type: 'notify', channel: 'sms', recipients: '0401 234 567', message: 'HIGH SEVERITY INCIDENT at {incident.location}' },
    },
    {
      id: 'auto-006',
      enabled: false,
      name: 'Daily Ops Report',
      trigger: { type: 'schedule', cron: '0 6 * * 1-5' },
      action: { type: 'generate_report', reportType: 'daily', sendTo: 'management@lux-traffic.com.au' },
    },
    {
      id: 'auto-007',
      enabled: false,
      name: 'Urgent Job → Immediate Dispatch',
      trigger: { type: 'job.created', priority: 'Urgent' },
      action: { type: 'dispatch', autoAssignCrew: true, autoAssignEquipment: true, notifyType: 'sms' },
    },
  ],
};

export function getAutomationConfig() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch { /* ignore */ }
  }
  return JSON.parse(JSON.stringify(defaults));
}

export function saveAutomationConfig(config) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  return config;
}

export function resetAutomationConfig() {
  localStorage.removeItem(STORAGE_KEY);
  return JSON.parse(JSON.stringify(defaults));
}

export function getAgentConfig(agentId) {
  const config = getAutomationConfig();
  return config.agents[agentId] || null;
}

export function isAgentEnabled(agentId) {
  const config = getAutomationConfig();
  return config.agents[agentId]?.enabled ?? false;
}

export function updateAgentConfig(agentId, updates) {
  const config = getAutomationConfig();
  if (config.agents[agentId]) {
    config.agents[agentId] = { ...config.agents[agentId], ...updates };
    if (updates.config) {
      config.agents[agentId].config = { ...config.agents[agentId].config, ...updates.config };
    }
    saveAutomationConfig(config);
  }
  return config;
}

export function getEnabledAutomations() {
  const config = getAutomationConfig();
  return config.automations.filter(a => a.enabled);
}

export function getAllAutomations() {
  return getAutomationConfig().automations;
}

export function saveAutomation(automation) {
  const config = getAutomationConfig();
  const idx = config.automations.findIndex(a => a.id === automation.id);
  if (idx >= 0) config.automations[idx] = automation;
  else config.automations.push(automation);
  saveAutomationConfig(config);
  return config;
}

export function deleteAutomation(id) {
  const config = getAutomationConfig();
  config.automations = config.automations.filter(a => a.id !== id);
  saveAutomationConfig(config);
  return config;
}

export function toggleAutomation(id) {
  const config = getAutomationConfig();
  const auto = config.automations.find(a => a.id === id);
  if (auto) { auto.enabled = !auto.enabled; saveAutomationConfig(config); }
  return config;
}

export function toggleAgent(agentId) {
  const config = getAutomationConfig();
  if (config.agents[agentId]) {
    config.agents[agentId].enabled = !config.agents[agentId].enabled;
    saveAutomationConfig(config);
  }
  return config;
}

export function updateWorkflow(workflowId, updates) {
  const config = getAutomationConfig();
  if (config.workflows[workflowId]) {
    config.workflows[workflowId] = { ...config.workflows[workflowId], ...updates };
    saveAutomationConfig(config);
  }
  return config;
}