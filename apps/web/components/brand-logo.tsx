type BrandLogoProps = {
  size?: number;
  showName?: boolean;
  className?: string;
};

export default function BrandLogo({
  size = 44,
  showName = true,
  className = '',
}: BrandLogoProps) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <span
        className="grid shrink-0 place-items-center rounded-[31%] bg-gradient-to-br from-[#151332] via-[#4c1d95] to-[#e95855] shadow-lg shadow-violet-300/50 ring-1 ring-white/90"
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 48 48" fill="none" className="h-[72%] w-[72%]">
          <rect x="9" y="10" width="30" height="28" rx="7" fill="white" />
          <path d="M16 19h12M16 25h8" stroke="#5B21B6" strokeWidth="3.4" strokeLinecap="round" />
          <path d="m30 27 3 3 6-7" stroke="#F05B58" strokeWidth="3.3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="36.5" cy="12.5" r="3.5" fill="#FFB14A" />
        </svg>
      </span>
      {showName && (
        <span className="text-xl font-black tracking-[-0.055em] text-slate-950">
          Sipar<span className="text-violet-700">İş</span><sup className="ml-0.5 align-top text-[8px] tracking-normal text-orange-500">●</sup>
        </span>
      )}
    </span>
  );
}
