import { useState, useEffect } from 'react';
import { Save, Plus, X, CheckCircle, Mail, Settings2, Bot, FileText, AlertTriangle, Eye, EyeOff, Copy, Send } from 'lucide-react';
import { workflowStatuses as defaultStatuses, jobTypes as defaultTypes, jobPriorities as defaultPriorities } from '../data/mockData';
import { getTemplates, saveTemplate, deleteTemplate, templateVariables } from '../services/templateService';
import { getAutomationConfig, saveAutomationConfig } from '../services/agentsConfig';
import { sendEmail } from '../utils/emailUtils';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [statuses, setStatuses] = useState(defaultStatuses);
  const [types, setTypes] = useState(defaultTypes);
  const [priorities, setPriorities] = useState(defaultPriorities);
  const [newStatus, setNewStatus] = useState('');
  const [newType, setNewType] = useState('');
  const [saved, setSaved] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [templateForm, setTemplateForm] = useState(null);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [autoConfig, setAutoConfig] = useState(null);
  const [testStatus, setTestStatus] = useState(null);
  const [testError, setTestError] = useState('');

  const [smtp, setSmtp] = useState(() => {
    const stored = localStorage.getItem('lux_smtp_config');
    return stored ? JSON.parse(stored) : { host: 'smtp.lux-traffic.com.au', port: '587', user: 'notifications@lux-traffic.com.au', pass: '', fromName: 'LUX Traffic Management', fromEmail: 'notifications@lux-traffic.com.au' };
  });

  const [autoEmail, setAutoEmail] = useState(() => {
    const stored = localStorage.getItem('lux_auto_email_settings');
    return stored ? JSON.parse(stored) : {
      'Planning-Scheduled': { enabled: true, template: 'TMP Approval Request', sendTo: 'client, crew', label: 'Planning → Scheduled' },
      'Scheduled-Active': { enabled: true, template: 'Job Notification', sendTo: 'client, crew, authority', label: 'Scheduled → Active' },
      'Active-Completed': { enabled: true, template: 'Job Completion Report', sendTo: 'client, crew', label: 'Active → Completed' },
    };
  });

  const [skills, setSkills] = useState(() => {
    const stored = localStorage.getItem('lux_skills_config');
    return stored ? JSON.parse(stored) : [
      { id: 'skill-tmp', enabled: true, name: 'TMP PDF Generator', description: 'Generate compliant Traffic Management Plan PDFs from job data' },
      { id: 'skill-email', enabled: true, name: 'Email Composer', description: 'Compose context-aware emails using templates + job data with smart CC/BCC' },
      { id: 'skill-docparse', enabled: false, name: 'Document Parser', description: 'Parse incoming emails to extract job requests, incident reports, permit approvals' },
      { id: 'skill-invoice', enabled: false, name: 'Invoice Generator', description: 'Convert completed jobs into invoices using rate cards, hours, equipment' },
      { id: 'skill-hazard', enabled: false, name: 'Site Hazard Analyzer', description: 'Analyze locations for known hazards, speed limits, school zones, traffic volumes' },
      { id: 'skill-ratecalc', enabled: true, name: 'Rate Calculator', description: 'Calculate job costs from crew hours × rates + equipment hire + fees + margin' },
      { id: 'skill-shiftopt', enabled: false, name: 'Shift Optimizer', description: 'Create optimal crew schedules minimizing travel and avoiding overtime' },
      { id: 'skill-authfmt', enabled: true, name: 'Authority Format Converter', description: 'Convert job data into each authority\'s required format (MRWA, Council, Police)' },
      { id: 'skill-weather', enabled: false, name: 'Weather Integration', description: 'Fetch BoM forecast for job locations, flag extreme weather days' },
      { id: 'skill-audit', enabled: true, name: 'Audit Trail', description: 'Record every change across all entities for ISO/OHS compliance' },
    ];
  });

  useEffect(() => {
    setTemplates(getTemplates());
    setAutoConfig(getAutomationConfig());
  }, []);

  const handleSave = () => {
    localStorage.setItem('lux_smtp_config', JSON.stringify(smtp));
    localStorage.setItem('lux_auto_email_settings', JSON.stringify(autoEmail));
    localStorage.setItem('lux_skills_config', JSON.stringify(skills));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSaveTemplate = () => {
    if (!templateForm) return;
    const result = saveTemplate(templateForm);
    setTemplates(result);
    setShowTemplateEditor(false);
    setTemplateForm(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDeleteTemplate = (id) => {
    if (confirm('Delete this template?')) {
      setTemplates(deleteTemplate(id));
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings2 },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'skills', label: 'Skills', icon: Bot },
    { id: 'triggers', label: 'Triggers', icon: AlertTriangle },
  ];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Settings & Customization</h1>
          <p>Configure workflows, email templates, skills, and automation triggers</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave}><Save size={16} /> Save All</button>
      </div>

      {saved && (
        <div style={{ background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#065f46', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={16} /> Settings saved successfully
        </div>
      )}

      <div className="card" style={{ marginBottom: '1.5rem', padding: '0' }}>
        <div style={{ display: 'flex', gap: '0', overflowX: 'auto' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1, minWidth: 100, background: 'none', border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid var(--lux-blue)' : '2px solid transparent',
                padding: '0.85rem 1rem', fontWeight: activeTab === tab.id ? 600 : 400,
                color: activeTab === tab.id ? 'var(--lux-blue)' : 'var(--lux-gray)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}>
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'general' && (
        <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>Job Statuses</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--lux-gray)', marginBottom: '1rem' }}>Customize workflow statuses available in the Job Board.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              {statuses.map(s => (
                <span key={s} className="badge badge-info" style={{ padding: '0.35rem 0.7rem', fontSize: '0.8rem' }}>
                  {s} <button onClick={() => setStatuses(statuses.filter(x => x !== s))} style={{ background: 'none', border: 'none', marginLeft: '0.3rem', cursor: 'pointer', fontSize: '0.8rem', color: 'inherit' }}>×</button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input className="form-input" value={newStatus} onChange={e => setNewStatus(e.target.value)} placeholder="New status..." style={{ flex: 1 }} />
              <button className="btn btn-sm btn-primary" onClick={() => { if (newStatus.trim() && !statuses.includes(newStatus.trim())) { setStatuses([...statuses, newStatus.trim()]); setNewStatus(''); } }}><Plus size={14} /></button>
            </div>
          </div>
          <div className="card">
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>Job Types & Priorities</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--lux-gray)', marginBottom: '1rem' }}>Define job types and priority levels.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              {types.map(t => (
                <span key={t} className="badge badge-active" style={{ padding: '0.35rem 0.7rem', fontSize: '0.8rem' }}>
                  {t} <button onClick={() => setTypes(types.filter(x => x !== t))} style={{ background: 'none', border: 'none', marginLeft: '0.3rem', cursor: 'pointer', fontSize: '0.8rem', color: 'inherit' }}>×</button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input className="form-input" value={newType} onChange={e => setNewType(e.target.value)} placeholder="New type..." style={{ flex: 1 }} />
              <button className="btn btn-sm btn-primary" onClick={() => { if (newType.trim() && !types.includes(newType.trim())) { setTypes([...types, newType.trim()]); setNewType(''); } }}><Plus size={14} /></button>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem', display: 'block' }}>Priority Levels</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {priorities.map(p => (
                  <span key={p} className={`badge ${p === 'Urgent' ? 'badge-urgent' : p === 'High' ? 'badge-active' : p === 'Low' ? 'badge-completed' : 'badge-info'}`} style={{ padding: '0.35rem 0.7rem', fontSize: '0.8rem' }}>{p}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'email' && (
        <div>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}><Mail size={16} /> SMTP / Email Server</h3>
            <div className="grid-3">
              <div className="form-group"><label>SMTP Host</label><input className="form-input" value={smtp.host} onChange={e => setSmtp({...smtp, host: e.target.value})} /></div>
              <div className="form-group"><label>Port</label><input className="form-input" value={smtp.port} onChange={e => setSmtp({...smtp, port: e.target.value})} /></div>
              <div className="form-group"><label>Username</label><input className="form-input" value={smtp.user} onChange={e => setSmtp({...smtp, user: e.target.value})} /></div>
              <div className="form-group">
                <label>Password</label>
                <div style={{ position: 'relative' }}>
                  <input className="form-input" type={showPw ? 'text' : 'password'} value={smtp.pass} onChange={e => setSmtp({...smtp, pass: e.target.value})} placeholder="SMTP password" />
                  <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--lux-gray)' }}>
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="form-group"><label>From Name</label><input className="form-input" value={smtp.fromName} onChange={e => setSmtp({...smtp, fromName: e.target.value})} /></div>
              <div className="form-group"><label>From Email</label><input className="form-input" type="email" value={smtp.fromEmail} onChange={e => setSmtp({...smtp, fromEmail: e.target.value})} /></div>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button className="btn btn-primary" onClick={async () => {
                await handleSave();
                const testMsg = await sendEmail(smtp.fromEmail || smtp.user, 'LUX Email Test', `<h2>Test Email</h2><p>Your SMTP settings are working correctly.</p><p>Sent at: ${new Date().toLocaleString()}</p>`);
                if (testMsg.status === 'Sent') {
                  setTestStatus('success');
                } else {
                  setTestStatus('error');
                  setTestError(testMsg.error || 'Unknown error');
                }
              }}><Send size={14} /> Send Test Email</button>
              {testStatus === 'success' && <span style={{ color: '#065f46', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}><CheckCircle size={14} /> Test email sent successfully</span>}
              {testStatus === 'error' && <span style={{ color: '#991b1b', fontSize: '0.85rem' }}>Failed: {testError}</span>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--lux-gray)' }}>{templates.length} email templates available</p>
            <button className="btn btn-primary" onClick={() => { setTemplateForm({ id: '', name: '', category: 'Notifications', subject: '', body: '' }); setShowTemplateEditor(true); }}><Plus size={16} /> New Template</button>
          </div>

          {showTemplateEditor && templateForm && (
            <div className="card" style={{ marginBottom: '1rem', border: '2px solid var(--lux-blue)' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>{templateForm.id ? 'Edit Template' : 'New Email Template'}</h3>
              <div className="grid-2">
                <div className="form-group"><label>Template Name</label><input className="form-input" value={templateForm.name} onChange={e => setTemplateForm({...templateForm, name: e.target.value})} placeholder="e.g. Client Onboarding" /></div>
                <div className="form-group"><label>Category</label><select className="form-select" value={templateForm.category} onChange={e => setTemplateForm({...templateForm, category: e.target.value})}>
                  <option>Approvals</option><option>Notifications</option><option>Reports</option><option>Authorities</option><option>Safety</option><option>Operations</option><option>Commercial</option>
                </select></div>
              </div>
              <div className="form-group"><label>Subject Line</label><input className="form-input" value={templateForm.subject} onChange={e => setTemplateForm({...templateForm, subject: e.target.value})} placeholder="Use {'{job.title}'} for dynamic fields" /></div>
              <div className="form-group"><label>Email Body</label><textarea className="form-textarea" style={{ minHeight: 180, fontFamily: 'monospace', fontSize: '0.8rem' }} value={templateForm.body} onChange={e => setTemplateForm({...templateForm, body: e.target.value})} /></div>
              <details style={{ marginBottom: '1rem' }}>
                <summary style={{ cursor: 'pointer', fontSize: '0.8rem', color: 'var(--lux-blue)', fontWeight: 500 }}>Available Variables (click to expand)</summary>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem', marginTop: '0.5rem', maxHeight: 200, overflowY: 'auto', fontSize: '0.75rem' }}>
                  {templateVariables.map(v => (
                    <div key={v.var} style={{ display: 'flex', gap: '0.5rem', padding: '0.2rem 0' }}>
                      <code style={{ color: 'var(--lux-blue)', fontWeight: 600, whiteSpace: 'nowrap' }}>{v.var}</code>
                      <span style={{ color: 'var(--lux-gray)' }}>{v.desc}</span>
                    </div>
                  ))}
                </div>
              </details>
              <div className="modal-actions" style={{ marginTop: 0 }}>
                <button className="btn btn-outline" onClick={() => setShowTemplateEditor(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSaveTemplate}>{templateForm.id ? 'Update Template' : 'Create Template'}</button>
              </div>
            </div>
          )}

          {templates.map(t => (
            <div className="card" key={t.id} style={{ marginBottom: '0.5rem', padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.name}</span>
                    <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{t.category}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--lux-gray)', fontFamily: 'monospace', marginBottom: '0.5rem' }}>{t.subject}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--lux-gray)', background: '#f8f9fc', borderRadius: 6, padding: '0.5rem', whiteSpace: 'pre-wrap', maxHeight: 60, overflow: 'hidden' }}>
                    {t.body.substring(0, 150)}{t.body.length > 150 ? '...' : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.3rem', marginLeft: '1rem' }}>
                  <button className="btn btn-sm btn-outline" onClick={() => { setTemplateForm(t); setShowTemplateEditor(true); }}>Edit</button>
                  <button className="btn btn-sm btn-outline" style={{ color: 'var(--lux-danger)' }} onClick={() => handleDeleteTemplate(t.id)}>×</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'skills' && (
        <div className="card">
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}><Bot size={16} /> System Skills</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--lux-gray)', marginBottom: '1rem' }}>
            Skills are specialized capabilities the system uses to process data. Enable or disable skills as needed.
          </p>
          {skills.map(skill => (
            <div key={skill.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--lux-border)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{skill.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--lux-gray)' }}>{skill.description}</div>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, marginLeft: '1rem' }}>
                <input type="checkbox" checked={skill.enabled} onChange={e => setSkills(skills.map(s => s.id === skill.id ? { ...s, enabled: e.target.checked } : s))} style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{
                  position: 'absolute', cursor: 'pointer', inset: 0, borderRadius: 24, transition: '0.3s',
                  background: skill.enabled ? 'var(--lux-blue)' : '#d1d5db',
                }}>
                  <span style={{
                    position: 'absolute', height: 20, width: 20, left: skill.enabled ? 22 : 2, top: 2,
                    borderRadius: '50%', background: '#fff', transition: '0.3s',
                  }} />
                </span>
              </label>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'triggers' && (
        <div className="card">
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}><AlertTriangle size={16} /> Auto-Email Triggers</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--lux-gray)', marginBottom: '1rem' }}>
            Configure automated emails sent when job status changes. Templates and recipients are configurable.
          </p>
          <table>
            <thead>
              <tr><th>Trigger</th><th>Enabled</th><th>Template</th><th>Send To</th></tr>
            </thead>
            <tbody>
              {Object.entries(autoEmail).map(([key, val]) => (
                <tr key={key}>
                  <td style={{ fontWeight: 500 }}>{val.label || key}</td>
                  <td>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="checkbox" checked={val.enabled} onChange={e => setAutoEmail({...autoEmail, [key]: { ...val, enabled: e.target.checked } })} />
                      {val.enabled ? 'Active' : 'Disabled'}
                    </label>
                  </td>
                  <td>
                    <select className="form-select" style={{ fontSize: '0.8rem' }} value={val.template} onChange={e => setAutoEmail({...autoEmail, [key]: { ...val, template: e.target.value } })}>
                      <option>TMP Approval Request</option>
                      <option>Job Notification</option>
                      <option>Job Completion Report</option>
                      <option>Authority Submission</option>
                      <option>Incident Notification</option>
                    </select>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {['client', 'crew', 'authority', 'cc'].map(t => (
                        <label key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}>
                          <input type="checkbox" checked={val.sendTo.includes(t)} onChange={e => {
                            const parts = val.sendTo.split(', ').filter(Boolean);
                            if (e.target.checked) parts.push(t); else { const idx = parts.indexOf(t); if (idx > -1) parts.splice(idx, 1); }
                            setAutoEmail({...autoEmail, [key]: { ...val, sendTo: parts.join(', ') }});
                          }} />
                          {t}
                        </label>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f8f9fc', borderRadius: 8, fontSize: '0.8rem', color: 'var(--lux-gray)' }}>
            <strong>How it works:</strong> When a job status changes in the Job Board, the system checks these triggers. If a matching trigger is enabled, an email is automatically sent using the selected template to the specified recipients.
          </div>
        </div>
      )}
    </div>
  );
}