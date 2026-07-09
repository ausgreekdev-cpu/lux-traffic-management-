import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please enter email and password'); return; }
    try {
      const success = await login(email, password);
      if (success) navigate('/');
      else setError('Invalid email or password');
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #264f97 0%, #14171c 100%)',
    }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '2.5rem', width: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: '#264f97', margin: '0 auto 1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '1.5rem', color: '#fff',
          }}>L</div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--lux-blue)' }}>LUX Traffic Management</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--lux-gray)', marginTop: '0.25rem' }}>Perth, Western Australia</p>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 8, padding: '0.75rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@lux-traffic.com.au" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <input className="form-input" type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--lux-gray)' }}>
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '1rem' }}>Sign In</button>
        </form>

        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8f9fc', borderRadius: 8, fontSize: '0.75rem', color: 'var(--lux-gray)' }}>
          <strong style={{ color: '#374151' }}>Demo Credentials:</strong><br />
          Admin: admin@lux-traffic.com.au / luxadmin2026<br />
          Manager: james@lux-traffic.com.au / luxtm2026<br />
          Crew: tom@lux-traffic.com.au / luxtm2026<br />
          Viewer: david@lux-traffic.com.au / luxtm2026
        </div>
      </div>
    </div>
  );
}