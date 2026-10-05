export function VeilMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect x="3" y="3" width="26" height="26" rx="7" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <rect x="7.5" y="7.5" width="17" height="17" rx="4.5" fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.7" />
      <rect x="12" y="12" width="8" height="8" rx="2" fill="currentColor" opacity="0.9" />
    </svg>
  );
}
