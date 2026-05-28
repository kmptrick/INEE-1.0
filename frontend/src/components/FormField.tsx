interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}

export function FormField({ label, children, required }: FormFieldProps) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#4A3020' }}>
        {label}{required && <span className="ml-1" style={{ color: '#C8803A' }}>*</span>}
      </label>
      {children}
    </div>
  );
}

export const inputClass = [
  'w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all',
  'bg-white text-[#1A1008]',
  'border border-[#E0D5CC]',
  'focus:border-[#C8803A] focus:ring-2 focus:ring-[#C8803A]/15',
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
  copper:   '#C8803A',
  copperHover: '#A86C2E',
  copperBg: '#FDF3E8',
  addBtn:   { background: '#C8803A', color: '#FFFFFF', boxShadow: '0 1px 4px rgba(200,128,58,0.3)' } as React.CSSProperties,
} as const;
