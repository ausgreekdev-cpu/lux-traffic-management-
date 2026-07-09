import { jobs, crew, equipment } from '../data/mockData';
import { logAction } from './agentLogger';
import { isAgentEnabled } from './agentsConfig';

function checkEnabled() {
  if (!isAgentEnabled('dispatch-agent')) {
    logAction('Dispatch Agent', 'Blocked', 'Agent is disabled in Automation Control Center', 'fail');
    return false;
  }
  return true;
}

export function getCrewAvailability() {
  if (!checkEnabled()) return crew.map(c => ({ ...c, activeJobs: 0, available: true, utilization: 0 }));
  const activeJobCrews = jobs.filter(j => j.status === 'Active').map(j => j.crew);
  return crew.map(c => {
    const activeJobs = activeJobCrews.filter(j => j === c.name).length;
    return {
      ...c,
      activeJobs,
      available: activeJobs < 3,
      utilization: Math.round((activeJobs / 3) * 100),
    };
  });
}

export function getEquipmentAvailability(type) {
  return equipment.filter(e => e.status === 'Available' && (!type || e.type === type));
}

export function getBestCrewForJob(job) {
  const crewAvail = getCrewAvailability();
  const sorted = crewAvail.sort((a, b) => a.activeJobs - b.activeJobs || a.utilization - b.utilization);

  if (sorted.length === 0 || sorted[0].activeJobs >= 3) {
    logAction('Dispatch Agent', 'Crew Allocation Failed', `No available crew for ${job.id}: ${job.title}`, 'fail');
    return null;
  }

  const selected = sorted[0];
  logAction('Dispatch Agent', 'Crew Allocated', `Assigned ${selected.name} (${selected.activeJobs} active jobs) to ${job.id}: ${job.title}`);
  return selected;
}

export function getRecommendation(jobId) {
  if (!checkEnabled()) return null;
  const job = jobs.find(j => j.id === jobId);
  if (!job) return null;

  const recommendedCrew = getBestCrewForJob(job);
  const availEquipment = getEquipmentAvailability().slice(0, 5);

  const requiredTypes = {
    'Lane Closure': ['TMA Truck', 'Cones', 'Signs'],
    'Bridge Works': ['TMA Truck', 'Cones', 'VMS Board'],
    'Shoulder Works': ['TMA Truck', 'Cones', 'Arrow Board'],
    'Utility Works': ['Cones', 'Signs', 'VMS Board'],
    'Intersection Works': ['TMA Truck', 'VMS Board', 'Cones', 'Arrow Board', 'Barriers'],
    'Event Traffic': ['Cones', 'Signs', 'Barriers'],
    'Road Closure': ['TMA Truck', 'Barriers', 'Cones', 'Signs', 'VMS Board'],
    'Detour Setup': ['Signs', 'Arrow Board', 'Cones'],
  };

  const needed = requiredTypes[job.type] || ['Cones', 'Signs'];
  const equipmentMatch = needed.map(type => {
    const avail = equipment.filter(e => e.type === type && e.status === 'Available');
    return { type, available: avail.length, items: avail.slice(0, 2) };
  });

  const allAvailable = equipmentMatch.every(m => m.available > 0);
  const score = allAvailable ? (recommendedCrew ? 85 : 60) : 40;

  logAction('Dispatch Agent', 'Recommendation Generated', `Job ${jobId}: ${score}% ready. Crew: ${recommendedCrew?.name || 'None'}, Equipment match: ${allAvailable ? 'Yes' : 'Partial'}`);

  return {
    jobId: job.id,
    jobTitle: job.title,
    score,
    recommendedCrew,
    equipmentMatch,
    allAvailable,
    estimatedSetupTime: needed.length * 15 + ' min',
    recommendedAction: score >= 80 ? 'Ready to dispatch' : score >= 60 ? 'Partial resources available' : 'Resources insufficient',
  };
}

export function executeDispatch(jobId, crewId, equipmentIds) {
  if (!checkEnabled()) return { dispatched: false, error: 'Dispatch Agent is disabled' };
  const job = jobs.find(j => j.id === jobId);
  const selectedCrew = crew.find(c => c.id === crewId);
  const selectedEquip = equipment.filter(e => equipmentIds.includes(e.id));

  logAction('Dispatch Agent', 'Dispatch Executed', `Job ${jobId}: ${job?.title} → Crew ${selectedCrew?.name}, Equipment: ${selectedEquip.map(e => e.name).join(', ')}`);

  return {
    dispatched: true,
    timestamp: new Date().toISOString(),
    job: job?.title,
    crew: selectedCrew?.name,
    equipment: selectedEquip.map(e => e.name),
    message: `Dispatched ${selectedCrew?.name} with ${selectedEquip.length} equipment items to ${job?.location}`,
  };
}