import jsonServer from 'json-server';
import nodemailer from 'nodemailer';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'lux-jwt-secret-2026-change-in-prod';

const isPkg = !!process.pkg;
const ROOT = isPkg ? path.dirname(process.execPath) : process.cwd();
const SRC_DIR = isPkg ? process.cwd() : process.cwd();

const DB_PATH = path.join(ROOT, 'data', 'db.json');
const UPLOADS_DIR = path.join(ROOT, 'uploads');
const DIST_DIR = path.join(ROOT, 'dist');

// Ensure data directory and db.json exist in portable mode
if (!fs.existsSync(path.join(ROOT, 'data'))) fs.mkdirSync(path.join(ROOT, 'data'), { recursive: true });
if (!fs.existsSync(DB_PATH)) {
  const srcDb = path.join(SRC_DIR, 'db.json');
  if (fs.existsSync(srcDb)) fs.copyFileSync(srcDb, DB_PATH);
  else fs.writeFileSync(DB_PATH, JSON.stringify({}));
}
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /\.(pdf|doc|docx|xls|xlsx|jpg|jpeg|png|gif|dwg|dxf|msg|zip|rar|7z|csv|txt|html|xml|json)$/i;
    if (allowed.test(path.extname(file.originalname))) cb(null, true);
    else cb(new Error('File type not allowed'));
  },
});

const server = jsonServer.create();
const router = jsonServer.router(DB_PATH);
const middlewares = jsonServer.defaults({ noCors: false, static: UPLOADS_DIR });

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Serve uploaded files
server.use('/api/files', (req, res, next) => {
  if (req.method === 'GET') {
    const filePath = path.join(UPLOADS_DIR, req.path);
    if (fs.existsSync(filePath)) res.sendFile(filePath);
    else res.status(404).json({ error: 'File not found' });
  } else next();
});

// JWT auth middleware — only protect API / json-server routes
function authenticateJWT(req, res, next) {
  const isApiRoute = req.path.startsWith('/api/') || ['/clients', '/jobs', '/crew', '/equipment', '/permits', '/incidents', '/timesheets', '/users', '/lux_documents', '/job_attachments', '/tmpDocuments', '/emailTemplates', '/auditLog', '/emailLog', '/scoping_requests', '/quote_items', '/quotes', '/scoping', '/notifications'].includes(req.path) || req.path.match(/^\/(clients|jobs|crew|equipment|permits|incidents|timesheets|users|lux_documents|job_attachments|tmpDocuments|emailTemplates|auditLog|emailLog|scoping_requests|quote_items|quotes|scoping|notifications)\//);
  if (!isApiRoute || req.method === 'OPTIONS') return next();
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = decoded;
    next();
  });
}

// Login
server.use((req, res, next) => {
  if (req.method === 'POST' && req.path === '/login') {
    const { email, password } = req.body;
    const db = JSON.parse(JSON.stringify(router.db.getState()));
    const user = db.users?.find(u => u.email === email && u.password === password);
    if (user) {
      const { password: _, ...safeUser } = user;
      const token = jwt.sign(safeUser, JWT_SECRET, { expiresIn: '24h' });
      return res.json({ success: true, token, user: safeUser });
    }
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
  next();
});

// Apply JWT auth to all subsequent routes
server.use(authenticateJWT);

// File upload — attach to a job
server.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const { jobId, clientId, category } = req.body;
  if (!jobId) return res.status(400).json({ error: 'jobId is required' });
  const db = JSON.parse(JSON.stringify(router.db.getState()));
  const attachment = {
    id: `ATT-${Date.now()}`, jobId, clientId: clientId || null,
    category: category || 'General', originalName: req.file.originalname,
    storedName: req.file.filename, mimeType: req.file.mimetype, size: req.file.size,
    path: `/api/files/${req.file.filename}`,
    uploadedAt: new Date().toISOString(), uploadedBy: req.body.uploadedBy || 'system',
    tags: (req.body.tags || '').split(',').map(t => t.trim()).filter(Boolean),
    description: req.body.description || '',
  };
  db.job_attachments = db.job_attachments || [];
  db.job_attachments.push(attachment);
  router.db.setState(db).write();
  res.json({ success: true, attachment });
});

server.get('/api/jobs/:jobId/attachments', (req, res) => {
  const db = router.db.getState();
  res.json((db.job_attachments || []).filter(a => a.jobId === req.params.jobId));
});

server.get('/api/clients/:clientId/attachments', (req, res) => {
  const db = router.db.getState();
  const jobIds = (db.jobs || []).filter(j => j.clientId === req.params.clientId).map(j => j.id);
  res.json((db.job_attachments || []).filter(a => jobIds.includes(a.jobId)));
});

server.delete('/api/attachments/:id', (req, res) => {
  const db = JSON.parse(JSON.stringify(router.db.getState()));
  const idx = (db.job_attachments || []).findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Attachment not found' });
  const [attachment] = db.job_attachments.splice(idx, 1);
  const filePath = path.join(UPLOADS_DIR, attachment.storedName);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  router.db.setState(db).write();
  res.json({ success: true });
});

// Upload to Lux repository
server.post('/api/lux/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const db = JSON.parse(JSON.stringify(router.db.getState()));
  const doc = {
    id: `LUXDOC-${Date.now()}`, category: req.body.category || 'Policy',
    title: req.body.title || req.file.originalname, originalName: req.file.originalname,
    storedName: req.file.filename, mimeType: req.file.mimetype, size: req.file.size,
    path: `/api/files/${req.file.filename}`,
    uploadedAt: new Date().toISOString(), uploadedBy: req.body.uploadedBy || 'system',
    tags: (req.body.tags || '').split(',').map(t => t.trim()).filter(Boolean),
    description: req.body.description || '', version: req.body.version || '1.0', status: req.body.status || 'active',
  };
  db.lux_documents = db.lux_documents || [];
  db.lux_documents.push(doc);
  router.db.setState(db).write();
  res.json({ success: true, doc });
});

// CSV Import
const knownCollections = ['clients', 'jobs', 'crew', 'equipment', 'permits', 'incidents', 'timesheets'];

const collectionPrefixes = {
  clients: 'CLT-', jobs: 'JOB-', crew: 'CRW-', equipment: 'EQ-',
  permits: 'PRM-', incidents: 'INC-', timesheets: 'TS-',
};

server.post('/api/import/csv', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const target = req.body.target;
  if (!target || !knownCollections.includes(target)) return res.status(400).json({ error: `Invalid target. Must be one of: ${knownCollections.join(', ')}` });
  try {
    const content = fs.readFileSync(req.file.path, 'utf-8');
    const records = parse(content, { columns: true, skip_empty_lines: true, relax_quotes: true, relax_column_count: true });
    if (records.length === 0) return res.status(400).json({ error: 'CSV file is empty or has no data rows' });
    const db = JSON.parse(JSON.stringify(router.db.getState()));
    const collection = db[target] || [];
    const prefix = collectionPrefixes[target];
    const errors = [];
    const mapped = records.map((row, i) => {
      const entry = { ...row };
      // Generate ID if not provided
      if (!entry.id && prefix) entry.id = `${prefix}${Date.now()}-${i}`;
      // Handle crew members field — comma-separated string → array
      if (target === 'crew' && typeof entry.members === 'string') entry.members = entry.members.split(',').map(s => s.trim()).filter(Boolean);
      // Handle job equipment field
      if (target === 'jobs' && typeof entry.equipment === 'string') entry.equipment = entry.equipment.split(',').map(s => s.trim()).filter(Boolean);
      // Handle date fields — ensure they're in ISO format
      entry.createdAt = entry.createdAt || new Date().toISOString();
      // Validate required fields per collection
      if (target === 'clients' && !entry.name) errors.push({ row: i + 1, error: 'Missing required field: name' });
      if (target === 'jobs' && !entry.title) errors.push({ row: i + 1, error: 'Missing required field: title' });
      if (target === 'crew' && !entry.name) errors.push({ row: i + 1, error: 'Missing required field: name' });
      return entry;
    });
    if (errors.length > 0) {
      fs.unlinkSync(req.file.path);
      return res.json({ success: false, errors, count: 0 });
    }
    db[target] = [...collection, ...mapped];
    router.db.setState(db).write();
    fs.unlinkSync(req.file.path);
    res.json({ success: true, count: mapped.length, errors, preview: mapped.slice(0, 5) });
  } catch (err) {
    try { fs.unlinkSync(req.file.path); } catch (_) {}
    res.status(400).json({ error: `CSV parsing failed: ${err.message}` });
  }
});

// Email
server.post('/api/send-email', async (req, res) => {
  const { smtp, to, subject, body, cc } = req.body;
  if (!smtp || !to || !subject || !body) return res.status(400).json({ success: false, error: 'Missing required fields' });
  try {
    const transporter = nodemailer.createTransport({
      host: smtp.host, port: parseInt(smtp.port, 10) || 587,
      secure: parseInt(smtp.port, 10) === 465,
      auth: { user: smtp.user, pass: smtp.pass },
    });
    const mailOptions = {
      from: `"${smtp.fromName || 'LUX Traffic Management'}" <${smtp.fromEmail || smtp.user}>`,
      to, subject, html: body.replace(/\n/g, '<br/>'),
    };
    if (cc?.length > 0) mailOptions.cc = cc.filter(Boolean).join(', ');
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Email sent successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Serve built frontend for non-API routes (SPA fallback)
server.use((req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/jobs') || req.path.startsWith('/clients') ||
      req.path.startsWith('/db') || req.path.startsWith('/upload') || req.path.startsWith('/login')) return next();
  const distIndex = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(distIndex) && !req.path.startsWith('/api/')) {
    const filePath = path.join(DIST_DIR, req.path === '/' ? 'index.html' : req.path);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) return res.sendFile(filePath);
    return res.sendFile(distIndex);
  }
  next();
});

// Notifications — auto-create on job status changes (before router)
server.use((req, res, next) => {
  if (req.method === 'PATCH' && req.path.match(/^\/jobs\//)) {
    const jobId = req.path.split('/')[2];
    const before = JSON.parse(JSON.stringify(router.db.getState()));
    const oldJob = before.jobs?.find(j => j.id === jobId);
    if (oldJob) {
      res.on('finish', () => {
        if (res.statusCode >= 400) return;
        const after = JSON.parse(JSON.stringify(router.db.getState()));
        const newJob = after.jobs?.find(j => j.id === jobId);
        if (newJob && oldJob.status !== newJob.status) {
          after.notifications = after.notifications || [];
          after.notifications.unshift({
            id: `NOTIF-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            type: 'job_status',
            jobId,
            title: `Job ${newJob.status}`,
            message: `${newJob.title} moved from ${oldJob.status} to ${newJob.status}`,
            oldStatus: oldJob.status,
            newStatus: newJob.status,
            read: false,
            createdAt: new Date().toISOString(),
          });
          router.db.setState(after).write();
        }
        // Also notify on crew change
        if (newJob && oldJob.crew !== newJob.crew) {
          after.notifications = after.notifications || [];
          after.notifications.unshift({
            id: `NOTIF-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            type: 'crew_change',
            jobId,
            title: 'Crew reassigned',
            message: `${newJob.title} reassigned to ${newJob.crew || 'unassigned'}`,
            read: false,
            createdAt: new Date().toISOString(),
          });
          router.db.setState(after).write();
        }
      });
    }
  }
  next();
});

// Audit log — intercept json-server writes (must be before router)
server.use((req, res, next) => {
  if (['POST', 'PATCH', 'DELETE'].includes(req.method) && !req.path.startsWith('/api/')) {
    res.on('finish', () => {
      if (res.statusCode >= 400) return;
      const after = JSON.parse(JSON.stringify(router.db.getState()));
      after.auditLog = after.auditLog || [];
      const entry = {
        id: `AUDIT-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        method: req.method,
        path: req.path,
        body: req.method === 'GET' ? null : { ...req.body, password: req.body?.password ? '[REDACTED]' : undefined },
        timestamp: new Date().toISOString(),
      };
      after.auditLog.push(entry);
      router.db.setState(after).write();
    });
  }
  next();
});

server.use(router);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`\n  LUX Traffic Management Portal`);
  console.log(`  ${'='.repeat(32)}`);
  console.log(`  Running on: ${url}`);
  console.log(`  Data: ${DB_PATH}`);
  console.log(`  Uploads: ${UPLOADS_DIR}`);
  console.log(`  ${'='.repeat(32)}\n`);

  // Auto-open browser in production/exe mode
  if (isPkg || process.env.NODE_ENV === 'production') {
    import('child_process').then(cp => {
      const cmd = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
      cp.exec(`${cmd} ${url}`);
    }).catch(() => {});
  }
});
