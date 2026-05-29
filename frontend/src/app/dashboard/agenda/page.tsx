'use client';
import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { calendar, leaveRequests, leaveTypes, users, CalendarEvent, LeaveRequest, LeaveType, UserProfile } from '@/lib/api';
import { T } from '@/components/FormField';
import { Modal } from '@/components/Modal';

// ── Constants ─────────────────────────────────────────────────────────────────

type ViewMode = 'day' | 'week' | 'month' | 'year';

const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const DAYS_FR   = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 7:00 – 19:00

const EVENT_COLORS: Record<string, string> = {
  MEETING: '#1D6FD8', CALL: '#16A34A', TASK: '#C8803A', OTHER: '#7C3AED',
};
const EVENT_FR: Record<string, string> = {
  MEETING: 'Réunion', CALL: 'Appel', TASK: 'Tâche', OTHER: 'Autre',
};
const LEAVE_STATUS_FR: Record<string, string> = {
  PENDING: 'En attente', APPROVED: 'Approuvé', REJECTED: 'Refusé',
};
const LEAVE_STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  PENDING:  { bg: '#FFFBEB', color: '#92400E' },
  APPROVED: { bg: '#F0FDF4', color: '#16A34A' },
  REJECTED: { bg: '#FEF2F2', color: '#DC2626' },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function startOfWeek(d: Date): Date {
  const dt = new Date(d);
  const day = dt.getDay();
  dt.setDate(dt.getDate() - day + (day === 0 ? -6 : 1));
  dt.setHours(0, 0, 0, 0);
  return dt;
}

function addDays(d: Date, n: number): Date {
  const dt = new Date(d);
  dt.setDate(dt.getDate() + n);
  return dt;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatTime(d: Date) {
  return d.toLocaleTimeString('fr-LU', { hour: '2-digit', minute: '2-digit' });
}

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function countWeekdays(start: Date, end: Date): number {
  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

// ── Quota bar ─────────────────────────────────────────────────────────────────

function QuotaBar({ leaves, ltypes, isOwnCalendar, userName }: {
  leaves: LeaveRequest[]; ltypes: LeaveType[]; isOwnCalendar: boolean; userName?: string;
}) {
  const year = new Date().getFullYear();
  const activeTypes = ltypes.filter(t => t.isActive);
  if (activeTypes.length === 0) return null;

  return (
    <div className="px-4 py-3 flex-shrink-0" style={{ background: '#FFF', borderBottom: `1px solid ${T.border}` }}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#4A3020' }}>
          {isOwnCalendar ? 'Mes quotas de congés' : `Congés de ${userName}`} — {year}
        </span>
      </div>
      <div className="flex flex-wrap gap-4">
        {activeTypes.map(lt => {
          const used = leaves
            .filter(l => l.leaveTypeId === lt.id && l.status !== 'REJECTED' &&
              new Date(l.startDate).getFullYear() === year)
            .reduce((sum, l) => sum + l.daysCount, 0);
          const pct = Math.min(100, Math.round((used / lt.maxDaysPerYear) * 100));
          const over = used > lt.maxDaysPerYear;
          return (
            <div key={lt.id} className="flex items-center gap-2 min-w-[160px]">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: lt.color }} />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="font-semibold truncate" style={{ color: T.dark }}>{lt.name}</span>
                  <span className="font-bold ml-2 flex-shrink-0" style={{ color: over ? '#DC2626' : T.muted }}>
                    {used} / {lt.maxDaysPerYear}j
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#EEE' }}>
                  <div className="h-full rounded-full transition-all" style={{
                    width: `${pct}%`,
                    background: over ? '#DC2626' : pct > 80 ? '#F59E0B' : lt.color,
                  }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AgendaPage() {
  const { user } = useAuth();
  const [view, setView] = useState<ViewMode>('month');
  const [cursor, setCursor] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [ltypes, setLtypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);

  // User selector
  const [userList, setUserList] = useState<UserProfile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  // New event modal
  const [newOpen, setNewOpen] = useState(false);
  const [newType, setNewType] = useState<'event' | 'leave'>('event');
  const [evForm, setEvForm] = useState({ title: '', description: '', type: 'MEETING', startDate: '', startTime: '09:00', endDate: '', endTime: '10:00', allDay: false, location: '' });
  const [lvForm, setLvForm] = useState({ leaveTypeId: '', startDate: '', endDate: '', notes: '' });
  const [saving, setSaving] = useState(false);

  // Detail
  const [selEvent, setSelEvent] = useState<CalendarEvent | null>(null);
  const [selLeave, setSelLeave] = useState<LeaveRequest | null>(null);

  const isOwnCalendar = !selectedUserId || selectedUserId === user?.id;
  const viewedUser = userList.find(u => u.id === selectedUserId);

  const load = async (uid?: string) => {
    setLoading(true);
    const targetId = uid ?? selectedUserId ?? user?.id ?? '';
    const [evs, lvs, lts] = await Promise.all([
      calendar.list({ userId: targetId }),
      leaveRequests.list({ userId: targetId }),
      leaveTypes.list(),
    ]);
    setEvents(evs);
    setLeaves(lvs);
    setLtypes(lts);
    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;
    setSelectedUserId(user.id);
    // Load user list (admin) or just current user
    if (user.role === 'ADMIN') {
      users.list().then(setUserList).catch(() => setUserList([]));
    } else {
      // All users can see others' calendars — load full list
      users.list().then(setUserList).catch(() => setUserList([]));
    }
  }, [user]);

  useEffect(() => {
    if (selectedUserId) load(selectedUserId);
  }, [selectedUserId]);

  const navigate = (dir: -1 | 1) => {
    setCursor(c => {
      const d = new Date(c);
      if (view === 'day')   d.setDate(d.getDate() + dir);
      if (view === 'week')  d.setDate(d.getDate() + dir * 7);
      if (view === 'month') d.setMonth(d.getMonth() + dir);
      if (view === 'year')  d.setFullYear(d.getFullYear() + dir);
      return d;
    });
  };

  const navLabel = useMemo(() => {
    if (view === 'day')   return cursor.toLocaleDateString('fr-LU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    if (view === 'week') {
      const ws = startOfWeek(cursor);
      const we = addDays(ws, 6);
      return `${ws.toLocaleDateString('fr-LU', { day: 'numeric', month: 'short' })} – ${we.toLocaleDateString('fr-LU', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    }
    if (view === 'month') return cursor.toLocaleDateString('fr-LU', { month: 'long', year: 'numeric' });
    return String(cursor.getFullYear());
  }, [view, cursor]);

  const openNew = (date?: Date, hour?: number) => {
    if (!isOwnCalendar) return; // Can't create events for someone else
    const d = date ? isoDate(date) : isoDate(new Date());
    const startTime = hour !== undefined ? `${String(hour).padStart(2,'0')}:00` : '09:00';
    const endTime   = hour !== undefined ? `${String(Math.min(hour + 1, 19)).padStart(2,'0')}:00` : '10:00';
    setEvForm(f => ({ ...f, startDate: d, endDate: d, startTime, endTime }));
    setLvForm(f => ({ ...f, startDate: d, endDate: d }));
    setNewOpen(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (newType === 'event') {
        const start = evForm.allDay ? new Date(evForm.startDate) : new Date(`${evForm.startDate}T${evForm.startTime}`);
        const end   = evForm.allDay ? new Date(evForm.endDate)   : new Date(`${evForm.endDate}T${evForm.endTime}`);
        await calendar.create({
          title: evForm.title, description: evForm.description || undefined,
          type: evForm.type as any, startDate: start.toISOString(), endDate: end.toISOString(),
          allDay: evForm.allDay, location: evForm.location || undefined,
        });
      } else {
        const start = new Date(lvForm.startDate);
        const end   = new Date(lvForm.endDate);
        const days  = countWeekdays(start, end);
        await leaveRequests.create({ leaveTypeId: lvForm.leaveTypeId, startDate: start.toISOString(), endDate: end.toISOString(), daysCount: days, notes: lvForm.notes || undefined });
      }
      setNewOpen(false);
      await load(selectedUserId);
    } finally { setSaving(false); }
  };

  const deleteEvent = async (id: string) => { await calendar.delete(id); await load(selectedUserId); setSelEvent(null); };
  const deleteLeave = async (id: string) => { await leaveRequests.delete(id); await load(selectedUserId); setSelLeave(null); };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 flex-shrink-0 flex-wrap gap-3" style={{ background: '#FFF', borderBottom: `1px solid ${T.border}` }}>
        <h1 className="text-xl font-bold" style={{ color: T.dark }}>Agenda</h1>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Person selector */}
          <select
            value={selectedUserId}
            onChange={e => setSelectedUserId(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-sm border outline-none cursor-pointer"
            style={{ borderColor: T.border, color: T.dark, background: '#FFF', minWidth: 160 }}>
            {userList.map(u => (
              <option key={u.id} value={u.id}>
                {u.id === user?.id ? `Moi (${u.firstName} ${u.lastName})` : `${u.firstName} ${u.lastName}`}
              </option>
            ))}
          </select>

          {/* View selector */}
          <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: T.border }}>
            {(['day','week','month','year'] as ViewMode[]).map(v => (
              <button key={v} onClick={() => setView(v)}
                className="px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
                style={{ background: view === v ? T.copper : '#FFF', color: view === v ? '#FFF' : T.muted }}>
                {v === 'day' ? 'Jour' : v === 'week' ? 'Semaine' : v === 'month' ? 'Mois' : 'Année'}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
              style={{ border: `1px solid ${T.border}`, color: T.muted, background: '#FFF' }}
              onMouseEnter={e => (e.currentTarget.style.background = T.head)}
              onMouseLeave={e => (e.currentTarget.style.background = '#FFF')}>‹</button>
            <button onClick={() => setCursor(new Date())} className="px-3 h-8 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              style={{ border: `1px solid ${T.border}`, color: T.muted, background: '#FFF' }}
              onMouseEnter={e => (e.currentTarget.style.background = T.head)}
              onMouseLeave={e => (e.currentTarget.style.background = '#FFF')}>Aujourd'hui</button>
            <button onClick={() => navigate(1)} className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
              style={{ border: `1px solid ${T.border}`, color: T.muted, background: '#FFF' }}
              onMouseEnter={e => (e.currentTarget.style.background = T.head)}
              onMouseLeave={e => (e.currentTarget.style.background = '#FFF')}>›</button>
          </div>
          <span className="text-sm font-semibold capitalize" style={{ color: T.dark, minWidth: 200, textAlign: 'center' }}>{navLabel}</span>

          {/* Add — only for own calendar */}
          {isOwnCalendar && (
            <button onClick={() => openNew()}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white cursor-pointer"
              style={{ background: T.copper }}>
              + Ajouter
            </button>
          )}
        </div>
      </div>

      {/* Quota bar */}
      <QuotaBar leaves={leaves} ltypes={ltypes} isOwnCalendar={isOwnCalendar}
        userName={viewedUser ? `${viewedUser.firstName} ${viewedUser.lastName}` : undefined} />

      {/* Calendar body */}
      <div className="flex-1 overflow-auto p-4" style={{ background: '#F8F5F2' }}>
        {loading ? (
          <div className="text-center py-16 text-sm" style={{ color: T.muted }}>Chargement...</div>
        ) : (
          <>
            {view === 'month' && <MonthView cursor={cursor} events={events} leaves={leaves} ltypes={ltypes} onDayClick={isOwnCalendar ? openNew : undefined} onEventClick={setSelEvent} onLeaveClick={setSelLeave} />}
            {view === 'week'  && <WeekView  cursor={cursor} events={events} leaves={leaves} ltypes={ltypes} onSlotClick={isOwnCalendar ? openNew : undefined} onEventClick={setSelEvent} onLeaveClick={setSelLeave} />}
            {view === 'day'   && <DayView   cursor={cursor} events={events} leaves={leaves} ltypes={ltypes} onSlotClick={isOwnCalendar ? openNew : undefined} onEventClick={setSelEvent} onLeaveClick={setSelLeave} />}
            {view === 'year'  && <YearView  cursor={cursor} events={events} leaves={leaves} ltypes={ltypes} onMonthClick={d => { setCursor(d); setView('month'); }} />}
          </>
        )}
      </div>

      {/* ── New event modal ── */}
      <Modal title="Nouvel événement" open={newOpen} onClose={() => setNewOpen(false)}>
        <div className="flex gap-2 mb-4">
          {(['event', 'leave'] as const).map(t => (
            <button key={t} type="button" onClick={() => setNewType(t)}
              className="flex-1 py-2 rounded-lg text-xs font-semibold border cursor-pointer transition-colors"
              style={newType === t ? { background: T.copper, color: '#FFF', borderColor: T.copper } : { background: '#FFF', color: T.muted, borderColor: T.border }}>
              {t === 'event' ? '📆 Rendez-vous / Tâche' : '🏖 Demande de congé'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSaveEvent} className="space-y-4">
          {newType === 'event' ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#4A3020' }}>Titre *</label>
                  <input className="w-full px-3 py-2 rounded-lg text-sm border outline-none" required
                    value={evForm.title} onChange={e => setEvForm(f => ({ ...f, title: e.target.value }))} style={{ borderColor: T.border }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#4A3020' }}>Type</label>
                  <select className="w-full px-3 py-2 rounded-lg text-sm border outline-none" value={evForm.type}
                    onChange={e => setEvForm(f => ({ ...f, type: e.target.value }))} style={{ borderColor: T.border }}>
                    {Object.entries(EVENT_FR).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#4A3020' }}>Lieu</label>
                  <input className="w-full px-3 py-2 rounded-lg text-sm border outline-none" value={evForm.location}
                    onChange={e => setEvForm(f => ({ ...f, location: e.target.value }))} style={{ borderColor: T.border }} />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold uppercase tracking-wider" style={{ color: '#4A3020' }}>
                  <input type="checkbox" checked={evForm.allDay} onChange={e => setEvForm(f => ({ ...f, allDay: e.target.checked }))} className="accent-amber-600 cursor-pointer" />
                  Journée entière
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#4A3020' }}>Début *</label>
                  <input type="date" required className="w-full px-3 py-2 rounded-lg text-sm border outline-none" value={evForm.startDate}
                    onChange={e => setEvForm(f => ({ ...f, startDate: e.target.value }))} style={{ borderColor: T.border }} />
                  {!evForm.allDay && <input type="time" className="w-full px-3 py-2 rounded-lg text-sm border outline-none mt-1" value={evForm.startTime}
                    onChange={e => setEvForm(f => ({ ...f, startTime: e.target.value }))} style={{ borderColor: T.border }} />}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#4A3020' }}>Fin *</label>
                  <input type="date" required className="w-full px-3 py-2 rounded-lg text-sm border outline-none" value={evForm.endDate}
                    onChange={e => setEvForm(f => ({ ...f, endDate: e.target.value }))} style={{ borderColor: T.border }} />
                  {!evForm.allDay && <input type="time" className="w-full px-3 py-2 rounded-lg text-sm border outline-none mt-1" value={evForm.endTime}
                    onChange={e => setEvForm(f => ({ ...f, endTime: e.target.value }))} style={{ borderColor: T.border }} />}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#4A3020' }}>Description</label>
                <textarea className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none" rows={2}
                  value={evForm.description} onChange={e => setEvForm(f => ({ ...f, description: e.target.value }))} style={{ borderColor: T.border }} />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#4A3020' }}>Type de congé *</label>
                <select required className="w-full px-3 py-2 rounded-lg text-sm border outline-none" value={lvForm.leaveTypeId}
                  onChange={e => setLvForm(f => ({ ...f, leaveTypeId: e.target.value }))} style={{ borderColor: T.border }}>
                  <option value="">— Choisir —</option>
                  {ltypes.filter(t => t.isActive).map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} (max {t.maxDaysPerYear}j/an)
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#4A3020' }}>Date de début *</label>
                  <input type="date" required className="w-full px-3 py-2 rounded-lg text-sm border outline-none" value={lvForm.startDate}
                    onChange={e => setLvForm(f => ({ ...f, startDate: e.target.value }))} style={{ borderColor: T.border }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#4A3020' }}>Date de fin *</label>
                  <input type="date" required className="w-full px-3 py-2 rounded-lg text-sm border outline-none" value={lvForm.endDate}
                    onChange={e => setLvForm(f => ({ ...f, endDate: e.target.value }))} style={{ borderColor: T.border }} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#4A3020' }}>Motif</label>
                <textarea className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none" rows={2}
                  value={lvForm.notes} onChange={e => setLvForm(f => ({ ...f, notes: e.target.value }))} style={{ borderColor: T.border }} />
              </div>
              {lvForm.startDate && lvForm.endDate && (
                <p className="text-xs font-semibold" style={{ color: T.copper }}>
                  ≈ {countWeekdays(new Date(lvForm.startDate), new Date(lvForm.endDate))} jour(s) ouvré(s)
                </p>
              )}
            </>
          )}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setNewOpen(false)}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium border cursor-pointer"
              style={{ borderColor: T.border, color: T.muted }}>Annuler</button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer"
              style={{ background: T.copper, opacity: saving ? 0.7 : 1 }}>
              {saving ? '...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Event detail modal ── */}
      {selEvent && (
        <Modal title={selEvent.title} open={!!selEvent} onClose={() => setSelEvent(null)}>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold text-white" style={{ background: EVENT_COLORS[selEvent.type] ?? '#888' }}>
                {EVENT_FR[selEvent.type] ?? selEvent.type}
              </span>
            </div>
            {selEvent.description && <p className="text-sm" style={{ color: T.muted }}>{selEvent.description}</p>}
            <div className="text-xs space-y-1" style={{ color: T.muted }}>
              <p>Début : <strong style={{ color: T.dark }}>{new Date(selEvent.startDate).toLocaleString('fr-LU')}</strong></p>
              <p>Fin : <strong style={{ color: T.dark }}>{new Date(selEvent.endDate).toLocaleString('fr-LU')}</strong></p>
              {selEvent.location && <p>Lieu : <strong style={{ color: T.dark }}>{selEvent.location}</strong></p>}
            </div>
            {isOwnCalendar && (
              <div className="flex justify-end pt-2">
                <button onClick={() => deleteEvent(selEvent.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer"
                  style={{ color: '#DC2626', borderColor: '#FECACA', background: 'transparent' }}>
                  Supprimer
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ── Leave detail modal ── */}
      {selLeave && (
        <Modal title="Demande de congé" open={!!selLeave} onClose={() => setSelLeave(null)}>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: selLeave.leaveType?.color ?? '#888' }} />
              <span className="text-sm font-semibold" style={{ color: T.dark }}>{selLeave.leaveType?.name}</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: LEAVE_STATUS_COLORS[selLeave.status]?.bg, color: LEAVE_STATUS_COLORS[selLeave.status]?.color }}>
                {LEAVE_STATUS_FR[selLeave.status]}
              </span>
            </div>
            <div className="text-xs space-y-1" style={{ color: T.muted }}>
              <p>Début : <strong style={{ color: T.dark }}>{new Date(selLeave.startDate).toLocaleDateString('fr-LU')}</strong></p>
              <p>Fin : <strong style={{ color: T.dark }}>{new Date(selLeave.endDate).toLocaleDateString('fr-LU')}</strong></p>
              <p>Durée : <strong style={{ color: T.dark }}>{selLeave.daysCount} jour(s) ouvré(s)</strong></p>
              {selLeave.notes && <p>Motif : {selLeave.notes}</p>}
            </div>
            {isOwnCalendar && selLeave.status === 'PENDING' && (
              <div className="flex justify-end pt-2">
                <button onClick={() => deleteLeave(selLeave.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer"
                  style={{ color: '#DC2626', borderColor: '#FECACA', background: 'transparent' }}>
                  Annuler la demande
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Month View ────────────────────────────────────────────────────────────────

function MonthView({ cursor, events, leaves, ltypes, onDayClick, onEventClick, onLeaveClick }: {
  cursor: Date; events: CalendarEvent[]; leaves: LeaveRequest[]; ltypes: LeaveType[];
  onDayClick?: (d: Date) => void; onEventClick: (e: CalendarEvent) => void; onLeaveClick: (l: LeaveRequest) => void;
}) {
  const today = new Date();
  const year = cursor.getFullYear(), month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);
  const startDow = (firstDay.getDay() + 6) % 7;

  const cells: (Date | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: lastDay.getDate() }, (_, i) => new Date(year, month, i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const eventsOnDay = (d: Date) => events.filter(e => sameDay(new Date(e.startDate), d));
  const leavesOnDay = (d: Date) => leaves.filter(l => {
    const s = new Date(l.startDate); const en = new Date(l.endDate);
    return d >= s && d <= en;
  });

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: '#FFF', border: `1px solid ${T.border}` }}>
      <div className="grid grid-cols-7 border-b" style={{ borderColor: T.border }}>
        {['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].map(d => (
          <div key={d} className="px-2 py-2 text-xs font-bold text-center uppercase tracking-wider" style={{ color: '#4A3020', background: T.head }}>
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7" style={{ gridAutoRows: 'minmax(90px, auto)' }}>
        {cells.map((d, i) => {
          const isToday = d && sameDay(d, today);
          const dayEvents = d ? eventsOnDay(d) : [];
          const dayLeaves = d ? leavesOnDay(d) : [];
          return (
            <div key={i}
              onClick={() => d && onDayClick?.(d)}
              className={`p-1.5 border-r border-b transition-colors${d && onDayClick ? ' cursor-pointer' : ''}`}
              style={{ borderColor: T.rowDiv, background: isToday ? '#FFF9F0' : !d ? '#FAFAFA' : '#FFF', minHeight: 90 }}
              onMouseEnter={e => { if (d && onDayClick) e.currentTarget.style.background = '#FDF3E8'; }}
              onMouseLeave={e => { if (d && onDayClick) e.currentTarget.style.background = isToday ? '#FFF9F0' : '#FFF'; }}>
              {d && (
                <>
                  <div className="text-xs font-bold mb-1 w-6 h-6 flex items-center justify-center rounded-full"
                    style={{ background: isToday ? T.copper : 'transparent', color: isToday ? '#FFF' : T.dark }}>
                    {d.getDate()}
                  </div>
                  <div className="space-y-0.5">
                    {dayLeaves.slice(0, 1).map(l => {
                      const lt = ltypes.find(t => t.id === l.leaveTypeId);
                      return (
                        <div key={l.id} onClick={e => { e.stopPropagation(); onLeaveClick(l); }}
                          className="text-xs px-1.5 py-0.5 rounded truncate cursor-pointer"
                          style={{ background: lt?.color ?? '#888', color: '#FFF', opacity: l.status === 'REJECTED' ? 0.4 : 1 }}>
                          🏖 {lt?.name ?? 'Congé'}
                        </div>
                      );
                    })}
                    {dayEvents.slice(0, 2).map(ev => (
                      <div key={ev.id} onClick={e => { e.stopPropagation(); onEventClick(ev); }}
                        className="text-xs px-1.5 py-0.5 rounded truncate cursor-pointer"
                        style={{ background: EVENT_COLORS[ev.type] ?? '#888', color: '#FFF' }}>
                        {ev.title}
                      </div>
                    ))}
                    {(dayEvents.length + dayLeaves.length) > 3 && (
                      <div className="text-xs" style={{ color: T.muted }}>+{dayEvents.length + dayLeaves.length - 3} autres</div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Week View ─────────────────────────────────────────────────────────────────

function WeekView({ cursor, events, leaves, ltypes, onSlotClick, onEventClick, onLeaveClick }: {
  cursor: Date; events: CalendarEvent[]; leaves: LeaveRequest[]; ltypes: LeaveType[];
  onSlotClick?: (date: Date, hour: number) => void;
  onEventClick: (e: CalendarEvent) => void; onLeaveClick: (l: LeaveRequest) => void;
}) {
  const today = new Date();
  const ws = startOfWeek(cursor);
  const days = Array.from({ length: 7 }, (_, i) => addDays(ws, i));

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: '#FFF', border: `1px solid ${T.border}` }}>
      <div className="grid border-b" style={{ gridTemplateColumns: '60px repeat(7, 1fr)', borderColor: T.border }}>
        <div style={{ background: T.head }} />
        {days.map((d, i) => (
          <div key={i} className="px-2 py-2 text-center border-l" style={{ background: T.head, borderColor: T.border }}>
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#4A3020' }}>{DAYS_FR[(i + 1) % 7]}</p>
            <p className="text-sm font-bold mt-0.5 w-7 h-7 mx-auto flex items-center justify-center rounded-full"
              style={{ background: sameDay(d, today) ? T.copper : 'transparent', color: sameDay(d, today) ? '#FFF' : T.dark }}>
              {d.getDate()}
            </p>
          </div>
        ))}
      </div>
      {/* Leave row */}
      <div className="grid border-b" style={{ gridTemplateColumns: '60px repeat(7, 1fr)', borderColor: T.border }}>
        <div className="flex items-center justify-center text-xs" style={{ color: T.muted, background: '#FAFAFA' }}>Congés</div>
        {days.map((d, i) => {
          const dayLeaves = leaves.filter(l => { const s = new Date(l.startDate); const en = new Date(l.endDate); return d >= s && d <= en; });
          return (
            <div key={i} className="border-l p-1" style={{ borderColor: T.rowDiv, minHeight: 28 }}>
              {dayLeaves.map(l => {
                const lt = ltypes.find(t => t.id === l.leaveTypeId);
                return (
                  <div key={l.id} onClick={() => onLeaveClick(l)}
                    className="text-xs px-1.5 py-0.5 rounded truncate cursor-pointer"
                    style={{ background: lt?.color ?? '#888', color: '#FFF', opacity: l.status === 'REJECTED' ? 0.4 : 1 }}>
                    🏖 {lt?.name}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      {/* Time grid */}
      <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 320px)' }}>
        {HOURS.map(h => (
          <div key={h} className="grid border-b" style={{ gridTemplateColumns: '60px repeat(7, 1fr)', borderColor: T.rowDiv }}>
            <div className="text-xs flex items-start justify-center pt-1" style={{ color: T.muted }}>{String(h).padStart(2,'0')}:00</div>
            {days.map((d, i) => {
              const dayEvents = events.filter(e => {
                const es = new Date(e.startDate);
                return sameDay(es, d) && es.getHours() === h;
              });
              return (
                <div key={i}
                  className={`border-l p-0.5 min-h-[48px]${onSlotClick ? ' cursor-pointer' : ''}`}
                  style={{ borderColor: T.rowDiv }}
                  onClick={() => { if (dayEvents.length === 0 && onSlotClick) onSlotClick(d, h); }}
                  onMouseEnter={e => { if (onSlotClick && dayEvents.length === 0) e.currentTarget.style.background = '#FDF3E8'; }}
                  onMouseLeave={e => { if (onSlotClick) e.currentTarget.style.background = 'transparent'; }}>
                  {dayEvents.map(ev => (
                    <div key={ev.id} onClick={e => { e.stopPropagation(); onEventClick(ev); }}
                      className="text-xs px-1.5 py-1 rounded cursor-pointer mb-0.5"
                      style={{ background: EVENT_COLORS[ev.type] ?? '#888', color: '#FFF' }}>
                      {formatTime(new Date(ev.startDate))} {ev.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Day View ──────────────────────────────────────────────────────────────────

function DayView({ cursor, events, leaves, ltypes, onSlotClick, onEventClick, onLeaveClick }: {
  cursor: Date; events: CalendarEvent[]; leaves: LeaveRequest[]; ltypes: LeaveType[];
  onSlotClick?: (date: Date, hour: number) => void;
  onEventClick: (e: CalendarEvent) => void; onLeaveClick: (l: LeaveRequest) => void;
}) {
  const dayEvents = events.filter(e => sameDay(new Date(e.startDate), cursor));
  const dayLeaves = leaves.filter(l => { const s = new Date(l.startDate); const en = new Date(l.endDate); return cursor >= s && cursor <= en; });

  return (
    <div className="rounded-xl overflow-hidden max-w-lg mx-auto" style={{ background: '#FFF', border: `1px solid ${T.border}` }}>
      {dayLeaves.length > 0 && (
        <div className="p-3 border-b space-y-1" style={{ borderColor: T.border }}>
          {dayLeaves.map(l => {
            const lt = ltypes.find(t => t.id === l.leaveTypeId);
            return (
              <div key={l.id} onClick={() => onLeaveClick(l)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer"
                style={{ background: lt?.color ?? '#888', color: '#FFF' }}>
                <span className="text-sm">🏖</span>
                <span className="text-sm font-semibold">{lt?.name} — {LEAVE_STATUS_FR[l.status]}</span>
              </div>
            );
          })}
        </div>
      )}
      <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
        {HOURS.map(h => {
          const hourEvents = dayEvents.filter(e => new Date(e.startDate).getHours() === h);
          return (
            <div key={h}
              className={`flex border-b${onSlotClick ? ' cursor-pointer' : ''}`}
              style={{ borderColor: T.rowDiv }}
              onClick={() => { if (hourEvents.length === 0 && onSlotClick) onSlotClick(cursor, h); }}
              onMouseEnter={e => { if (onSlotClick && hourEvents.length === 0) e.currentTarget.style.background = '#FDF3E8'; }}
              onMouseLeave={e => { if (onSlotClick) e.currentTarget.style.background = 'transparent'; }}>
              <div className="w-16 flex-shrink-0 flex items-start justify-center pt-2 text-xs" style={{ color: T.muted }}>{String(h).padStart(2,'0')}:00</div>
              <div className="flex-1 min-h-[56px] p-1 space-y-1">
                {hourEvents.map(ev => (
                  <div key={ev.id} onClick={e => { e.stopPropagation(); onEventClick(ev); }}
                    className="px-3 py-2 rounded-lg cursor-pointer"
                    style={{ background: EVENT_COLORS[ev.type] ?? '#888', color: '#FFF' }}>
                    <p className="text-sm font-semibold">{ev.title}</p>
                    <p className="text-xs opacity-80">{formatTime(new Date(ev.startDate))} → {formatTime(new Date(ev.endDate))}</p>
                    {ev.location && <p className="text-xs opacity-80">📍 {ev.location}</p>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Year View ─────────────────────────────────────────────────────────────────

function YearView({ cursor, events, leaves, ltypes, onMonthClick }: {
  cursor: Date; events: CalendarEvent[]; leaves: LeaveRequest[]; ltypes: LeaveType[];
  onMonthClick: (d: Date) => void;
}) {
  const year = cursor.getFullYear();
  const today = new Date();

  return (
    <div className="grid grid-cols-3 gap-4 xl:grid-cols-4">
      {MONTHS_FR.map((monthName, mi) => {
        const firstDay = new Date(year, mi, 1);
        const lastDay  = new Date(year, mi + 1, 0);
        const startDow = (firstDay.getDay() + 6) % 7;
        const cells: (number | null)[] = [
          ...Array(startDow).fill(null),
          ...Array.from({ length: lastDay.getDate() }, (_, i) => i + 1),
        ];
        while (cells.length % 7 !== 0) cells.push(null);

        return (
          <div key={mi} onClick={() => onMonthClick(new Date(year, mi, 1))}
            className="rounded-xl p-3 cursor-pointer transition-all"
            style={{ background: '#FFF', border: `1px solid ${T.border}` }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = T.copper)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}>
            <p className="text-xs font-bold text-center mb-2" style={{ color: T.dark }}>{monthName}</p>
            <div className="grid grid-cols-7 gap-px">
              {['L','M','M','J','V','S','D'].map((d, i) => (
                <div key={i} className="text-center" style={{ fontSize: 8, color: T.muted }}>{d}</div>
              ))}
              {cells.map((day, i) => {
                if (!day) return <div key={i} />;
                const d = new Date(year, mi, day);
                const hasEv = events.some(e => sameDay(new Date(e.startDate), d));
                const hasLv = leaves.some(l => {
                  const s = new Date(l.startDate); const en = new Date(l.endDate);
                  return d >= s && d <= en && l.status !== 'REJECTED';
                });
                const isToday = sameDay(d, today);
                return (
                  <div key={i} className="flex items-center justify-center" style={{ height: 18 }}>
                    <div className="relative flex items-center justify-center rounded-full"
                      style={{ width: 16, height: 16, background: isToday ? T.copper : hasLv ? '#E0F7E9' : 'transparent', fontSize: 9, color: isToday ? '#FFF' : T.dark }}>
                      {day}
                      {hasEv && !isToday && <span className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full" style={{ background: T.copper }} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
