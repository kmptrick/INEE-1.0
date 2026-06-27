'use client';
import { useState } from 'react';
import {
  comptabilite, PaysCompta, TypeEntite,
  ClassificationResult, TvaResult, FranchiseResult, AuditResult, RegimeResult, DepotResult,
} from '@/lib/api';
import { FormField, inputClass, selectClass, T } from '@/components/FormField';
import { PageHeader } from '@/components/PageShell';

const PAYS: { value: PaysCompta; label: string }[] = [
  { value: 'LU', label: '🇱🇺 Luxembourg' },
  { value: 'BE', label: '🇧🇪 Belgique' },
  { value: 'FR', label: '🇫🇷 France' },
  { value: 'DE', label: '🇩🇪 Allemagne' },
];

const TYPES: { value: TypeEntite; label: string }[] = [
  { value: 'SOCIETE_CAPITAUX', label: 'Société de capitaux (SARL, SA, GmbH…)' },
  { value: 'SOCIETE_PERSONNES', label: 'Société de personnes (SENC, SCS…)' },
  { value: 'PERSONNE_PHYSIQUE', label: 'Indépendant / personne physique' },
  { value: 'PROFESSION_LIBERALE', label: 'Profession libérale' },
  { value: 'ASSOCIATION', label: 'Association / ASBL' },
];

const fmt = (n: number) => new Intl.NumberFormat('fr-LU', { style: 'currency', currency: 'EUR' }).format(n);

const BADGE: Record<string, string> = { micro: '#0EA5E9', petite: '#10B981', moyenne: '#F59E0B', grande: '#DC2626' };

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-4" style={{ borderColor: T.border, background: T.card }}>
      <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: T.copper }}>{title}</p>
      {children}
    </div>
  );
}

function Row({ k, v, strong }: { k: string; v: React.ReactNode; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-4 py-1 text-sm">
      <span style={{ color: T.muted }}>{k}</span>
      <span className="text-right" style={{ color: T.dark, fontWeight: strong ? 700 : 500 }}>{v}</span>
    </div>
  );
}

function YesNo({ ok, yes, no }: { ok: boolean; yes: string; no: string }) {
  return (
    <span className="px-2 py-0.5 rounded-md text-xs font-bold" style={{
      color: ok ? '#065F46' : '#7A6050',
      background: ok ? '#D1FAE5' : '#F2EBE4',
    }}>{ok ? yes : no}</span>
  );
}

export default function ComptabilitePage() {
  const [pays, setPays] = useState<PaysCompta>('LU');
  const [typeEntite, setTypeEntite] = useState<TypeEntite>('SOCIETE_CAPITAUX');
  const [bilan, setBilan] = useState('500000');
  const [ca, setCa] = useState('1200000');
  const [effectif, setEffectif] = useState('8');
  const [benefice, setBenefice] = useState('60000');
  const [montantHT, setMontantHT] = useState('1000');
  const [typeActivite, setTypeActivite] = useState<'VENTE' | 'SERVICES'>('SERVICES');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [res, setRes] = useState<{
    classification: ClassificationResult; regime: RegimeResult; tva: TvaResult;
    franchise: FranchiseResult; audit: AuditResult; depot: DepotResult;
  } | null>(null);

  const calculer = async () => {
    setLoading(true); setError(null);
    try {
      const b = parseFloat(bilan) || 0, c = parseFloat(ca) || 0, e = parseFloat(effectif) || 0;
      const [classification, regime, tva, franchise, audit, depot] = await Promise.all([
        comptabilite.classification({ pays, bilan: b, ca: c, effectif: e }),
        comptabilite.regime({ pays, typeEntite, ca: c, beneficeAnnuel: parseFloat(benefice) || 0 }),
        comptabilite.tva({ pays, montantHT: parseFloat(montantHT) || 0 }),
        comptabilite.franchise({ pays, ca: c, typeActivite }),
        comptabilite.audit({ pays, bilan: b, ca: c, effectif: e }),
        comptabilite.depot({ pays, bilan: b, ca: c, effectif: e }),
      ]);
      setRes({ classification, regime, tva, franchise, audit, depot });
    } catch (err: any) {
      setError(err?.message || 'Erreur de calcul');
    } finally { setLoading(false); }
  };

  return (
    <div className="p-6">
      <PageHeader title="Comptabilité — calculateur LU / BE / FR / DE" />
      <p className="text-sm mb-5" style={{ color: T.muted }}>
        Détermine la catégorie de taille, le régime comptable, la TVA, l’éligibilité à la franchise,
        l’audit légal et les obligations de dépôt selon le pays et le type d’entité.
      </p>

      <div className="grid gap-6" style={{ gridTemplateColumns: 'minmax(300px, 380px) minmax(0,1fr)' }}>
        {/* ── Formulaire ── */}
        <div className="rounded-xl border p-5 space-y-4 self-start" style={{ borderColor: T.border, background: T.card }}>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Pays">
              <select className={selectClass} value={pays} onChange={e => setPays(e.target.value as PaysCompta)}>
                {PAYS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </FormField>
            <FormField label="Type d'entité">
              <select className={selectClass} value={typeEntite} onChange={e => setTypeEntite(e.target.value as TypeEntite)}>
                {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </FormField>
          </div>

          <FormField label="Total bilan (€)">
            <input type="number" min="0" className={inputClass} value={bilan} onChange={e => setBilan(e.target.value)} />
          </FormField>
          <FormField label="Chiffre d'affaires net HT (€)">
            <input type="number" min="0" className={inputClass} value={ca} onChange={e => setCa(e.target.value)} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Effectif moyen">
              <input type="number" min="0" className={inputClass} value={effectif} onChange={e => setEffectif(e.target.value)} />
            </FormField>
            <FormField label="Bénéfice annuel (€) — DE">
              <input type="number" className={inputClass} value={benefice} onChange={e => setBenefice(e.target.value)} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Montant HT à taxer (€)">
              <input type="number" min="0" className={inputClass} value={montantHT} onChange={e => setMontantHT(e.target.value)} />
            </FormField>
            <FormField label="Activité (franchise FR)">
              <select className={selectClass} value={typeActivite} onChange={e => setTypeActivite(e.target.value as 'VENTE' | 'SERVICES')}>
                <option value="SERVICES">Services / BNC</option>
                <option value="VENTE">Vente de marchandises</option>
              </select>
            </FormField>
          </div>

          <button onClick={calculer} disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
            style={{ background: loading ? T.copperHover : T.copper }}>
            {loading ? 'Calcul…' : 'Calculer'}
          </button>
          {error && <p className="text-xs" style={{ color: '#DC2626' }}>{error}</p>}
        </div>

        {/* ── Résultats ── */}
        <div className="space-y-4">
          {!res && !loading && (
            <div className="rounded-xl border border-dashed p-10 text-center text-sm" style={{ borderColor: T.border, color: T.muted }}>
              Renseignez les paramètres puis cliquez sur <strong>Calculer</strong>.
            </div>
          )}

          {res && (
            <>
              <Card title="Classification de taille">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 rounded-lg text-sm font-bold text-white"
                    style={{ background: BADGE[res.classification.categorie] }}>
                    {res.classification.libelleCategorie}
                  </span>
                </div>
                {res.classification.criteres.map(cr => (
                  <Row key={cr.critere}
                    k={cr.critere === 'ca' ? 'Chiffre d\'affaires' : cr.critere === 'bilan' ? 'Total bilan' : 'Effectif'}
                    v={<span style={{ color: cr.depasse ? '#DC2626' : T.dark }}>
                      {cr.critere === 'effectif' ? cr.valeur : fmt(cr.valeur)}
                      {cr.seuil !== null && <span style={{ color: T.muted }}> / {cr.critere === 'effectif' ? cr.seuil : fmt(cr.seuil)}</span>}
                      {cr.depasse ? ' ⚠' : ' ✓'}
                    </span>} />
                ))}
                <p className="text-xs mt-2" style={{ color: T.muted }}>{res.classification.regle}</p>
              </Card>

              <Card title="Régime comptable">
                <Row k="Régime" v={res.regime.regime.replace(/_/g, ' ')} strong />
                <Row k="Partie double" v={<YesNo ok={res.regime.partieDouble} yes="Oui" no="Non" />} />
                <p className="text-xs mt-2" style={{ color: T.muted }}>{res.regime.raison}</p>
              </Card>

              <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                <Card title="TVA">
                  <Row k="Taux appliqué" v={`${res.tva.taux} %`} strong />
                  <Row k="Montant HT" v={fmt(res.tva.montantHT)} />
                  <Row k="TVA" v={fmt(res.tva.montantTva)} />
                  <Row k="Total TTC" v={fmt(res.tva.montantTTC)} strong />
                </Card>

                <Card title="Franchise de TVA">
                  <Row k="Seuil national" v={fmt(res.franchise.seuil)} />
                  <Row k="Éligible (national)" v={<YesNo ok={res.franchise.eligible} yes="Oui" no="Non" />} />
                  <Row k="Régime UE (≤100k)" v={<YesNo ok={res.franchise.regimeUe.eligibleUe} yes="Oui" no="Non" />} />
                  <p className="text-xs mt-2" style={{ color: T.muted }}>{res.franchise.detail}</p>
                </Card>
              </div>

              <Card title="Audit légal">
                <Row k="Audit obligatoire" v={<YesNo ok={res.audit.obligatoire} yes="Oui" no="Non" />} strong />
                <Row k="Auditeur" v={res.audit.auditeur} />
                <p className="text-xs mt-2" style={{ color: T.muted }}>{res.audit.raison}</p>
              </Card>

              <Card title="Dépôt des comptes">
                <Row k="Destinataire" v={res.depot.destinataire} />
                <Row k="Format" v={res.depot.formatElectronique} />
                <Row k="Délai" v={res.depot.delai} />
                {res.depot.schema && <p className="text-xs mt-2" style={{ color: T.muted }}>{res.depot.schema}</p>}
              </Card>

              <p className="text-xs italic" style={{ color: T.muted }}>
                ⚠️ Calculs de cadrage (situation 2025-2026). À reconfirmer sur source officielle — les taux
                et seuils évoluent en loi de finances annuelle.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
