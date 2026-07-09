import { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { CalendarDays, HardHat, Wrench, X, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { getJobs, getCrew, getEquipment } from '../services/dataService';

const localizer = momentLocalizer(moment);

const STATUS_COLORS = {
  'Active': '#22c55e',
  'Scheduled': '#3b82f6',
  'Planning': '#f59e0b',
  'On Hold': '#eab308',
  'Completed': '#6b7280',
  'Cancelled': '#ef4444',
};

const VIEW_LABELS = { month: 'Month', week: 'Week', day: 'Day', agenda: 'List' };

export default function CalendarView() {
  const [jobs, setJobs] = useState([]);
  const [crew, setCrew] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filter, setFilter] = useState('all');
  const [crewFilter, setCrewFilter] = useState('all');
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getJobs(), getCrew(), getEquipment()])
      .then(([j, c, e]) => { setJobs(j); setCrew(c); setEquipment(e); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const events = jobs
    .filter(j => {
      if (filter === 'active') return j.status === 'Active';
      if (filter === 'scheduled') return j.status === 'Scheduled' || j.status === 'Planning';
      if (filter === 'completed') return j.status === 'Completed' || j.status === 'Cancelled';
      return j.status !== 'Cancelled';
    })
    .filter(j => crewFilter === 'all' || j.crew === crewFilter)
    .map(j => ({
      id: j.id,
      title: `${j.title} (${j.client})`,
      start: new Date(j.startDate + 'T00:00:00'),
      end: new Date(new Date(j.endDate + 'T00:00:00').getTime() + 86400000),
      allDay: true,
      resource: j,
    }));

  const eventStyleGetter = useCallback((event) => {
    const color = STATUS_COLORS[event.resource.status] || '#6b7280';
    return {
      style: {
        backgroundColor: color,
        borderRadius: 4,
        border: 'none',
        color: '#fff',
        fontSize: '0.75rem',
        fontWeight: 600,
        padding: '2px 4px',
      },
    };
  }, []);

  const handleSelectEvent = useCallback((event) => {
    setSelectedEvent(event.resource);
  }, []);

  const handleNavigate = useCallback((newDate) => setDate(newDate), []);

  const CustomToolbar = ({ label, onNavigate }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button className="btn btn-outline btn-sm" onClick={() => onNavigate('PREV')}><ChevronLeft size={16} /></button>
        <span style={{ fontWeight: 700, fontSize: '1.1rem', minWidth: 200, textAlign: 'center' }}>{label}</span>
        <button className="btn btn-outline btn-sm" onClick={() => onNavigate('NEXT')}><ChevronRight size={16} /></button>
        <button className="btn btn-sm btn-outline" onClick={() => onNavigate('TODAY')}>Today</button>
      </div>
      <div style={{ display: 'flex', gap: '0.3rem' }}>
        {['month', 'week', 'day', 'agenda'].map(v => (
          <button key={v} className={`btn btn-sm ${view === v ? 'btn-primary' : 'btn-outline'}`} onClick={() => setView(v)}>
            {VIEW_LABELS[v]}
          </button>
        ))}
      </div>
    </div>
  );

  if (loading) return <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>Loading calendar...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CalendarDays size={24} /> Schedule Calendar</h1>
        <p>Visual timeline of all jobs, crew assignments, and equipment deployments</p>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <Filter size={16} style={{ color: 'var(--lux-gray)' }} />
          <select className="form-select" style={{ width: 'auto' }} value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">All Jobs</option>
            <option value="active">Active</option>
            <option value="scheduled">Scheduled / Planning</option>
            <option value="completed">Completed / Cancelled</option>
          </select>
          <HardHat size={16} style={{ color: 'var(--lux-gray)' }} />
          <select className="form-select" style={{ width: 'auto' }} value={crewFilter} onChange={e => setCrewFilter(e.target.value)}>
            <option value="all">All Crews</option>
            {crew.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto', flexWrap: 'wrap', alignItems: 'center', fontSize: '0.75rem' }}>
            {Object.entries(STATUS_COLORS).map(([s, c]) => (
              <span key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: c, display: 'inline-block' }} />
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="card" style={{ padding: '1rem' }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: view === 'agenda' ? 400 : 650 }}
              view={view}
              date={date}
              onView={setView}
              onNavigate={handleNavigate}
              onSelectEvent={handleSelectEvent}
              eventPropGetter={eventStyleGetter}
              components={{ toolbar: CustomToolbar }}
              popup
              selectable
              popupOffset={{ x: 30, y: 20 }}
            />
          </div>
        </div>

        {selectedEvent && (
          <div className="card" style={{ width: 340, flexShrink: 0, alignSelf: 'flex-start', position: 'sticky', top: 80 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.95rem', flex: 1 }}>{selectedEvent.title}</h3>
              <button onClick={() => setSelectedEvent(null)} className="btn btn-sm" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div><strong>Client:</strong> {selectedEvent.client}</div>
              <div><strong>Location:</strong> {selectedEvent.location}</div>
              <div><strong>Status:</strong> <span className={`badge ${
                selectedEvent.status === 'Active' ? 'badge-active' :
                selectedEvent.status === 'Completed' ? 'badge-success' :
                selectedEvent.status === 'Planning' || selectedEvent.status === 'Scheduled' ? 'badge-info' :
                selectedEvent.status === 'On Hold' ? 'badge-warning' :
                selectedEvent.status === 'Cancelled' ? 'badge-urgent' : ''
              }`}>{selectedEvent.status}</span></div>
              <div><strong>Priority:</strong> {selectedEvent.priority}</div>
              <div><strong>Type:</strong> {selectedEvent.type}</div>
              <div><strong>Dates:</strong> {moment(selectedEvent.startDate).format('MMM D')} – {moment(selectedEvent.endDate).format('MMM D, YYYY')}</div>
              <div><strong>Crew:</strong> {selectedEvent.crew || 'Unassigned'}</div>
              <div><strong>Equipment:</strong> {selectedEvent.equipment?.join(', ') || 'None'}</div>
              {selectedEvent.notes && <div><strong>Notes:</strong> {selectedEvent.notes}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
