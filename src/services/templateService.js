const STORAGE_KEY_TEMPLATES = 'lux_email_templates';

const defaults = [
  { id: 'EMT-001', name: 'TMP Approval Request', category: 'Approvals', subject: 'Traffic Management Plan Approval - {job.title}', body: 'Dear {client.name},\n\nPlease find attached the Traffic Management Plan for:\n\nJob: {job.title}\nLocation: {job.location}\nType: {job.type}\nDuration: {job.startDate} to {job.endDate}\n\nPlease review and provide approval at your earliest convenience.\n\nThis TMP has been prepared in accordance with the WA Traffic Management Code of Practice 2024.\n\nRegards,\n{company.name}\n{company.phone}' },
  { id: 'EMT-002', name: 'Job Notification', category: 'Notifications', subject: 'Works Notification - {job.title}', body: 'Dear {client.name},\n\nThis is to advise that LUX Traffic Management will be undertaking traffic management works at the following location:\n\nJob: {job.title}\nLocation: {job.location}\nType: {job.type}\nStart Date: {job.startDate}\nEnd Date: {job.endDate}\n\nPlease ensure all necessary arrangements are in place.\n\nFor any enquiries, please contact {crew.leader} on {crew.phone}.\n\nRegards,\n{company.name}' },
  { id: 'EMT-003', name: 'Job Completion Report', category: 'Reports', subject: 'Works Completion Report - {job.title}', body: 'Dear {client.name},\n\nRE: Completion of Traffic Management Works\n\nJob: {job.title}\nLocation: {job.location}\nScheduled: {job.startDate} to {job.endDate}\nStatus: Completed\n\nAll traffic management equipment has been removed and the site has been restored.\n\nPlease find attached the completion documentation.\n\nRegards,\n{company.name}' },
  { id: 'EMT-004', name: 'Authority Submission - MRWA', category: 'Authorities', subject: 'TMP Submission - {job.title} - {job.id}', body: 'To the Works Manager,\n\nMain Roads Western Australia\n\nLUX Traffic Management submits the following Traffic Management Plan for approval:\n\nJob Reference: {job.id}\nTitle: {job.title}\nLocation: {job.location}\nType: {job.type}\nDuration: {job.startDate} to {job.endDate}\nClient: {client.name}\n\nThis TMP complies with the WA Traffic Management Code of Practice 2024 and AS 1742.3.\n\nRegards,\n{company.name}\n{company.phone}\n{company.email}' },
  { id: 'EMT-005', name: 'Incident Notification', category: 'Safety', subject: 'URGENT - Incident Report - {job.title}', body: 'ALERT: Safety Incident\n\nJob: {job.title}\nLocation: {job.location}\nIncident Type: {incident.type}\nDate: {incident.date}\nTime: {incident.time}\nSeverity: {incident.severity}\nDescription: {incident.description}\n\nReported by: {incident.reportedBy}\n\nActions Taken: {incident.actions}\n\n{company.name}\n{company.phone}' },
  { id: 'EMT-006', name: 'Permit Renewal Reminder', category: 'Authorities', subject: 'Permit Renewal Required - {permit.reference}', body: 'Dear {client.name},\n\nThis is a reminder that permit {permit.reference} for {job.title} is due to expire on {permit.expiryDate}.\n\nPlease arrange renewal to avoid any interruption to works.\n\nRegards,\n{company.name}' },
  { id: 'EMT-007', name: 'Crew Dispatch Instructions', category: 'Operations', subject: 'Dispatch Instructions - {job.title}', body: 'CREW DISPATCH\n\nCrew: {crew.name}\nLeader: {crew.leader}\nVehicle: {crew.vehicle}\n\nJob Details:\nJob: {job.title}\nLocation: {job.location}\nStart: {job.startDate} {job.startTime}\nEnd: {job.endDate}\nType: {job.type}\n\nEquipment Required:\n{job.equipment}\n\nNotes: {job.notes}\n\nContact: {job.client} on {client.phone}\n\nReport to site supervisor on arrival.\n\n{company.name}' },
  { id: 'EMT-008', name: 'Client Quote', category: 'Commercial', subject: 'Traffic Management Quote - {job.title}', body: 'Dear {client.name},\n\nThank you for your enquiry regarding traffic management services.\n\nPlease find below our quote for the proposed works:\n\nJob: {job.title}\nLocation: {job.location}\nType: {job.type}\nDuration: {job.startDate} to {job.endDate}\n\nQuote Details:\n- Crew Hours: {quote.crewHours}h @ ${quote.crewRate}/hr\n- Equipment Hire: {quote.equipmentCost}\n- TMP Preparation: {quote.tmpCost}\n- Permit Fees: {quote.permitCost}\n- Total (ex GST): ${quote.totalExGst}\n- GST: ${quote.gst}\n- Total (inc GST): ${quote.totalIncGst}\n\nThis quote is valid for 30 days.\n\nRegards,\n{company.name}\n{company.phone}\n{company.email}' },
  { id: 'EMT-009', name: 'Invoice', category: 'Commercial', subject: 'INVOICE - {job.title} - {invoice.number}', body: 'INVOICE\n\nInvoice Number: {invoice.number}\nDate: {invoice.date}\nJob Reference: {job.id}\n\nTo: {client.name}\n{client.address}\n\nDescription: Traffic Management Services - {job.title}\nLocation: {job.location}\nPeriod: {job.startDate} to {job.endDate}\n\nItemised:\n- {invoice.hours}h Labour @ ${invoice.rate}/hr\n- Equipment Hire\n- TMP Fee\n- Permit Fees\n\nTotal Due: ${invoice.total}\n\nPayment Terms: 30 days from invoice date\nBSB: 306-089\nAccount: 1234 5678\n\n{company.name}\n{company.phone}' },
  { id: 'EMT-010', name: 'Daily Site Report', category: 'Reports', subject: 'Daily Site Report - {job.title} - {site.date}', body: 'DAILY SITE REPORT\n\nJob: {job.title}\nLocation: {job.location}\nDate: {site.date}\nCrew: {crew.name}\nLeader: {crew.leader}\n\nWorks Completed:\n{site.workCompleted}\n\nIncidents: {site.incidents}\n\nEquipment On Site:\n{job.equipment}\n\nWeather: {site.weather}\n\nNext Day Plan:\n{site.nextDayPlan}\n\nSigned: ___________________\n\n{company.name}' },
];

export function getTemplates() {
  const stored = localStorage.getItem(STORAGE_KEY_TEMPLATES);
  if (stored) {
    try { return JSON.parse(stored); }
    catch { /* ignore */ }
  }
  return JSON.parse(JSON.stringify(defaults));
}

export function saveTemplates(templates) {
  localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(templates));
  return templates;
}

export function saveTemplate(template) {
  const templates = getTemplates();
  const idx = templates.findIndex(t => t.id === template.id);
  if (idx >= 0) templates[idx] = template;
  else templates.push(template);
  saveTemplates(templates);
  return templates;
}

export function deleteTemplate(id) {
  const templates = getTemplates().filter(t => t.id !== id);
  saveTemplates(templates);
  return templates;
}

export const templateVariables = [
  { var: '{job.title}', desc: 'Job title' },
  { var: '{job.id}', desc: 'Job reference ID' },
  { var: '{job.location}', desc: 'Job location' },
  { var: '{job.type}', desc: 'Job type (Lane Closure, etc.)' },
  { var: '{job.startDate}', desc: 'Job start date' },
  { var: '{job.endDate}', desc: 'Job end date' },
  { var: '{job.status}', desc: 'Job status' },
  { var: '{job.priority}', desc: 'Job priority' },
  { var: '{job.equipment}', desc: 'Required equipment' },
  { var: '{job.notes}', desc: 'Job notes' },
  { var: '{client.name}', desc: 'Client company name' },
  { var: '{client.email}', desc: 'Client email' },
  { var: '{client.phone}', desc: 'Client phone number' },
  { var: '{client.address}', desc: 'Client address' },
  { var: '{crew.name}', desc: 'Crew name' },
  { var: '{crew.leader}', desc: 'Crew leader name' },
  { var: '{crew.phone}', desc: 'Crew phone' },
  { var: '{crew.vehicle}', desc: 'Crew vehicle' },
  { var: '{company.name}', desc: 'LUX Traffic Management' },
  { var: '{company.phone}', desc: 'Company phone (08) 9417 2200' },
  { var: '{company.email}', desc: 'Company email admin@lux-traffic.com.au' },
  { var: '{company.abn}', desc: 'Company ABN' },
  { var: '{incident.type}', desc: 'Incident type' },
  { var: '{incident.severity}', desc: 'Incident severity' },
  { var: '{incident.date}', desc: 'Incident date' },
  { var: '{incident.time}', desc: 'Incident time' },
  { var: '{incident.description}', desc: 'Incident description' },
  { var: '{incident.reportedBy}', desc: 'Who reported it' },
  { var: '{incident.actions}', desc: 'Actions taken' },
  { var: '{permit.reference}', desc: 'Permit reference number' },
  { var: '{permit.expiryDate}', desc: 'Permit expiry date' },
  { var: '{permit.authority}', desc: 'Permit authority' },
  { var: '{invoice.number}', desc: 'Invoice number' },
  { var: '{invoice.date}', desc: 'Invoice date' },
  { var: '{invoice.total}', desc: 'Invoice total' },
  { var: '{invoice.hours}', desc: 'Invoice hours' },
  { var: '{invoice.rate}', desc: 'Invoice hourly rate' },
  { var: '{quote.crewHours}', desc: 'Quote crew hours' },
  { var: '{quote.crewRate}', desc: 'Quote crew rate' },
  { var: '{quote.equipmentCost}', desc: 'Quote equipment cost' },
  { var: '{quote.tmpCost}', desc: 'Quote TMP cost' },
  { var: '{quote.permitCost}', desc: 'Quote permit cost' },
  { var: '{quote.totalExGst}', desc: 'Quote total ex GST' },
  { var: '{quote.gst}', desc: 'Quote GST' },
  { var: '{quote.totalIncGst}', desc: 'Quote total inc GST' },
  { var: '{site.date}', desc: 'Site report date' },
  { var: '{site.workCompleted}', desc: 'Work completed today' },
  { var: '{site.incidents}', desc: 'Site incidents today' },
  { var: '{site.weather}', desc: 'Site weather conditions' },
  { var: '{site.nextDayPlan}', desc: 'Next day plan' },
];