import { useState } from 'react';
import { Search, Plus, Eye, Edit3, Send, CheckCircle, XCircle, Clock, FileText, MapPin, AlertTriangle, ChevronRight, ChevronLeft, Save } from 'lucide-react';
import { scopeRequests as defaultScopes } from '../data/mockData';

const emptyForm = {
  clientName: '', contactName: '', contactPhone: '', contactEmail: '', billingContact: '', insuranceProvided: false,
  roadName: '', suburb: '', nearestIntersection: '', gpsCoordinates: '', workArea: 'verge', roadManager: 'council', councilName: '', speedLimit: 50,
  signalisedIntersection: false, affectsBusLane: false, affectsCyclePath: false, affectsPedCrossing: false,
  workDescription: '', workFootprint: 'static', laneOpenPastWorksite: false, vehicleAccessRequired: false,
  proposedStartDate: '', proposedEndDate: '', shiftDay: { start: '07:00', end: '17:00' }, shiftNight: { start: '', end: '' }, shiftDuration: 8, stagingChanges: false, totalDurationDays: 1,
  permitTasks: { drafting: 'lux', siteInspection: 'lux', planSubmission: 'lux', rop: 'lux', publicNotice: '', noiseExemption: '' },
  tcMethod: 'ptcd', tmaRequired: 'assess', advanceWarningDistance: 160,
  nearbySchool: false, existingTmpRef: '', sitePhotosAvailable: false, swmsRequired: false,
  quoteType: 'design-submission', linkedJobId: null, linkedQuoteId: null,
  notes: '', signedBy: '', signedDate: '',
};

const statusStyles = { draft: { icon: Clock, color: '#92400e', bg: '#fffbeb' }, submitted: { icon: Send, color: '#1e40af', bg: '#dbeafe' }, quoted: { icon: FileText, color: '#065f46', bg: '#d1fae5' }, approved: { icon: CheckCircle, color: '#065f46', bg: '#d1fae5' }, rejected: { icon: XCircle, color: '#991b1b', bg: '#fce4ec' }, converted: { icon: CheckCircle, color: '#1e40af', bg: '#e0e7ff' } };

const workAreaLabels = { verge: 'Verge / Footpath only', 'left-lane': 'Left Lane only', 'multi-lane': 'Multi-lane', 'full-closure': 'Full Road Closure' };
const roadManagerLabels = { council: 'Local Council', mrwa: 'Main Roads WA', private: 'Private' };
const tcMethodLabels = { manual: 'Manual Stop/Slow', ptcd: 'PTCD (Portable Signals/Boom Barrier)', 'no-preference': 'No preference – LUX to recommend' };
const footprintLabels = { static: 'Static (single location)', linear: 'Linear / Moving', 'multi-staged': 'Multi-staged' };
const quoteTypeLabels = { 'draft-only': 'Draft design only', 'design-submission': 'Design + full submission', 'full-deployment': 'Design + submission + deployment', 'off-plan': 'Off-plan TGS (generic)' };

function StepIndicator({ step, labels }) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
      {labels.map((l, i) => (
        <div key={i} style={{ flex: 1, minWidth: 100, textAlign: 'center', padding: '0.5rem', borderRadius: 8, fontSize: '0.75rem', fontWeight: i === step ? 600 : 400, background: i === step ? 'var(--lux-blue)' : i < step ? '#d1fae5' : '#f1f5f9', color: i === step ? '#fff' : i < step ? '#065f46' : '#94a3b8', transition: '0.2s' }}>
          {i + 1}. {l}
        </div>
      ))}
    </div>
  );
}

function Input({ label, value, onChange, type = 'text', placeholder, style, ...props }) {
  return (
    <div className="form-group" style={style}>
      <label>{label}</label>
      {type === 'select' ? (
        <select className="form-select" value={value} onChange={onChange} {...props}>
          {placeholder && <option value="">{placeholder}</option>}
          {props.children}
        </select>
      ) : type === 'textarea' ? (
        <textarea className="form-textarea" style={{ minHeight: 80, ...(props.textareaStyle || {}) }} value={value} onChange={onChange} placeholder={placeholder} />
      ) : type === 'checkbox' ? (
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.3rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={value} onChange={onChange} style={{ width: 18, height: 18 }} />
          <span style={{ fontSize: '0.85rem' }}>{placeholder}</span>
        </label>
      ) : type === 'time' ? (
        <input className="form-input" type="time" value={value} onChange={onChange} />
      ) : (
        <input className="form-input" type={type} value={value} onChange={onChange} placeholder={placeholder} />
      )}
    </div>
  );
}

function PermitTaskSelector({ label, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.4rem 0', fontSize: '0.85rem' }}>
      <span style={{ flex: 1, fontWeight: 500 }}>{label}</span>
      {['lux', 'client', 'shared'].map(opt => (
        <button key={opt} type="button" onClick={() => onChange(opt)}
          style={{ padding: '0.25rem 0.6rem', borderRadius: 6, fontSize: '0.75rem', border: '1px solid', cursor: 'pointer', background: value === opt ? 'var(--lux-blue)' : '#fff', color: value === opt ? '#fff' : 'var(--lux-gray)', borderColor: value === opt ? 'var(--lux-blue)' : 'var(--lux-border)' }}>
          {opt === 'lux' ? 'LUX' : opt === 'client' ? 'Client' : 'Shared'}
        </button>
      ))}
    </div>
  );
}

export default function Scoping() {
  const [scopes, setScopes] = useState(defaultScopes);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editScope, setEditScope] = useState(null);
  const [viewScope, setViewScope] = useState(null);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [saved, setSaved] = useState(false);

  const stepLabels = ['Contact & Billing', 'Location & Road Context', 'Nature of Work', 'Timeline & Staging', 'Permits & Authority', 'Traffic Control & Submit'];

  const filtered = scopes.filter(s => {
    const q = search.toLowerCase();
    return (statusFilter === 'all' || s.status === statusFilter) &&
      (s.clientName?.toLowerCase().includes(q) || s.roadName?.toLowerCase().includes(q) || s.contactName?.toLowerCase().includes(q) || s.id?.toLowerCase().includes(q));
  });

  const resetForm = () => { setForm(emptyForm); setStep(0); setEditScope(null); };

  const openNew = () => { resetForm(); setShowForm(true); setViewScope(null); };
  const openEdit = (s) => { setEditScope(s); setForm({ ...s, shiftDay: s.shiftDay || { start: '07:00', end: '17:00' }, shiftNight: s.shiftNight || { start: '', end: '' } }); setStep(0); setShowForm(true); setViewScope(null); };
  const openView = (s) => { setViewScope(s); setShowForm(false); };

  const handleSave = () => {
    if (editScope) {
      setScopes(scopes.map(s => s.id === editScope.id ? { ...s, ...form, updatedAt: new Date().toISOString() } : s));
    } else {
      const newScope = { id: `SCO-${String(scopes.length + 1).padStart(3, '0')}`, status: 'draft', submittedAt: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...form };
      setScopes([...scopes, newScope]);
    }
    setSaved(true); setTimeout(() => setSaved(false), 2000);
    setShowForm(false); resetForm();
  };

  const handleSubmit = () => {
    if (editScope) {
      setScopes(scopes.map(s => s.id === editScope.id ? { ...s, ...form, status: 'submitted', submittedAt: new Date().toISOString(), updatedAt: new Date().toISOString() } : s));
    } else {
      const newScope = { id: `SCO-${String(scopes.length + 1).padStart(3, '0')}`, status: 'submitted', submittedAt: new Date().toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...form };
      setScopes([...scopes, newScope]);
    }
    setSaved(true); setTimeout(() => setSaved(false), 2000);
    setShowForm(false); resetForm();
  };

  const updateStatus = (id, newStatus) => {
    setScopes(scopes.map(s => s.id === id ? { ...s, status: newStatus, updatedAt: new Date().toISOString() } : s));
  };

  const setPermitTask = (task, val) => {
    setForm({ ...form, permitTasks: { ...form.permitTasks, [task]: val } });
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Client Scoping & Intake</h1>
          <p>Structured project scoping for TMP/TGS proposals — aligned with MRWA Code of Practice</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}><Plus size={16} /> New Scoping Request</button>
      </div>

      {saved && (
        <div style={{ background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#065f46', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={16} /> Scoping request saved successfully
        </div>
      )}

      {viewScope && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{viewScope.clientName} — {viewScope.roadName}</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--lux-gray)' }}>{viewScope.id} · Submitted {viewScope.submittedAt ? new Date(viewScope.submittedAt).toLocaleDateString() : 'Draft'}</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span className="badge" style={{ background: (statusStyles[viewScope.status] || statusStyles.draft).bg, color: (statusStyles[viewScope.status] || statusStyles.draft).color, fontWeight: 600 }}>{viewScope.status}</span>
              <button className="btn btn-sm btn-outline" onClick={() => openEdit(viewScope)}><Edit3 size={14} /> Edit</button>
              <button className="btn btn-sm btn-outline" onClick={() => setViewScope(null)}>Close</button>
            </div>
          </div>
          <div className="grid-3" style={{ fontSize: '0.85rem' }}>
            <div><strong>Contact:</strong> {viewScope.contactName}<br/>{viewScope.contactEmail}<br/>{viewScope.contactPhone}</div>
            <div><strong>Location:</strong> {viewScope.roadName}, {viewScope.suburb}<br/>Intersection: {viewScope.nearestIntersection}<br/>Speed: {viewScope.speedLimit} km/h · {roadManagerLabels[viewScope.roadManager]}</div>
            <div><strong>Work:</strong> {viewScope.workDescription}<br/>Footprint: {footprintLabels[viewScope.workFootprint]}<br/>Area: {workAreaLabels[viewScope.workArea]}</div>
          </div>
          <div className="grid-3" style={{ fontSize: '0.85rem', marginTop: '0.75rem', padding: '0.75rem', background: '#f8f9fc', borderRadius: 8 }}>
            <div><strong>Timeline:</strong> {viewScope.proposedStartDate} → {viewScope.proposedEndDate}<br/>Shift: {viewScope.shiftDay?.start}–{viewScope.shiftDay?.end} · {viewScope.shiftDuration}h · {viewScope.totalDurationDays} days</div>
            <div><strong>Traffic Control:</strong> {tcMethodLabels[viewScope.tcMethod]}<br/>TMA: {viewScope.tmaRequired} · Warning: {viewScope.advanceWarningDistance}m</div>
            <div><strong>Quote Type:</strong> {quoteTypeLabels[viewScope.quoteType]}<br/>Linked Job: {viewScope.linkedJobId || '—'} · Insurance: {viewScope.insuranceProvided ? 'Yes' : 'No'}</div>
          </div>
          {viewScope.notes && <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#fffbeb', borderRadius: 8, fontSize: '0.8rem' }}><strong>Notes:</strong> {viewScope.notes}</div>}
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
            {viewScope.status === 'submitted' && <button className="btn btn-sm btn-primary" onClick={() => updateStatus(viewScope.id, 'quoted')}><FileText size={14} /> Mark as Quoted</button>}
            {viewScope.status === 'submitted' && <button className="btn btn-sm btn-outline" onClick={() => updateStatus(viewScope.id, 'rejected')}><XCircle size={14} /> Reject</button>}
            {viewScope.status === 'quoted' && <button className="btn btn-sm btn-primary" onClick={() => updateStatus(viewScope.id, 'approved')}><CheckCircle size={14} /> Approve</button>}
            {viewScope.status === 'quoted' && <button className="btn btn-sm btn-outline" onClick={() => updateStatus(viewScope.id, 'rejected')}><XCircle size={14} /> Reject</button>}
          </div>
        </div>
      )}

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem', border: '2px solid var(--lux-blue)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>{editScope ? `Edit Scoping: ${editScope.clientName}` : 'New Scoping Request'}</h2>

          <StepIndicator step={step} labels={stepLabels} />

          {step === 0 && (
            <div>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--lux-blue)' }}>1. Contact & Billing</h3>
              <div className="grid-3">
                <Input label="Client Company" value={form.clientName} onChange={e => setForm({...form, clientName: e.target.value})} placeholder="e.g. Main Roads WA" />
                <Input label="Contact Name" value={form.contactName} onChange={e => setForm({...form, contactName: e.target.value})} placeholder="Site contact" />
                <Input label="Contact Phone" value={form.contactPhone} onChange={e => setForm({...form, contactPhone: e.target.value})} placeholder="0400 000 000" />
                <Input label="Contact Email" type="email" value={form.contactEmail} onChange={e => setForm({...form, contactEmail: e.target.value})} placeholder="client@example.com" />
                <Input label="Billing Contact (if different)" value={form.billingContact} onChange={e => setForm({...form, billingContact: e.target.value})} />
                <Input label="Insurance Certificate Provided" type="checkbox" value={form.insuranceProvided} onChange={e => setForm({...form, insuranceProvided: e.target.checked})} placeholder="Yes, certificate is on file" />
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--lux-blue)' }}>2. Location & Road Context</h3>
              <div className="grid-3">
                <Input label="Road Name" value={form.roadName} onChange={e => setForm({...form, roadName: e.target.value})} placeholder="e.g. Mitchell Freeway" />
                <Input label="Suburb" value={form.suburb} onChange={e => setForm({...form, suburb: e.target.value})} placeholder="e.g. Perth" />
                <Input label="Nearest Intersecting Street" value={form.nearestIntersection} onChange={e => setForm({...form, nearestIntersection: e.target.value})} placeholder="Corner of..." />
                <Input label="GPS / What3Words" value={form.gpsCoordinates} onChange={e => setForm({...form, gpsCoordinates: e.target.value})} placeholder="Optional" />
                <Input label="Work Area" type="select" value={form.workArea} onChange={e => setForm({...form, workArea: e.target.value})}>
                  {Object.entries(workAreaLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </Input>
                <Input label="Road Manager" type="select" value={form.roadManager} onChange={e => setForm({...form, roadManager: e.target.value})}>
                  {Object.entries(roadManagerLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </Input>
                {form.roadManager === 'council' && <Input label="Council Name" value={form.councilName} onChange={e => setForm({...form, councilName: e.target.value})} placeholder="e.g. City of Perth" />}
                <Input label="Posted Speed Limit (km/h)" type="number" value={form.speedLimit} onChange={e => setForm({...form, speedLimit: parseInt(e.target.value) || 0})} />
              </div>
              <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <Input label="Signalised Intersection?" type="checkbox" value={form.signalisedIntersection} onChange={e => setForm({...form, signalisedIntersection: e.target.checked})} placeholder="Affects a signalised intersection" />
                <Input label="Affects Bus Lane?" type="checkbox" value={form.affectsBusLane} onChange={e => setForm({...form, affectsBusLane: e.target.checked})} placeholder="Blocks a bus lane" />
                <Input label="Affects Cycle Path?" type="checkbox" value={form.affectsCyclePath} onChange={e => setForm({...form, affectsCyclePath: e.target.checked})} placeholder="Blocks dedicated cycle path" />
                <Input label="Affects Pedestrian Crossing?" type="checkbox" value={form.affectsPedCrossing} onChange={e => setForm({...form, affectsPedCrossing: e.target.checked})} placeholder="Blocks a pedestrian crossing" />
              </div>
              <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#fffbeb', borderRadius: 6, fontSize: '0.75rem', color: '#92400e' }}>
                <strong>Compliance note:</strong> Sites ≥70 km/h require longer taper lengths, additional advance warning signs, and may mandate a TMA.
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--lux-blue)' }}>3. Nature of Work</h3>
              <div className="grid-2">
                <Input label="Description of Works" type="textarea" value={form.workDescription} onChange={e => setForm({...form, workDescription: e.target.value})} placeholder="Describe what the client is doing (e.g. dig a hole, set up a crane, road resurfacing)" textareaStyle={{ minHeight: 100 }} />
                <div>
                  <Input label="Work Footprint" type="select" value={form.workFootprint} onChange={e => setForm({...form, workFootprint: e.target.value})}>
                    {Object.entries(footprintLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </Input>
                  <Input label="Lane open past worksite?" type="checkbox" value={form.laneOpenPastWorksite} onChange={e => setForm({...form, laneOpenPastWorksite: e.target.checked})} placeholder="Yes, traffic flows past" />
                  <Input label="Vehicle access through worksite?" type="checkbox" value={form.vehicleAccessRequired} onChange={e => setForm({...form, vehicleAccessRequired: e.target.checked})} placeholder="Vehicles need to pass through" />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--lux-blue)' }}>4. Timeline & Staging</h3>
              <div className="grid-3">
                <Input label="Proposed Start Date" type="date" value={form.proposedStartDate} onChange={e => setForm({...form, proposedStartDate: e.target.value})} />
                <Input label="Proposed End Date" type="date" value={form.proposedEndDate} onChange={e => setForm({...form, proposedEndDate: e.target.value})} />
                <Input label="Total Duration (calendar days)" type="number" value={form.totalDurationDays} onChange={e => setForm({...form, totalDurationDays: parseInt(e.target.value) || 1})} />
              </div>
              <div className="grid-3" style={{ marginTop: '0.75rem' }}>
                <div className="form-group">
                  <label>Day Shift Start</label>
                  <input className="form-input" type="time" value={form.shiftDay.start} onChange={e => setForm({...form, shiftDay: { ...form.shiftDay, start: e.target.value }})} />
                </div>
                <div className="form-group">
                  <label>Day Shift End</label>
                  <input className="form-input" type="time" value={form.shiftDay.end} onChange={e => setForm({...form, shiftDay: { ...form.shiftDay, end: e.target.value }})} />
                </div>
                <Input label="Shift Duration (hours)" type="number" value={form.shiftDuration} onChange={e => setForm({...form, shiftDuration: parseInt(e.target.value) || 1})} />
              </div>
              <div className="grid-3" style={{ marginTop: '0.5rem' }}>
                <div className="form-group">
                  <label>Night Shift Start (if applicable)</label>
                  <input className="form-input" type="time" value={form.shiftNight.start} onChange={e => setForm({...form, shiftNight: { ...form.shiftNight, start: e.target.value }})} />
                </div>
                <div className="form-group">
                  <label>Night Shift End</label>
                  <input className="form-input" type="time" value={form.shiftNight.end} onChange={e => setForm({...form, shiftNight: { ...form.shiftNight, end: e.target.value }})} />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', paddingBottom: '0.25rem' }}>
                  <Input label="Staging changes between shifts?" type="checkbox" value={form.stagingChanges} onChange={e => setForm({...form, stagingChanges: e.target.checked})} placeholder="Multiple distinct TGS drawings needed" />
                </div>
              </div>
              <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#fffbeb', borderRadius: 6, fontSize: '0.75rem', color: '#92400e' }}>
                <strong>Industry note:</strong> Night works near residential zones may require a separate council noise exemption. Factor this into your timeline.
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--lux-blue)' }}>5. Permits & Authority Ownership</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--lux-gray)', marginBottom: '1rem' }}>Who handles each task? This directly affects your quote — full submission costs more than draft-only.</p>
              <div style={{ background: '#f8f9fc', borderRadius: 8, padding: '0.75rem 1rem' }}>
                <PermitTaskSelector label="TMP/TGS Drafting" value={form.permitTasks.drafting} onChange={v => setPermitTask('drafting', v)} />
                <PermitTaskSelector label="Site Inspection & Photos (s4.2.1)" value={form.permitTasks.siteInspection} onChange={v => setPermitTask('siteInspection', v)} />
                <PermitTaskSelector label="LGA/MRWA Plan Submission" value={form.permitTasks.planSubmission} onChange={v => setPermitTask('planSubmission', v)} />
                <PermitTaskSelector label="Road Occupancy Permit (ROP)" value={form.permitTasks.rop} onChange={v => setPermitTask('rop', v)} />
                <PermitTaskSelector label="Public Notice / Advertising" value={form.permitTasks.publicNotice || ''} onChange={v => setPermitTask('publicNotice', v)} />
                <PermitTaskSelector label="Council Noise Exemption (night works)" value={form.permitTasks.noiseExemption || ''} onChange={v => setPermitTask('noiseExemption', v)} />
              </div>
              <div style={{ marginTop: '1rem' }}>
                <Input label="Quote Type" type="select" value={form.quoteType} onChange={e => setForm({...form, quoteType: e.target.value})}>
                  {Object.entries(quoteTypeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </Input>
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--lux-blue)' }}>6. Traffic Control & Additional Constraints</h3>
              <div className="grid-3">
                <Input label="Traffic Control Method" type="select" value={form.tcMethod} onChange={e => setForm({...form, tcMethod: e.target.value})}>
                  {Object.entries(tcMethodLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </Input>
                <Input label="TMA Required?" type="select" value={form.tmaRequired} onChange={e => setForm({...form, tmaRequired: e.target.value})}>
                  <option value="yes">Yes</option><option value="no">No</option><option value="assess">Unsure – assess in quote</option>
                </Input>
                <Input label="Advance Warning Distance (m)" type="number" value={form.advanceWarningDistance} onChange={e => setForm({...form, advanceWarningDistance: parseInt(e.target.value) || 0})} />
              </div>
              <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <Input label="Nearby school/hospital/emergency?" type="checkbox" value={form.nearbySchool} onChange={e => setForm({...form, nearbySchool: e.target.checked})} placeholder="Sensitive receptor nearby" />
                <Input label="Existing TMP/TGS to reference?" type="checkbox" value={!!form.existingTmpRef} onChange={e => setForm({...form, existingTmpRef: e.target.checked ? form.existingTmpRef || 'YES' : ''})} />
                <Input label="Site photos available?" type="checkbox" value={form.sitePhotosAvailable} onChange={e => setForm({...form, sitePhotosAvailable: e.target.checked})} placeholder="Photos provided by client" />
                <Input label="SWMS required?" type="checkbox" value={form.swmsRequired} onChange={e => setForm({...form, swmsRequired: e.target.checked})} placeholder="Safe Work Method Statement needed" />
              </div>
              {form.existingTmpRef && form.existingTmpRef !== 'YES' && (
                <Input label="Existing TMP Reference" value={form.existingTmpRef} onChange={e => setForm({...form, existingTmpRef: e.target.value})} placeholder="e.g. MRWA-TMP-2026-0842" />
              )}
              <Input label="Additional Notes" type="textarea" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Any other constraints, access issues, or client requirements..." textareaStyle={{ minHeight: 80 }} />
              <div className="grid-2" style={{ marginTop: '0.75rem' }}>
                <Input label="Signed by" value={form.signedBy} onChange={e => setForm({...form, signedBy: e.target.value})} placeholder="Client representative name" />
                <Input label="Date" type="date" value={form.signedDate} onChange={e => setForm({...form, signedDate: e.target.value})} />
              </div>
              <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f8f9fc', borderRadius: 8, fontSize: '0.8rem', color: 'var(--lux-gray)' }}>
                <strong>Declaration:</strong> I confirm the information above is accurate. I understand a physical site inspection is required per MRWA Code s4.2.1 for all site-specific plans and that MRWA/LGA review periods typically range from 10–15 business days.
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--lux-border)' }}>
            <div>
              {step > 0 && <button className="btn btn-outline" onClick={() => setStep(step - 1)}><ChevronLeft size={16} /> Previous</button>}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-outline" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</button>
              <button className="btn btn-outline" onClick={handleSave}><Save size={14} /> Save Draft</button>
              {step < 5 ? (
                <button className="btn btn-primary" onClick={() => setStep(step + 1)}>Next <ChevronRight size={16} /></button>
              ) : (
                <button className="btn btn-primary" onClick={handleSubmit}><Send size={14} /> Submit Scoping Request</button>
              )}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--lux-gray)' }} />
          <input className="form-input" style={{ paddingLeft: '2rem' }} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by client, road, or contact..." />
        </div>
        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
          {['all', 'draft', 'submitted', 'quoted', 'approved', 'rejected'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-outline'}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--lux-gray)' }}>
          <FileText size={40} style={{ marginBottom: '1rem', opacity: 0.4 }} />
          <p>No scoping requests found. Create one to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {filtered.map(s => {
            const st = statusStyles[s.status] || statusStyles.draft;
            return (
              <div className="card" key={s.id} style={{ padding: '1rem', cursor: 'pointer' }} onClick={() => openView(s)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{s.clientName}</span>
                      <span className="badge" style={{ background: st.bg, color: st.color, fontSize: '0.65rem', fontWeight: 600 }}>{s.status}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--lux-gray)', fontFamily: 'monospace' }}>{s.id}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--lux-gray)', flexWrap: 'wrap' }}>
                      <span><MapPin size={12} /> {s.roadName}, {s.suburb}</span>
                      <span>{s.speedLimit} km/h · {roadManagerLabels[s.roadManager]}</span>
                      <span>{workAreaLabels[s.workArea]}</span>
                      <span>{s.proposedStartDate} → {s.proposedEndDate}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--lux-gray)', marginTop: '0.25rem' }}>
                      {s.workDescription}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
                    <button className="btn btn-sm btn-outline" onClick={(e) => { e.stopPropagation(); openView(s); }}><Eye size={14} /></button>
                    <button className="btn btn-sm btn-outline" onClick={(e) => { e.stopPropagation(); openEdit(s); }}><Edit3 size={14} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
