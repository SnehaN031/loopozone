export function SectionTitle({ eyebrow, title, accent, dark = false }) {
  return (
    <div className="text-center">
      {eyebrow && <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#0f9b78]">{eyebrow}</p>}
      <h2 className={dark ? 'mt-4 text-[38px] font-semibold leading-tight tracking-[-0.8px] text-white sm:text-[56px]' : 'mt-4 text-[38px] font-semibold leading-tight tracking-[-0.8px] text-[#171d21] sm:text-[56px]'}>
        {title} <span className="text-[#17a77d]">{accent}</span>
      </h2>
      <span className="mx-auto mt-5 block h-[3px] w-12 rounded-full bg-[#17a77d]" />
    </div>
  );
}
