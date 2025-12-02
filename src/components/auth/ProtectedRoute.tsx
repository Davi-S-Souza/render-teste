'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}
export default function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const router = useRouter();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/');
      return;
    }

    if (requiredRoles && requiredRoles.length > 0) {
      if (!authService.hasAnyRole(requiredRoles)) {
        router.push('/home');
      }
    }
  }, [router, requiredRoles]);

  if (!authService.isAuthenticated()) {
    return null;
  }

  if (requiredRoles && requiredRoles.length > 0 && !authService.hasAnyRole(requiredRoles)) {
    return null;
  }

  return <>{children}</>;
}
