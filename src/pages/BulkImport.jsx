import { useState, useRef } from 'react';
import { Upload, FileDown, CheckCircle, AlertCircle, X, Database, Table } from 'lucide-react';
import { importCsv } from '../services/dataService';

const collections = [
  { value: 'clients', label: 'Clients', fields: ['name', 'email', 'phone', 'address', 'type', 'status', 'industry', 'region', 'accountManager', 'notes'] },
  { value: 'jobs', label: 'Jobs', fields: ['title', 'client', 'clientId', 'location', 'status', 'priority', 'type', 'startDate', 'endDate', 'crew', 'notes'] },
  { value: 'crew', label: 'Crew', fields: ['name', 'leader', 'members', 'phone', 'email', 'vehicle'] },
  { value: 'equipment', label: 'Equipment', fields: ['name', 'type', 'status', 'lastService', 'location'] },
  { value: 'permits', label: 'Permits', fields: ['jobId', 'authority', 'type', 'appliedDate', 'approvedDate', 'expiryDate', 'status', 'reference', 'conditions'] },
  { value: 'incidents', label: 'Incidents', fields: ['jobId', 'type', 'date', 'time', 'reportedBy', 'location', 'description', 'severity', 'actions', 'status'] },
  { value: 'timesheets', label: 'Timesheets', fields: ['crewId', 'jobId', 'date', 'member', 'startTime', 'endTime', 'hours', 'breakHours', 'notes', 'status'] },
];

const csvTemplate = (fields) => fields.join(',');

export default function BulkImport() {
  const [target, setTarget] = useState('clients');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileRef = useRef();

  const handleFile = (f) => {
    setFile(f);
    setResult(null);
    setPreview(null);
    if (f) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.split('\n').filter(Boolean);
        const headers = lines[0].split(',').map(h => h.trim());
        const rows = lines.slice(1, 6).map(line => line.split(',').map(c => c.trim()));
        setPreview({ headers, rows, total: lines.length - 1 });
      };
      reader.readAsText(f);
    }
  };

  const handleImport = async () => {
    if (!file || !target) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await importCsv(file, target);
      setResult({ type: 'success', count: data.count, errors: data.errors?.filter(Boolean) || [] });
      setFile(null);
      setPreview(null);
      fileRef.current.value = '';
    } catch (err) {
      setResult({ type: 'error', message: err.message });
    }
    setLoading(false);
  };

  const downloadTemplate = () => {
    const col = collections.find(c => c.value === target);
    if (!col) return;
    const blob = new Blob([csvTemplate(col.fields)], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${target}-template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Upload size={24} /> Bulk CSV Import</h1>
        <p>Import records from CSV files into any collection</p>
      </div>

      {result && (
        <div className={`card ${result.type === 'success' ? '' : ''}`} style={{ marginBottom: '1.5rem', borderLeft: `4px solid ${result.type === 'success' ? 'var(--lux-green, #22c55e)' : 'var(--lux-red, #ef4444)'}` }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            {result.type === 'success' ? <CheckCircle size={22} style={{ color: 'var(--lux-green, #22c55e)', flexShrink: 0, marginTop: 2 }} /> : <AlertCircle size={22} style={{ color: 'var(--lux-red, #ef4444)', flexShrink: 0, marginTop: 2 }} />}
            <div style={{ flex: 1 }}>
              <strong>{result.type === 'success' ? 'Import Complete' : 'Import Failed'}</strong>
              <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                {result.type === 'success' ? `${result.count} records imported successfully.` : result.message}
                {result.errors?.length > 0 && <div style={{ marginTop: '0.5rem' }}>{result.errors.map((e, i) => <div key={i} style={{ fontSize: '0.8rem', color: 'var(--lux-gray)' }}>{e.row ? `Row ${e.row}: ` : ''}{e.error || e}</div>)}</div>}
              </div>
              <button className="btn btn-sm btn-outline" style={{ marginTop: '0.5rem' }} onClick={() => setResult(null)}>Dismiss</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid-2">
        <div className="card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><Database size={18} /> Select Target</h3>
          <div className="form-group">
            <label>Collection</label>
            <select className="form-select" value={target} onChange={e => { setTarget(e.target.value); setFile(null); setPreview(null); setResult(null); }}>
              {collections.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Upload CSV File</label>
            <input ref={fileRef} type="file" accept=".csv" className="form-input" onChange={e => handleFile(e.target.files[0])} />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button className="btn btn-primary" onClick={handleImport} disabled={!file || loading}>
              {loading ? 'Importing...' : <><Upload size={14} /> Import</>}
            </button>
            <button className="btn btn-outline" onClick={downloadTemplate}>
              <FileDown size={14} /> Download Template
            </button>
          </div>
        </div>

        <div className="card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><Table size={18} /> Column Reference</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--lux-gray)', marginBottom: '0.75rem' }}>Expected CSV columns for <strong>{collections.find(c => c.value === target)?.label}</strong>:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {collections.find(c => c.value === target)?.fields.map(f => (
              <span key={f} style={{ padding: '0.25rem 0.6rem', background: 'var(--lux-bg)', borderRadius: 4, fontSize: '0.8rem', fontFamily: 'monospace' }}>{f}</span>
            ))}
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--lux-gray)' }}>
            <strong>Tips:</strong>
            <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
              <li>First row must be column headers matching above field names</li>
              <li>Empty rows are skipped automatically</li>
              <li>IDs are auto-generated if not provided</li>
              <li>Crew <code>members</code> column: comma-separated names</li>
              <li>Job <code>equipment</code> column: comma-separated items</li>
            </ul>
          </div>
        </div>
      </div>

      {preview && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Table size={18} /> Preview <span style={{ fontWeight: 400, fontSize: '0.85rem', color: 'var(--lux-gray)' }}>({preview.total} rows total, showing first {preview.rows.length})</span>
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>{preview.headers.map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {preview.rows.map((row, i) => (
                  <tr key={i}>{row.map((cell, j) => <td key={j} style={{ fontSize: '0.8rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cell}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
