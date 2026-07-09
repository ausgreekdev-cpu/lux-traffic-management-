import { useState } from 'react';
import { FileText, Download, CalendarDays, TrendingUp, BarChart3, RefreshCw } from 'lucide-react';
import { generateDailyReport, generateWeeklyReport, generateCrewPerformanceReport, exportReportAsJson } from '../services/reportAgent';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('daily');
  const [dailyReport, setDailyReport] = useState(null);
  const [weeklyReport, setWeeklyReport] = useState(null);
  const [crewReport, setCrewReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const genDaily = () => {
    setLoading(true);
    setTimeout(() => {
      setDailyReport(generateDailyReport());
      setLoading(false);
    }, 800);
  };

  const genWeekly = () => {
    setLoading(true);
    const monday = new Date();
    monday.setDate(monday.getDate() - monday.getDay() + 1);
    setTimeout(() => {
      setWeeklyReport(generateWeeklyReport(monday.toISOString().split('T')[0]));
      setLoading(false);
    }, 800);
  };

  const genCrew = () => {
    setLoading(true);
    setTimeout(() => {
      setCrewReport(generateCrewPerformanceReport());
      setLoading(false);
    }, 800);
  };

  return (
    <div>
      <div className="page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><BarChart3 size={24} /> Reports & Analytics</h1>
        <p>Auto-generated operational reports — daily, weekly, and crew performance</p>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0', borderBottom: '1px solid var(--lux-border)' }}>
          {[
            { id: 'daily', label: 'Daily Report', icon: CalendarDays },
            { id: 'weekly', label: 'Weekly Report', icon: TrendingUp },
            { id: 'crew', label: 'Crew Performance', icon: FileText },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'none', border: 'none', borderBottom: activeTab === tab.id ? '2px solid var(--lux-blue)' : '2px solid transparent',
                padding: '0.75rem 1rem', fontWeight: activeTab === tab.id ? 600 : 400,
                color: activeTab === tab.id ? 'var(--lux-blue)' : 'var(--lux-gray)',
                display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer',
              }}>
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>
        <div style={{ padding: '1.5rem 0 0' }}>
          {activeTab === 'daily' && (
            <div>
              <button className="btn btn-primary" onClick={genDaily} disabled={loading}>
                <RefreshCw size={16} /> {loading ? 'Generating...' : 'Generate Daily Report'}
              </button>
              {dailyReport && (
                <div style={{ marginTop: '1.5rem' }}>
                  <div className="grid-4" style={{ marginBottom: '1rem' }}>
                    <div className="card" style={{ textAlign: 'center' }}><div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--lux-blue)' }}>{dailyReport.summary.activeJobs}</div><div style={{ fontSize: '0.75rem', color: 'var(--lux-gray)' }}>Active Jobs</div></div>
                    <div className="card" style={{ textAlign: 'center' }}><div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--lux-warning)' }}>{dailyReport.summary.jobsToday}</div><div style={{ fontSize: '0.75rem', color: 'var(--lux-gray)' }}>Jobs Today</div></div>
                    <div className="card" style={{ textAlign: 'center' }}><div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--lux-danger)' }}>{dailyReport.summary.incidentsToday}</div><div style={{ fontSize: '0.75rem', color: 'var(--lux-gray)' }}>Incidents Today</div></div>
                    <div className="card" style={{ textAlign: 'center' }}><div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--lux-success)' }}>{dailyReport.summary.hoursLogged}h</div><div style={{ fontSize: '0.75rem', color: 'var(--lux-gray)' }}>Hours Logged</div></div>
                  </div>
                  <button className="btn btn-sm btn-outline" onClick={() => exportReportAsJson(dailyReport)}><Download size={14} /> Export JSON</button>
                  <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--lux-gray)' }}>Generated: {new Date(dailyReport.generatedAt).toLocaleString()} by {dailyReport.generatedBy}</div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'weekly' && (
            <div>
              <button className="btn btn-primary" onClick={genWeekly} disabled={loading}>
                <RefreshCw size={16} /> {loading ? 'Generating...' : 'Generate Weekly Report'}
              </button>
              {weeklyReport && (
                <div style={{ marginTop: '1.5rem' }}>
                  <div className="grid-4" style={{ marginBottom: '1rem' }}>
                    <div className="card" style={{ textAlign: 'center' }}><div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--lux-blue)' }}>{weeklyReport.summary.jobsInPeriod}</div><div style={{ fontSize: '0.75rem', color: 'var(--lux-gray)' }}>Jobs This Week</div></div>
                    <div className="card" style={{ textAlign: 'center' }}><div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--lux-danger)' }}>{weeklyReport.summary.incidentsInPeriod}</div><div style={{ fontSize: '0.75rem', color: 'var(--lux-gray)' }}>Incidents</div></div>
                    <div className="card" style={{ textAlign: 'center' }}><div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--lux-success)' }}>{weeklyReport.summary.totalHours}h</div><div style={{ fontSize: '0.75rem', color: 'var(--lux-gray)' }}>Total Hours</div></div>
                    <div className="card" style={{ textAlign: 'center' }}><div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--lux-warning)' }}>{weeklyReport.summary.pendingTimesheets}</div><div style={{ fontSize: '0.75rem', color: 'var(--lux-gray)' }}>Pending Timesheets</div></div>
                  </div>
                  <div className="grid-2">
                    <div><strong>Jobs by Status:</strong> {Object.entries(weeklyReport.statusBreakdown).map(([k, v]) => <span key={k} className="badge badge-info" style={{ marginLeft: '0.3rem' }}>{k}: {v}</span>)}</div>
                    <div><strong>Jobs by Type:</strong> {Object.entries(weeklyReport.jobsByType).map(([k, v]) => <span key={k} className="badge badge-active" style={{ marginLeft: '0.3rem' }}>{k}: {v}</span>)}</div>
                  </div>
                  <div style={{ marginTop: '0.75rem' }}>
                    <button className="btn btn-sm btn-outline" onClick={() => exportReportAsJson(weeklyReport)}><Download size={14} /> Export JSON</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'crew' && (
            <div>
              <button className="btn btn-primary" onClick={genCrew} disabled={loading}>
                <RefreshCw size={16} /> {loading ? 'Generating...' : 'Generate Crew Performance Report'}
              </button>
              {crewReport && (
                <div style={{ marginTop: '1.5rem' }}>
                  <table>
                    <thead>
                      <tr><th>Crew</th><th>Leader</th><th>Total Jobs</th><th>Active</th><th>Completed</th><th>Utilization</th></tr>
                    </thead>
                    <tbody>
                      {crewReport.map(c => (
                        <tr key={c.crewName}>
                          <td style={{ fontWeight: 500 }}>{c.crewName}</td>
                          <td>{c.leader}</td>
                          <td>{c.totalJobs}</td>
                          <td><span className="badge badge-info">{c.activeJobs}</span></td>
                          <td><span className="badge badge-active">{c.completedJobs}</span></td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div style={{ flex: 1, height: 6, background: '#e2e8f0', borderRadius: 3 }}>
                                <div style={{ width: `${c.utilization}%`, height: '100%', background: c.utilization > 80 ? 'var(--lux-danger)' : c.utilization > 50 ? 'var(--lux-warning)' : 'var(--lux-success)', borderRadius: 3 }} />
                              </div>
                              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{c.utilization}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}