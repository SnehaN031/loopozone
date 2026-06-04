import { Leaf } from 'lucide-react';

export function BrandLogo({ tone = 'light' }) {
  const loopText = tone === 'light' ? 'text-white' : 'text-[#111827]';
  const zoneText = tone === 'light' ? 'text-[#86efac]' : 'text-[#15803d]';

  return (
    <div className="flex items-center gap-3">
      <div className="flex size-12 items-center justify-center rounded-[13px] bg-gradient-to-br from-[#22c55e] to-[#16a34a] text-white shadow-[0_14px_28px_rgba(22,163,74,0.24)]">
        <Leaf className="size-6" strokeWidth={2.4} />
      </div>
      <div className="text-[22px] font-semibold tracking-[-0.5px]">
        <span className={loopText}>LoopO</span>
        <span className={zoneText}>Zone</span>
      </div>
    </div>
  );
}
