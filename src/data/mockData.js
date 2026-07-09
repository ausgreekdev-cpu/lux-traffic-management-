export const clients = [
  { id: 'CLT-001', name: 'Main Roads WA', email: 'projects@mainroads.wa.gov.au', phone: '(08) 9323 4111', address: 'Don Aitken Centre, 58 Don Aitken Approach, East Perth WA 6004', type: 'Government', status: 'Active' },
  { id: 'CLT-002', name: 'City of Perth', email: 'traffic@cityofperth.wa.gov.au', phone: '(08) 9461 3333', address: '27 St Georges Terrace, Perth WA 6000', type: 'Council', status: 'Active' },
  { id: 'CLT-003', name: 'Georgiou Group', email: 'projects@georgiou.com.au', phone: '(08) 9477 4900', address: '15 Yampi Way, Willetton WA 6155', type: 'Contractor', status: 'Active' },
  { id: 'CLT-004', name: 'BGC Construction', email: 'traffic@bgc.com.au', phone: '(08) 9410 1000', address: '50 Bannister Road, Canning Vale WA 6155', type: 'Contractor', status: 'Active' },
  { id: 'CLT-005', name: 'City of Stirling', email: 'traffic@stirling.wa.gov.au', phone: '(08) 9205 8555', address: '25 Cedric Street, Stirling WA 6021', type: 'Council', status: 'Active' },
  { id: 'CLT-006', name: 'Lendlease WA', email: 'perth@lendlease.com.au', phone: '(08) 9220 1000', address: '197 St Georges Terrace, Perth WA 6000', type: 'Contractor', status: 'Active' },
  { id: 'CLT-007', name: 'City of Fremantle', email: 'traffic@fremantle.wa.gov.au', phone: '(08) 9432 9999', address: '10 William Street, Fremantle WA 6160', type: 'Council', status: 'Active' },
  { id: 'CLT-008', name: 'WA Police - Traffic Command', email: 'traffic@police.wa.gov.au', phone: '(08) 9217 4000', address: '60-68 Beaufort Street, Perth WA 6000', type: 'Government', status: 'Active' },
];

export const jobs = [
  { id: 'JOB-001', title: 'Mitchell Frwy - Lane Closure (Southbound)', client: 'Main Roads WA', location: 'Mitchell Freeway, Perth WA', status: 'Active', priority: 'High', type: 'Lane Closure', startDate: '2026-07-10', endDate: '2026-07-12', crew: 'Crew A', equipment: ['TMA Truck', 'Cones', 'Signs'], emailThread: [], notes: 'Night works 8pm-5am', attachments: [] },
  { id: 'JOB-002', title: 'Elizabeth Quay Bus Bridge Works', client: 'City of Perth', location: 'Elizabeth Quay Bus Bridge, Perth WA', status: 'Scheduled', priority: 'Medium', type: 'Bridge Works', startDate: '2026-07-15', endDate: '2026-07-20', crew: 'Crew B', equipment: ['VMS Board', 'Cones', 'TMA Truck'], emailThread: [], notes: 'Major event coordination required', attachments: [] },
  { id: 'JOB-003', title: 'Kwinana Fwy - Shoulder Works', client: 'Main Roads WA', location: 'Kwinana Freeway, Como WA', status: 'Active', priority: 'Urgent', type: 'Shoulder Works', startDate: '2026-07-09', endDate: '2026-07-09', crew: 'Crew C', equipment: ['TMA Truck', 'Cones', 'Arrow Board'], emailThread: [], notes: 'Emergency pavement repair', attachments: [] },
  { id: 'JOB-004', title: 'Great Eastern Hwy - Utility Works', client: 'BGC Construction', location: 'Great Eastern Hwy, Redcliffe WA', status: 'Planning', priority: 'Low', type: 'Utility Works', startDate: '2026-08-01', endDate: '2026-08-05', crew: 'Crew A', equipment: ['Cones', 'Signs', 'VMS Board'], emailThread: [], notes: 'Gas main upgrade - TMP to MRWA', attachments: [] },
  { id: 'JOB-005', title: 'Roe Highway - Intersection Upgrade', client: 'Georgiou Group', location: 'Roe Hwy & Nicholson Rd, Canning Vale WA', status: 'Active', priority: 'High', type: 'Intersection Works', startDate: '2026-07-11', endDate: '2026-08-20', crew: 'Crew B', equipment: ['TMA Truck', 'VMS Board', 'Cones', 'Arrow Board', 'Barriers'], emailThread: [], notes: 'Major intersection upgrade - TMP approved', attachments: [] },
  { id: 'JOB-006', title: 'St Georges Tce - Event Traffic Mgmt', client: 'City of Perth', location: 'St Georges Terrace, Perth WA', status: 'Scheduled', priority: 'Medium', type: 'Event Traffic', startDate: '2026-07-25', endDate: '2026-07-26', crew: 'Crew C', equipment: ['Cones', 'Signs', 'Barriers'], emailThread: [], notes: 'Perth City Festival traffic plan', attachments: [] },
];

export const crew = [
  { id: 'CRW-001', name: 'Crew A', leader: 'James Mitchell', members: ['Tom Baker', 'Sarah Connor', 'Mike Davis'], phone: '0401 234 567', email: 'crewa@lux-traffic.com.au', vehicle: 'Toyota HiLux - 1ELT 123' },
  { id: 'CRW-002', name: 'Crew B', leader: 'Emma Wilson', members: ['David Lee', 'Rachel Chen', 'Sam Peters'], phone: '0402 345 678', email: 'crewb@lux-traffic.com.au', vehicle: 'Isuzu NRR - 1ELT 456' },
  { id: 'CRW-003', name: 'Crew C', leader: 'Liam O\'Brien', members: ['Jessie Woo', 'Patrick Ryan', 'Natalie Grey'], phone: '0403 456 789', email: 'crewc@lux-traffic.com.au', vehicle: 'Toyota HiLux - 1ELT 789' },
];

export const equipment = [
  { id: 'EQ-001', name: 'TMA Truck 1', type: 'TMA Truck', status: 'Available', lastService: '2026-06-15', location: 'Jandakot Depot' },
  { id: 'EQ-002', name: 'TMA Truck 2', type: 'TMA Truck', status: 'In Use', lastService: '2026-06-20', location: 'Mitchell Fwy - JOB-001' },
  { id: 'EQ-003', name: 'VMS Board 1', type: 'VMS Board', status: 'Available', lastService: '2026-07-01', location: 'Jandakot Depot' },
  { id: 'EQ-004', name: 'VMS Board 2', type: 'VMS Board', status: 'In Use', lastService: '2026-06-28', location: 'Roe Hwy - JOB-005' },
  { id: 'EQ-005', name: 'Arrow Board 1', type: 'Arrow Board', status: 'Available', lastService: '2026-06-25', location: 'Jandakot Depot' },
  { id: 'EQ-006', name: 'Arrow Board 2', type: 'Arrow Board', status: 'Maintenance', lastService: '2026-07-05', location: 'Workshop' },
  { id: 'EQ-007', name: 'Cones Set A', type: 'Traffic Cones', status: 'Available', lastService: '2026-07-02', location: 'Jandakot Depot' },
  { id: 'EQ-008', name: 'Cones Set B', type: 'Traffic Cones', status: 'In Use', lastService: '2026-07-04', location: 'Kwinana Fwy - JOB-003' },
  { id: 'EQ-009', name: 'Barriers Set A', type: 'Barriers', status: 'Available', lastService: '2026-06-10', location: 'Jandakot Depot' },
  { id: 'EQ-010', name: 'Signs Package 1', type: 'Signage', status: 'In Use', lastService: '2026-07-03', location: 'Mitchell Fwy - JOB-001' },
];

export const workflowStatuses = ['Planning', 'Scheduled', 'Active', 'On Hold', 'Completed', 'Cancelled'];
export const jobPriorities = ['Low', 'Medium', 'High', 'Urgent'];
export const jobTypes = ['Lane Closure', 'Bridge Works', 'Shoulder Works', 'Utility Works', 'Intersection Works', 'Event Traffic', 'Road Closure', 'Detour Setup'];

export const exportFormats = [
  { id: 'mrwa-tmp', name: 'Main Roads WA TMP', description: 'Standard TMP submission format for Main Roads Western Australia' },
  { id: 'city-permit', name: 'City of Perth Permit', description: 'Traffic permit application for City of Perth' },
  { id: 'wa-police', name: 'WA Police Notification', description: 'Traffic management notification for WA Police' },
  { id: 'council-works', name: 'Council Works Notice', description: 'Standard works notice for local councils' },
];

export const incidents = [
  { id: 'INC-001', jobId: 'JOB-003', type: 'Near Miss', date: '2026-07-09', time: '14:30', reportedBy: 'James Mitchell', location: 'Kwinana Freeway, Como WA', description: 'Vehicle nearly entered closed lane. Crew shouted warning.', severity: 'Medium', actions: 'Reported to Main Roads. Additional signage deployed.', status: 'Closed', createdAt: '2026-07-09T14:45:00Z' },
  { id: 'INC-002', jobId: 'JOB-001', type: 'Equipment Damage', date: '2026-07-10', time: '22:15', reportedBy: 'Tom Baker', location: 'Mitchell Freeway, Perth WA', description: 'TMA Truck struck by debris. Minor rear bumper damage.', severity: 'Low', actions: 'Vehicle removed from service. Scheduled for repair.', status: 'Open', createdAt: '2026-07-10T22:30:00Z' },
];

export const permits = [
  { id: 'PRM-001', jobId: 'JOB-005', authority: 'Main Roads WA', type: 'TMP Approval', appliedDate: '2026-06-20', approvedDate: '2026-07-01', expiryDate: '2026-08-20', status: 'Approved', reference: 'MRWA-TMP-2026-0842', conditions: 'Night works only. ATCP must be on site.' },
  { id: 'PRM-002', jobId: 'JOB-001', authority: 'Main Roads WA', type: 'TMP Approval', appliedDate: '2026-07-01', approvedDate: null, expiryDate: '2026-07-12', status: 'Pending', reference: 'MRWA-TMP-2026-0915', conditions: '' },
  { id: 'PRM-003', jobId: 'JOB-002', authority: 'City of Perth', type: 'Works Permit', appliedDate: '2026-07-05', approvedDate: '2026-07-08', expiryDate: '2026-07-20', status: 'Approved', reference: 'CP-PRM-0726-44', conditions: 'Pedestrian access maintained at all times.' },
];

export const timesheets = [
  { id: 'TS-001', crewId: 'CRW-001', jobId: 'JOB-001', date: '2026-07-10', member: 'Tom Baker', startTime: '19:30', endTime: '05:30', hours: 10, breakHours: 1, notes: 'Night shift. TMA truck setup.', status: 'Approved' },
  { id: 'TS-002', crewId: 'CRW-001', jobId: 'JOB-001', date: '2026-07-10', member: 'Sarah Connor', startTime: '19:30', endTime: '05:30', hours: 10, breakHours: 1, notes: 'Night shift. Cone placement.', status: 'Approved' },
  { id: 'TS-003', crewId: 'CRW-001', jobId: 'JOB-001', date: '2026-07-11', member: 'Tom Baker', startTime: '19:30', endTime: '05:30', hours: 10, breakHours: 1, notes: '', status: 'Pending' },
];

export const scopeRequests = [
  {
    id: 'SCO-001', status: 'submitted', submittedAt: '2026-07-18T09:00:00Z', createdAt: '2026-07-18T09:00:00Z', updatedAt: '2026-07-18T09:00:00Z',
    clientName: 'Georgiou Group', contactName: 'David Chen', contactPhone: '0400 111 222', contactEmail: 'dchen@georgiou.com.au', billingContact: 'accounts@georgiou.com.au', insuranceProvided: true,
    roadName: 'Roe Highway', suburb: 'Canning Vale', nearestIntersection: 'Nicholson Road', gpsCoordinates: '-32.081, 115.918', workArea: 'multi-lane', roadManager: 'mrwa', councilName: '', speedLimit: 80,
    signalisedIntersection: true, affectsBusLane: false, affectsCyclePath: true, affectsPedCrossing: false,
    workDescription: 'Intersection upgrade - new traffic signals and slip lane', workFootprint: 'multi-staged', laneOpenPastWorksite: true, vehicleAccessRequired: true,
    proposedStartDate: '2026-08-15', proposedEndDate: '2026-09-30', shiftDay: { start: '07:00', end: '17:00' }, shiftNight: { start: '', end: '' }, shiftDuration: 10, stagingChanges: true, totalDurationDays: 46,
    permitTasks: { drafting: 'lux', siteInspection: 'lux', planSubmission: 'shared', rop: 'client', publicNotice: 'client', noiseExemption: '' },
    tcMethod: 'ptcd', tmaRequired: 'yes', advanceWarningDistance: 200,
    nearbySchool: false, existingTmpRef: 'MRWA-TMP-2026-0842', sitePhotosAvailable: true, swmsRequired: true,
    quoteType: 'design-submission', linkedJobId: null, linkedQuoteId: null,
    notes: 'Client has existing TMP for reference. Requires staged TGS for each construction phase.',
  },
  {
    id: 'SCO-002', status: 'draft', submittedAt: null, createdAt: '2026-07-19T14:00:00Z', updatedAt: '2026-07-19T14:00:00Z',
    clientName: 'City of Stirling', contactName: 'Sarah Lee', contactPhone: '0401 555 666', contactEmail: 'slee@stirling.wa.gov.au', billingContact: '', insuranceProvided: false,
    roadName: 'Cedric Street', suburb: 'Stirling', nearestIntersection: 'Main Street', gpsCoordinates: '', workArea: 'left-lane', roadManager: 'council', councilName: 'City of Stirling', speedLimit: 60,
    signalisedIntersection: false, affectsBusLane: true, affectsCyclePath: false, affectsPedCrossing: false,
    workDescription: 'Bus stop shelter installation - left lane closure required', workFootprint: 'static', laneOpenPastWorksite: true, vehicleAccessRequired: false,
    proposedStartDate: '2026-08-01', proposedEndDate: '2026-08-01', shiftDay: { start: '09:00', end: '15:00' }, shiftNight: { start: '', end: '' }, shiftDuration: 6, stagingChanges: false, totalDurationDays: 1,
    permitTasks: { drafting: 'lux', siteInspection: 'lux', planSubmission: 'lux', rop: 'lux', publicNotice: '', noiseExemption: '' },
    tcMethod: 'manual', tmaRequired: 'no', advanceWarningDistance: 100,
    nearbySchool: true, existingTmpRef: '', sitePhotosAvailable: false, swmsRequired: false,
    quoteType: 'full-submission', linkedJobId: null, linkedQuoteId: null,
    notes: 'School zone timing - works must occur within school hours only.',
  },
];

export const quotes = [
  {
    id: 'QTE-001', scopeId: 'SCO-001', status: 'draft', createdAt: '2026-07-20T10:00:00Z', updatedAt: '2026-07-20T10:00:00Z',
    clientName: 'Georgiou Group', contactName: 'David Chen', contactEmail: 'dchen@georgiou.com.au',
    jobDescription: 'Roe Highway Intersection Upgrade - Canning Vale',
    lineItems: [
      { description: 'TMP/TGS Design - Stage 1 (Intersection Works)', quantity: 1, unit: 'each', rate: 850, amount: 850 },
      { description: 'TMP/TGS Design - Stage 2 (Slip Lane Works)', quantity: 1, unit: 'each', rate: 850, amount: 850 },
      { description: 'TMP/TGS Design - Stage 3 (Signal Modification)', quantity: 1, unit: 'each', rate: 1200, amount: 1200 },
      { description: 'Site Inspection & Photography (s4.2.1)', quantity: 1, unit: 'each', rate: 350, amount: 350 },
      { description: 'MRWA Plan Submission & Liaison', quantity: 1, unit: 'each', rate: 650, amount: 650 },
      { description: 'Traffic Modelling (signalised intersection)', quantity: 1, unit: 'each', rate: 1800, amount: 1800 },
      { description: 'Staging Diagrams (3 stages × 3 views)', quantity: 9, unit: 'sheets', rate: 120, amount: 1080 },
    ],
    subtotal: 6780, gst: 678, total: 7458,
    validityDays: 30, notes: 'Excludes ROP fees. Excludes on-site traffic management deployment.',
  },
];