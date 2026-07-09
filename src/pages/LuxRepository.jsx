import { useState, useEffect } from 'react';
import { Search, FileText, Download, Trash2, Upload, Tag, BookOpen, ShieldCheck, Wrench, FolderOpen, ChevronDown, ChevronRight, Plus, X, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getLuxDocuments, uploadLuxDocument, deleteLuxDocument } from '../services/dataService';

const API = 'http://localhost:3001';

const categoryIcons = { Policy: ShieldCheck, Template: FileText, 'Equipment Manual': Wrench, Guide: BookOpen, Form: FileText, Certificate: ShieldCheck, Report: FileText };

function formatSize(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function LuxRepository() {
  const { user } = useAuth();
  const [docs, setDocs] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showUpload, setShowUpload] = useState(false);
  const [uploadForm, setUploadForm] = useState({ title: '', category: 'Policy', description: '', tags: '', version: '1.0', status: 'active' });
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState({});

  useEffect(() => { getLuxDocuments().then(setDocs).catch(() => {}); }, []);

  const categories = [...new Set(docs.map(d => d.category))];

  const filtered = docs.filter(d => {
    const q = search.toLowerCase();
    return (categoryFilter === 'all' || d.category === categoryFilter) &&
      (d.title?.toLowerCase().includes(q) || d.originalName?.toLowerCase().includes(q) || d.tags?.join(' ').toLowerCase().includes(q) || d.description?.toLowerCase().includes(q));
  });

  const grouped = {};
  filtered.forEach(d => {
    if (!grouped[d.category]) grouped[d.category] = [];
    grouped[d.category].push(d);
  });

  const handleUpload = async () => {
    if (!uploadFile) return;
    setUploading(true);
    try {
      const res = await uploadLuxDocument(uploadFile, uploadForm);
      if (res.success) {
        setDocs([...docs, res.doc]);
        setShowUpload(false);
        setUploadFile(null);
        setUploadForm({ title: '', category: 'Policy', description: '', tags: '', version: '1.0', status: 'active' });
        setSaved(true); setTimeout(() => setSaved(false), 2000);
      }
    } catch (e) { alert('Upload failed: ' + e.message); }
    setUploading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this document permanently?')) return;
    try {
      await deleteLuxDocument(id);
      setDocs(docs.filter(d => d.id !== id));
    } catch (e) { alert('Delete failed: ' + e.message); }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>LUX Internal Repository</h1>
          <p>Company policies, equipment manuals, TMP templates, forms, and internal documents</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowUpload(true)}><Upload size={16} /> Upload Document</button>
      </div>

      {saved && (
        <div style={{ background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#065f46', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={16} /> Document uploaded successfully
        </div>
      )}

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--lux-gray)' }} />
            <input className="form-input" style={{ paddingLeft: '2.2rem' }} placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
            <button className={`btn btn-sm ${categoryFilter === 'all' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setCategoryFilter('all')}>All</button>
            {categories.map(c => (
              <button key={c} className={`btn btn-sm ${categoryFilter === c ? 'btn-primary' : 'btn-outline'}`} onClick={() => setCategoryFilter(c)}>{c}</button>
            ))}
          </div>
        </div>
      </div>

      {showUpload && (
        <div className="card" style={{ marginBottom: '1.5rem', border: '2px solid var(--lux-blue)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Upload New Document</h3>
            <button className="btn btn-sm btn-outline" onClick={() => setShowUpload(false)}><X size={14} /></button>
          </div>
          <div className="grid-3">
            <div className="form-group"><label>Title</label><input className="form-input" value={uploadForm.title} onChange={e => setUploadForm({...uploadForm, title: e.target.value})} placeholder="e.g. WHS Policy 2026" /></div>
            <div className="form-group"><label>Category</label><select className="form-select" value={uploadForm.category} onChange={e => setUploadForm({...uploadForm, category: e.target.value})}>
              <option>Policy</option><option>Template</option><option>Equipment Manual</option><option>Guide</option><option>Form</option><option>Certificate</option><option>Report</option>
            </select></div>
            <div className="form-group"><label>Version</label><input className="form-input" value={uploadForm.version} onChange={e => setUploadForm({...uploadForm, version: e.target.value})} placeholder="1.0" /></div>
          </div>
          <div className="grid-2">
            <div className="form-group"><label>Description</label><textarea className="form-textarea" style={{ minHeight: 60 }} value={uploadForm.description} onChange={e => setUploadForm({...uploadForm, description: e.target.value})} placeholder="Brief description of this document" /></div>
            <div className="form-group"><label>Tags (comma separated)</label><input className="form-input" value={uploadForm.tags} onChange={e => setUploadForm({...uploadForm, tags: e.target.value})} placeholder="e.g. safety, training, induction" /></div>
          </div>
          <div className="form-group">
            <label>File</label>
            <input type="file" onChange={e => setUploadFile(e.target.files[0])} accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png,.dwg,.zip,.txt" />
            {uploadFile && <span style={{ fontSize: '0.8rem', color: 'var(--lux-gray)', marginLeft: '0.5rem' }}>{uploadFile.name} ({(uploadFile.size / 1024).toFixed(0)} KB)</span>}
          </div>
          <div className="modal-actions" style={{ marginTop: '1rem' }}>
            <button className="btn btn-outline" onClick={() => setShowUpload(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleUpload} disabled={!uploadFile || uploading}><Upload size={14} /> {uploading ? 'Uploading...' : 'Upload Document'}</button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--lux-gray)' }}>
          <BookOpen size={40} style={{ marginBottom: '1rem', opacity: 0.4 }} />
          <p>No documents found. Upload internal policies, templates, and manuals.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {Object.entries(grouped).map(([category, catDocs]) => {
            const Icon = categoryIcons[category] || FileText;
            const isExpanded = expanded[category] !== false;
            return (
              <div key={category} className="card" style={{ padding: '0' }}>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: isExpanded ? '1px solid var(--lux-border)' : 'none' }}
                  onClick={() => setExpanded({...expanded, [category]: !isExpanded})}>
                  <Icon size={18} style={{ color: 'var(--lux-blue)' }} />
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', flex: 1 }}>{category}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--lux-gray)' }}>{catDocs.length} document{catDocs.length > 1 ? 's' : ''}</span>
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
                {isExpanded && (
                  <div style={{ padding: '0.5rem 1rem 1rem' }}>
                    {catDocs.map(doc => (
                      <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', background: '#f8f9fc', borderRadius: 6, marginBottom: '0.3rem', fontSize: '0.8rem' }}>
                        <FileText size={16} style={{ color: doc.mimeType?.includes('pdf') ? '#dc2626' : doc.mimeType?.startsWith('image/') ? '#2563eb' : 'var(--lux-gray)' }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.title}</div>
                          <div style={{ color: 'var(--lux-gray)', fontSize: '0.7rem' }}>
                            {doc.originalName} · {formatSize(doc.size)} · v{doc.version} · {new Date(doc.uploadedAt).toLocaleDateString()}
                          </div>
                          {doc.tags && doc.tags.length > 0 && (
                            <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.2rem' }}>
                              {doc.tags.map((t, i) => <span key={i} className="badge badge-info" style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem' }}>{t}</span>)}
                            </div>
                          )}
                        </div>
                        <span className="badge" style={{ background: doc.status === 'active' ? '#d1fae5' : '#fef3c7', color: doc.status === 'active' ? '#065f46' : '#92400e', fontSize: '0.6rem' }}>{doc.status}</span>
                        <a href={`${API}${doc.path}`} target="_blank" rel="noreferrer" className="btn btn-xs btn-outline" style={{ padding: '0.2rem 0.4rem' }}><Download size={12} /></a>
                        <button className="btn btn-xs btn-outline" style={{ padding: '0.2rem 0.4rem', color: 'var(--lux-danger)' }} onClick={() => handleDelete(doc.id)}><Trash2 size={12} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
