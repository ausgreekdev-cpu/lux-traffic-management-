import { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';

const STEPS = [
  {
    title: 'Welcome to LUX Traffic Management',
    content: 'This portal helps you plan, quote, and manage traffic management projects across Perth, WA. Take a quick tour to learn the key areas.',
    icon: '👋',
  },
  {
    title: 'Planning Dashboard',
    content: 'Your home base. See your pipeline at a glance — scoping queue, quotes pending, TMPs to draft, and upcoming permit expiries. KPIs are pulled live from your data.',
    icon: '📊',
    link: '/',
  },
  {
    title: 'Scoping & Intake',
    content: 'Capture new project enquiries. Log client requirements, site details, and scope of works before moving to quoting.',
    icon: '📋',
    link: '/scoping',
  },
  {
    title: 'Quotes & Proposals',
    content: 'Create professional quotes for clients. Track which quotes are pending, approved, or declined. Convert approved quotes into jobs.',
    icon: '💰',
    link: '/quotes',
  },
  {
    title: 'TMP Generator',
    content: 'Generate MRWA-compliant Traffic Management Plans. Fill in the details and print or export for authority submissions.',
    icon: '📄',
    link: '/tmp-generator',
  },
  {
    title: 'Planning Board',
    content: 'Drag jobs between lanes to move them through the workflow: Planning → Scheduled → Active → Completed. Status changes trigger notifications automatically.',
    icon: '📌',
    link: '/kanban',
  },
  {
    title: 'Job Board & Planner Assignment',
    content: 'Every job can be assigned to a specific planner. Use the Planner filter to see your workload. Update statuses, send emails, and attach files from here.',
    icon: '👤',
    link: '/jobs',
  },
  {
    title: 'You\'re All Set!',
    content: 'Explore the other tools — Permits, Planning Calendar, Reports, and Automation. You can restart this tour anytime from Settings.',
    icon: '🎉',
  },
];

export default function OnboardingTour({ onComplete }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];

  const handleFinish = () => {
    localStorage.setItem('lux_tour_complete', 'true');
    if (onComplete) onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem('lux_tour_complete', 'true');
    if (onComplete) onComplete();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, width: 480, maxWidth: '90vw',
        padding: '2rem', boxShadow: '0 25px 80px rgba(0,0,0,0.3)',
        position: 'relative',
      }}>
        <button onClick={handleSkip} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4 }}>
          <X size={20} />
        </button>

        <div style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '0.5rem' }}>{current.icon}</div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, textAlign: 'center', marginBottom: '0.75rem', color: '#264f97' }}>{current.title}</h2>
        <p style={{ fontSize: '0.9rem', color: '#4b5563', textAlign: 'center', lineHeight: 1.6, marginBottom: '1.5rem' }}>{current.content}</p>

        {current.link && (
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', background: '#dbeafe', color: '#1e40af', padding: '0.25rem 0.75rem', borderRadius: 4 }}>
              Navigate to: {current.link}
            </span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.35rem', marginBottom: '1.5rem' }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: '50%',
              background: i === step ? '#264f97' : '#d1d5db',
              transition: 'all 0.2s',
            }} />
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={handleSkip} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: '#9ca3af' }}>Skip tour</button>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {step > 0 && (
              <button className="btn btn-outline btn-sm" onClick={() => setStep(step - 1)}>
                <ChevronLeft size={14} /> Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button className="btn btn-primary btn-sm" onClick={() => setStep(step + 1)}>
                Next <ChevronRight size={14} />
              </button>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={handleFinish}>
                <Check size={14} /> Get Started
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
