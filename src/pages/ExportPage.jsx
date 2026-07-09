import { useState } from 'react';
import { Download, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { jobs, exportFormats } from '../data/mockData';
import { generateAuthorityExport } from '../utils/emailUtils';

export default function ExportPage() {
  const [selectedJobId, setSelectedJobId] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');
  const [exportHistory, setExportHistory] = useState([]);

  const selectedJob = jobs.find(j => j.id === selectedJobId);
  const format = exportFormats.find(f => f.id === selectedFormat);

  const handleExport = () => {
    if (!selectedJob || !selectedFormat) return;
    const client = { name: selectedJob.client, email: '', phone: '', address: '' };
    const result = generateAuthorityExport(selectedJob, client, selectedFormat);
    setExportHistory([{ ...result, exportedAt: new Date().toISOString(), jobTitle: selectedJob.title }, ...exportHistory].slice(0, 20));
  };

  return (
    <div>
      <div className="page-header">
        <h1>Export to Authorities</h1>
        <p>Generate standardized export documents for Main Roads WA, councils, and WA Police</p>
      </div>

      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>Create Export</h3>
          <div className="form-group">
            <label>Select Job</label>
            <select className="form-select" value={selectedJobId} onChange={e => setSelectedJobId(e.target.value)}>
              <option value="">Choose a job...</option>
              {jobs.filter(j => j.status === 'Active' || j.status === 'Scheduled' || j.status === 'Planning').map(j => (
                <option key={j.id} value={j.id}>{j.id} - {j.title}</option>
              ))}
            </select>
          </div>
          {selectedJob && (
            <div style={{ background: '#f8f9fc', borderRadius: 8, padding: '1rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
              <div><strong>Client:</strong> {selectedJob.client}</div>
              <div><strong>Location:</strong> {selectedJob.location}</div>
              <div><strong>Type:</strong> {selectedJob.type}</div>
              <div><strong>Duration:</strong> {selectedJob.startDate} to {selectedJob.endDate}</div>
            </div>
          )}
          <div className="form-group">
            <label>Export Format</label>
            {exportFormats.map(f => (
              <label key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', cursor: 'pointer' }}>
                <input type="radio" name="format" value={f.id} checked={selectedFormat === f.id} onChange={e => setSelectedFormat(e.target.value)} />
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{f.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--lux-gray)' }}>{f.description}</div>
                </div>
              </label>
            ))}
          </div>
          <button className="btn btn-primary" onClick={handleExport} disabled={!selectedJob || !selectedFormat}>
            <FileText size={16} /> Generate & Download Export
          </button>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>Export Information</h3>
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '0.75rem', marginBottom: '1rem', fontSize: '0.8rem', color: '#92400e' }}>
            <strong><AlertTriangle size={12} /> Note:</strong> Exports generate JSON files for demonstration. In production, these would generate PDF/Word documents compliant with the <strong>WA Traffic Management Code of Practice 2024</strong>.
          </div>
          <div style={{ fontSize: '0.85rem' }}>
            <h4 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Supported Authorities</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ padding: '0.4rem 0' }}>• Main Roads Western Australia (MRWA)</li>
              <li style={{ padding: '0.4rem 0' }}>• City of Perth</li>
              <li style={{ padding: '0.4rem 0' }}>• WA Police - Traffic Command</li>
              <li style={{ padding: '0.4rem 0' }}>• Local Councils (Stirling, Fremantle, etc.)</li>
              <li style={{ padding: '0.4rem 0' }}>• Department of Transport WA</li>
            </ul>
          </div>
        </div>
      </div>

      {exportHistory.length > 0 && (
        <div className="card">
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={16} /> Recent Exports
          </h3>
          <table>
            <thead>
              <tr><th>Export ID</th><th>Job</th><th>Format</th><th>Submitted To</th><th>Exported At</th><th>Status</th></tr>
            </thead>
            <tbody>
              {exportHistory.map((exp, i) => (
                <tr key={i}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600 }}>{exp.exportId}</td>
                  <td>{exp.jobTitle}</td>
                  <td style={{ fontSize: '0.8rem' }}>{exp.format}</td>
                  <td>{exp.submittedTo}</td>
                  <td style={{ fontSize: '0.75rem' }}>{new Date(exp.exportedAt).toLocaleString()}</td>
                  <td><span className="badge badge-active"><CheckCircle size={12} /> Generated</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}