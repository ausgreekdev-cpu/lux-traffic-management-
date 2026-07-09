import { useState, useEffect } from 'react';
import { Search, Plus, Mail, Send, CheckCircle, Upload, Paperclip, File, X, Zap, Download, Trash2, FolderOpen } from 'lucide-react';
import { workflowStatuses, jobPriorities, jobTypes, exportFormats } from '../data/mockData';
import { renderTemplate, sendEmail, generateAuthorityExport } from '../utils/emailUtils';
import { getTemplates } from '../services/templateService';
import { logAction } from '../services/agentLogger';
import { getJobAttachments, uploadAttachment, deleteAttachment, getClients } from '../services/dataService';

const defaultJobs = [
  { id: 'JOB-001', title: 'Mitchell Frwy - Lane Closure (Southbound)', client: 'Main Roads WA', location: 'Mitchell Freeway, Perth WA', status: 'Active', priority: 'High', type: 'Lane Closure', startDate: '2026-07-10', endDate: '2026-07-12', crew: 'Crew A', equipment: ['TMA Truck', 'Cones', 'Signs'], emailThread: [], notes: 'Night works 8pm-5am', attachments: [] },
  { id: 'JOB-002', title: 'Elizabeth Quay Bus Bridge Works', client: 'City of Perth', location: 'Elizabeth Quay Bus Bridge, Perth WA', status: 'Scheduled', priority: 'Medium', type: 'Bridge Works', startDate: '2026-07-15', endDate: '2026-07-20', crew: 'Crew B', equipment: ['VMS Board', 'Cones', 'TMA Truck'], emailThread: [], notes: 'Major event coordination required', attachments: [] },
  { id: 'JOB-003', title: 'Kwinana Fwy - Shoulder Works', client: 'Main Roads WA', location: 'Kwinana Freeway, Como WA', status: 'Active', priority: 'Urgent', type: 'Shoulder Works', startDate: '2026-07-09', endDate: '2026-07-09', crew: 'Crew C', equipment: ['TMA Truck', 'Cones', 'Arrow Board'], emailThread: [], notes: 'Emergency pavement repair', attachments: [] },
  { id: 'JOB-004', title: 'Great Eastern Hwy - Utility Works', client: 'BGC Construction', location: 'Great Eastern Hwy, Redcliffe WA', status: 'Planning', priority: 'Low', type: 'Utility Works', startDate: '2026-08-01', endDate: '2026-08-05', crew: 'Crew A', equipment: ['Cones', 'Signs', 'VMS Board'], emailThread: [], notes: 'Gas main upgrade - TMP to MRWA', attachments: [] },
  { id: 'JOB-005', title: 'Roe Highway - Intersection Upgrade', client: 'Georgiou Group', location: 'Roe Hwy & Nicholson Rd, Canning Vale WA', status: 'Active', priority: 'High', type: 'Intersection Works', startDate: '2026-07-11', endDate: '2026-08-20', crew: 'Crew B', equipment: ['TMA Truck', 'VMS Board', 'Cones', 'Arrow Board', 'Barriers'], emailThread: [], notes: 'Major intersection upgrade - TMP approved', attachments: [] },
  { id: 'JOB-006', title: 'St Georges Tce - Event Traffic Mgmt', client: 'City of Perth', location: 'St Georges Terrace, Perth WA', status: 'Scheduled', priority: 'Medium', type: 'Event Traffic', startDate: '2026-07-25', endDate: '2026-07-26', crew: 'Crew C', equipment: ['Cones', 'Signs', 'Barriers'], emailThread: [], notes: 'Perth City Festival traffic plan', attachments: [] },
];

export default function Jobs() {
  const [jobList, setJobList] = useState(defaultJobs);
  const [showModal, setShowModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [editJob, setEditJob] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [emailLog, setEmailLog] = useState([]);
  const [form, setForm] = useState({ title: '', client: '', clientId: '', location: '', status: 'Planning', priority: 'Medium', type: 'Lane Closure', startDate: '', endDate: '', crew: '', notes: '' });
  const [emailForm, setEmailForm] = useState({ templateId: '', to: '', cc: '', attachments: [] });
  const [jobFiles, setJobFiles] = useState([]);
  const [clients, setClients] = useState([]);
  const [uploading, setUploading] = useState(false);
  const templates = getTemplates();

  useEffect(() => { getClients().then(setClients).catch(() => {}); }, []);

  useEffect(() => {
    if (selectedJob) getJobAttachments(selectedJob.id).then(setJobFiles).catch(() => setJobFiles([]));
    else setJobFiles([]);
  }, [selectedJob]);

  const clientNames = [...new Set(jobList.map(j => j.client))];

  const filteredJobs = jobList.filter(j => {
    const q = search.toLowerCase();
    return (statusFilter === 'All' || j.status === statusFilter) &&
      (j.title.toLowerCase().includes(q) || j.location.toLowerCase().includes(q) || j.id.toLowerCase().includes(q) || j.client.toLowerCase().includes(q));
  });

  const openNew = () => { setEditJob(null); setForm({ title: '', client: '', clientId: '', location: '', status: 'Planning', priority: 'Medium', type: 'Lane Closure', startDate: '', endDate: '', crew: '', notes: '' }); setShowModal(true); };
  const openEdit = (job) => { setEditJob(job); setForm({ ...job, clientId: job.clientId || '' }); setShowModal(true); getJobAttachments(job.id).then(setJobFiles).catch(() => setJobFiles([])); };

  const handleFileAttach = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map(f => ({ name: f.name, size: f.size, type: f.type, addedAt: new Date().toISOString() }));
    setForm({...form, attachments: [...(form.attachments || []), ...newFiles]});
  };

  const removeAttachment = (idx) => {
    setForm({...form, attachments: form.attachments.filter((_, i) => i !== idx)});
  };

  const saveJob = () => {
    if (editJob) {
      setJobList(jobList.map(j => j.id === editJob.id ? { ...j, ...form, attachments: form.attachments || [] } : j));
    } else {
      const newId = `JOB-${String(jobList.length + 1).padStart(3, '0')}`;
      setJobList([...jobList, { id: newId, ...form, equipment: [], emailThread: [], attachments: form.attachments || [] }]);
    }
    setShowModal(false);
  };

  const updateStatus = async (jobId, status) => {
    const job = jobList.find(j => j.id === jobId);
    if (!job) return;

    setJobList(jobList.map(j => j.id === jobId ? { ...j, status } : j));
    logAction('Auto-Email', `Status Change: ${job.status} → ${status}`, `Job ${jobId}: ${job.title}`, 'success');

    const autoEmailSettings = JSON.parse(localStorage.getItem('lux_auto_email_settings'));
    if (!autoEmailSettings) return;

    const triggerKey = `${job.status}-${status}`;
    const trigger = autoEmailSettings[triggerKey];
    if (!trigger || !trigger.enabled) return;

    const template = templates.find(t => t.name === trigger.template);
    if (!template) return;

    const client = { name: job.client, email: job.client === 'Main Roads WA' ? 'projects@mainroads.wa.gov.au' : job.client === 'City of Perth' ? 'traffic@cityofperth.wa.gov.au' : 'client@example.com' };
    const { body, subject } = renderTemplate(template, job, client);

    const recipients = [];
    const toList = (trigger.sendTo || '').split(', ').filter(Boolean);
    if (toList.includes('client')) recipients.push(client.email);
    if (toList.includes('crew')) recipients.push(getCc(job) || '');
    if (toList.includes('authority')) recipients.push(job.client === 'Main Roads WA' ? 'projects@mainroads.wa.gov.au' : 'permits@cityofperth.wa.gov.au');
    const cc = toList.includes('cc') ? ['operations@lux-traffic.com.au'] : [];

    const email = await sendEmail(recipients.filter(Boolean).join(', '), subject, body, cc);
    setEmailLog([...emailLog, { ...email, jobId }]);
    setJobList(prev => prev.map(j => j.id === jobId ? { ...j, emailThread: [...j.emailThread, email] } : j));
    logAction('Auto-Email', 'Email Sent Automatically', `"${subject}" sent to ${recipients.join(', ')} for ${jobId}`);
  };

  const handleSendEmail = async () => {
    const template = templates.find(t => t.id === emailForm.templateId);
    if (!template || !selectedJob) return;
    const client = { name: selectedJob.client, email: emailForm.to || 'client@example.com' };
    const rendered = renderTemplate(template, selectedJob, client);
    const email = await sendEmail(emailForm.to || client.email, rendered.subject, rendered.body, emailForm.cc ? emailForm.cc.split(',').map(s => s.trim()) : []);
    setEmailLog([...emailLog, { ...email, jobId: selectedJob.id }]);
    setJobList(jobList.map(j => j.id === selectedJob.id ? { ...j, emailThread: [...j.emailThread, email] } : j));
    setShowEmailModal(false);
  };

  const handleExport = (format) => {
    if (!selectedJob) return;
    const client = { name: selectedJob.client, email: '', phone: '', address: '' };
    generateAuthorityExport(selectedJob, client, format);
    setShowExportModal(false);
  };

  const projectCc = (job) => {
    const map = { 'Crew A': 'crewa@lux-traffic.com.au', 'Crew B': 'crewb@lux-traffic.com.au', 'Crew C': 'crewc@lux-traffic.com.au' };
    return map[job.crew] || '';
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Job Board</h1>
          <p>Manage all traffic management jobs across Perth WA</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}><Plus size={16} /> New Job</button>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--lux-gray)' }} />
            <input className="form-input" style={{ paddingLeft: '2.2rem' }} placeholder="Search jobs..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-select" style={{ width: 'auto' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            {workflowStatuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <span style={{ fontSize: '0.8rem', color: 'var(--lux-gray)' }}>{filteredJobs.length} jobs</span>
        </div>
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr><th>ID</th><th>Title</th><th>Client</th><th>Location</th><th>Status</th><th>Priority</th><th>Type</th><th>Duration</th><th>Crew</th><th>Files</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filteredJobs.map(job => (
              <tr key={job.id}>
                <td style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.8rem' }}>{job.id}</td>
                <td style={{ fontWeight: 500 }}>{job.title}</td>
                <td>{job.client}</td>
                <td style={{ fontSize: '0.8rem', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.location}</td>
                <td>
                  <select className="form-select" style={{ width: 'auto', fontSize: '0.75rem', padding: '0.2rem 0.4rem' }} value={job.status}
                    onChange={e => updateStatus(job.id, e.target.value)}>
                    {workflowStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td><span className={`badge badge-${job.priority === 'Urgent' ? 'urgent' : job.priority === 'High' ? 'active' : job.priority === 'Low' ? 'completed' : 'info'}`}>{job.priority}</span></td>
                <td style={{ fontSize: '0.8rem' }}>{job.type}</td>
                <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{job.startDate} - {job.endDate}</td>
                <td><span className="badge badge-info">{job.crew}</span></td>
                <td>{job.attachments && job.attachments.length > 0 ? <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem', color: 'var(--lux-gray)' }}><Paperclip size={12} /> {job.attachments.length}</span> : '-'}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    <button className="btn btn-sm btn-outline" title="Send Email" onClick={() => { setSelectedJob(job); setEmailForm({ templateId: '', to: job.client === 'Main Roads WA' ? 'projects@mainroads.wa.gov.au' : 'traffic@cityofperth.wa.gov.au', cc: getCc(job), attachments: [] }); setShowEmailModal(true); }}><Mail size={14} /></button>
                    <button className="btn btn-sm btn-outline" title="Export to Authority" onClick={() => { setSelectedJob(job); setShowExportModal(true); }}><Send size={14} /></button>
                    <button className="btn btn-sm btn-outline" onClick={() => openEdit(job)}>Edit</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editJob ? 'Edit Job' : 'Create New Job'}</h2>
            <div className="grid-2">
              <div className="form-group">
                <label>Job Title</label>
                <input className="form-input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Mitchell Frwy - Lane Closure" />
              </div>
              <div className="form-group">
                <label>Client</label>
                <select className="form-select" value={form.clientId} onChange={e => {
                  const c = clients.find(cl => cl.id === e.target.value);
                  setForm({...form, clientId: e.target.value, client: c ? c.name : '' });
                }}>
                  <option value="">Select client...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Location</label>
                <input className="form-input" value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="Full road location" />
              </div>
              <div className="form-group">
                <label>Job Type</label>
                <select className="form-select" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                  {jobTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select className="form-select" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                  {workflowStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select className="form-select" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                  {jobPriorities.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input className="form-input" type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input className="form-input" type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Crew</label>
                <select className="form-select" value={form.crew} onChange={e => setForm({...form, crew: e.target.value})}>
                  <option value="">Select crew</option><option>Crew A</option><option>Crew B</option><option>Crew C</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea className="form-textarea" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="TMP status, equipment, special instructions..." />
            </div>
            <div className="form-group">
              <label>Attachments (browser local — metadata only)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                {(form.attachments || []).map((att, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#f8f9fc', borderRadius: 6, padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>
                    <Paperclip size={14} />
                    <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{att.name}</span>
                    <button onClick={() => removeAttachment(i)} style={{ background: 'none', border: 'none', color: 'var(--lux-danger)', cursor: 'pointer', fontSize: '0.8rem' }}>×</button>
                  </div>
                ))}
              </div>
              <label className="btn btn-sm btn-outline" style={{ cursor: 'pointer', display: 'inline-flex' }}>
                <Upload size={14} /> Add Files
                <input type="file" multiple onChange={handleFileAttach} style={{ display: 'none' }} />
              </label>
            </div>
            {editJob && (
              <div className="form-group" style={{ marginTop: '0.5rem', padding: '0.75rem', background: '#f8f9fc', borderRadius: 8 }}>
                <label style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}><FolderOpen size={14} /> Server Files (persistent — attached to job ID)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '0.5rem' }}>
                  {jobFiles.length === 0 && <span style={{ fontSize: '0.75rem', color: 'var(--lux-gray)' }}>No server files uploaded yet.</span>}
                  {jobFiles.map(f => (
                    <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', padding: '0.3rem 0.5rem', background: '#fff', borderRadius: 6 }}>
                      <File size={14} />
                      <a href={`http://localhost:3001${f.path}`} target="_blank" rel="noreferrer" style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.originalName}</a>
                      <span style={{ color: 'var(--lux-gray)' }}>{(f.size / 1024).toFixed(0)} KB</span>
                      <button className="btn btn-xs btn-outline" style={{ color: 'var(--lux-danger)' }} onClick={async () => { try { await deleteAttachment(f.id); setJobFiles(jobFiles.filter(x => x.id !== f.id)); } catch (e) { alert(e.message); } }}><Trash2 size={12} /></button>
                    </div>
                  ))}
                </div>
                <div>
                  <input type="file" onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    setUploading(true);
                    try {
                      const res = await uploadAttachment(file, editJob.id, form.clientId, { category: 'General', uploadedBy: 'admin' });
                      if (res.success) setJobFiles([...jobFiles, res.attachment]);
                    } catch (err) { alert('Upload failed: ' + err.message); }
                    setUploading(false);
                    e.target.value = '';
                  }} style={{ fontSize: '0.75rem' }} disabled={uploading} />
                  {uploading && <span style={{ fontSize: '0.75rem', color: 'var(--lux-gray)' }}>Uploading...</span>}
                </div>
              </div>
            )}
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveJob}>{editJob ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}

      {showEmailModal && selectedJob && (
        <div className="modal-overlay" onClick={() => setShowEmailModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Send Email — {selectedJob.id}: {selectedJob.title}</h2>
            <div className="form-group">
              <label>Email Template</label>
              <select className="form-select" value={emailForm.templateId} onChange={e => setEmailForm({...emailForm, templateId: e.target.value})}>
                <option value="">Select a template...</option>
                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            {emailForm.templateId && (
              <div style={{ background: '#f8f9fc', borderRadius: 8, padding: '1rem', marginBottom: '1rem', fontSize: '0.8rem', whiteSpace: 'pre-wrap' }} className="card">
                {renderTemplate(templates.find(t => t.id === emailForm.templateId), selectedJob, { name: selectedJob.client, email: '' }).body}
              </div>
            )}
            <div className="grid-2">
              <div className="form-group">
                <label>To</label>
                <input className="form-input" value={emailForm.to} onChange={e => setEmailForm({...emailForm, to: e.target.value})} />
              </div>
              <div className="form-group">
                <label>CC</label>
                <input className="form-input" value={emailForm.cc} onChange={e => setEmailForm({...emailForm, cc: e.target.value})} placeholder="comma separated emails" />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowEmailModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSendEmail}><Send size={16} /> Send Email</button>
            </div>
          </div>
        </div>
      )}

      {showExportModal && selectedJob && (
        <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Export — {selectedJob.id}</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--lux-gray)', marginBottom: '1.25rem' }}>Submit job data to governing authorities</p>
            {exportFormats.map(fmt => (
              <div key={fmt.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', border: '1px solid var(--lux-border)', borderRadius: 8, marginBottom: '0.5rem' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{fmt.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--lux-gray)' }}>{fmt.description}</div>
                </div>
                <button className="btn btn-sm btn-primary" onClick={() => handleExport(fmt.id)}>Export</button>
              </div>
            ))}
            <div className="modal-actions"><button className="btn btn-outline" onClick={() => setShowExportModal(false)}>Close</button></div>
          </div>
        </div>
      )}

      {emailLog.length > 0 && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={16} /> Recent Emails</h3>
          <table>
            <thead><tr><th>Time</th><th>To</th><th>Subject</th><th>Status</th></tr></thead>
            <tbody>
              {emailLog.slice(-10).reverse().map((email, i) => (
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
    </div>
  );

  function getCc(job) {
    const map = { 'Crew A': 'crewa@lux-traffic.com.au', 'Crew B': 'crewb@lux-traffic.com.au', 'Crew C': 'crewc@lux-traffic.com.au' };
    return map[job.crew] || '';
  }
}