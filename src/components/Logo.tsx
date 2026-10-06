interface LogoProps {
  size?: number
}

/** A rising line ending in a star: momentum, not total stars. Same drawing as public/favicon.svg. */
export function Logo({ size = 24 }: LogoProps) {
  return (
    <svg className="logo" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="var(--accent)" />
      <polyline
        points="6,24 12,18 16,21 22,13"
        fill="none"
        stroke="var(--accent-contrast)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M24 3.5 L25.5 7.5 L29.5 9 L25.5 10.5 L24 14.5 L22.5 10.5 L18.5 9 L22.5 7.5 Z" fill="var(--accent-contrast)" />
    </svg>
  )
}
