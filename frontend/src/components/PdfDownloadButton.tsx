'use client';
import dynamic from 'next/dynamic';
import type { IneeDocumentProps } from './IneeDocumentPdf';

// PDFDownloadLink must be loaded client-side only (no SSR support)
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then(m => m.PDFDownloadLink),
  { ssr: false, loading: () => <span className="text-xs text-gray-400">PDF...</span> }
);

const IneeDocumentPdf = dynamic(
  () => import('./IneeDocumentPdf').then(m => m.IneeDocumentPdf),
  { ssr: false }
) as React.ComponentType<IneeDocumentProps>;

interface Props extends IneeDocumentProps {
  filename: string;
}

// Sanitise le nom de fichier (retire les caractères invalides)
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
      {({ loading, error }) => {
        if (error) return '⚠ Erreur PDF';
        if (loading) return 'Génération...';
        return '↓ PDF';
      }}
    </PDFDownloadLink>
  );
}
