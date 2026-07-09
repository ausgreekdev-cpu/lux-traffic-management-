const API = 'http://localhost:3001';

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ── Clients ──
export function getClients() { return request('/clients'); }
export function getClient(id) { return request(`/clients/${id}`); }
export async function saveClient(client) {
  if (client.id) return request(`/clients/${client.id}`, { method: 'PATCH', body: JSON.stringify(client) });
  const clients = await getClients();
  client.id = `CLT-${String(clients.length + 1).padStart(3, '0')}`;
  return request('/clients', { method: 'POST', body: JSON.stringify(client) });
}
export function deleteClient(id) { return request(`/clients/${id}`, { method: 'DELETE' }); }

// ── Jobs ──
export function getJobs() { return request('/jobs'); }
export function getJob(id) { return request(`/jobs/${id}`); }
export function getJobsByClient(clientId) { return request(`/jobs?clientId=${clientId}`); }
export async function saveJob(job) {
  if (job.id) return request(`/jobs/${job.id}`, { method: 'PATCH', body: JSON.stringify(job) });
  const jobs = await getJobs();
  job.id = `JOB-${String(jobs.length + 1).padStart(3, '0')}`;
  return request('/jobs', { method: 'POST', body: JSON.stringify(job) });
}
export function deleteJob(id) { return request(`/jobs/${id}`, { method: 'DELETE' }); }

// ── Job Attachments ──
export function getJobAttachments(jobId) { return request(`/api/jobs/${jobId}/attachments`); }

export function getClientAttachments(clientId) { return request(`/api/clients/${clientId}/attachments`); }

export async function uploadAttachment(file, jobId, clientId, { category, description, tags, uploadedBy } = {}) {
  const form = new FormData();
  form.append('file', file);
  form.append('jobId', jobId);
  form.append('clientId', clientId || '');
  form.append('category', category || 'General');
  form.append('description', description || '');
  form.append('tags', tags || '');
  form.append('uploadedBy', uploadedBy || 'system');
  const res = await fetch(`${API}/api/upload`, { method: 'POST', body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(err.error);
  }
  return res.json();
}

export function deleteAttachment(id) { return request(`/api/attachments/${id}`, { method: 'DELETE' }); }

// ── Lux Documents ──
export function getLuxDocuments() { return request('/lux_documents'); }

export async function uploadLuxDocument(file, { title, category, description, tags, version, status, uploadedBy } = {}) {
  const form = new FormData();
  form.append('file', file);
  form.append('title', title || file.name);
  form.append('category', category || 'Policy');
  form.append('description', description || '');
  form.append('tags', tags || '');
  form.append('version', version || '1.0');
  form.append('status', status || 'active');
  form.append('uploadedBy', uploadedBy || 'system');
  const res = await fetch(`${API}/api/lux/upload`, { method: 'POST', body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(err.error);
  }
  return res.json();
}

export function deleteLuxDocument(id) { return request(`/lux_documents/${id}`, { method: 'DELETE' }); }

// ── Crew, Equipment, Permits, Incidents, Timesheets ──
export const getCrew = () => request('/crew');
export const getEquipment = () => request('/equipment');
export const getPermits = () => request('/permits');
export const getIncidents = () => request('/incidents');
export const getTimesheets = () => request('/timesheets');

// ── Login ──
export async function login(email, password) {
  return request('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}
