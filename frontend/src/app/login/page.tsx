'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { auth } from '@/lib/api';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [locked, setLocked] = useState(false);

  // Forgot password state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotDone, setForgotDone] = useState(false);
  const [forgotError, setForgotError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/dashboard');
    } catch (err: any) {
      if (err.message?.includes('ACCOUNT_LOCKED')) {
        setLocked(true);
        setError('');
      } else {
        setLocked(false);
        setError('Email ou mot de passe incorrect');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotLoading(true);
    try {
      await auth.forgotPassword(forgotEmail);
      setForgotDone(true);
    } catch {
      setForgotError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setForgotLoading(false);
    }
  };

  const openForgot = () => {
    setForgotEmail('');
    setForgotDone(false);
    setForgotError('');
    setForgotOpen(true);
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

          {!forgotOpen ? (
            <>
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
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: '#4A3020' }}>Mot de passe</label>
                    <button type="button" onClick={openForgot}
                      className="text-xs transition-colors"
                      style={{ color: '#C8803A' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#A06828')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#C8803A')}>
                      Mot de passe oublié ?
                    </button>
                  </div>
                  <div className="relative">
                    <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                      placeholder="••••••••"
                      className="w-full px-4 py-3 pr-11 rounded-lg text-sm outline-none transition-all"
                      style={{ background: '#FFFFFF', border: '1.5px solid #E0D5CC', color: '#1A1008' }}
                      onFocus={e => { e.target.style.borderColor = '#C8803A'; e.target.style.boxShadow = '0 0 0 3px rgba(200,128,58,0.12)'; }}
                      onBlur={e => { e.target.style.borderColor = '#E0D5CC'; e.target.style.boxShadow = 'none'; }}
                    />
                    <button
                      type="button"
                      onMouseDown={() => setShowPwd(true)}
                      onMouseUp={() => setShowPwd(false)}
                      onMouseLeave={() => setShowPwd(false)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer select-none"
                      style={{ color: '#A08070', lineHeight: 1 }}
                      tabIndex={-1}
                    >
                      {showPwd ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                          <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {locked && (
                  <div className="rounded-lg px-4 py-3 space-y-2" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                    <p className="text-sm font-semibold" style={{ color: '#B91C1C' }}>Compte bloqué après 5 tentatives incorrectes.</p>
                    <button type="button" onClick={openForgot} className="text-xs font-semibold underline cursor-pointer" style={{ color: '#C8803A' }}>
                      Réinitialiser mon mot de passe →
                    </button>
                  </div>
                )}
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
            </>
          ) : (
            <>
              <button onClick={() => setForgotOpen(false)} className="flex items-center gap-1.5 text-xs mb-6 transition-colors" style={{ color: '#8A7060' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#C8803A')}
                onMouseLeave={e => (e.currentTarget.style.color = '#8A7060')}>
                ← Retour à la connexion
              </button>
              <h2 className="text-2xl font-bold mb-1" style={{ color: '#1A1008' }}>Mot de passe oublié</h2>
              <p className="text-sm mb-8" style={{ color: '#8A7060' }}>Entrez votre adresse email pour recevoir un lien de réinitialisation.</p>

              {forgotDone ? (
                <div className="rounded-xl px-5 py-6 text-center space-y-3" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                  <p className="text-3xl">✓</p>
                  <p className="font-semibold text-sm" style={{ color: '#16A34A' }}>Email envoyé</p>
                  <p className="text-xs" style={{ color: '#4A3020' }}>Si cet email existe dans notre système, vous recevrez un lien dans quelques minutes.</p>
                  <button onClick={() => setForgotOpen(false)}
                    className="mt-2 text-xs font-semibold transition-colors"
                    style={{ color: '#C8803A' }}>
                    Retour à la connexion →
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgot} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#4A3020' }}>Email</label>
                    <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required
                      placeholder="vous@inee.lu"
                      className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                      style={{ background: '#FFFFFF', border: '1.5px solid #E0D5CC', color: '#1A1008' }}
                      onFocus={e => { e.target.style.borderColor = '#C8803A'; e.target.style.boxShadow = '0 0 0 3px rgba(200,128,58,0.12)'; }}
                      onBlur={e => { e.target.style.borderColor = '#E0D5CC'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                  {forgotError && (
                    <div className="text-sm rounded-lg px-4 py-3" style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C' }}>
                      {forgotError}
                    </div>
                  )}
                  <button type="submit" disabled={forgotLoading}
                    className="w-full font-semibold py-3 px-4 rounded-lg text-sm transition-all"
                    style={{ background: forgotLoading ? '#A06828' : '#C8803A', color: '#FFFFFF', letterSpacing: '0.03em', boxShadow: '0 2px 8px rgba(200,128,58,0.35)' }}>
                    {forgotLoading ? 'Envoi...' : 'Envoyer le lien →'}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
