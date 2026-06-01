'use client';
import { useState } from 'react';
import type { IneeDocumentProps } from './IneeDocumentPdf';

interface Props extends IneeDocumentProps {
  filename: string;
}

function sanitizeFilename(name: string): string {
  return name.replace(/[/\\:*?"<>|]/g, '-').replace(/\s+/g, '_') + '.pdf';
}

export function PdfDownloadButton({ filename, ...docProps }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleDownload = async () => {
    if (loading) return;
    setLoading(true);
    setError(false);
    try {
      // Import dynamique pour éviter les problèmes SSR
      const { pdf } = await import('@react-pdf/renderer');
      const { IneeDocumentPdf } = await import('./IneeDocumentPdf');
      const { createElement } = await import('react');

      const doc = createElement(IneeDocumentPdf, docProps);
      const blob = await pdf(doc as any).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = sanitizeFilename(filename.replace(/\.pdf$/, ''));
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('PDF error:', e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
      style={{ opacity: loading ? 0.7 : 1 }}
    >
      {error ? '⚠ Erreur' : loading ? 'Génération...' : '↓ PDF'}
    </button>
  );
}
