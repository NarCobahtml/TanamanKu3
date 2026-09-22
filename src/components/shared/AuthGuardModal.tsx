'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Sparkles, LogIn, UserPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/use-auth';

export interface AuthGuardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  actionName?: string;
}

export function AuthGuardModal({
  open,
  onOpenChange,
  title = 'Login Diperlukan',
  description = 'Fitur ini membutuhkan akun terdaftar untuk menyimpan dan mengelola data Anda. Silakan masuk atau buat akun baru terlebih dahulu.',
  actionName,
}: AuthGuardModalProps) {
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl p-6">
        <DialogHeader className="text-left space-y-2.5">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
              <Lock className="h-5 w-5 stroke-[2.2]" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                {title}
              </DialogTitle>
              {actionName && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary mt-0.5">
                  <Sparkles className="h-3 w-3" /> Fitur {actionName}
                </span>
              )}
            </div>
          </div>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-5 flex flex-col sm:flex-row gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto rounded-full text-xs font-semibold cursor-pointer order-3 sm:order-1"
          >
            Nanti Saja
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              router.push('/register');
            }}
            className="w-full sm:w-auto rounded-full text-xs font-semibold cursor-pointer order-2 sm:order-2 flex items-center justify-center gap-1.5"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Daftar Akun
          </Button>
          <Button
            type="button"
            onClick={() => {
              onOpenChange(false);
              router.push('/login');
            }}
            className="w-full sm:w-auto rounded-full bg-[#1B5E20] hover:bg-[#17491a] text-white text-xs font-semibold px-5 shadow-sm cursor-pointer order-1 sm:order-3 flex items-center justify-center gap-1.5"
          >
            <LogIn className="h-3.5 w-3.5" />
            Lanjutkan ke Login
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function useAuthGuard() {
  const { isAuthenticated, loading } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [guardOptions, setGuardOptions] = useState<{
    title?: string;
    description?: string;
    actionName?: string;
  }>({});

  const checkAuth = (options?: {
    title?: string;
    description?: string;
    actionName?: string;
  }): boolean => {
    if (!isAuthenticated) {
      if (options) {
        setGuardOptions(options);
      }
      setModalOpen(true);
      return false;
    }
    return true;
  };

  const AuthModal = (
    <AuthGuardModal
      open={modalOpen}
      onOpenChange={setModalOpen}
      title={guardOptions.title}
      description={guardOptions.description}
      actionName={guardOptions.actionName}
    />
  );

  return {
    isAuthenticated,
    loading,
    checkAuth,
    modalOpen,
    setModalOpen,
    AuthModal,
  };
}
