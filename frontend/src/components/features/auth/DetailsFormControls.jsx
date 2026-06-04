import { Check, ChevronDown, MessageCircle, Package } from 'lucide-react';

export const primaryMaterialOptions = [
  { value: 'paper', label: 'Paper / Cardboard', Icon: Package },
  { value: 'ewaste', label: 'E-Waste', Icon: Package },
  { value: 'metals', label: 'Metals', Icon: Package },
  { value: 'plastics', label: 'Plastics', Icon: Package },
  { value: 'glass', label: 'Glass', Icon: Package },
  { value: 'wood', label: 'Wood', Icon: Package },
  { value: 'textiles', label: 'Textiles', Icon: Package },
  { value: 'chemicals', label: 'Chemicals', Icon: Package },
  { value: 'packaging', label: 'Packaging Waste', Icon: Package },
];

export const communicationPreferenceOptions = [
  { value: 'whatsapp', label: 'WhatsApp updates', note: '(Recommended)' },
  { value: 'email', label: 'Email notifications', note: '' },
  { value: 'sms', label: 'SMS notifications', note: '' },
];

export function SectionCard({ title, description, Icon, children }) {
  return (
    <section className="rounded-[14px] border border-[#e5e7eb] bg-white p-5 shadow-[0_16px_44px_rgba(15,23,42,0.04)] sm:p-7">
      <div className="mb-6 flex items-start gap-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#e8f7ef] text-[#15803d]">
          <Icon className="size-5" />
        </span>
        <div>
          <h2 className="text-[17px] font-semibold text-[#1f2937]">{title}</h2>
          {description && <p className="mt-2 text-[14px] font-medium text-[#64748b]">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

export function FormField({ label, helper, required, htmlFor, children }) {
  return (
    <label className="block" htmlFor={htmlFor}>
      <span className="mb-3 block text-[14px] font-semibold text-[#1f2937]">
        {label}
        {helper && <span className="ml-1 text-[#64748b]">({helper})</span>}
        {required && <span className="text-[#dc2626]"> *</span>}
      </span>
      {children}
    </label>
  );
}

export function TextInput({ id, name, value, onChange, placeholder, Icon, inputMode, autoComplete, type = 'text' }) {
  return (
    <div className="flex min-h-[56px] items-center rounded-[11px] border-[1.5px] border-[#e2e8f0] bg-white px-4 transition focus-within:border-[#15803d] focus-within:shadow-[0_0_0_4px_rgba(21,128,61,0.07)]">
      <Icon className="mr-4 size-5 shrink-0 text-[#64748b]" />
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete={autoComplete}
        className="min-w-0 flex-1 py-[13px] text-[15px] font-medium text-[#111827] outline-none placeholder:text-[#8a8f98]"
      />
    </div>
  );
}

export function SelectInput({ id, name, value, onChange, Icon, options, placeholder }) {
  return (
    <div className="relative flex min-h-[56px] items-center rounded-[11px] border-[1.5px] border-[#e2e8f0] bg-white px-4 transition focus-within:border-[#15803d] focus-within:shadow-[0_0_0_4px_rgba(21,128,61,0.07)]">
      <Icon className="mr-4 size-5 shrink-0 text-[#64748b]" />
      <select
        id={id}
        name={name}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        className="min-w-0 flex-1 appearance-none bg-transparent py-[13px] pr-8 text-[15px] font-medium text-[#111827] outline-none"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 size-5 text-[#64748b]" />
    </div>
  );
}

export function SelectButton({ selected, onClick, children, Icon }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={[
        'relative flex min-h-[48px] items-center justify-center gap-3 rounded-[10px] border-[1.5px] px-4 text-[15px] font-semibold transition hover:-translate-y-px hover:border-[#15803d]/55',
        selected
          ? 'border-[#15803d] bg-[#f0fdf4] pr-10 text-[#166534] shadow-[0_0_0_3px_rgba(21,128,61,0.07)]'
          : 'border-[#e2e8f0] bg-white text-[#1f2937]',
      ].join(' ')}
      onClick={onClick}
    >
      {Icon && <Icon className="size-5 shrink-0 text-[#15803d]" />}
      <span className="truncate">{children}</span>
      {selected && (
        <span className="absolute right-3 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full bg-[#15803d] text-white">
          <Check className="size-3.5" />
        </span>
      )}
    </button>
  );
}

export function PrimaryMaterialsCard({ selectedMaterials, onToggle }) {
  return (
    <SectionCard title="Primary Materials You Handle" Icon={Package}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {primaryMaterialOptions.map(({ value, label, Icon }) => (
          <SelectButton key={value} selected={selectedMaterials.includes(value)} Icon={Icon} onClick={() => onToggle(value)}>
            {label}
          </SelectButton>
        ))}
      </div>
    </SectionCard>
  );
}

export function CommunicationPreferencesCard({ selectedPreferences, onToggle }) {
  return (
    <SectionCard title="Communication Preferences" Icon={MessageCircle}>
      <div className="space-y-5">
        {communicationPreferenceOptions.map(({ value, label, note }) => (
          <CheckboxRow
            key={value}
            selected={selectedPreferences.includes(value)}
            label={label}
            note={note}
            onClick={() => onToggle(value)}
          />
        ))}
      </div>
    </SectionCard>
  );
}

function CheckboxRow({ selected, label, note, onClick }) {
  return (
    <button type="button" className="flex w-full items-center gap-3 text-left" onClick={onClick}>
      <span
        className={[
          'flex size-5 shrink-0 items-center justify-center rounded-[4px] border-[1.5px]',
          selected ? 'border-[#15803d] bg-[#15803d] text-white' : 'border-[#94a3b8] bg-white text-transparent',
        ].join(' ')}
      >
        <Check className="size-3.5" />
      </span>
      <span className="text-[15px] font-semibold text-[#1f2937]">
        {label}
        {note && <span className="ml-1 text-[13px] text-[#64748b]">{note}</span>}
      </span>
    </button>
  );
}
