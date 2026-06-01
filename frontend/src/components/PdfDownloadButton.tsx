'use client';
import dynamic from 'next/dynamic';

// PDFDownloadLink doit être chargé côté client uniquement
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then(m => m.PDFDownloadLink),
  { ssr: false, loading: () => <span className="text-xs text-gray-400">PDF...</span> }
);

// Import direct (pas de dynamic) car PdfDownloadButton lui-même est déjà dynamique
import type { IneeDocumentProps } from './IneeDocumentPdf';
import { IneeDocumentPdf } from './IneeDocumentPdf';

interface Props extends IneeDocumentProps {
  filename: string;
}

function sanitizeFilename(name: string): string {
  return name.replace(/[/\\:*?"<>|]/g, '-').replace(/\s+/g, '_') + '.pdf';
}

export function PdfDownloadButton({ filename, ...docProps }: Props) {
  const safeFilename = sanitizeFilename(filename.replace(/\.pdf$/, ''));

  return (
    <PDFDownloadLink
      document={<IneeDocumentPdf {...docProps} />}
      fileName={safeFilename}
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
    >
      {({ loading, error }: { loading: boolean; error: Error | null }) => {
        if (error) return '⚠ Erreur';
        if (loading) return 'Génération...';
        return '↓ PDF';
      }}
    </PDFDownloadLink>
  );
}
