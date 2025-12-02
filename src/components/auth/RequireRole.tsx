'use client';

import { authService } from '@/lib/authService';

interface RequireRoleProps {
  roles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function RequireRole({ roles, children, fallback = null }: RequireRoleProps) {
  if (!authService.hasAnyRole(roles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
