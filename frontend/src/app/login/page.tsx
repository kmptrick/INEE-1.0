'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/dashboard');
    } catch {
      setError('Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#1A1008' }}>
      {/* Left panel — brand */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-14"
        style={{ background: 'linear-gradient(160deg, #1A1008 0%, #2E1A0A 100%)', borderRight: '1px solid #2E1E10' }}>
        <div>
          <svg width="52" height="52" viewBox="0 0 100 100" fill="none">
            <path d="M50 4 L96 50 L50 96 L4 50 Z" stroke="#C8803A" strokeWidth="4" fill="none" />
            <path d="M50 16 L84 50 L50 84 L16 50 Z" stroke="#C8803A" strokeWidth="2" fill="none" />
            <line x1="50" y1="30" x2="50" y2="70" stroke="#F5EDE4" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="36" y1="30" x2="64" y2="30" stroke="#F5EDE4" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="36" y1="70" x2="64" y2="70" stroke="#F5EDE4" strokeWidth="4.5" strokeLinecap="round" />
            <circle cx="50" cy="50" r="5" fill="#C8803A" />
          </svg>
          <h1 className="text-4xl font-bold tracking-[0.22em] mt-6" style={{ color: '#F5EDE4' }}>INEE</h1>
          <p className="mt-3 text-base" style={{ color: '#C8803A', letterSpacing: '0.05em' }}>CRM & ERP — Luxembourg</p>
        </div>

        <div style={{ borderTop: '1px solid #2E1E10', paddingTop: '2rem' }}>
          <p className="text-sm" style={{ color: '#4A3020', lineHeight: 1.8 }}>
            37, Rue du Baumbusch<br />
            8213 Mamer — Luxembourg<br />
            TVA : LU36332830
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8" style={{ background: '#F8F5F2' }}>
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <svg width="36" height="36" viewBox="0 0 100 100" fill="none">
              <path d="M50 4 L96 50 L50 96 L4 50 Z" stroke="#C8803A" strokeWidth="4" fill="none" />
              <path d="M50 16 L84 50 L50 84 L16 50 Z" stroke="#C8803A" strokeWidth="2" fill="none" />
              <line x1="50" y1="30" x2="50" y2="70" stroke="#1A1008" strokeWidth="4.5" strokeLinecap="round" />
              <line x1="36" y1="30" x2="64" y2="30" stroke="#1A1008" strokeWidth="4.5" strokeLinecap="round" />
              <line x1="36" y1="70" x2="64" y2="70" stroke="#1A1008" strokeWidth="4.5" strokeLinecap="round" />
              <circle cx="50" cy="50" r="5" fill="#C8803A" />
            </svg>
            <span className="text-xl font-bold tracking-widest" style={{ color: '#1A1008' }}>INEE</span>
          </div>

          <h2 className="text-2xl font-bold mb-1" style={{ color: '#1A1008' }}>Connexion</h2>
          <p className="text-sm mb-8" style={{ color: '#8A7060' }}>Accédez à votre espace de travail</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#4A3020' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="vous@inee.lu"
                className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                style={{ background: '#FFFFFF', border: '1.5px solid #E0D5CC', color: '#1A1008' }}
                onFocus={e => { e.target.style.borderColor = '#C8803A'; e.target.style.boxShadow = '0 0 0 3px rgba(200,128,58,0.12)'; }}
                onBlur={e => { e.target.style.borderColor = '#E0D5CC'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#4A3020' }}>Mot de passe</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                style={{ background: '#FFFFFF', border: '1.5px solid #E0D5CC', color: '#1A1008' }}
                onFocus={e => { e.target.style.borderColor = '#C8803A'; e.target.style.boxShadow = '0 0 0 3px rgba(200,128,58,0.12)'; }}
                onBlur={e => { e.target.style.borderColor = '#E0D5CC'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {error && (
              <div className="text-sm rounded-lg px-4 py-3" style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full font-semibold py-3 px-4 rounded-lg text-sm transition-all"
              style={{ background: loading ? '#A06828' : '#C8803A', color: '#FFFFFF', letterSpacing: '0.03em', boxShadow: '0 2px 8px rgba(200,128,58,0.35)' }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.background = '#A86C2E'; }}
              onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLElement).style.background = '#C8803A'; }}
            >
              {loading ? 'Connexion...' : 'Se connecter →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
