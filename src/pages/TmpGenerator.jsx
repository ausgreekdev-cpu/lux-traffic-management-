import { useState } from 'react';
import { FileText, Download, CheckCircle, AlertTriangle, MapPin, CalendarDays, HardHat } from 'lucide-react';
import { jobs } from '../data/mockData';
import { logAction } from '../services/agentLogger';

const defaultTmpDocs = [
  { id: 'TMP-001', jobId: 'JOB-005', title: 'Roe Hwy Intersection Upgrade TMP', version: '2.0', status: 'Approved', createdDate: '2026-06-15', approvedDate: '2026-07-01', preparedBy: 'Emma Wilson', notes: 'WA Traffic Management Code of Practice 2024 compliant' },
];

export default function TmpGenerator() {
  const [tmpDocs, setTmpDocs] = useState(defaultTmpDocs);
  const [selectedJob, setSelectedJob] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(null);

  const job = jobs.find(j => j.id === selectedJob);

  const generateTmp = () => {
    if (!job) return;
    setGenerating(true);
    setTimeout(() => {
      const doc = {
        id: `TMP-${String(tmpDocs.length + 1).padStart(3, '0')}`,
        jobId: job.id,
        title: `Traffic Management Plan - ${job.title}`,
        version: '1.0',
        status: 'Draft',
        createdDate: new Date().toISOString().split('T')[0],
        approvedDate: null,
        preparedBy: 'LUX Traffic Management',
        notes: `Generated for ${job.client} at ${job.location}. ${job.type} works from ${job.startDate} to ${job.endDate}.`,
      };
      setTmpDocs([doc, ...tmpDocs]);
      setGenerated(doc);
      setGenerating(false);
    }, 1500);
  };

  const downloadTmp = (doc, targetJob) => {
    const j = targetJob || jobs.find(jt => jt.id === doc.jobId);
    const now = new Date().toLocaleString('en-AU', { timeZone: 'Australia/Perth' });

    const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>TMP ${doc.id}</title>
<style>
  @page { margin: 20mm; size: A4; }
  body { font-family: 'Inter', Arial, sans-serif; color: #1e293b; line-height: 1.5; font-size: 11pt; }
  .header { text-align: center; border-bottom: 3px solid #0a2e5c; padding-bottom: 1rem; margin-bottom: 1.5rem; }
  .header h1 { color: #0a2e5c; font-size: 18pt; margin: 0; }
  .header h2 { color: #f5a623; font-size: 14pt; margin: 0.25rem 0; font-weight: 400; }
  .header p { color: #6b7280; font-size: 9pt; }
  .section { margin-bottom: 1.25rem; }
  .section h3 { background: #0a2e5c; color: #fff; padding: 0.4rem 0.75rem; font-size: 11pt; margin: 0 0 0.5rem 0; border-radius: 4px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 0.75rem; }
  td, th { border: 1px solid #e2e8f0; padding: 0.35rem 0.5rem; text-align: left; font-size: 10pt; }
  th { background: #f8f9fc; font-weight: 600; }
  .badge-ok { color: #065f46; background: #d1fae5; padding: 0.1rem 0.4rem; border-radius: 4px; font-size: 9pt; }
  .badge-warn { color: #92400e; background: #fef3c7; padding: 0.1rem 0.4rem; border-radius: 4px; font-size: 9pt; }
  .footer { text-align: center; font-size: 8pt; color: #9ca3af; margin-top: 2rem; border-top: 1px solid #e2e8f0; padding-top: 0.75rem; }
  .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.04; font-size: 60pt; font-weight: 800; color: #0a2e5c; pointer-events: none; z-index: -1; }
  .signature-block { display: flex; justify-content: space-between; margin-top: 2rem; }
  .signature-line { border-top: 1px solid #1e293b; width: 200px; padding-top: 0.25rem; font-size: 9pt; text-align: center; }
</style></head>
<body>
<div class="watermark">LUX TRAFFIC MANAGEMENT</div>

<div class="header">
  <h1>TRAFFIC MANAGEMENT PLAN</h1>
  <h2>LUX Traffic Management Pty Ltd</h2>
  <p>Unit 3/45 Kelvin Road, Jandakot WA 6164 | ABN: 12 345 678 901 | (08) 9417 2200 | admin@lux-traffic.com.au</p>
</div>

<div class="section">
  <h3>Document Control</h3>
  <table>
    <tr><td width="30%"><strong>TMP ID</strong></td><td>${doc.id}</td></tr>
    <tr><td><strong>Version</strong></td><td>${doc.version}</td></tr>
    <tr><td><strong>Status</strong></td><td>${doc.status}</td></tr>
    <tr><td><strong>Date Generated</strong></td><td>${now}</td></tr>
    <tr><td><strong>Prepared By</strong></td><td>${doc.preparedBy}</td></tr>
  </table>
</div>

${j ? `
<div class="section">
  <h3>Job Details</h3>
  <table>
    <tr><td width="30%"><strong>Job Reference</strong></td><td>${j.id}</td></tr>
    <tr><td><strong>Title</strong></td><td>${j.title}</td></tr>
    <tr><td><strong>Client</strong></td><td>${j.client}</td></tr>
    <tr><td><strong>Location</strong></td><td>${j.location}</td></tr>
    <tr><td><strong>Work Type</strong></td><td>${j.type}</td></tr>
    <tr><td><strong>Duration</strong></td><td>${j.startDate} to ${j.endDate}</td></tr>
    <tr><td><strong>Priority</strong></td><td>${j.priority}</td></tr>
    <tr><td><strong>Assigned Crew</strong></td><td>${j.crew}</td></tr>
    <tr><td><strong>Notes</strong></td><td>${j.notes || 'N/A'}</td></tr>
  </table>
</div>

<div class="section">
  <h3>Compliance Framework</h3>
  <table>
    <tr><td width="70%">WA Traffic Management Code of Practice 2024</td><td><span class="badge-ok">Compliant</span></td></tr>
    <tr><td>AS 1742.3 - Manual of Uniform Traffic Control Devices</td><td><span class="badge-ok">Compliant</span></td></tr>
    <tr><td>Main Roads WA Standard Specifications</td><td><span class="badge-ok">Compliant</span></td></tr>
    <tr><td>WHS Act 2020 & WHS Regulations 2022</td><td><span class="badge-ok">Compliant</span></td></tr>
    <tr><td>Local Council Bylaws & Permits</td><td><span class="badge-ok">Compliant</span></td></tr>
  </table>
</div>

<div class="section">
  <h3>Traffic Management Requirements</h3>
  <table>
    <tr><td width="50%">Traffic Controller Required</td><td>${j.type !== 'Shoulder Works' ? '<span class="badge-warn">Yes - ATCP on site</span>' : '<span class="badge-ok">No</span>'}</td></tr>
    <tr><td>Night Works</td><td>${j.notes?.toLowerCase().includes('night') ? '<span class="badge-warn">Yes - Lighting plan required</span>' : '<span class="badge-ok">No</span>'}</td></tr>
    <tr><td>Detour Required</td><td>${j.type === 'Road Closure' || j.type === 'Detour Setup' || j.type === 'Intersection Works' ? '<span class="badge-warn">Yes - Detour signage required</span>' : '<span class="badge-ok">No</span>'}</td></tr>
    <tr><td>Pedestrian Management</td><td>${j.type === 'Event Traffic' || j.type === 'Bridge Works' ? '<span class="badge-warn">Required</span>' : '<span class="badge-ok">Standard</span>'}</td></tr>
    <tr><td>Emergency Vehicle Access</td><td><span class="badge-ok">Maintained at all times</span></td></tr>
    <tr><td>Public Transport Considerations</td><td>${j.location.toLowerCase().includes('fwy') || j.location.toLowerCase().includes('freeway') ? '<span class="badge-warn">Bus routes may be affected</span>' : '<span class="badge-ok">Standard</span>'}</td></tr>
  </table>
</div>

<div class="section">
  <h3>Signage & Traffic Control Devices</h3>
  <table>
    <tr><th>Item</th><th>Status</th></tr>
    ${(j.equipment && j.equipment.length > 0 ? j.equipment : ['Standard Signing per TGS']).map(eq => `
    <tr><td>${eq}</td><td><span class="badge-ok">Scheduled</span></td></tr>`).join('')}
  </table>
</div>

<div class="section">
  <h3>Site Plan</h3>
  <div style="border: 2px dashed #e2e8f0; padding: 2rem; text-align: center; color: #9ca3af; font-size: 10pt;">
    [ SITE LAYOUT DIAGRAM — Insert traffic staging plan here ]<br/>
    <span style="font-size: 8pt;">Refer to attached site drawing for detailed signage positions, coning layout, and traffic controller locations</span>
  </div>
</div>

<div class="section">
  <h3>Risk Assessment</h3>
  <table>
    <tr><th>Hazard</th><th>Risk</th><th>Control Measure</th></tr>
    <tr><td>Vehicle incursion into work zone</td><td>High</td><td>TMA truck, buffer zone, advance warning signs</td></tr>
    <tr><td>Worker struck by traffic</td><td>High</td><td>Hi-vis PPE, exclusion zones, spotter</td></tr>
    <tr><td>Night work visibility</td><td>Medium</td><td>Lighting tower, reflective signage, LED arrow board</td></tr>
    <tr><td>Pedestrian conflict</td><td>Medium</td><td>Delineated pedestrian path, fencing</td></tr>
    <tr><td>Manual handling injuries</td><td>Low</td><td>Mechanical aid for heavy items, team lifting</td></tr>
  </table>
</div>
` : '<p>No job data available.</p>'}

<div class="section">
  <h3>Approvals</h3>
  <div class="signature-block">
    <div class="signature-line">Prepared By (LUX Traffic Management)</div>
    <div class="signature-line">Date</div>
  </div>
  <div class="signature-block" style="margin-top: 1rem;">
    <div class="signature-line">Approved By (Client / Authority)</div>
    <div class="signature-line">Date</div>
  </div>
</div>

<div class="footer">
  <p>This Traffic Management Plan has been prepared in accordance with the WA Traffic Management Code of Practice 2024.<br/>
  LUX Traffic Management Pty Ltd | ABN 12 345 678 901 | Perth, Western Australia<br/>
  Document ID: ${doc.id} | Version ${doc.version} | Generated: ${now}</p>
</div>

<script>
  window.print();
</script>
</body></html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TMP-${doc.id}-${doc.jobId}.html`;
    a.click();
    URL.revokeObjectURL(url);

    logAction('TMP Generator', 'TMP Document Generated', `Downloaded ${doc.id} for ${doc.jobId}`, 'success');
  };

  const printTmp = (doc) => {
    const j = jobs.find(jt => jt.id === doc.jobId);
    downloadTmp(doc, j);
    logAction('TMP Generator', 'TMP Document Printed', `Print ${doc.id} for ${doc.jobId}`, 'success');
  };

  return (
    <div>
      <div className="page-header">
        <h1>TMP Document Generator</h1>
        <p>Generate Traffic Management Plans compliant with WA Code of Practice 2024</p>
      </div>

      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}><FileText size={16} /> Generate New TMP</h3>
          <div className="form-group">
            <label>Select Job</label>
            <select className="form-select" value={selectedJob} onChange={e => setSelectedJob(e.target.value)}>
              <option value="">Choose a job...</option>
              {jobs.map(j => <option key={j.id} value={j.id}>{j.id} - {j.title}</option>)}
            </select>
          </div>

          {job && (
            <div style={{ background: '#f8f9fc', borderRadius: 8, padding: '1rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div><strong>Client:</strong> {job.client}</div>
                <div><strong>Type:</strong> {job.type}</div>
                <div><MapPin size={13} /> {job.location}</div>
                <div><CalendarDays size={13} /> {job.startDate} to {job.endDate}</div>
              </div>
              <div style={{ marginTop: '0.5rem', color: 'var(--lux-gray)' }}>{job.notes}</div>
            </div>
          )}

          <button className="btn btn-primary" onClick={generateTmp} disabled={!job || generating} style={{ width: '100%', justifyContent: 'center' }}>
            {generating ? 'Generating...' : <><FileText size={16} /> Generate TMP Document</>}
          </button>

          {generated && (
            <div style={{ marginTop: '1rem', background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: 8, padding: '0.75rem', fontSize: '0.85rem', color: '#065f46', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={16} /> TMP generated: {generated.id}
            </div>
          )}
        </div>

        <div className="card">
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>TMP Requirements Checklist</h3>
          <div style={{ fontSize: '0.85rem' }}>
            {[
              'Site location plan (road name, suburb, region)',
              'Proposed traffic staging and phasing',
              'Signage schedule per AS 1742.3',
              'TMA vehicle and buffer zone requirements',
              'Pedestrian management plan (if applicable)',
              'Traffic controller positions and ATCP details',
              'Night works lighting plan (if applicable)',
              'Emergency vehicle access maintained',
              'Public transport route considerations',
              'Local council notification confirmation',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0' }}>
                <div style={{ width: 20, height: 20, borderRadius: 4, border: '2px solid #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem' }}>{i + 1}</div>
                {item}
              </div>
            ))}
          </div>
          <div style={{ marginTop: '1rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '0.75rem', fontSize: '0.8rem', color: '#92400e' }}>
            <AlertTriangle size={13} /> All TMPs must comply with the <strong>WA Traffic Management Code of Practice 2024</strong>.
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>Generated TMP Documents</h3>
        <table>
          <thead>
            <tr><th>ID</th><th>Title</th><th>Version</th><th>Status</th><th>Created</th><th>Prepared By</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {tmpDocs.map(doc => (
              <tr key={doc.id}>
                <td style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.8rem' }}>{doc.id}</td>
                <td style={{ fontWeight: 500 }}>{doc.title}</td>
                <td>{doc.version}</td>
                <td><span className={`badge ${doc.status === 'Approved' ? 'badge-active' : 'badge-pending'}`}>{doc.status}</span></td>
                <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{doc.createdDate}</td>
                <td>{doc.preparedBy}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    <button className="btn btn-sm btn-outline" onClick={() => downloadTmp(doc, null)} title="Download"><Download size={14} /></button>
                    <button className="btn btn-sm btn-outline" onClick={() => printTmp(doc)} title="Print/PDF">PDF</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}