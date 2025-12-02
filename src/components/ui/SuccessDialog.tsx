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
import { CheckCircle } from "lucide-react";

interface SuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  message?: string;
  redirectTo?: string;
  buttonText?: string;
}

export function SuccessDialog({ 
  open, 
  onOpenChange,
  title = "Sucesso!",
  message = "Operação realizada com sucesso.",
  redirectTo,
  buttonText = "OK"
}: SuccessDialogProps) {
  const router = useRouter();

  const handleClose = () => {
    onOpenChange(false);
    if (redirectTo) {
      router.push(redirectTo);
    }
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
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          
          <p className="text-center text-gray-600">
            {message}
          </p>
          
          <Button
            onClick={handleClose}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {buttonText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
