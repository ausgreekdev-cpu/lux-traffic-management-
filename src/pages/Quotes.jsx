import { useState } from 'react';
import { Plus, FileText, DollarSign, Trash2, Send, CheckCircle, Printer, Eye, Edit3 } from 'lucide-react';
import { quotes as defaultQuotes, scopeRequests } from '../data/mockData';

const defaultRates = [
  { description: 'TMP/TGS Design - Standard (per sheet)', unit: 'sheet', defaultQty: 1, defaultRate: 350 },
  { description: 'TMP/TGS Design - Complex Intersection', unit: 'each', defaultQty: 1, defaultRate: 1200 },
  { description: 'Site Inspection & Photography (s4.2.1)', unit: 'each', defaultQty: 1, defaultRate: 350 },
  { description: 'Traffic Modelling / Signal Coordination', unit: 'each', defaultQty: 1, defaultRate: 1800 },
  { description: 'MRWA Plan Submission & Liaison', unit: 'each', defaultQty: 1, defaultRate: 650 },
  { description: 'LGA Plan Submission & Liaison', unit: 'each', defaultQty: 1, defaultRate: 450 },
  { description: 'Road Occupancy Permit (ROP) Application', unit: 'each', defaultQty: 1, defaultRate: 250 },
  { description: 'Public Notice / Advertising (road closure)', unit: 'each', defaultQty: 1, defaultRate: 350 },
  { description: 'Council Noise Exemption Application', unit: 'each', defaultQty: 1, defaultRate: 200 },
  { description: 'Staging Diagrams (additional sheets)', unit: 'sheet', defaultQty: 1, defaultRate: 120 },
  { description: 'Project Management / Client Liaison', unit: 'hour', defaultQty: 2, defaultRate: 95 },
  { description: 'SWMS Development', unit: 'each', defaultQty: 1, defaultRate: 250 },
];

const statusStyles = { draft: { color: '#92400e', bg: '#fffbeb' }, sent: { color: '#1e40af', bg: '#dbeafe' }, accepted: { color: '#065f46', bg: '#d1fae5' }, rejected: { color: '#991b1b', bg: '#fce4ec' } };

export default function Quotes() {
  const [quotes, setQuotes] = useState(defaultQuotes);
  const [showForm, setShowForm] = useState(false);
  const [editQuote, setEditQuote] = useState(null);
  const [viewQuote, setViewQuote] = useState(null);
  const [scopeId, setScopeId] = useState('');
  const [clientName, setClientName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [lineItems, setLineItems] = useState([]);
  const [notes, setNotes] = useState('');
  const [validityDays, setValidityDays] = useState(30);
  const [saved, setSaved] = useState(false);

  const openNewFromScope = (scope) => {
    setScopeId(scope?.id || '');
    setClientName(scope?.clientName || '');
    setContactName(scope?.contactName || '');
    setContactEmail(scope?.contactEmail || '');
    setJobDescription(`${scope?.roadName || ''} - ${scope?.workDescription || ''}`.substring(0, 100));
    setLineItems([]);
    setNotes(scope?.notes || '');
    setValidityDays(30);
    setEditQuote(null);
    setShowForm(true);
    setViewQuote(null);
  };

  const openNew = () => {
    setScopeId(''); setClientName(''); setContactName(''); setContactEmail('');
    setJobDescription(''); setLineItems([]); setNotes(''); setValidityDays(30);
    setEditQuote(null); setShowForm(true); setViewQuote(null);
  };

  const openEdit = (q) => {
    setEditQuote(q); setScopeId(q.scopeId || ''); setClientName(q.clientName);
    setContactName(q.contactName); setContactEmail(q.contactEmail);
    setJobDescription(q.jobDescription); setLineItems(q.lineItems.map(i => ({ ...i })));
    setNotes(q.notes || ''); setValidityDays(q.validityDays || 30);
    setShowForm(true); setViewQuote(null);
  };

  const addLineItem = (rate) => {
    setLineItems([...lineItems, { description: rate.description, quantity: rate.defaultQty || 1, unit: rate.unit || 'each', rate: rate.defaultRate || 0, amount: (rate.defaultQty || 1) * (rate.defaultRate || 0) }]);
  };

  const updateLineItem = (idx, field, value) => {
    const updated = lineItems.map((item, i) => {
      if (i !== idx) return item;
      const changed = { ...item, [field]: value };
      if (field === 'quantity' || field === 'rate') changed.amount = (changed.quantity || 0) * (changed.rate || 0);
      return changed;
    });
    setLineItems(updated);
  };

  const removeLineItem = (idx) => setLineItems(lineItems.filter((_, i) => i !== idx));

  const calcTotal = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    return { subtotal, gst: Math.round(subtotal * 0.1 * 100) / 100, total: Math.round(subtotal * 1.1 * 100) / 100 };
  };

  const handleSave = () => {
    const { subtotal, gst, total } = calcTotal();
    if (editQuote) {
      setQuotes(quotes.map(q => q.id === editQuote.id ? { ...q, clientName, contactName, contactEmail, jobDescription, lineItems, subtotal, gst, total, notes, validityDays, updatedAt: new Date().toISOString() } : q));
    } else {
      const newQuote = { id: `QTE-${String(quotes.length + 1).padStart(3, '0')}`, scopeId: scopeId || null, status: 'draft', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), clientName, contactName, contactEmail, jobDescription, lineItems, subtotal, gst, total, notes, validityDays };
      setQuotes([...quotes, newQuote]);
    }
    setSaved(true); setTimeout(() => setSaved(false), 2000);
    setShowForm(false);
  };

  const updateStatus = (id, status) => setQuotes(quotes.map(q => q.id === id ? { ...q, status, updatedAt: new Date().toISOString() } : q));

  const formatCurrency = (n) => '$' + (n || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Quotes & Proposals</h1>
          <p>Generate itemised quotes from scoping requests using rate card</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline" onClick={openNew}><Plus size={16} /> Blank Quote</button>
          <button className="btn btn-primary" onClick={() => openNewFromScope(null)}><FileText size={16} /> From Scoping Request</button>
        </div>
      </div>

      {saved && (
        <div style={{ background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#065f46', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={16} /> Quote saved successfully
        </div>
      )}

      {viewQuote && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{viewQuote.jobDescription}</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--lux-gray)' }}>{viewQuote.id} · {viewQuote.clientName} · {new Date(viewQuote.createdAt).toLocaleDateString()}</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span className="badge" style={{ background: (statusStyles[viewQuote.status] || statusStyles.draft).bg, color: (statusStyles[viewQuote.status] || statusStyles.draft).color, fontWeight: 600 }}>{viewQuote.status}</span>
              <button className="btn btn-sm btn-outline" onClick={() => openEdit(viewQuote)}><Edit3 size={14} /></button>
              <button className="btn btn-sm btn-outline" onClick={() => setViewQuote(null)}>Close</button>
            </div>
          </div>
          <div style={{ fontSize: '0.85rem' }}>
            <p><strong>To:</strong> {viewQuote.contactName}, {viewQuote.clientName} — {viewQuote.contactEmail}</p>
          </div>
          <table style={{ marginTop: '0.75rem' }}>
            <thead><tr><th>#</th><th>Description</th><th>Qty</th><th>Unit</th><th>Rate</th><th style={{ textAlign: 'right' }}>Amount</th></tr></thead>
            <tbody>
              {viewQuote.lineItems.map((item, i) => (
                <tr key={i}><td>{i + 1}</td><td>{item.description}</td><td>{item.quantity}</td><td>{item.unit}</td><td>{formatCurrency(item.rate)}</td><td style={{ textAlign: 'right' }}>{formatCurrency(item.amount)}</td></tr>
              ))}
            </tbody>
          </table>
          <div style={{ textAlign: 'right', marginTop: '0.75rem', fontSize: '0.9rem' }}>
            <div>Subtotal: {formatCurrency(viewQuote.subtotal)}</div>
            <div>GST (10%): {formatCurrency(viewQuote.gst)}</div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>Total: {formatCurrency(viewQuote.total)}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--lux-gray)' }}>Valid for {viewQuote.validityDays} days</div>
          </div>
          {viewQuote.notes && <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#fffbeb', borderRadius: 8, fontSize: '0.8rem' }}><strong>Notes:</strong> {viewQuote.notes}</div>}
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
            {viewQuote.status === 'draft' && <button className="btn btn-primary btn-sm" onClick={() => updateStatus(viewQuote.id, 'sent')}><Send size={14} /> Mark as Sent</button>}
            {viewQuote.status === 'sent' && <button className="btn btn-primary btn-sm" onClick={() => updateStatus(viewQuote.id, 'accepted')}><CheckCircle size={14} /> Mark as Accepted</button>}
            {(viewQuote.status === 'draft' || viewQuote.status === 'sent') && <button className="btn btn-sm btn-outline" onClick={() => updateStatus(viewQuote.id, 'rejected')}>Reject</button>}
          </div>
        </div>
      )}

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem', border: '2px solid var(--lux-blue)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>{editQuote ? 'Edit Quote' : 'New Quote'}</h2>

          {!editQuote && (
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>Base on Scoping Request (optional)</label>
              <select className="form-select" value={scopeId} onChange={e => {
                const scope = scopeRequests.find(s => s.id === e.target.value);
                setScopeId(e.target.value);
                if (scope) { setClientName(scope.clientName); setContactName(scope.contactName); setContactEmail(scope.contactEmail); setJobDescription(`${scope.roadName} — ${scope.workDescription}`.substring(0, 100)); setNotes(scope.notes || ''); }
              }}>
                <option value="">— No scoping request —</option>
                {scopeRequests.filter(s => s.status === 'submitted' || s.status === 'quoted').map(s => (
                  <option key={s.id} value={s.id}>{s.id} — {s.clientName} — {s.roadName}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid-3">
            <div className="form-group"><label>Client Name</label><input className="form-input" value={clientName} onChange={e => setClientName(e.target.value)} /></div>
            <div className="form-group"><label>Contact Name</label><input className="form-input" value={contactName} onChange={e => setContactName(e.target.value)} /></div>
            <div className="form-group"><label>Contact Email</label><input className="form-input" type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} /></div>
          </div>
          <div className="form-group"><label>Job / Scope Description</label><input className="form-input" value={jobDescription} onChange={e => setJobDescription(e.target.value)} /></div>

          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Line Items</h3>
              <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--lux-gray)', padding: '0.25rem 0' }}>Quick-add rate:</span>
                {['TMP/TGS Design', 'Site Inspection', 'Plan Submission', 'Staging Diagram'].map(label => {
                  const r = defaultRates.find(d => d.description.startsWith(label));
                  return r && <button key={label} className="btn btn-xs btn-outline" onClick={() => addLineItem(r)} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>+{r.description.split('-')[0].trim()}</button>;
                })}
              </div>
            </div>

            <table>
              <thead><tr><th>Description</th><th style={{ width: 60 }}>Qty</th><th style={{ width: 60 }}>Unit</th><th style={{ width: 100 }}>Rate</th><th style={{ width: 100, textAlign: 'right' }}>Amount</th><th style={{ width: 30 }}></th></tr></thead>
              <tbody>
                {lineItems.map((item, i) => (
                  <tr key={i}>
                    <td><input className="form-input" style={{ fontSize: '0.8rem' }} value={item.description} onChange={e => updateLineItem(i, 'description', e.target.value)} /></td>
                    <td><input className="form-input" style={{ fontSize: '0.8rem', textAlign: 'center' }} type="number" min="0" value={item.quantity} onChange={e => updateLineItem(i, 'quantity', parseFloat(e.target.value) || 0)} /></td>
                    <td><select className="form-select" style={{ fontSize: '0.8rem' }} value={item.unit} onChange={e => updateLineItem(i, 'unit', e.target.value)}><option>each</option><option>hour</option><option>day</option><option>sheet</option><option>km</option></select></td>
                    <td><input className="form-input" style={{ fontSize: '0.8rem', textAlign: 'right' }} type="number" min="0" value={item.rate} onChange={e => updateLineItem(i, 'rate', parseFloat(e.target.value) || 0)} /></td>
                    <td style={{ textAlign: 'right', fontSize: '0.85rem' }}>${(item.amount || 0).toFixed(2)}</td>
                    <td><button className="btn btn-sm btn-outline" style={{ color: 'var(--lux-danger)', border: 'none' }} onClick={() => removeLineItem(i)}><Trash2 size={14} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
              {defaultRates.map((r, i) => (
                <button key={i} className="btn btn-xs btn-outline" onClick={() => addLineItem(r)} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>+ {r.description.substring(0, 30)}{r.description.length > 30 ? '...' : ''}</button>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'right', marginTop: '1rem', padding: '1rem', background: '#f8f9fc', borderRadius: 8 }}>
            {lineItems.length > 0 ? (
              <>
                <div style={{ fontSize: '0.85rem' }}>Subtotal: {formatCurrency(calcTotal().subtotal)}</div>
                <div style={{ fontSize: '0.85rem' }}>GST (10%): {formatCurrency(calcTotal().gst)}</div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Total: {formatCurrency(calcTotal().total)}</div>
              </>
            ) : <span style={{ color: 'var(--lux-gray)', fontSize: '0.85rem' }}>Add line items to see totals</span>}
          </div>

          <div className="grid-2" style={{ marginTop: '1rem' }}>
            <div className="form-group"><label>Notes / Exclusions</label><textarea className="form-textarea" style={{ minHeight: 80 }} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Excludes ROP fees, on-site deployment, etc." /></div>
            <div className="form-group"><label>Validity Period (days)</label><input className="form-input" type="number" value={validityDays} onChange={e => setValidityDays(parseInt(e.target.value) || 30)} /></div>
          </div>

          <div className="modal-actions" style={{ marginTop: '1rem' }}>
            <button className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}><DollarSign size={14} /> {editQuote ? 'Update Quote' : 'Create Quote'}</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {['all', 'draft', 'sent', 'accepted', 'rejected'].map(s => (
          <button key={s} className={`btn btn-sm ${s === 'all' ? 'btn-primary' : 'btn-outline'}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>
        ))}
      </div>

      {quotes.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--lux-gray)' }}>
          <DollarSign size={40} style={{ marginBottom: '1rem', opacity: 0.4 }} />
          <p>No quotes yet. Create one from a scoping request or start a blank quote.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {quotes.map(q => {
            const st = statusStyles[q.status] || statusStyles.draft;
            return (
              <div className="card" key={q.id} style={{ padding: '1rem', cursor: 'pointer' }} onClick={() => { setViewQuote(q); setShowForm(false); }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{q.clientName}</span>
                      <span className="badge" style={{ background: st.bg, color: st.color, fontSize: '0.65rem', fontWeight: 600 }}>{q.status}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--lux-gray)', fontFamily: 'monospace' }}>{q.id}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--lux-gray)' }}>{q.jobDescription}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--lux-gray)', marginTop: '0.25rem' }}>{q.contactName} · {q.contactEmail} · {q.lineItems.length} line items</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{formatCurrency(q.total)}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--lux-gray)' }}>{new Date(q.createdAt).toLocaleDateString()}</div>
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
