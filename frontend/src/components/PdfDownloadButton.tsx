'use client';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { IneeDocumentPdf } from './IneeDocumentPdf';
import type { IneeDocumentProps } from './IneeDocumentPdf';

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
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
        background: '#FFF9E6', color: '#B45309',
        border: '1px solid #FDE68A', textDecoration: 'none',
        cursor: 'pointer',
      }}
    >
      {({ loading, error }: any) =>
        error ? '⚠ Erreur' : loading ? 'Génération...' : '↓ PDF'
      }
    </PDFDownloadLink>
  );
}
