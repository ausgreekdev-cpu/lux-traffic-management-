import { jobs, crew, equipment, incidents, timesheets, permits } from '../data/mockData';
import { logAction } from './agentLogger';
import { isAgentEnabled } from './agentsConfig';

function checkEnabled() {
  if (!isAgentEnabled('reporting-agent')) {
    logAction('Reporting Agent', 'Blocked', 'Agent is disabled in Automation Control Center', 'fail');
    return false;
  }
  return true;
}

export function generateDailyReport(date = new Date().toISOString().split('T')[0]) {
  if (!checkEnabled()) return null;
  const activeJobs = jobs.filter(j => j.status === 'Active');
  const todayJobs = jobs.filter(j => j.startDate <= date && j.endDate >= date);
  const todayIncidents = incidents.filter(i => i.date === date);
  const todayTimesheets = timesheets.filter(t => t.date === date);

  const report = {
    title: `Daily Operations Report — ${date}`,
    generatedAt: new Date().toISOString(),
    generatedBy: 'LUX Reporting Agent',
    summary: {
      totalJobs: jobs.length,
      activeJobs: activeJobs.length,
      jobsToday: todayJobs.length,
      incidentsToday: todayIncidents.length,
      crewDeployed: [...new Set(todayJobs.map(j => j.crew))].length,
      hoursLogged: todayTimesheets.reduce((s, t) => s + (t.hours || 0), 0),
      openIncidents: incidents.filter(i => i.status === 'Open').length,
      activePermits: permits.filter(p => p.status === 'Approved').length,
    },
    activeJobs: activeJobs.map(j => ({
      id: j.id,
      title: j.title,
      location: j.location,
      client: j.client,
      priority: j.priority,
      crew: j.crew,
      status: j.status,
    })),
    incidents: todayIncidents,
    equipmentStatus: {
      available: equipment.filter(e => e.status === 'Available').length,
      inUse: equipment.filter(e => e.status === 'In Use').length,
      maintenance: equipment.filter(e => e.status === 'Maintenance').length,
    },
  };

  logAction('Reporting Agent', 'Daily Report', `Generated daily report for ${date}: ${activeJobs.length} active jobs, ${todayIncidents.length} incidents`);
  return report;
}

export function generateWeeklyReport(startDate) {
  if (!checkEnabled()) return null;
  const endDate = new Date(new Date(startDate).getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const weekJobs = jobs.filter(j => j.startDate <= endDate && j.endDate >= startDate);
  const weekIncidents = incidents.filter(i => i.date >= startDate && i.date <= endDate);
  const weekTimesheets = timesheets.filter(t => t.date >= startDate && t.date <= endDate);

  const statusBreakdown = {};
  jobs.forEach(j => { statusBreakdown[j.status] = (statusBreakdown[j.status] || 0) + 1; });

  const report = {
    title: `Weekly Operations Report — ${startDate} to ${endDate}`,
    generatedAt: new Date().toISOString(),
    generatedBy: 'LUX Reporting Agent',
    period: { start: startDate, end: endDate },
    summary: {
      jobsInPeriod: weekJobs.length,
      incidentsInPeriod: weekIncidents.length,
      totalHours: weekTimesheets.reduce((s, t) => s + (t.hours || 0), 0),
      approvedTimesheets: weekTimesheets.filter(t => t.status === 'Approved').length,
      pendingTimesheets: weekTimesheets.filter(t => t.status === 'Pending').length,
    },
    statusBreakdown,
    jobsByType: {},
    incidentsByType: {},
  };

  weekJobs.forEach(j => { report.jobsByType[j.type] = (report.jobsByType[j.type] || 0) + 1; });
  weekIncidents.forEach(i => { report.incidentsByType[i.type] = (report.incidentsByType[i.type] || 0) + 1; });

  logAction('Reporting Agent', 'Weekly Report', `Generated weekly report for ${startDate}–${endDate}: ${weekJobs.length} jobs, ${weekIncidents.length} incidents`);
  return report;
}

export function generateCrewPerformanceReport() {
  if (!checkEnabled()) return [];
  return crew.map(c => {
    const crewJobs = jobs.filter(j => j.crew === c.name);
    const active = crewJobs.filter(j => j.status === 'Active').length;
    const completed = crewJobs.filter(j => j.status === 'Completed').length;
    return {
      crewName: c.name,
      leader: c.leader,
      totalJobs: crewJobs.length,
      activeJobs: active,
      completedJobs: completed,
      utilization: Math.round((active / Math.max(crewJobs.length, 1)) * 100),
    };
  });
}

export function exportReportAsJson(report) {
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${report.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  logAction('Reporting Agent', 'Report Exported', `Exported ${report.title} as JSON`);
}