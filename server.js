import jsonServer from 'json-server';
import nodemailer from 'nodemailer';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, 'uploads');
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
    else cb(new Error('File type not allowed. Allowed: pdf, doc, xls, images, dwg, dxf, msg, zip, csv, txt'));
  },
});

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults({ noCors: false, static: 'uploads' });

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Serve uploaded files statically
server.use('/api/files', (req, res, next) => {
  if (req.method === 'GET') {
    const filePath = path.join(UPLOADS_DIR, req.path);
    if (fs.existsSync(filePath)) res.sendFile(filePath);
    else res.status(404).json({ error: 'File not found' });
  } else next();
});

// Login
server.use((req, res, next) => {
  if (req.method === 'POST' && req.path === '/login') {
    const { email, password } = req.body;
    const db = JSON.parse(JSON.stringify(router.db.getState()));
    const user = db.users.find(u => u.email === email && u.password === password);
    if (user) {
      const { password: _, ...safeUser } = user;
      return res.json({ success: true, user: safeUser });
    }
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
  next();
});

// File upload — attach to a job
server.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const { jobId, clientId, category } = req.body;
  if (!jobId) return res.status(400).json({ error: 'jobId is required' });

  const db = JSON.parse(JSON.stringify(router.db.getState()));
  const attachment = {
    id: `ATT-${Date.now()}`,
    jobId,
    clientId: clientId || null,
    category: category || 'General',
    originalName: req.file.originalname,
    storedName: req.file.filename,
    mimeType: req.file.mimetype,
    size: req.file.size,
    path: `/api/files/${req.file.filename}`,
    uploadedAt: new Date().toISOString(),
    uploadedBy: req.body.uploadedBy || 'system',
    tags: (req.body.tags || '').split(',').map(t => t.trim()).filter(Boolean),
    description: req.body.description || '',
  };

  db.job_attachments = db.job_attachments || [];
  db.job_attachments.push(attachment);
  router.db.setState(db).write();
  res.json({ success: true, attachment });
});

// Get all attachments for a job
server.get('/api/jobs/:jobId/attachments', (req, res) => {
  const db = router.db.getState();
  const attachments = (db.job_attachments || []).filter(a => a.jobId === req.params.jobId);
  res.json(attachments);
});

// Get all attachments across all jobs for a client (consolidated view)
server.get('/api/clients/:clientId/attachments', (req, res) => {
  const db = router.db.getState();
  const clientJobs = (db.jobs || []).filter(j => j.clientId === req.params.clientId);
  const jobIds = clientJobs.map(j => j.id);
  const attachments = (db.job_attachments || []).filter(a => jobIds.includes(a.jobId));
  res.json(attachments);
});

// Delete an attachment
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
    id: `LUXDOC-${Date.now()}`,
    category: req.body.category || 'Policy',
    title: req.body.title || req.file.originalname,
    originalName: req.file.originalname,
    storedName: req.file.filename,
    mimeType: req.file.mimetype,
    size: req.file.size,
    path: `/api/files/${req.file.filename}`,
    uploadedAt: new Date().toISOString(),
    uploadedBy: req.body.uploadedBy || 'system',
    tags: (req.body.tags || '').split(',').map(t => t.trim()).filter(Boolean),
    description: req.body.description || '',
    version: req.body.version || '1.0',
    status: req.body.status || 'active',
  };

  db.lux_documents = db.lux_documents || [];
  db.lux_documents.push(doc);
  router.db.setState(db).write();
  res.json({ success: true, doc });
});

// Email
server.post('/api/send-email', async (req, res) => {
  const { smtp, to, subject, body, cc } = req.body;
  if (!smtp || !to || !subject || !body) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }
  try {
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: parseInt(smtp.port, 10) || 587,
      secure: parseInt(smtp.port, 10) === 465,
      auth: { user: smtp.user, pass: smtp.pass },
    });
    const mailOptions = {
      from: `"${smtp.fromName || 'LUX Traffic Management'}" <${smtp.fromEmail || smtp.user}>`,
      to, subject, html: body.replace(/\n/g, '<br/>'),
    };
    if (cc && cc.length > 0) mailOptions.cc = cc.filter(Boolean).join(', ');
    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SENT] To: ${to} | Subject: ${subject}`);
    res.json({ success: true, message: 'Email sent successfully' });
  } catch (err) {
    console.error('[EMAIL ERROR]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

server.use(router);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`LUX Traffic API running on http://localhost:${PORT}`);
  console.log(`Resources: /jobs, /clients, /crew, /equipment, /incidents, /permits, /timesheets, /tmpDocuments, /emailTemplates, /emailLog, /users, /job_attachments, /lux_documents`);
  console.log(`File uploads: POST /api/upload -> /uploads/`);
  console.log(`Files served: /api/files/:filename`);
});
