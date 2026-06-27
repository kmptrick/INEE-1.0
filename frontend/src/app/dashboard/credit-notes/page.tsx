'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { creditNotes, invoicing, companies, CreditNote, Invoice, Company, Service } from '@/lib/api';
import { Modal } from '@/components/Modal';
import { HistoryPanel } from '@/components/HistoryPanel';
import { SendModal, SendType, SendLang } from '@/components/SendModal';
import { FormField, inputClass, selectClass, T } from '@/components/FormField';
import { PageHeader, AddButton, FilterBar, DataTable, Td, StatusBadge, FormActions, usePagination, useSort, TableFooter, useSegmentFilter, SegmentFilterBar, FilterRuleDef } from '@/components/PageShell';
import { ServicePicker } from '@/components/ServicePicker';

const STATUS_ST: Record<string, { bg: string; color: string }> = {
  DRAFT:     { bg: '#F5F5F5', color: '#666'    },
  ISSUED:    { bg: '#EFF6FF', color: '#1D6FD8' },
  CANCELLED: { bg: '#FEF2F2', color: '#DC2626' },
};
const STATUS_FR: Record<string, string> = { DRAFT: 'Brouillon', ISSUED: 'Émise', CANCELLED: 'Annulée' };
const FILTERS = [
  { value: '',          label: 'Toutes'    },
  { value: 'DRAFT',     label: 'Brouillon' },
  { value: 'ISSUED',    label: 'Émises'    },
  { value: 'CANCELLED', label: 'Annulées'  },
];

const fmt = (n: number) => new Intl.NumberFormat('fr-LU', { style: 'currency', currency: 'EUR' }).format(n);

const SEGMENT_DEFS: FilterRuleDef[] = [
  { key: 'number',    label: 'Numéro',          dataType: 'text',   getValue: (cn) => cn.number },
  { key: 'invoice',   label: 'Facture liée',    dataType: 'text',   getValue: (cn) => cn.invoice?.number ?? '' },
  { key: 'company',   label: 'Client',          dataType: 'text',   getValue: (cn) => cn.company?.name ?? '' },
  { key: 'total',     label: 'Montant TTC (€)', dataType: 'number', getValue: (cn) => String(cn.total) },
  { key: 'createdAt', label: 'Date de création', dataType: 'date',  getValue: (cn) => cn.createdAt?.slice(0, 10) ?? '' },
];

type LineForm = { serviceId: string; description: string; quantity: string; unitPrice: string; unite: string; discountRate: string; lineVatRate: string; };
const emptyLine = (): LineForm => ({ serviceId: '', description: '', quantity: '1', unitPrice: '', unite: '', discountRate: '', lineVatRate: '' });
const emptyForm = (invoiceId = '', invoiceNumber = '', companyId = '') => ({
  invoiceId, invoiceNumber, companyId, vatRate: '17', vatMention: '', notes: '', remarque: '', lines: [emptyLine()],
});
const lineTotal = (l: LineForm) => { const q=parseFloat(l.quantity)||0; const p=parseFloat(l.unitPrice)||0; const d=parseFloat(l.discountRate)||0; return q*p*(1-d/100); };
function calcVatGroups(lines: LineForm[], defaultVatRate: number) {
  const groups: Record<string, number> = {};
  let subtotal = 0;
  for (const l of lines) {
    const lt = lineTotal(l);
    subtotal += lt;
    const rate = String(parseFloat(l.lineVatRate) || defaultVatRate);
    groups[rate] = (groups[rate] || 0) + lt;
  }
  subtotal = Math.round(subtotal * 100) / 100;
  const vatTotal = Math.round(Object.entries(groups).reduce((s,[r,b])=>s+b*Number(r)/100,0)*100)/100;
  return { subtotal, vatGroups: groups, vatTotal, total: Math.round((subtotal+vatTotal)*100)/100 };
}

function ActionBtn({ label, color, bg, border, onClick, disabled }: { label: string; color: string; bg: string; border: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
      style={{ color, background: bg, border: `1px solid ${border}`, opacity: disabled ? 0.5 : 1 }}>
      {label}
    </button>
  );
}

function CreditNotesContent() {
  const params = useSearchParams();
  const prefillInvoiceId = params.get('invoiceId') ?? '';
  const prefillInvoiceNumber = params.get('invoiceNumber') ?? '';

  const [list, setList] = useState<CreditNote[]>([]);
  const [invoiceList, setInvoiceList] = useState<Invoice[]>([]);
  const [compList, setCompList] = useState<Company[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [editingCN, setEditingCN] = useState<CreditNote | null>(null);
  const [form, setForm] = useState(emptyForm(prefillInvoiceId, prefillInvoiceNumber));
  const [saving, setSaving] = useState(false);
  const [viewItem, setViewItem] = useState<CreditNote | null>(null);
  const [actioning, setActioning] = useState(false);
  const [fullCNs, setFullCNs] = useState<Record<string, CreditNote>>({});
  const { sort, toggle: sortToggle, sorted } = useSort(list);
  const { search, setSearch, rules, addRule, removeRule, updateRule, clearRules, clearAll, filtered, activeCount } = useSegmentFilter(sorted, SEGMENT_DEFS);
  const pagination = usePagination(filtered);

  const load = (s?: string) => {
    setLoading(true);
    creditNotes.list(s || undefined).then(setList).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    invoicing.invoices.list().then(setInvoiceList);
    companies.list().then(setCompList);
    if (prefillInvoiceId) setOpen(true);
  }, []);

  // Auto-remplir le client quand on arrive depuis une facture
  useEffect(() => {
    if (prefillInvoiceId && invoiceList.length > 0) {
      onInvoiceChange(prefillInvoiceId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceList]);

  useEffect(() => {
    list.forEach(cn => {
      if (!fullCNs[cn.id]) creditNotes.get(cn.id).then(full => setFullCNs(p => ({ ...p, [cn.id]: full })));
    });
  }, [list]);

  const openView = (cn: CreditNote) => setViewItem(fullCNs[cn.id] ?? cn);

  const updateStatus = async (cn: CreditNote, status: string) => {
    setActioning(true);
    try {
      const updated = await creditNotes.update(cn.id, { status });
      setFullCNs(p => ({ ...p, [cn.id]: updated }));
      setViewItem(updated);
      load(filter || undefined);
    } finally { setActioning(false); }
  };

  const setField = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const setLine = (i: number, k: string, v: string) => setForm(f => { const l = [...f.lines]; l[i] = { ...l[i], [k]: v }; return { ...f, lines: l }; });
  const addLine = () => setForm(f => ({ ...f, lines: [...f.lines, emptyLine()] }));
  const removeLine = (i: number) => setForm(f => ({ ...f, lines: f.lines.filter((_, idx) => idx !== i) }));

  const onInvoiceChange = async (invoiceId: string) => {
    const inv = invoiceList.find(i => i.id === invoiceId);
    // Charger les lignes complètes de la facture
    let invoiceLines: LineForm[] = [emptyLine()];
    if (invoiceId) {
      try {
        const full = await invoicing.invoices.get(invoiceId);
        if (full.lines && full.lines.length > 0) {
          invoiceLines = full.lines.map(l => ({
            serviceId: l.serviceId ?? '',
            description: l.description,
            quantity: String(l.quantity),
            unitPrice: String(l.unitPrice),
            unite: l.unite ?? '',
            discountRate: l.discountRate ? String(l.discountRate) : '',
            lineVatRate: l.lineVatRate ? String(l.lineVatRate) : '',
          }));
        }
      } catch {}
    }
    setForm(f => ({
      ...f,
      invoiceId,
      invoiceNumber: inv?.number ?? '',
      companyId: inv?.company?.id ?? f.companyId,
      vatRate: String(inv?.vatRate ?? 17),
      vatMention: inv?.vatMention ?? '',
      lines: invoiceLines,
    }));
  };

  const pickService = (i: number, s: Service) => {
    setLine(i, 'serviceId', s.id);
    setLine(i, 'description', s.description);
    setLine(i, 'unitPrice', String(s.prixHT));
    setLine(i, 'unite', s.unite ?? '');
  };

  const _cnTotals = (() => {
    if (!open) return { subtotal: 0, vatGroups: {} as Record<string, number>, vatTotal: 0, total: 0 };
    try { return calcVatGroups(form.lines, parseFloat(form.vatRate) || 17); }
    catch { return { subtotal: 0, vatGroups: {} as Record<string, number>, vatTotal: 0, total: 0 }; }
  })();
  const { subtotal, vatGroups, vatTotal, total } = _cnTotals;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const data: any = {
        invoiceId: form.invoiceId,
        vatRate: parseFloat(form.vatRate) || 0,
        vatMention: form.vatMention || undefined,
        notes: form.notes || undefined,
        lines: form.lines.map(l => ({
          ...(l.serviceId ? { serviceId: l.serviceId } : {}),
          description: l.description, quantity: parseFloat(l.quantity) || 1,
          unitPrice: parseFloat(l.unitPrice) || 0,
          ...(l.unite ? { unite: l.unite } : {}),
          ...(l.discountRate ? { discountRate: parseFloat(l.discountRate) } : {}),
          ...(l.lineVatRate ? { lineVatRate: parseFloat(l.lineVatRate) } : {}),
        })),
      };
      if (form.companyId) data.companyId = form.companyId;
      if (editingCN) {
        await creditNotes.update(editingCN.id, data);
        setEditingCN(null);
      } else {
        await creditNotes.create(data);
      }
      setOpen(false);
      setForm(emptyForm());
      load(filter || undefined);
    } finally { setSaving(false); }
  };

  return (
    <div className="p-6">
      <PageHeader title="Notes de crédit" action={<AddButton onClick={() => { setForm(emptyForm()); setOpen(true); }} />} />
      <FilterBar filters={FILTERS} active={filter} onChange={v => { setFilter(v); load(v || undefined); }} />
      <SegmentFilterBar search={search} onSearch={setSearch} placeholder="Rechercher une note de crédit..." defs={SEGMENT_DEFS} rules={rules} addRule={addRule} removeRule={removeRule} updateRule={updateRule} clearRules={clearRules} clearAll={clearAll} activeCount={activeCount} />

      <DataTable loading={loading} empty="Aucune note de crédit" sort={sort} onSort={sortToggle}
        headers={[
          { label: 'Numéro', key: 'number' }, { label: 'Facture liée' }, { label: 'Client' },
          { label: 'HT', key: 'subtotal', align: 'right' }, { label: 'TVA', align: 'right' }, { label: 'TTC', key: 'total', align: 'right' },
          { label: 'Création', key: 'createdAt' },
          { label: 'Statut', key: 'status', align: 'center' },
        ]}>
        {pagination.paged.map((cn, i) => {
          const ss = STATUS_ST[cn.status] ?? { bg: '#F5F5F5', color: '#888' };
          return (
            <tr key={cn.id} onClick={() => openView(cn)}
              style={{ borderTop: i > 0 ? `1px solid ${T.rowDiv}` : undefined, cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.background = T.copperBg)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: T.dark }}>{cn.number}</td>
              <td className="px-4 py-3 font-mono text-xs" style={{ color: T.muted }}>{cn.invoice?.number ?? '—'}</td>
              <Td>{cn.company?.name ?? '—'}</Td>
              <td className="px-4 py-3 text-right text-sm" style={{ color: T.dark }}>{fmt(cn.subtotal)}</td>
              <td className="px-4 py-3 text-right text-sm" style={{ color: T.muted }}>{fmt(cn.vatAmount)}</td>
              <td className="px-4 py-3 text-right text-sm font-bold" style={{ color: T.dark }}>{fmt(cn.total)}</td>
              <Td>{cn.createdAt ? new Date(cn.createdAt).toLocaleDateString('fr-LU') : '—'}</Td>
              <td className="px-4 py-3 text-center"><StatusBadge label={STATUS_FR[cn.status] ?? cn.status} bg={ss.bg} color={ss.color} /></td>
            </tr>
          );
        })}
      </DataTable>
      <TableFooter pagination={pagination} export={{ getData: () => filtered.map(cn => ({ Numéro: cn.number, 'Facture liée': cn.invoice?.number ?? '', Client: cn.company?.name ?? '', 'HT (€)': cn.subtotal, 'TVA (€)': cn.vatAmount, 'TTC (€)': cn.total, Statut: STATUS_FR[cn.status] ?? cn.status })), filename: 'notes-de-credit', title: 'Notes de crédit' }} />

      {/* ── Detail modal ── */}
      {viewItem && (
        <Modal title={`Note de crédit ${viewItem.number}`} open={!!viewItem} onClose={() => setViewItem(null)} wide>
          <div className="grid gap-6" style={{ gridTemplateColumns: 'minmax(0,1fr) 260px' }}>
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 pb-3" style={{ borderBottom: `1px solid ${T.border}` }}>
              {(() => { const ss = STATUS_ST[viewItem.status] ?? { bg: '#F5F5F5', color: '#888' }; return <StatusBadge label={STATUS_FR[viewItem.status] ?? viewItem.status} bg={ss.bg} color={ss.color} />; })()}
              <div className="flex flex-wrap gap-2 ml-auto">
                {viewItem.status === 'DRAFT' && (
                  <ActionBtn label="✎ Modifier" color={T.copper} bg={T.head} border={T.border}
                    onClick={() => {
                      const full = fullCNs[viewItem.id] ?? viewItem;
                      setViewItem(null);
                      setForm({
                        invoiceId: (full as any).invoiceId ?? '',
                        invoiceNumber: full.invoice?.number ?? '',
                        companyId: full.company?.id ?? '',
                        vatRate: String(full.vatRate),
                        vatMention: full.vatMention ?? '',
                        notes: full.notes ?? '',
                        remarque: '',
                        lines: (full.lines ?? []).map((l: any) => ({
                          serviceId: l.serviceId ?? '',
                          description: l.description,
                          quantity: String(l.quantity),
                          unitPrice: String(l.unitPrice),
                          unite: l.unite ?? '',
                          discountRate: l.discountRate ? String(l.discountRate) : '',
                          lineVatRate: l.lineVatRate ? String(l.lineVatRate) : '',
                        })),
                      });
                      setEditingCN(full);
                      setOpen(true);
                    }}
                    disabled={actioning} />
                )}
                {viewItem.status === 'DRAFT' && (
                  <ActionBtn label="Émettre" color="#1D6FD8" bg="#EFF6FF" border="#BFDBFE" onClick={() => updateStatus(viewItem, 'ISSUED')} disabled={actioning} />
                )}
                {viewItem.status === 'ISSUED' && (
                  <ActionBtn label="📧 Envoyer" color="#16A34A" bg="#F0FDF4" border="#BBF7D0"
                    onClick={() => setSendModalOpen(true)}
                    disabled={actioning} />
                )}
                {viewItem.status !== 'CANCELLED' && (
                  <ActionBtn label="Annuler" color={T.muted} bg="#F5F5F5" border={T.border} onClick={() => updateStatus(viewItem, 'CANCELLED')} disabled={actioning} />
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
              <div><span style={{ color: T.muted }}>Client : </span><span className="font-semibold" style={{ color: T.dark }}>{viewItem.company?.name ?? '—'}</span></div>
              <div><span style={{ color: T.muted }}>Facture : </span><span className="font-semibold font-mono" style={{ color: T.dark }}>{viewItem.invoice?.number ?? '—'}</span></div>
              <div><span style={{ color: T.muted }}>TVA : </span><span className="font-semibold" style={{ color: T.dark }}>{viewItem.vatRate}%</span></div>
            </div>

            {(viewItem.lines ?? []).length > 0 && (
              <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${T.border}` }}>
                <table className="w-full text-xs">
                  <thead style={{ background: T.head }}>
                    <tr>
                      <th className="text-left px-3 py-2 font-semibold" style={{ color: T.muted }}>Description</th>
                      <th className="text-center px-3 py-2 font-semibold" style={{ color: T.muted }}>Qté</th>
                      <th className="text-right px-3 py-2 font-semibold" style={{ color: T.muted }}>Prix HT</th>
                      <th className="text-right px-3 py-2 font-semibold" style={{ color: T.muted }}>Total HT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewItem.lines!.map((l, i) => (
                      <tr key={i} style={{ borderTop: `1px solid ${T.rowDiv}` }}>
                        <td className="px-3 py-2" style={{ color: T.dark }}>{l.description}</td>
                        <td className="px-3 py-2 text-center" style={{ color: T.muted }}>{l.quantity}</td>
                        <td className="px-3 py-2 text-right" style={{ color: T.muted }}>{fmt(l.unitPrice)}</td>
                        <td className="px-3 py-2 text-right font-semibold" style={{ color: T.dark }}>{fmt(l.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end">
              <div className="w-52 space-y-1 text-sm">
                <div className="flex justify-between"><span style={{ color: T.muted }}>HT</span><span style={{ color: T.dark }}>{fmt(viewItem.subtotal)}</span></div>
                <div className="flex justify-between"><span style={{ color: T.muted }}>TVA {viewItem.vatRate}%</span><span style={{ color: T.muted }}>{fmt(viewItem.vatAmount)}</span></div>
                <div className="flex justify-between font-bold pt-1" style={{ borderTop: `1px solid ${T.border}`, color: '#7C3AED' }}>
                  <span>Total NC</span><span>− {fmt(viewItem.total)}</span>
                </div>
              </div>
            </div>

            {viewItem.vatMention && (
              <div className="rounded-lg px-3 py-2 text-xs" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                <span className="font-semibold" style={{ color: '#92400E' }}>Mention légale TVA : </span>
                <span style={{ color: '#78350F' }}>{viewItem.vatMention}</span>
              </div>
            )}
            {viewItem.notes && <p className="text-xs italic" style={{ color: T.muted }}>{viewItem.notes}</p>}
          </div>
          <HistoryPanel entityType="CreditNote" entityId={viewItem.id} />
          </div>
        </Modal>
      )}

      {/* ── Modal d'envoi NC ── */}
      {viewItem && sendModalOpen && (
        <SendModal
          open={sendModalOpen}
          onClose={() => setSendModalOpen(false)}
          title={`Envoyer la note de crédit ${viewItem.number}`}
          onSend={async (_type: SendType, _lang: SendLang) => {
            await creditNotes.send(viewItem.id);
            setSendModalOpen(false);
          }}
        />
      )}

      {/* ── Nouvelle note de crédit ── */}
      <Modal title={editingCN ? `Modifier la note de crédit ${editingCN.number}` : 'Nouvelle note de crédit'} open={open} onClose={() => { setOpen(false); setEditingCN(null); setForm(emptyForm()); }} wide>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Facture liée" required>
            <select className={selectClass} value={form.invoiceId} onChange={e => onInvoiceChange(e.target.value)} required>
              <option value="">— Sélectionner une facture —</option>
              {invoiceList.map(inv => (
                <option key={inv.id} value={inv.id}>{inv.number}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Client">
            <select className={selectClass} value={form.companyId} onChange={e => setField('companyId', e.target.value)}>
              <option value="">— Aucun (hérité de la facture) —</option>
              {compList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FormField>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#6B4C35' }}>Lignes à créditer</label>
              <button type="button" onClick={addLine} className="text-xs font-semibold" style={{ color: T.copper }}>+ Ajouter ligne</button>
            </div>
            <div className="space-y-2">
              {form.lines.map((l, i) => (
                <div key={i} className="rounded-lg p-3 space-y-2" style={{ background: T.head, border: `1px solid ${T.border}` }}>
                  <div className="grid gap-2 items-center" style={{ gridTemplateColumns: '32px 1fr 64px 88px 24px' }}>
                    <ServicePicker onSelect={s => pickService(i, s)} />
                    <input placeholder="Description" className={inputClass} value={l.description} readOnly />
                    <input type="number" min="0" step="0.01" placeholder="Qté" className={inputClass} value={l.quantity} onChange={e => setLine(i, 'quantity', e.target.value)} />
                    <input type="number" min="0" step="0.01" placeholder="Prix HT" className={inputClass} value={l.unitPrice} onChange={e => setLine(i, 'unitPrice', e.target.value)} required />
                    {form.lines.length > 1 && <button type="button" onClick={() => removeLine(i)} className="text-lg leading-none cursor-pointer" style={{ color: '#CCC' }}>✕</button>}
                  </div>
                  <div className="grid gap-2" style={{ gridTemplateColumns: '90px 90px 1fr' }}>
                    <div>
                      <label className="block text-xs mb-0.5" style={{ color: T.muted }}>TVA %</label>
                      <select className={inputClass} value={l.lineVatRate} onChange={e => setLine(i, 'lineVatRate', e.target.value)}>
                        <option value="">17% — Défaut</option>
                        {[3,8,14,17].map(r => <option key={r} value={r}>{r}%</option>)}
                        <option value="0">0%</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs mb-0.5" style={{ color: T.muted }}>Remise %</label>
                      <input type="number" min="0" max="100" step="0.1" placeholder="0" className={inputClass} value={l.discountRate} onChange={e => setLine(i, 'discountRate', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs mb-0.5" style={{ color: T.muted }}>Complément</label>
                      <input placeholder="ex: mensuel, par dossier…" className={inputClass} value={l.unite} onChange={e => setLine(i, 'unite', e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totaux multi-TVA */}
          <div className="rounded-xl p-4 space-y-1.5 text-sm" style={{ background: T.head, border: `1px solid ${T.border}` }}>
            <div className="flex justify-between"><span style={{ color: T.muted }}>Sous-total HT</span><span style={{ color: T.dark }}>{fmt(subtotal)}</span></div>
            {Object.entries(vatGroups).sort((a, b) => Number(a[0]) - Number(b[0])).map(([rate, base]) => (
              <div key={rate} className="flex justify-between"><span style={{ color: T.muted }}>TVA {rate}%</span><span style={{ color: T.dark }}>{fmt(Math.round(base * Number(rate) / 100 * 100) / 100)}</span></div>
            ))}
            <div className="flex justify-between font-bold text-base pt-1" style={{ borderTop:`1px solid ${T.border}`, color:'#7C3AED' }}>
              <span>Total NC (à déduire)</span><span>− {fmt(total)}</span>
            </div>
          </div>

          <FormField label="Notes"><textarea className={inputClass} rows={2} value={form.notes} onChange={e => setField('notes', e.target.value)} /></FormField>
          
          <FormActions onCancel={() => { setOpen(false); setEditingCN(null); setForm(emptyForm()); }} saving={saving} label="Enregistrer" />
        </form>
      </Modal>
    </div>
  );
}

export default function CreditNotesPage() {
  return (
    <Suspense>
      <CreditNotesContent />
    </Suspense>
  );
}