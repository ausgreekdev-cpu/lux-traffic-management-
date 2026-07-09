let logs = [];

export function logAction(agent, action, details, status = 'success') {
  const entry = {
    id: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    agent,
    action,
    details,
    status,
    timestamp: new Date().toISOString(),
  };
  logs = [entry, ...logs];
  if (typeof window !== 'undefined') {
    const stored = JSON.parse(localStorage.getItem('lux_agent_logs') || '[]');
    stored.unshift(entry);
    if (stored.length > 200) stored.length = 200;
    localStorage.setItem('lux_agent_logs', JSON.stringify(stored));
  }
  return entry;
}

export function getLogs(limit = 50) {
  if (logs.length === 0 && typeof window !== 'undefined') {
    logs = JSON.parse(localStorage.getItem('lux_agent_logs') || '[]');
  }
  return logs.slice(0, limit);
}

export function clearLogs() {
  logs = [];
  localStorage.removeItem('lux_agent_logs');
}

export function getAgentStats() {
  const all = getLogs(500);
  const agentGroups = {};
  all.forEach(l => {
    if (!agentGroups[l.agent]) agentGroups[l.agent] = { total: 0, success: 0, fail: 0, actions: {} };
    agentGroups[l.agent].total++;
    if (l.status === 'success') agentGroups[l.agent].success++;
    else agentGroups[l.agent].fail++;
    agentGroups[l.agent].actions[l.action] = (agentGroups[l.agent].actions[l.action] || 0) + 1;
  });
  return agentGroups;
}