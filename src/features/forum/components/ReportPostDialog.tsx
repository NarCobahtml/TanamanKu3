'use client';

import { useState } from 'react';
import { Flag, AlertTriangle, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import type { ForumPost } from '../types';
import { cn } from '@/lib/utils';

export interface ReportPostDialogProps {
  post: ForumPost | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReportSubmitted?: (postId: string, reason: string, details?: string) => void;
}

const REPORT_REASONS = [
  {
    id: 'spam',
    title: 'Spam atau Promosi Ilegal',
    desc: 'Promosi komersial berulang, tautan berbahaya, atau bot iklan.',
  },
  {
    id: 'misleading',
    title: 'Informasi Sesat / Membahayakan',
    desc: 'Tips atau racikan perawatan tanaman yang salah dan berisiko mematikan tanaman.',
  },
  {
    id: 'harassment',
    title: 'Ujaran Kebencian & Pelecehan',
    desc: 'Kata-kata kasar, merendahkan sesama anggota, atau mengandung unsur SARA.',
  },
  {
    id: 'offtopic',
    title: 'Konten Tidak Relevan (Off-topic)',
    desc: 'Pembahasan tidak ada hubungannya dengan tanaman, agrikultur, atau berkebun.',
  },
  {
    id: 'other',
    title: 'Alasan Lainnya',
    desc: 'Pelanggaran etika komunitas atau aturan TanamanKu lainnya.',
  },
];

export function ReportPostDialog({
  post,
  open,
  onOpenChange,
  onReportSubmitted,
}: ReportPostDialogProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleReset = () => {
    setSelectedReason('');
    setAdditionalDetails('');
    setIsSubmitting(false);
    setIsSubmitted(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    // Delay reset so animation finishes smoothly
    setTimeout(handleReset, 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason || !post) return;

    setIsSubmitting(true);

    // Front-end only simulation
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success('Laporan berhasil dikirim ke moderator TanamanKu.');
      onReportSubmitted?.(post.id, selectedReason, additionalDetails.trim());
    }, 600);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) handleClose();
        else onOpenChange(true);
      }}
    >
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Flag className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold tracking-tight">
                    Laporkan Postingan
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Bantu kami menjaga forum TanamanKu tetap bersih, edukatif, dan ramah.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {/* Target post preview */}
            {post && (
              <div className="rounded-xl border border-border/80 bg-secondary/30 p-3 text-xs space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="font-medium text-foreground">{post.author}</span>
                  <span>{post.category}</span>
                </div>
                <p className="font-semibold text-foreground line-clamp-1">{post.title}</p>
                <p className="text-muted-foreground line-clamp-2 italic">
                  &ldquo;{post.excerpt}&rdquo;
                </p>
              </div>
            )}

            {/* Reason selector */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Pilih Alasan Pelaporan <span className="text-destructive">*</span>
              </label>
              <div className="space-y-2">
                {REPORT_REASONS.map((reason) => {
                  const isSelected = selectedReason === reason.id;
                  return (
                    <button
                      key={reason.id}
                      type="button"
                      onClick={() => setSelectedReason(reason.id)}
                      className={cn(
                        'w-full text-left rounded-xl border p-3 transition-all cursor-pointer flex items-start gap-3',
                        isSelected
                          ? 'border-amber-500/80 bg-amber-500/5 shadow-xs ring-1 ring-amber-500/40'
                          : 'border-border/70 hover:border-border hover:bg-secondary/40'
                      )}
                    >
                      <div
                        className={cn(
                          'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors',
                          isSelected
                            ? 'border-amber-600 bg-amber-600 text-white'
                            : 'border-muted-foreground/40'
                        )}
                      >
                        {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={cn('text-xs font-semibold', isSelected ? 'text-foreground' : 'text-foreground')}>
                          {reason.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                          {reason.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-1.5">
              <label
                htmlFor="report-details"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between"
              >
                <span>Catatan Tambahan</span>
                <span className="text-[10px] lowercase font-normal">Opsional</span>
              </label>
              <Textarea
                id="report-details"
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                placeholder="Berikan detail atau kronologi singkat untuk membantu tim moderator..."
                className="resize-none text-xs min-h-[70px] rounded-xl"
                maxLength={400}
              />
              <p className="text-[10px] text-muted-foreground text-right">
                {additionalDetails.length}/400 karakter
              </p>
            </div>

            <DialogFooter className="gap-2 sm:justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClose}
                disabled={isSubmitting}
                className="cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!selectedReason || isSubmitting}
                className="bg-amber-600 hover:bg-amber-700 text-white cursor-pointer font-medium"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Mengirim...
                  </span>
                ) : (
                  'Kirim Laporan'
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          /* Success confirmation state */
          <div className="py-6 px-2 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div className="space-y-1.5">
              <DialogTitle className="text-lg font-bold text-foreground">
                Laporan Berhasil Terkirim
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Terima kasih atas kontribusi Anda. Laporan telah kami catat untuk segera ditinjau oleh tim moderator komunitas TanamanKu.
              </DialogDescription>
            </div>

            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-muted-foreground max-w-sm mx-auto">
              <p className="flex items-center justify-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-medium mb-0.5">
                <ShieldAlert className="h-3.5 w-3.5" />
                Komitmen Ruang Aman
              </p>
              Setiap laporan diproses secara rahasia demi kenyamanan dan perlindungan privasi Anda.
            </div>

            <div className="pt-2">
              <Button
                type="button"
                size="sm"
                onClick={handleClose}
                className="min-w-[120px] cursor-pointer"
              >
                Selesai
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
