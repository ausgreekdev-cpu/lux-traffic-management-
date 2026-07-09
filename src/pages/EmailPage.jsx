import { useState } from 'react';
import { Plus, Mail, Edit3, Send, Trash2, CheckCircle } from 'lucide-react';
import { getTemplates, saveTemplate as saveTemplSvc, deleteTemplate as delTemplSvc, templateVariables } from '../services/templateService';
import { renderTemplate, sendEmail } from '../utils/emailUtils';
import { jobs } from '../data/mockData';

export default function EmailPage() {
  const [templates, setTemplates] = useState(getTemplates());
  const [showModal, setShowModal] = useState(false);
  const [editTemplate, setEditTemplate] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewJob, setPreviewJob] = useState(jobs[0]);
  const [sendLog, setSendLog] = useState([]);
  const [form, setForm] = useState({ name: '', subject: '', body: '' });
  const [sendForm, setSendForm] = useState({ to: '', cc: '' });

  const handleSendTest = async (template) => {
    const client = { name: 'Test Client', email: sendForm.to || 'test@lux-traffic.com.au' };
    const { body, subject } = renderTemplate(template, previewJob, client);
    const email = await sendEmail(sendForm.to || 'test@lux-traffic.com.au', subject, body, sendForm.cc ? sendForm.cc.split(',').map(s => s.trim()) : []);
    setSendLog([email, ...sendLog].slice(0, 20));
  };

  const saveTemplate = () => {
    if (editTemplate && editTemplate.id) {
      const updated = { ...editTemplate, ...form };
      setTemplates(saveTemplSvc(updated));
    } else {
      const newTempl = { id: `EMT-${Date.now()}`, ...form, category: 'Notifications' };
      setTemplates(saveTemplSvc(newTempl));
    }
    setShowModal(false); setEditTemplate(null);
  };

  const deleteTemplate = (id) => {
    if (confirm('Delete this template?')) setTemplates(delTemplSvc(id));
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Email Templates & Automation</h1>
          <p>Create email templates, auto-send updates, and track email history</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditTemplate(null); setForm({ name: '', subject: '', body: '', category: 'Notifications' }); setShowModal(true); }}>
          <Plus size={16} /> New Template
        </button>
      </div>

      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>Job Status Change Auto-Email</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--lux-gray)', marginBottom: '1rem' }}>
            When a job status changes in the Job Board, an automatic email can be sent to relevant stakeholders.
          </p>
          <div style={{ fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--lux-border)' }}>
              <span>Planning → Scheduled</span>
              <span className="badge badge-info">TMP Approval Request</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--lux-border)' }}>
              <span>Scheduled → Active</span>
              <span className="badge badge-info">Job Notification</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--lux-border)' }}>
              <span>Active → Completed</span>
              <span className="badge badge-info">Job Completion Report</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
              <span>Any Status Change</span>
              <span className="badge badge-info">Email client + crew + CC</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>Quick Send</h3>
          <div className="form-group">
            <label>Test Email To</label>
            <input className="form-input" value={sendForm.to} onChange={e => setSendForm({...sendForm, to: e.target.value})} placeholder="recipient@example.com" />
          </div>
          <div className="form-group">
            <label>CC</label>
            <input className="form-input" value={sendForm.cc} onChange={e => setSendForm({...sendForm, cc: e.target.value})} placeholder="cc@example.com" />
          </div>
          <div className="form-group">
            <label>Template</label>
            <select className="form-select" value={selectedTemplate?.id || ''} onChange={e => setSelectedTemplate(templates.find(t => t.id === e.target.value))}>
              <option value="">Select a template</option>
              {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={() => handleSendTest(selectedTemplate)} disabled={!selectedTemplate}>
            <Mail size={16} /> Send Test Email
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem' }}>Email Templates</h3>
      </div>

      <div className="grid-2">
        {templates.map(t => (
          <div className="card" key={t.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{t.name} <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{t.category || 'General'}</span></div>
                <div style={{ fontSize: '0.8rem', color: 'var(--lux-gray)', fontFamily: 'monospace' }}>{t.subject}</div>
              </div>
              <div style={{ display: 'flex', gap: '0.3rem' }}>
                <button className="btn btn-sm btn-outline" onClick={() => { setEditTemplate(t); setForm({ name: t.name, subject: t.subject, body: t.body, category: t.category || 'Notifications' }); setShowModal(true); }}><Edit3 size={12} /></button>
                <button className="btn btn-sm btn-outline" onClick={() => deleteTemplate(t.id)}><Trash2 size={12} /></button>
              </div>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--lux-gray)', background: '#f8f9fc', borderRadius: 6, padding: '0.75rem', whiteSpace: 'pre-wrap', maxHeight: 120, overflow: 'hidden' }}>
              {t.body.substring(0, 200)}{t.body.length > 200 ? '...' : ''}
            </div>
          </div>
        ))}
      </div>

      {sendLog.length > 0 && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Mail size={16} /> Email Send History
          </h3>
          <table>
            <thead><tr><th>Time</th><th>To</th><th>Subject</th><th>Status</th></tr></thead>
            <tbody>
              {sendLog.map((email, i) => (
                <tr key={i}>
                  <td style={{ fontSize: '0.75rem' }}>{new Date(email.sentAt).toLocaleTimeString()}</td>
                  <td>{email.to}</td>
                  <td>{email.subject}</td>
                  <td><span className="badge badge-active"><CheckCircle size={12} /> Sent</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{form.name ? 'Edit Template' : 'New Template'}</h2>
            <div className="grid-2">
              <div className="form-group">
                <label>Template Name</label>
                <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. TMP Approval Request" />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select className="form-select" value={form.category || 'Notifications'} onChange={e => setForm({...form, category: e.target.value})}>
                  <option>Approvals</option><option>Notifications</option><option>Reports</option>
                  <option>Authorities</option><option>Safety</option><option>Operations</option><option>Commercial</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Subject Line</label>
              <input className="form-input" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} placeholder="Use {'{job.title}'} for dynamic fields" />
            </div>
            <div className="form-group">
              <label>Email Body</label>
              <textarea className="form-textarea" style={{ minHeight: 200, fontFamily: 'monospace', fontSize: '0.85rem' }} value={form.body} onChange={e => setForm({...form, body: e.target.value})} placeholder="Dear {client.name}, ..." />
            </div>
            <details style={{ marginBottom: '1rem' }}>
              <summary style={{ cursor: 'pointer', fontSize: '0.8rem', color: 'var(--lux-blue)', fontWeight: 500 }}>Available Variables — click to expand ({templateVariables.length} total)</summary>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem', marginTop: '0.5rem', maxHeight: 160, overflowY: 'auto', fontSize: '0.75rem' }}>
                {templateVariables.map(v => (
                  <div key={v.var} style={{ display: 'flex', gap: '0.5rem', padding: '0.15rem 0' }}>
                    <code style={{ color: 'var(--lux-blue)', fontWeight: 600, whiteSpace: 'nowrap' }}>{v.var}</code>
                    <span style={{ color: 'var(--lux-gray)' }}>{v.desc}</span>
                  </div>
                ))}
              </div>
            </details>
            <div style={{ background: '#f8f9fc', borderRadius: 8, padding: '1rem', marginBottom: '1rem', fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
              <strong>Subject Preview:</strong> {renderTemplate(form, previewJob, { name: 'Client Name', email: 'client@example.com' }).subject}<br/>
              <strong>Body Preview:</strong><br/>
              {renderTemplate(form, previewJob, { name: 'Client Name', email: 'client@example.com' }).body}
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveTemplate}>{editTemplate ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}