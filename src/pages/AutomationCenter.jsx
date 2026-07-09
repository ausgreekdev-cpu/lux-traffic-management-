import { useState, useEffect } from 'react';
import { Bot, Workflow, Zap, Save, RotateCcw, Plus, Trash2, ToggleLeft, ToggleRight, Settings2, Play, Pause, Edit3, AlertTriangle, Activity, ShieldCheck, Mail, Bell, Clock } from 'lucide-react';
import { getAutomationConfig, saveAutomationConfig, resetAutomationConfig, toggleAgent, updateAgentConfig, saveAutomation, deleteAutomation, toggleAutomation, updateWorkflow } from '../services/agentsConfig';
import { logAction } from '../services/agentLogger';

const agentIcons = { Zap, AlertTriangle, Activity, Mail, Bell, ShieldCheck, Bot };

const scheduleLabels = {
  'on-demand': 'On Demand',
  'event-driven': 'Event Driven',
  'every-1h': 'Every Hour',
  'every-6h': 'Every 6 Hours',
  'daily': 'Daily',
  'weekly': 'Weekly',
};

export default function AutomationCenter() {
  const [config, setConfig] = useState(null);
  const [activeTab, setActiveTab] = useState('agents');
  const [saved, setSaved] = useState(false);
  const [newAuto, setNewAuto] = useState(false);
  const [autoForm, setAutoForm] = useState({ name: '', triggerType: 'job.status_change', actionType: 'send_email', enabled: true });

  useEffect(() => { setConfig(getAutomationConfig()); }, []);

  const refresh = () => setConfig(getAutomationConfig());

  const handleSave = () => {
    if (config) saveAutomationConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    logAction('Automation Center', 'Configuration Saved', 'All agent/workflow/automation settings saved', 'success');
  };

  const handleReset = () => {
    if (confirm('Reset all automation settings to defaults? This cannot be undone.')) {
      setConfig(resetAutomationConfig());
      logAction('Automation Center', 'Configuration Reset', 'All automation settings restored to defaults', 'warning');
    }
  };

  const handleToggleAgent = (agentId) => {
    toggleAgent(agentId);
    refresh();
    const agent = config?.agents[agentId];
    logAction('Automation Center', `Agent ${config?.agents[agentId]?.enabled ? 'Disabled' : 'Enabled'}`, `${agent?.name}`, 'success');
  };

  const handleAddAutomation = () => {
    const newId = `auto-${String(Date.now()).slice(-6)}`;
    const auto = {
      id: newId, enabled: true,
      name: autoForm.name,
      trigger: { type: autoForm.triggerType },
      action: { type: autoForm.actionType, recipients: [], template: '' },
    };
    saveAutomation(auto);
    refresh();
    setNewAuto(false);
    setAutoForm({ name: '', triggerType: 'job.status_change', actionType: 'send_email', enabled: true });
    logAction('Automation Center', 'New Automation Created', `"${auto.name}" (${autoForm.triggerType} → ${autoForm.actionType})`, 'success');
  };

  if (!config) return <div>Loading...</div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Bot size={24} /> Automation Control Center</h1>
          <p>Configure agents, workflows, and automation rules for LUX Traffic Management</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-primary" onClick={handleSave}><Save size={16} /> Save Config</button>
          <button className="btn btn-outline" onClick={handleReset}><RotateCcw size={16} /> Reset</button>
        </div>
      </div>

      {saved && (
        <div style={{ background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#065f46', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Save size={16} /> Configuration saved successfully
        </div>
      )}

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0', marginBottom: '0', borderBottom: '1px solid var(--lux-border)' }}>
          {[
            { id: 'agents', label: 'Agents', icon: Bot, count: Object.keys(config.agents).length },
            { id: 'workflows', label: 'Workflows', icon: Workflow, count: Object.keys(config.workflows).length },
            { id: 'automations', label: 'Automations', icon: Zap, count: config.automations.length },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1, background: 'none', border: 'none', borderBottom: activeTab === tab.id ? '2px solid var(--lux-blue)' : '2px solid transparent',
                padding: '0.85rem 1rem', fontWeight: activeTab === tab.id ? 600 : 400,
                color: activeTab === tab.id ? 'var(--lux-blue)' : 'var(--lux-gray)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', cursor: 'pointer',
              }}>
              <tab.icon size={16} /> {tab.label} <span className="badge badge-info">{tab.count}</span>
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'agents' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {Object.entries(config.agents).map(([id, agent]) => {
            const Icon = agentIcons[agent.icon] || Bot;
            return (
              <div className="card" key={id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ padding: '0.5rem', borderRadius: 8, background: agent.enabled ? '#dbeafe' : '#f3f4f6', color: agent.enabled ? 'var(--lux-blue)' : '#9ca3af' }}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {agent.name}
                        <span className={`badge ${agent.enabled ? 'badge-active' : 'badge-pending'}`}>{agent.enabled ? 'Active' : 'Disabled'}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--lux-gray)', maxWidth: 500 }}>{agent.description}</div>
                    </div>
                  </div>
                  <button className="btn btn-sm btn-outline" onClick={() => handleToggleAgent(id)}>
                    {agent.enabled ? <Pause size={14} /> : <Play size={14} />} {agent.enabled ? 'Disable' : 'Enable'}
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', fontSize: '0.8rem' }}>
                  <div>
                    <span style={{ color: 'var(--lux-gray)' }}>Schedule:</span>{' '}
                    <strong>{scheduleLabels[agent.schedule] || agent.schedule}</strong>
                  </div>
                  {agent.config && Object.entries(agent.config).slice(0, 3).map(([key, val]) => (
                    <div key={key}>
                      <span style={{ color: 'var(--lux-gray)' }}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}:</span>{' '}
                      <strong>{typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val)}</strong>
                    </div>
                  ))}
                </div>
                {agent.enabled && (
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--lux-border)' }}>
                    <details>
                      <summary style={{ cursor: 'pointer', fontSize: '0.8rem', color: 'var(--lux-blue)', fontWeight: 500 }}>Advanced Configuration</summary>
                      <div style={{ marginTop: '0.75rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        {Object.entries(agent.config).map(([key, val]) => (
                          <div className="form-group" key={key} style={{ margin: 0 }}>
                            <label style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</label>
                            {typeof val === 'boolean' ? (
                              <select className="form-select" style={{ fontSize: '0.8rem' }} value={val ? 'true' : 'false'}
                                onChange={e => updateAgentConfig(id, { config: { ...agent.config, [key]: e.target.value === 'true' } })}>
                                <option value="true">Enabled</option><option value="false">Disabled</option>
                              </select>
                            ) : (
                              <input className="form-input" style={{ fontSize: '0.8rem' }} value={val}
                                onChange={e => { agent.config[key] = e.target.value; setConfig({...config}); }} />
                            )}
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'workflows' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {Object.entries(config.workflows).map(([id, wf]) => (
            <div className="card" key={id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {wf.name}
                    <span className={`badge ${wf.enabled ? 'badge-active' : 'badge-pending'}`}>{wf.enabled ? 'Active' : 'Disabled'}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--lux-gray)' }}>{wf.description}</div>
                </div>
                <button className="btn btn-sm btn-outline" onClick={() => {
                  wf.enabled = !wf.enabled;
                  updateWorkflow(id, { enabled: wf.enabled });
                  refresh();
                }}>
                  {wf.enabled ? <Pause size={14} /> : <Play size={14} />} {wf.enabled ? 'Disable' : 'Enable'}
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '1rem' }}>
                {wf.stages.map((stage, i) => (
                  <div key={stage} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <div style={{
                      flex: 1, padding: '0.35rem 0.5rem', borderRadius: 6, textAlign: 'center',
                      background: '#f8f9fc', border: '1px solid #e2e8f0', fontSize: '0.75rem', fontWeight: 500,
                      color: 'var(--lux-blue)',
                    }}>
                      {i + 1}. {stage}
                    </div>
                    {i < wf.stages.length - 1 && (
                      <div style={{ padding: '0 0.25rem', color: '#9ca3af', fontSize: '0.7rem' }}>
                        {wf.autoTransitions[`${stage}-${wf.stages[i+1]}`]?.auto ? '→' : '⋯'}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {Object.keys(wf.autoTransitions).length > 0 && (
                <div style={{ fontSize: '0.8rem' }}>
                  <strong style={{ color: 'var(--lux-gray)' }}>Auto-Transitions:</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.35rem' }}>
                    {Object.entries(wf.autoTransitions).map(([key, t]) => (
                      <span key={key} className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                        {key.replace('-', ' → ')} {t.auto ? '(auto)' : '(manual)'}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'automations' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--lux-gray)' }}>
              {config.automations.filter(a => a.enabled).length} of {config.automations.length} automations active
            </p>
            <button className="btn btn-primary" onClick={() => setNewAuto(true)}><Plus size={16} /> New Automation</button>
          </div>

          {newAuto && (
            <div className="card" style={{ marginBottom: '1rem', border: '2px solid var(--lux-blue)' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>New Automation Rule</h3>
              <div className="grid-2">
                <div className="form-group">
                  <label>Rule Name</label>
                  <input className="form-input" value={autoForm.name} onChange={e => setAutoForm({...autoForm, name: e.target.value})} placeholder="e.g. Urgent Job → SMS Dispatch" />
                </div>
                <div className="form-group">
                  <label>Trigger Type</label>
                  <select className="form-select" value={autoForm.triggerType} onChange={e => setAutoForm({...autoForm, triggerType: e.target.value})}>
                    <option value="job.status_change">Job Status Change</option>
                    <option value="job.created">Job Created</option>
                    <option value="incident.created">Incident Reported</option>
                    <option value="incident.severity">Incident Severity Escalated</option>
                    <option value="permit.expiring">Permit Expiring</option>
                    <option value="schedule">Scheduled (Cron)</option>
                    <option value="equipment.service_due">Equipment Service Due</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Action Type</label>
                  <select className="form-select" value={autoForm.actionType} onChange={e => setAutoForm({...autoForm, actionType: e.target.value})}>
                    <option value="send_email">Send Email</option>
                    <option value="send_sms">Send SMS</option>
                    <option value="notify">In-App Notification</option>
                    <option value="dispatch">Auto Dispatch</option>
                    <option value="generate_report">Generate Report</option>
                    <option value="create_task">Create Task</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>&nbsp;</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="checkbox" checked={autoForm.enabled} onChange={e => setAutoForm({...autoForm, enabled: e.target.checked})} />
                    Enable immediately
                  </label>
                </div>
              </div>
              <div className="modal-actions" style={{ marginTop: '0.75rem' }}>
                <button className="btn btn-outline" onClick={() => setNewAuto(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleAddAutomation} disabled={!autoForm.name}>Create Rule</button>
              </div>
            </div>
          )}

          {config.automations.map(auto => (
            <div className="card" key={auto.id} style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                  <button className="btn btn-sm btn-outline" onClick={() => { toggleAutomation(auto.id); refresh(); }} style={{ color: auto.enabled ? 'var(--lux-success)' : 'var(--lux-gray)' }}>
                    {auto.enabled ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                  </button>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {auto.name}
                      <span className={`badge ${auto.enabled ? 'badge-active' : 'badge-pending'}`}>{auto.enabled ? 'Active' : 'Disabled'}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--lux-gray)' }}>
                      <span className="badge badge-info">{auto.trigger.type.replace('.', ' → ').replace('_', ' ')}</span>
                      {' '}→{' '}
                      <span className="badge badge-active">{auto.action.type.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.3rem' }}>
                  <button className="btn btn-sm btn-outline" onClick={() => { deleteAutomation(auto.id); refresh(); }}><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}