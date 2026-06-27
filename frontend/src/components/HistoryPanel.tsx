'use client';
import { useEffect, useState } from 'react';
import { auditLogs, AuditLog } from '@/lib/api';
import { T } from './FormField';

interface Props {
  entityType: string;
  entityId: string;
}

export function HistoryPanel({ entityType, entityId }: Props) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!entityId) return;
    setLoading(true);
    auditLogs.list(entityType, entityId)
      .then(setLogs)
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [entityType, entityId]);

  return (
    <div className="flex flex-col h-full" style={{
      borderLeft: `1px solid ${T.border}`,
      paddingLeft: '1rem',
      minWidth: 0,
    }}>
      <p className="text-xs font-bold uppercase tracking-wider mb-3 flex-shrink-0" style={{ color: T.copper }}>
        📋 Historique
      </p>

      {loading ? (
        <p className="text-xs" style={{ color: T.muted }}>Chargement…</p>
      ) : logs.length === 0 ? (
        <p className="text-xs italic" style={{ color: T.muted }}>Aucun historique disponible.</p>
      ) : (
        <div className="space-y-3 overflow-y-auto flex-1" style={{ maxHeight: '60vh' }}>
          {logs.map((log, i) => (
            <div key={log.id} className="relative pl-4">
              {/* Ligne verticale */}
              {i < logs.length - 1 && (
                <div className="absolute left-1.5 top-4 bottom-0 w-px" style={{ background: T.border }} />
              )}
              {/* Point */}
              <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full border-2 flex-shrink-0"
                style={{ background: '#FFF', borderColor: T.copper }} />

              <div className="text-xs space-y-0.5">
                <div className="flex items-center gap-1 flex-wrap">
                  {log.user && (
                    <span className="font-semibold" style={{ color: T.dark }}>
                      {log.user.firstName} {log.user.lastName}
                    </span>
                  )}
                  <span style={{ color: T.muted }}>
                    {new Date(log.createdAt).toLocaleDateString('fr-LU', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="font-medium" style={{ color: T.dark }}>{log.action}</p>
                {log.details && (
                  <p style={{ color: T.muted }}>{log.details}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
