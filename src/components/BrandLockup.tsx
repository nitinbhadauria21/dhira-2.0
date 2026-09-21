'use client';

import Link from 'next/link';

type BrandLockupProps = {
  href?: string;
  /** YOBRO line size in px (BROFRIEND is 36% of this). */
  size?: number;
  className?: string;
  color?: string;
};

/**
 * Two-line brand mark: YOBRO over BROFRIEND.
 */
export default function BrandLockup({
  href = '/',
  size = 24,
  className = '',
  color = 'var(--color-text)',
}: BrandLockupProps) {
  const subSize = Math.max(8, Math.round(size * 0.36));
  const subMt = Math.max(3, Math.round(size * 0.17));

  return (
    <Link
      href={href}
      className={`inline-flex flex-col items-start leading-none flex-shrink-0 ${className}`}
      style={{ color, textDecoration: 'none' }}
    >
      <span
        className="block leading-none"
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: size,
          letterSpacing: '-0.03em',
        }}
      >
        YOBRO
      </span>
      <span
        className="block leading-none"
        style={{
          fontFamily: 'var(--font-ui)',
          fontWeight: 600,
          fontSize: subSize,
          letterSpacing: '0.3em',
          marginTop: subMt,
          opacity: 0.62,
        }}
      >
        BROFRIEND
      </span>
    </Link>
  );
}
