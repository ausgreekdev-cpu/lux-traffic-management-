import { useState, useEffect } from 'react';
import { Search, Plus, Phone, Mail, MapPin, Building2, ClipboardCheck, FileText, Download, Trash2, Eye, Edit3, Briefcase, FolderOpen, ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getClients, saveClient, getJobsByClient, getClientAttachments, deleteAttachment } from '../services/dataService';

const API = 'http://localhost:3001';

function formatSize(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function FileIcon({ mime }) {
  if (!mime) return <FileText size={20} />;
  if (mime.startsWith('image/')) return <img src="/api/placeholder/24" alt="" style={{ width: 20, height: 20 }} />;
  if (mime.includes('pdf')) return <FileText size={20} style={{ color: '#dc2626' }} />;
  if (mime.includes('zip') || mime.includes('rar')) return <FileText size={20} style={{ color: '#ca8a04' }} />;
  if (mime.includes('dwg') || mime.includes('dxf')) return <FileText size={20} style={{ color: '#2563eb' }} />;
  return <FileText size={20} style={{ color: 'var(--lux-gray)' }} />;
}

export default function Clients() {
  const { user } = useAuth();
  const [clientList, setClientList] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientJobs, setClientJobs] = useState([]);
  const [clientFiles, setClientFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', type: 'Contractor', status: 'Active', industry: '', region: '', accountManager: '', notes: '' });
  const [fileFilter, setFileFilter] = useState('all');

  useEffect(() => { getClients().then(setClientList).catch(() => {}); }, []);

  useEffect(() => {
    if (!selectedClient) { setClientJobs([]); setClientFiles([]); return; }
    setLoading(true);
    Promise.all([
      getJobsByClient(selectedClient.id).catch(() => []),
      getClientAttachments(selectedClient.id).catch(() => []),
    ]).then(([jobs, files]) => {
      setClientJobs(jobs);
      setClientFiles(files);
      setLoading(false);
    });
  }, [selectedClient]);

  const filtered = clientList.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.type?.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => { setEditClient(null); setForm({ name: '', email: '', phone: '', address: '', type: 'Contractor', status: 'Active', industry: '', region: '', accountManager: '', notes: '' }); setShowModal(true); };
  const openEdit = (c) => { setEditClient(c); setForm({ ...c }); setShowModal(true); };

  const save = async () => {
    try {
      const saved = await saveClient(editClient ? { ...editClient, ...form } : form);
      if (editClient) setClientList(clientList.map(c => c.id === editClient.id ? { ...c, ...form } : c));
      else setClientList([...clientList, saved]);
      setShowModal(false);
    } catch (e) { alert('Failed to save: ' + e.message); }
  };

  const handleDeleteFile = async (file) => {
    if (!confirm('Delete this file? It will be removed from the server.')) return;
    try {
      await deleteAttachment(file.id);
      setClientFiles(clientFiles.filter(f => f.id !== file.id));
    } catch (e) { alert('Delete failed: ' + e.message); }
  };

  const filteredFiles = fileFilter === 'all' ? clientFiles : clientFiles.filter(f => f.category === fileFilter);
  const categories = [...new Set(clientFiles.map(f => f.category))];

  if (selectedClient) {
    return (
      <div>
        <button className="btn btn-outline btn-sm" onClick={() => setSelectedClient(null)} style={{ marginBottom: '1rem' }}><ChevronLeft size={16} /> Back to Clients</button>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{selectedClient.name}</h1>
              <p style={{ fontSize: '0.8rem', color: 'var(--lux-gray)' }}>{selectedClient.id} · {selectedClient.type} · {selectedClient.industry || ''}</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-sm btn-outline" onClick={() => { openEdit(selectedClient); }}><Edit3 size={14} /> Edit</button>
            </div>
          </div>
          <div className="grid-3" style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
            <div><strong>Contact:</strong><br/>{selectedClient.email}<br/>{selectedClient.phone}<br/>{selectedClient.address}</div>
            <div><strong>Account:</strong><br/>Manager: {selectedClient.accountManager || 'Unassigned'}<br/>Region: {selectedClient.region || '—'}</div>
            <div><strong>Activity:</strong><br/>{clientJobs.length} active jobs · {clientFiles.length} files on record</div>
          </div>
          {selectedClient.notes && <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#fffbeb', borderRadius: 8, fontSize: '0.8rem' }}><strong>Notes:</strong> {selectedClient.notes}</div>}
        </div>

        <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Briefcase size={16} /> Jobs ({clientJobs.length})</h3>
            {clientJobs.length === 0 ? <p style={{ fontSize: '0.8rem', color: 'var(--lux-gray)' }}>No jobs for this client yet.</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {clientJobs.map(job => {
                  const statusColors = { Planning: '#92400e', Scheduled: '#1e40af', Active: '#065f46', Completed: '#6b7280', 'On Hold': '#b45309', Cancelled: '#991b1b' };
                  return (
                    <div key={job.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', background: '#f8f9fc', borderRadius: 6, fontSize: '0.8rem' }}>
                      <div>
                        <span style={{ fontWeight: 600 }}>{job.title}</span>
                        <span style={{ color: 'var(--lux-gray)', marginLeft: '0.5rem' }}>{job.location}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="badge" style={{ background: '#e0e7ff', color: statusColors[job.status] || '#374151', fontSize: '0.65rem' }}>{job.status}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--lux-gray)' }}>{job.startDate}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card">
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FolderOpen size={16} /> Consolidated Files ({clientFiles.length})
            </h3>
            {categories.length > 0 && (
              <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                <button className={`btn btn-xs ${fileFilter === 'all' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFileFilter('all')}>All</button>
                {categories.map(c => (
                  <button key={c} className={`btn btn-xs ${fileFilter === c ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFileFilter(c)}>{c}</button>
                ))}
              </div>
            )}
            {filteredFiles.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--lux-gray)' }}>No files uploaded yet. Upload files from a specific job to see them here.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', maxHeight: 300, overflowY: 'auto' }}>
                {filteredFiles.map(file => (
                  <div key={file.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.5rem', background: '#f8f9fc', borderRadius: 6, fontSize: '0.75rem' }}>
                    <FileIcon mime={file.mimeType} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.originalName}</div>
                      <div style={{ color: 'var(--lux-gray)' }}>{file.category} · {formatSize(file.size)} · {file.jobId}</div>
                    </div>
                    <a href={`${API}${file.path}`} target="_blank" rel="noreferrer" className="btn btn-xs btn-outline" style={{ padding: '0.2rem 0.4rem' }}><Download size={12} /></a>
                    <button className="btn btn-xs btn-outline" style={{ padding: '0.2rem 0.4rem', color: 'var(--lux-danger)' }} onClick={() => handleDeleteFile(file)}><Trash2 size={12} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Client Database</h1>
          <p>Manage clients, councils, contractors — each client stores their jobs, scoping requests, and all attached files</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}><Plus size={16} /> Add Client</button>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', maxWidth: 400 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--lux-gray)' }} />
          <input className="form-input" style={{ paddingLeft: '2.2rem' }} placeholder="Search clients..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="grid-3">
        {filtered.map(client => (
          <div className="card" key={client.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedClient(client)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{client.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--lux-gray)' }}>{client.id} · {client.industry || client.type}</div>
              </div>
              <span className={`badge ${client.status === 'Active' ? 'badge-active' : 'badge-pending'}`}>{client.status}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--lux-gray)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Mail size={13} /> {client.email}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Phone size={13} /> {client.phone}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={13} /> {client.address}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Building2 size={13} /> {client.type}</div>
            </div>
            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.3rem' }}>
              <button className="btn btn-xs btn-outline" style={{ fontSize: '0.7rem' }} onClick={(e) => { e.stopPropagation(); setSelectedClient(client); }}><Eye size={12} /> View</button>
              <button className="btn btn-xs btn-outline" style={{ fontSize: '0.7rem' }} onClick={(e) => { e.stopPropagation(); openEdit(client); }}><Edit3 size={12} /> Edit</button>
              <button className="btn btn-xs btn-outline" style={{ fontSize: '0.7rem' }} onClick={(e) => { e.stopPropagation(); window.location.href = '/scoping'; }}><ClipboardCheck size={12} /> Scoping</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <h2>{editClient ? 'Edit Client' : 'Add Client'}</h2>
            <div className="grid-2">
              <div className="form-group"><label>Company Name</label><input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div className="form-group"><label>Type</label><select className="form-select" value={form.type} onChange={e => setForm({...form, type: e.target.value})}><option>Government</option><option>Council</option><option>Contractor</option><option>Private</option></select></div>
              <div className="form-group"><label>Email</label><input className="form-input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
              <div className="form-group"><label>Phone</label><input className="form-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
              <div className="form-group"><label>Industry</label><input className="form-input" value={form.industry || ''} onChange={e => setForm({...form, industry: e.target.value})} placeholder="e.g. Construction, Government" /></div>
              <div className="form-group"><label>Region</label><input className="form-input" value={form.region || ''} onChange={e => setForm({...form, region: e.target.value})} placeholder="e.g. Metro Perth, Regional" /></div>
              <div className="form-group"><label>Account Manager</label><input className="form-input" value={form.accountManager || ''} onChange={e => setForm({...form, accountManager: e.target.value})} /></div>
              <div className="form-group"><label>Status</label><select className="form-select" value={form.status} onChange={e => setForm({...form, status: e.target.value})}><option>Active</option><option>Inactive</option></select></div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}><label>Address</label><input className="form-input" value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}><label>Notes</label><textarea className="form-textarea" style={{ minHeight: 60 }} value={form.notes || ''} onChange={e => setForm({...form, notes: e.target.value})} /></div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>{editClient ? 'Update' : 'Add Client'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
