'use client';

import { useState } from 'react';
import { authService } from '@/lib/authService';

interface UseAuthDialogReturn {
  showAuthDialog: boolean;
  authMessage: string;
  authTitle: string;
  setShowAuthDialog: (show: boolean) => void;
  requireAuth: (action: () => void | Promise<void>, actionName?: string) => void;
}

export function useAuthDialog(): UseAuthDialogReturn {
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authMessage, setAuthMessage] = useState('Você precisa fazer login para realizar esta ação.');
  const [authTitle, setAuthTitle] = useState('Autenticação Necessária');

  const requireAuth = (action: () => void | Promise<void>, actionName?: string) => {
    if (!authService.isAuthenticated()) {
      const messages: Record<string, { title: string; message: string }> = {
        'criar post': {
          title: 'Login Necessário',
          message: 'Você precisa fazer login para criar um post.'
        },
        'comentar': {
          title: 'Login Necessário',
          message: 'Você precisa fazer login para comentar.'
        },
        'curtir': {
          title: 'Login Necessário',
          message: 'Você precisa fazer login para curtir.'
        },
        'responder': {
          title: 'Login Necessário',
          message: 'Você precisa fazer login para responder.'
        },
        'compartilhar': {
          title: 'Login Necessário',
          message: 'Você precisa fazer login para compartilhar.'
        },
      };

      const messageConfig = actionName ? messages[actionName.toLowerCase()] : null;
      
      if (messageConfig) {
        setAuthTitle(messageConfig.title);
        setAuthMessage(messageConfig.message);
      } else {
        setAuthTitle('Autenticação Necessária');
        setAuthMessage('Você precisa fazer login para realizar esta ação.');
      }

      setShowAuthDialog(true);
      return;
    }

    action();
  };

  return {
    showAuthDialog,
    authMessage,
    authTitle,
    setShowAuthDialog,
    requireAuth,
  };
}
