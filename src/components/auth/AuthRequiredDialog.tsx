'use client';

import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus } from "lucide-react";

interface AuthRequiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  message?: string;
}

export function AuthRequiredDialog({ 
  open, 
  onOpenChange,
  title = "Autenticação Necessária",
  message = "Você precisa fazer login para realizar esta ação."
}: AuthRequiredDialogProps) {
  const router = useRouter();

  const handleLogin = () => {
    onOpenChange(false);
    router.push('/');
  };

  const handleRegister = () => {
    onOpenChange(false);
    router.push('/register');
  };

  const handleLater = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-gray-900">
            {title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {message}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-6 py-4">
          <div className="rounded-full bg-green-100 p-4">
            <LogIn className="h-8 w-8 text-green-600" />
          </div>
          
          <p className="text-center text-gray-600">
            {message}
          </p>
          
          <div className="flex flex-col gap-3 w-full">
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                onClick={handleRegister}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Cadastrar
              </Button>
              <Button
                onClick={handleLogin}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Fazer Login
              </Button>
            </div>
            <Button
              onClick={handleLater}
              variant="outline"
              className="w-full border-gray-300"
            >
              Depois
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
