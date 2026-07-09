export function renderTemplate(template, job, client, extra = {}) {
  let body = (template?.body || '');
  const company = {
    name: 'LUX Traffic Management',
    phone: '(08) 9417 2200',
    email: 'admin@lux-traffic.com.au',
    abn: '12 345 678 901',
  };

  const vars = {
    'job.title': job?.title || '',
    'job.id': job?.id || '',
    'job.location': job?.location || '',
    'job.type': job?.type || '',
    'job.startDate': job?.startDate || '',
    'job.endDate': job?.endDate || '',
    'job.status': job?.status || '',
    'job.priority': job?.priority || '',
    'job.equipment': job?.equipment?.join(', ') || '',
    'job.notes': job?.notes || '',
    'job.startTime': job?.startTime || '',
    'client.name': client?.name || '',
    'client.email': client?.email || '',
    'client.phone': client?.phone || '',
    'client.address': client?.address || '',
    'crew.name': extra?.crew?.name || '',
    'crew.leader': extra?.crew?.leader || '',
    'crew.phone': extra?.crew?.phone || '',
    'crew.vehicle': extra?.crew?.vehicle || '',
    'company.name': company.name,
    'company.phone': company.phone,
    'company.email': company.email,
    'company.abn': company.abn,
    'incident.type': extra?.incident?.type || '',
    'incident.severity': extra?.incident?.severity || '',
    'incident.date': extra?.incident?.date || '',
    'incident.time': extra?.incident?.time || '',
    'incident.description': extra?.incident?.description || '',
    'incident.reportedBy': extra?.incident?.reportedBy || '',
    'incident.actions': extra?.incident?.actions || '',
    'permit.reference': extra?.permit?.reference || '',
    'permit.expiryDate': extra?.permit?.expiryDate || '',
    'permit.authority': extra?.permit?.authority || '',
    'invoice.number': extra?.invoice?.number || '',
    'invoice.date': extra?.invoice?.date || '',
    'invoice.total': extra?.invoice?.total || '',
    'invoice.hours': extra?.invoice?.hours || '',
    'invoice.rate': extra?.invoice?.rate || '',
    'quote.crewHours': extra?.quote?.crewHours || '',
    'quote.crewRate': extra?.quote?.crewRate || '',
    'quote.equipmentCost': extra?.quote?.equipmentCost || '',
    'quote.tmpCost': extra?.quote?.tmpCost || '',
    'quote.permitCost': extra?.quote?.permitCost || '',
    'quote.totalExGst': extra?.quote?.totalExGst || '',
    'quote.gst': extra?.quote?.gst || '',
    'quote.totalIncGst': extra?.quote?.totalIncGst || '',
    'site.date': extra?.site?.date || '',
    'site.workCompleted': extra?.site?.workCompleted || '',
    'site.incidents': extra?.site?.incidents || '',
    'site.weather': extra?.site?.weather || '',
    'site.nextDayPlan': extra?.site?.nextDayPlan || '',
  };

  const subject = (template?.subject || '');
  let renderedSubject = subject;
  Object.entries(vars).forEach(([key, val]) => {
    const token = `{${key}}`;
    body = body.replaceAll(token, val);
    renderedSubject = renderedSubject.replaceAll(token, val);
  });

  return { subject: renderedSubject, body };
}

export async function sendEmail(to, subject, body, cc = [], attachments = []) {
  const email = {
    id: `EM-${Date.now()}`,
    to,
    subject,
    body,
    cc: cc.filter(Boolean),
    attachments,
    sentAt: new Date().toISOString(),
    status: 'Sent',
  };

  const smtp = (() => {
    try { return JSON.parse(localStorage.getItem('lux_smtp_config')); }
    catch { return null; }
  })();

  if (smtp && smtp.host && smtp.user) {
    try {
      const res = await fetch('http://localhost:3001/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ smtp, to, subject, body, cc: cc.filter(Boolean) }),
      });
      if (!res.ok) {
        const errData = await res.json();
        email.status = 'Failed';
        email.error = errData.error || 'Server error';
      }
    } catch (err) {
      email.status = 'Failed';
      email.error = 'Server unavailable: ' + err.message;
    }
  } else {
    console.warn('[EMAIL SIMULATED] No SMTP configured — email logged only');
    email.status = 'Simulated';
  }

  console.log(`[EMAIL ${email.status}] To: ${to} | Subject: ${subject}${email.error ? ' | Error: ' + email.error : ''}`);
  return email;
}

export function generateAuthorityExport(job, client, format) {
  const now = new Date();
  const exportDoc = {
    exportId: `EXP-${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(job.id).replace('JOB-','')}`,
    format,
    generatedAt: now.toISOString(),
    applicant: 'LUX Traffic Management Pty Ltd',
    applicantAbn: '12 345 678 901',
    applicantAddress: 'Unit 3/45 Kelvin Road, Jandakot WA 6164',
    applicantPhone: '(08) 9417 2200',
    applicantEmail: 'admin@lux-traffic.com.au',
    job: { reference: job.id, title: job.title, description: job.notes, location: job.location, startDate: job.startDate, endDate: job.endDate, type: job.type, priority: job.priority },
    client: { ...client },
    trafficManagement: {
      codeOfPractice: 'WA Traffic Management Code of Practice 2024',
      signageCompliant: true,
      trafficControllerRequired: job.type !== 'Shoulder Works',
      nightWorks: job.notes?.toLowerCase().includes('night') || false,
      detourRequired: job.type === 'Road Closure',
    },
    status: 'Draft',
    submittedTo: format === 'mrwa-tmp' ? 'Main Roads WA' : format === 'wa-police' ? 'WA Police' : client?.name || '',
  };

  const blob = new Blob([JSON.stringify(exportDoc, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${exportDoc.exportId}-${format}.json`;
  a.click();
  URL.revokeObjectURL(url);
  return exportDoc;
}