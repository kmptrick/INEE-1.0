'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth } from '@/lib/api';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirm) { setError('Les mots de passe ne correspondent pas.'); return; }
    if (newPassword.length < 8) { setError('Minimum 8 caractères.'); return; }
    setError('');
    setLoading(true);
    try {
      await auth.resetPasswordWithToken(token, newPassword);
      setDone(true);
    } catch (err: any) {
      setError(err.message ?? 'Lien invalide ou expiré.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center space-y-3 py-4">
        <p className="text-sm" style={{ color: '#B91C1C' }}>Lien invalide. Veuillez recommencer depuis la page de connexion.</p>
        <button onClick={() => router.replace('/login')} className="text-xs font-semibold" style={{ color: '#D9924E' }}>← Retour à la connexion</button>
      </div>
    );
  }

  return done ? (
    <div className="text-center space-y-3 py-4">
      <p className="text-3xl">✓</p>
      <p className="font-semibold text-sm" style={{ color: '#16A34A' }}>Mot de passe mis à jour</p>
      <p className="text-xs" style={{ color: '#6B4C35' }}>Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
      <button onClick={() => router.replace('/login')}
        className="mt-2 w-full font-semibold py-3 px-4 rounded-lg text-sm"
        style={{ background: '#D9924E', color: '#FFF' }}>
        Se connecter →
      </button>
    </div>
  ) : (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#6B4C35' }}>Nouveau mot de passe</label>
        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={8}
          placeholder="••••••••"
          className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
          style={{ background: '#FFFFFF', border: '1.5px solid #E0D5CC', color: '#1A1008' }}
          onFocus={e => { e.target.style.borderColor = '#D9924E'; e.target.style.boxShadow = '0 0 0 3px rgba(200,128,58,0.12)'; }}
          onBlur={e => { e.target.style.borderColor = '#E0D5CC'; e.target.style.boxShadow = 'none'; }}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#6B4C35' }}>Confirmer le mot de passe</label>
        <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
          placeholder="••••••••"
          className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
          style={{ background: '#FFFFFF', border: '1.5px solid #E0D5CC', color: '#1A1008' }}
          onFocus={e => { e.target.style.borderColor = '#D9924E'; e.target.style.boxShadow = '0 0 0 3px rgba(200,128,58,0.12)'; }}
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
        style={{ background: loading ? '#A06828' : '#D9924E', color: '#FFFFFF', letterSpacing: '0.03em', boxShadow: '0 2px 8px rgba(200,128,58,0.35)' }}>
        {loading ? 'Enregistrement...' : 'Enregistrer le nouveau mot de passe →'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex" style={{ background: '#1A1008' }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-14"
        style={{ background: 'linear-gradient(160deg, #1A1008 0%, #2E1A0A 100%)', borderRight: '1px solid #2E1E10' }}>
        <div>
          <svg width="52" height="52" viewBox="0 0 100 100" fill="none">
            <path d="M50 4 L96 50 L50 96 L4 50 Z" stroke="#D9924E" strokeWidth="4" fill="none" />
            <path d="M50 16 L84 50 L50 84 L16 50 Z" stroke="#D9924E" strokeWidth="2" fill="none" />
            <line x1="50" y1="30" x2="50" y2="70" stroke="#F5EDE4" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="36" y1="30" x2="64" y2="30" stroke="#F5EDE4" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="36" y1="70" x2="64" y2="70" stroke="#F5EDE4" strokeWidth="4.5" strokeLinecap="round" />
            <circle cx="50" cy="50" r="5" fill="#D9924E" />
          </svg>
          <h1 className="text-4xl font-bold tracking-[0.22em] mt-6" style={{ color: '#F5EDE4' }}>INEE</h1>
          <p className="mt-3 text-base" style={{ color: '#D9924E', letterSpacing: '0.05em' }}>CRM & ERP — Luxembourg</p>
        </div>
        <div style={{ borderTop: '1px solid #2E1E10', paddingTop: '2rem' }}>
          <p className="text-sm" style={{ color: '#6B4C35', lineHeight: 1.8 }}>
            37, Rue du Baumbusch<br />
            8213 Mamer — Luxembourg<br />
            TVA : LU36332830
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8" style={{ background: '#F8F5F2' }}>
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-1" style={{ color: '#1A1008' }}>Nouveau mot de passe</h2>
          <p className="text-sm mb-8" style={{ color: '#8A7060' }}>Choisissez un mot de passe sécurisé (minimum 8 caractères).</p>
          <Suspense fallback={<div className="text-sm" style={{ color: '#8A7060' }}>Chargement...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
