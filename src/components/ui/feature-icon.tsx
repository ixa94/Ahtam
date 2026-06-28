type FeatureIconProps = {
  name: string;
  className?: string;
};

const paths: Record<string, React.ReactNode> = {
  halal: (
    <>
      <path d="M12 3c2.5 2 4 4.5 4 7a4 4 0 1 1-8 0c0-2.5 1.5-5 4-7Z" />
      <path d="M5 21h14" />
    </>
  ),
  decor: (
    <>
      <path d="M12 3v18" />
      <path d="M12 8c2.5-2 5-1.5 6 .5-1 2.5-3.5 3-6 1.5Z" />
      <path d="M12 8c-2.5-2-5-1.5-6 .5 1 2.5 3.5 3 6 1.5Z" />
    </>
  ),
  separate: (
    <>
      <circle cx="8" cy="8" r="2.5" />
      <circle cx="16" cy="8" r="2.5" />
      <path d="M4 19c0-2.2 1.8-4 4-4s4 1.8 4 4" />
      <path d="M12 19c0-2.2 1.8-4 4-4s4 1.8 4 4" />
    </>
  ),
  imam: (
    <>
      <path d="M12 3l1.6 3.6L17 8l-2.6 2.4L15 14l-3-1.8L9 14l.6-3.6L7 8l3.4-1.4Z" />
      <path d="M5 20h14" />
    </>
  ),
  room: (
    <>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M4 10h16" />
      <path d="M9 19v-4" />
    </>
  ),
  sound: (
    <>
      <path d="M5 9v6h4l5 4V5L9 9H5Z" />
      <path d="M17 9c1 1 1 5 0 6" />
    </>
  ),
  parking: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M9 16V8h3a2.5 2.5 0 0 1 0 5H9" />
    </>
  ),
  scale: (
    <>
      <path d="M3 21V8l9-5 9 5v13" />
      <path d="M3 21h18" />
      <path d="M9 21v-6h6v6" />
    </>
  )
};

export function FeatureIcon({ name, className }: FeatureIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name] ?? paths.decor}
    </svg>
  );
}
