interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}

export function FormField({ label, children, required }: FormFieldProps) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#6B4C35' }}>
        {label}{required && <span className="ml-1" style={{ color: '#D9924E' }}>*</span>}
      </label>
      {children}
    </div>
  );
}

export const inputClass = [
  'w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all',
  'bg-white text-[#1A1008]',
  'border border-[#E0D5CC]',
  'focus:border-[#D9924E] focus:ring-2 focus:ring-[#D9924E]/15',
].join(' ');

export const selectClass = inputClass;

/* Shared UI tokens used inline */
export const T = {
  bg:       '#F8F5F2',
  card:     '#FFFFFF',
  border:   '#E8DDD5',
  rowDiv:   '#F2EBE4',
  head:     '#F5EDE4',
  dark:     '#1A1008',
  muted:    '#7A6050',
  copper:   '#D9924E',
  copperHover: '#C07E3A',
  copperBg: '#FEF6EE',
  addBtn:   { background: '#D9924E', color: '#FFFFFF', boxShadow: '0 1px 4px rgba(217,146,78,0.3)' } as React.CSSProperties,
} as const;
