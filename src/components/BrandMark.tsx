interface BrandMarkProps {
  className?: string;
  strokeWidth?: number;
}

export function BrandMark({ className, strokeWidth = 2 }: BrandMarkProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 10c-2.2 0-3.5 1.2-3.5 3.2v1.6c0 1.1-.6 1.7-1.7 1.7 1.1 0 1.7.6 1.7 1.7v1.6c0 2 1.3 3.2 3.5 3.2" />
      <path d="M20 10c2.2 0 3.5 1.2 3.5 3.2v1.6c0 1.1.6 1.7 1.7 1.7-1.1 0-1.7.6-1.7 1.7v1.6c0 2-1.3 3.2-3.5 3.2" />
      <circle cx="16" cy="16.4" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}
