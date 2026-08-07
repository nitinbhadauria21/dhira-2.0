'use client';

import React from 'react';
import Link from 'next/link';
import { resetDhiraClientStateForNewAccount } from '@/lib/dhiraClientCache';

type SignUpLinkProps = React.ComponentProps<typeof Link>;

/**
 * Navigates to sign-up after clearing stale dhira-* client cache (new account flow).
 */
export default function SignUpLink({ onClick, href = '/sign-up', ...rest }: SignUpLinkProps) {
  return (
    <Link
      href={href}
      {...rest}
      onClick={(e) => {
        resetDhiraClientStateForNewAccount();
        onClick?.(e);
      }}
    />
  );
}
