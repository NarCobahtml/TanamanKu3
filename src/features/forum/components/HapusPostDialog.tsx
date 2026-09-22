'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { deletePost } from '../forum-storage';
import type { ForumPost } from '../types';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

export interface HapusPostDialogProps {
  post: ForumPost | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

export function HapusPostDialog({
  post,
  open,
  onOpenChange,
  onDeleted,
}: HapusPostDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = () => {
    if (!post || loading) return;
    setLoading(true);
    try {
      deletePost(post.id);
      toast.success('Postingan berhasil dihapus dari forum');
      onOpenChange(false);
      onDeleted?.();
    } catch (err) {
      console.error('Gagal menghapus postingan:', err);
      toast.error('Gagal menghapus postingan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5 text-destructive">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive/10">
              <Trash2 className="h-5 w-5" />
            </div>
            <DialogTitle className="text-lg font-bold">Hapus Postingan</DialogTitle>
          </div>
          <DialogDescription className="pt-2 text-sm leading-relaxed text-muted-foreground">
            Apakah Anda yakin ingin menghapus postingan{' '}
            <strong className="text-foreground font-semibold">
              &ldquo;{post?.title}&rdquo;
            </strong>
            ? Tindakan ini tidak dapat dibatalkan dan postingan beserta diskusi di dalamnya akan dihapus dari forum.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 flex gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? 'Menghapus...' : 'Hapus Postingan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
