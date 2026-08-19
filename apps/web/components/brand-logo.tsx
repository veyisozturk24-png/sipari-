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
        className="grid shrink-0 place-items-center rounded-[30%] bg-gradient-to-br from-orange-400 via-fuchsia-500 to-violet-700 shadow-lg shadow-violet-300/50 ring-1 ring-white/80"
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 48 48" fill="none" className="h-[72%] w-[72%]">
          <path d="M14 13.5h20a4 4 0 0 1 4 4v2.2a4 4 0 0 1-4 4H18a4 4 0 0 0-4 4v2.1a4 4 0 0 0 4 4h16" stroke="white" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M31.5 9.5v6M31.5 32.5v6" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="34" cy="36" r="2.6" fill="white" />
        </svg>
      </span>
      {showName && (
        <span className="text-xl font-black tracking-[-0.055em] text-slate-950">
          Sipar<span className="text-violet-700">İş</span>
        </span>
      )}
    </span>
  );
}
