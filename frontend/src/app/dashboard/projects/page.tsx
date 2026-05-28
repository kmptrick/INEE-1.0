'use client';
import { useEffect, useState } from 'react';
import { projects, companies, Project, Task, Company } from '@/lib/api';
import { Modal } from '@/components/Modal';
import { FormField, inputClass, selectClass, T } from '@/components/FormField';
import { PageHeader, AddButton, FilterBar, FormActions } from '@/components/PageShell';

// ── Constants ────────────────────────────────────────────────────────────────

const PROJ_STATUS: Record<string, { label: string; bg: string; color: string }> = {
  ACTIVE:    { label: 'Actif',     bg: '#F0FDF4', color: '#16A34A' },
  ON_HOLD:   { label: 'En pause',  bg: '#FFF7ED', color: '#C2410C' },
  COMPLETED: { label: 'Terminé',   bg: '#EFF6FF', color: '#1D6FD8' },
  CANCELLED: { label: 'Annulé',    bg: '#F5F5F5', color: '#888'    },
};

const TASK_STATUS_COLS: { key: Task['status']; label: string; color: string }[] = [
  { key: 'TODO',        label: 'À faire',    color: '#6B7280' },
  { key: 'IN_PROGRESS', label: 'En cours',   color: '#C2410C' },
  { key: 'REVIEW',      label: 'Révision',   color: '#1D6FD8' },
  { key: 'DONE',        label: 'Terminé',    color: '#16A34A' },
];

const PRIORITY: Record<string, { label: string; bg: string; color: string }> = {
  LOW:    { label: 'Faible',  bg: '#F3F4F6', color: '#6B7280' },
  MEDIUM: { label: 'Normale', bg: '#EFF6FF', color: '#1D6FD8' },
  HIGH:   { label: 'Haute',   bg: '#FFF7ED', color: '#C2410C' },
  URGENT: { label: 'Urgente', bg: '#FEF2F2', color: '#DC2626' },
};

const PROJ_FILTERS = [
  { value: '',          label: 'Tous'       },
  { value: 'ACTIVE',    label: 'Actifs'     },
  { value: 'ON_HOLD',   label: 'En pause'   },
  { value: 'COMPLETED', label: 'Terminés'   },
];

const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString('fr-LU') : null;
const fmt = (n: number) => new Intl.NumberFormat('fr-LU', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

const emptyProjectForm = () => ({ name: '', description: '', status: 'ACTIVE', startDate: '', endDate: '', budget: '', companyId: '' });
const emptyTaskForm = () => ({ title: '', description: '', status: 'TODO' as Task['status'], priority: 'MEDIUM' as Task['priority'], dueDate: '' });

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const s = PROJ_STATUS[status] ?? { label: status, bg: '#F5F5F5', color: '#888' };
  return <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>{s.label}</span>;
}

function PriorityBadge({ priority }: { priority: string }) {
  const p = PRIORITY[priority] ?? PRIORITY.MEDIUM;
  return <span className="text-xs font-semibold px-1.5 py-0.5 rounded" style={{ background: p.bg, color: p.color }}>{p.label}</span>;
}

function TaskProgress({ tasks }: { tasks?: { status: string }[] }) {
  if (!tasks || tasks.length === 0) return <span className="text-xs" style={{ color: T.muted }}>0 tâche</span>;
  const done = tasks.filter(t => t.status === 'DONE').length;
  const pct = Math.round((done / tasks.length) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: T.border }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: pct === 100 ? '#16A34A' : T.copper }} />
      </div>
      <span className="text-xs font-semibold flex-shrink-0" style={{ color: T.muted }}>{done}/{tasks.length}</span>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ProjectsPage() {
  const [list, setList] = useState<Project[]>([]);
  const [compList, setCompList] = useState<Company[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Create project modal
  const [createOpen, setCreateOpen] = useState(false);
  const [projectForm, setProjectForm] = useState(emptyProjectForm());
  const [savingProject, setSavingProject] = useState(false);

  // Detail modal
  const [detail, setDetail] = useState<Project | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Task form (inside detail)
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [taskForm, setTaskForm] = useState(emptyTaskForm());
  const [savingTask, setSavingTask] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const load = (s?: string) => {
    setLoading(true);
    projects.list(s || undefined).then(setList).finally(() => setLoading(false));
  };
  useEffect(() => { load(); companies.list().then(setCompList); }, []);

  const openDetail = async (p: Project) => {
    setDetail(p);
    setDetailLoading(true);
    const full = await projects.get(p.id);
    setDetail(full);
    setDetailLoading(false);
  };

  const refreshDetail = async (id: string) => {
    const full = await projects.get(id);
    setDetail(full);
    setList(l => l.map(p => p.id === id ? { ...p, tasks: full.tasks, _count: full._count } : p));
  };

  // Project CRUD
  const setPF = (k: string, v: string) => setProjectForm(f => ({ ...f, [k]: v }));
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault(); setSavingProject(true);
    try {
      const data: any = { name: projectForm.name, status: projectForm.status };
      if (projectForm.description) data.description = projectForm.description;
      if (projectForm.startDate) data.startDate = projectForm.startDate;
      if (projectForm.endDate) data.endDate = projectForm.endDate;
      if (projectForm.budget) data.budget = parseFloat(projectForm.budget);
      if (projectForm.companyId) data.companyId = projectForm.companyId;
      await projects.create(data);
      setCreateOpen(false); setProjectForm(emptyProjectForm()); load(filter || undefined);
    } finally { setSavingProject(false); }
  };

  const updateProjectStatus = async (p: Project, status: string) => {
    await projects.update(p.id, { name: p.name, status } as any);
    load(filter || undefined);
    if (detail?.id === p.id) setDetail(d => d ? { ...d, status } : d);
  };

  // Task CRUD
  const setTF = (k: string, v: string) => setTaskForm(f => ({ ...f, [k]: v }));
  const openEditTask = (t: Task) => {
    setEditTask(t);
    setTaskForm({ title: t.title, description: t.description ?? '', status: t.status, priority: t.priority, dueDate: t.dueDate ? t.dueDate.slice(0, 10) : '' });
    setTaskFormOpen(true);
  };
  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault(); if (!detail) return; setSavingTask(true);
    try {
      const data: any = { title: taskForm.title, status: taskForm.status, priority: taskForm.priority };
      if (taskForm.description) data.description = taskForm.description;
      if (taskForm.dueDate) data.dueDate = taskForm.dueDate;
      if (editTask) await projects.tasks.update(detail.id, editTask.id, data);
      else await projects.tasks.create(detail.id, data);
      setTaskFormOpen(false); setTaskForm(emptyTaskForm()); setEditTask(null);
      await refreshDetail(detail.id);
    } finally { setSavingTask(false); }
  };
  const deleteTask = async (t: Task) => {
    if (!detail) return;
    await projects.tasks.delete(detail.id, t.id);
    await refreshDetail(detail.id);
  };
  const moveTask = async (t: Task, status: Task['status']) => {
    if (!detail) return;
    await projects.tasks.update(detail.id, t.id, { ...t, status } as any);
    await refreshDetail(detail.id);
  };

  return (
    <div className="p-6">
      <PageHeader title="Projets" action={<AddButton onClick={() => { setProjectForm(emptyProjectForm()); setCreateOpen(true); }} label="+ Nouveau projet" />} />
      <FilterBar filters={PROJ_FILTERS} active={filter} onChange={v => { setFilter(v); load(v || undefined); }} />

      {loading ? (
        <div className="text-center py-16 text-sm" style={{ color: T.muted }}>Chargement...</div>
      ) : list.length === 0 ? (
        <div className="text-center py-16 text-sm" style={{ color: T.muted }}>Aucun projet — cliquez sur «+ Nouveau projet»</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {list.map(p => {
            const s = PROJ_STATUS[p.status] ?? PROJ_STATUS.ACTIVE;
            return (
              <div key={p.id} onClick={() => openDetail(p)}
                className="rounded-2xl p-5 cursor-pointer transition-all"
                style={{ background: '#FFF', border: `1.5px solid ${T.border}`, boxShadow: '0 1px 4px rgba(26,16,8,0.06)' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = T.copper)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-sm leading-tight flex-1 mr-2" style={{ color: T.dark }}>{p.name}</h3>
                  <StatusBadge status={p.status} />
                </div>
                {/* Client */}
                {p.company && <p className="text-xs mb-2" style={{ color: T.muted }}>Client : <span className="font-semibold" style={{ color: T.dark }}>{p.company.name}</span></p>}
                {/* Description */}
                {p.description && <p className="text-xs mb-3 line-clamp-2" style={{ color: T.muted }}>{p.description}</p>}
                {/* Dates */}
                {(p.startDate || p.endDate) && (
                  <div className="flex gap-3 text-xs mb-3" style={{ color: T.muted }}>
                    {p.startDate && <span>Début : <strong style={{ color: T.dark }}>{fmtDate(p.startDate)}</strong></span>}
                    {p.endDate && <span>Fin : <strong style={{ color: p.endDate && new Date(p.endDate) < new Date() && p.status !== 'COMPLETED' ? '#DC2626' : T.dark }}>{fmtDate(p.endDate)}</strong></span>}
                  </div>
                )}
                {/* Budget */}
                {p.budget != null && p.budget > 0 && (
                  <p className="text-xs mb-3" style={{ color: T.muted }}>Budget : <span className="font-bold" style={{ color: T.copper }}>{fmt(p.budget)}</span></p>
                )}
                {/* Progress */}
                <TaskProgress tasks={p.tasks ?? []} />
              </div>
            );
          })}
        </div>
      )}

      {/* ── Nouveau projet ── */}
      <Modal title="Nouveau projet" open={createOpen} onClose={() => setCreateOpen(false)}>
        <form onSubmit={handleCreateProject} className="space-y-4">
          <FormField label="Nom du projet" required>
            <input className={inputClass} value={projectForm.name} onChange={e => setPF('name', e.target.value)} required placeholder="Refonte site web, Migration ERP..." />
          </FormField>
          <FormField label="Description">
            <textarea className={inputClass} rows={2} value={projectForm.description} onChange={e => setPF('description', e.target.value)} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Statut">
              <select className={selectClass} value={projectForm.status} onChange={e => setPF('status', e.target.value)}>
                <option value="ACTIVE">Actif</option>
                <option value="ON_HOLD">En pause</option>
                <option value="COMPLETED">Terminé</option>
                <option value="CANCELLED">Annulé</option>
              </select>
            </FormField>
            <FormField label="Client">
              <select className={selectClass} value={projectForm.companyId} onChange={e => setPF('companyId', e.target.value)}>
                <option value="">— Aucun —</option>
                {compList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Date de début"><input type="date" className={inputClass} value={projectForm.startDate} onChange={e => setPF('startDate', e.target.value)} /></FormField>
            <FormField label="Date de fin"><input type="date" className={inputClass} value={projectForm.endDate} onChange={e => setPF('endDate', e.target.value)} /></FormField>
          </div>
          <FormField label="Budget (€)">
            <input type="number" min="0" step="100" className={inputClass} value={projectForm.budget} onChange={e => setPF('budget', e.target.value)} placeholder="5000" />
          </FormField>
          <FormActions onCancel={() => setCreateOpen(false)} saving={savingProject} label="Créer le projet" />
        </form>
      </Modal>

      {/* ── Detail projet (kanban) ── */}
      {detail && (
        <Modal title={detail.name} open={!!detail} onClose={() => { setDetail(null); setTaskFormOpen(false); }} wide>
          <div className="space-y-4">
            {/* Header info */}
            <div className="flex flex-wrap items-center gap-3 pb-3" style={{ borderBottom: `1px solid ${T.border}` }}>
              <StatusBadge status={detail.status} />
              {detail.company && <span className="text-xs" style={{ color: T.muted }}>Client : <strong style={{ color: T.dark }}>{detail.company.name}</strong></span>}
              {detail.startDate && <span className="text-xs" style={{ color: T.muted }}>Début : <strong style={{ color: T.dark }}>{fmtDate(detail.startDate)}</strong></span>}
              {detail.endDate && <span className="text-xs" style={{ color: T.muted }}>Fin : <strong style={{ color: T.dark }}>{fmtDate(detail.endDate)}</strong></span>}
              {detail.budget != null && detail.budget > 0 && <span className="text-xs font-bold" style={{ color: T.copper }}>{fmt(detail.budget)}</span>}
              {/* Status change */}
              <div className="ml-auto flex gap-2">
                {detail.status !== 'ACTIVE'    && <button onClick={() => updateProjectStatus(detail, 'ACTIVE')}    className="text-xs px-2 py-1 rounded-lg border font-semibold" style={{ color: '#16A34A', borderColor: '#BBF7D0', background: '#F0FDF4' }}>Activer</button>}
                {detail.status !== 'ON_HOLD'   && <button onClick={() => updateProjectStatus(detail, 'ON_HOLD')}   className="text-xs px-2 py-1 rounded-lg border font-semibold" style={{ color: '#C2410C', borderColor: '#FED7AA', background: '#FFF7ED' }}>Pause</button>}
                {detail.status !== 'COMPLETED' && <button onClick={() => updateProjectStatus(detail, 'COMPLETED')} className="text-xs px-2 py-1 rounded-lg border font-semibold" style={{ color: '#1D6FD8', borderColor: '#BFDBFE', background: '#EFF6FF' }}>Terminer</button>}
              </div>
            </div>

            {detail.description && <p className="text-sm" style={{ color: T.muted }}>{detail.description}</p>}

            {/* Kanban */}
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: T.muted }}>Tâches</h3>
              <button onClick={() => { setEditTask(null); setTaskForm(emptyTaskForm()); setTaskFormOpen(true); }}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                style={{ color: '#FFF', background: T.copper }}>
                + Nouvelle tâche
              </button>
            </div>

            {detailLoading ? (
              <div className="py-8 text-center text-sm" style={{ color: T.muted }}>Chargement...</div>
            ) : (
              <div className="grid grid-cols-4 gap-3">
                {TASK_STATUS_COLS.map(col => {
                  const colTasks = (detail.tasks ?? []).filter(t => t.status === col.key);
                  return (
                    <div key={col.key} className="rounded-xl p-3 min-h-[120px]" style={{ background: '#F8F5F2' }}>
                      {/* Col header */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: col.color }}>{col.label}</span>
                        <span className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center" style={{ background: col.color, color: '#FFF' }}>{colTasks.length}</span>
                      </div>
                      {/* Tasks */}
                      <div className="space-y-2">
                        {colTasks.map(t => (
                          <div key={t.id} className="rounded-lg p-2.5 group relative" style={{ background: '#FFF', border: `1px solid ${T.border}`, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                            <div className="flex items-start justify-between gap-1 mb-1.5">
                              <p className="text-xs font-semibold leading-tight flex-1" style={{ color: T.dark }}>{t.title}</p>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                <button onClick={() => openEditTask(t)} className="text-xs" style={{ color: T.copper }}>✎</button>
                                <button onClick={() => deleteTask(t)} className="text-xs" style={{ color: '#DC2626' }}>✕</button>
                              </div>
                            </div>
                            <PriorityBadge priority={t.priority} />
                            {t.dueDate && <p className="text-xs mt-1.5" style={{ color: new Date(t.dueDate) < new Date() && t.status !== 'DONE' ? '#DC2626' : T.muted }}>📅 {fmtDate(t.dueDate)}</p>}
                            {t.assignedTo && <p className="text-xs mt-1" style={{ color: T.muted }}>👤 {t.assignedTo.firstName} {t.assignedTo.lastName}</p>}
                            {/* Move buttons */}
                            <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {col.key !== 'TODO'        && <button onClick={() => moveTask(t, 'TODO')}        className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#F3F4F6', color: '#6B7280' }}>← À faire</button>}
                              {col.key !== 'IN_PROGRESS' && <button onClick={() => moveTask(t, 'IN_PROGRESS')} className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#FFF7ED', color: '#C2410C' }}>En cours</button>}
                              {col.key !== 'REVIEW'      && <button onClick={() => moveTask(t, 'REVIEW')}      className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#EFF6FF', color: '#1D6FD8' }}>Révision</button>}
                              {col.key !== 'DONE'        && <button onClick={() => moveTask(t, 'DONE')}        className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#F0FDF4', color: '#16A34A' }}>Terminé →</button>}
                            </div>
                          </div>
                        ))}
                        {colTasks.length === 0 && <p className="text-xs text-center py-4" style={{ color: T.border }}>—</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Task form */}
            {taskFormOpen && (
              <div className="rounded-xl p-4 mt-2" style={{ background: T.head, border: `1px solid ${T.border}` }}>
                <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: T.muted }}>{editTask ? 'Modifier la tâche' : 'Nouvelle tâche'}</h4>
                <form onSubmit={handleSaveTask} className="space-y-3">
                  <FormField label="Titre" required>
                    <input className={inputClass} value={taskForm.title} onChange={e => setTF('title', e.target.value)} required autoFocus />
                  </FormField>
                  <div className="grid grid-cols-3 gap-3">
                    <FormField label="Statut">
                      <select className={selectClass} value={taskForm.status} onChange={e => setTF('status', e.target.value)}>
                        <option value="TODO">À faire</option>
                        <option value="IN_PROGRESS">En cours</option>
                        <option value="REVIEW">Révision</option>
                        <option value="DONE">Terminé</option>
                      </select>
                    </FormField>
                    <FormField label="Priorité">
                      <select className={selectClass} value={taskForm.priority} onChange={e => setTF('priority', e.target.value)}>
                        <option value="LOW">Faible</option>
                        <option value="MEDIUM">Normale</option>
                        <option value="HIGH">Haute</option>
                        <option value="URGENT">Urgente</option>
                      </select>
                    </FormField>
                    <FormField label="Échéance">
                      <input type="date" className={inputClass} value={taskForm.dueDate} onChange={e => setTF('dueDate', e.target.value)} />
                    </FormField>
                  </div>
                  <FormField label="Description">
                    <input className={inputClass} value={taskForm.description} onChange={e => setTF('description', e.target.value)} />
                  </FormField>
                  <FormActions onCancel={() => { setTaskFormOpen(false); setEditTask(null); }} saving={savingTask} label={editTask ? 'Enregistrer' : 'Ajouter'} />
                </form>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
