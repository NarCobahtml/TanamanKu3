'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface PaginationProps extends React.HTMLAttributes<HTMLElement> {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  prevLabel?: string;
  nextLabel?: string;
}

// Hitung deret nomor halaman
function getPageNumbers(
  currentPage: number,
  totalPages: number,
  siblingCount: number = 1
): (number | 'ellipsis')[] {
  const totalNumbers = siblingCount * 2 + 3;
  const totalBlocks = totalNumbers + 2;

  if (totalPages <= totalBlocks) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftItemCount = 3 + 2 * siblingCount;
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, 'ellipsis', totalPages];
  }

  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightItemCount = 3 + 2 * siblingCount;
    const rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => totalPages - rightItemCount + i + 1
    );
    return [1, 'ellipsis', ...rightRange];
  }

  if (shouldShowLeftDots && shouldShowRightDots) {
    const middleRange = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + i
    );
    return [1, 'ellipsis', ...middleRange, 'ellipsis', totalPages];
  }

  return Array.from({ length: totalPages }, (_, i) => i + 1);
}

// Komponen navigasi pagination
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  prevLabel = 'Sebelumnya',
  nextLabel = 'Berikutnya',
  className,
  ...props
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers(currentPage, totalPages, siblingCount);

  return (
    <nav
      role="navigation"
      aria-label="Pagination Navigation"
      className={cn('flex items-center gap-1.5', className)}
      {...props}
    >
      {/* Tombol halaman sebelumnya */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Ke halaman sebelumnya"
        className="h-8 gap-1 rounded-xl px-2.5 text-xs font-medium cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">{prevLabel}</span>
      </Button>

      {/* Daftar tombol angka halaman */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="flex h-8 w-8 items-center justify-center text-muted-foreground"
                aria-hidden="true"
              >
                <MoreHorizontal className="h-4 w-4" />
              </span>
            );
          }

          const isCurrent = page === currentPage;

          return (
            <Button
              key={page}
              type="button"
              variant={isCurrent ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(page)}
              aria-label={`Halaman ${page}`}
              aria-current={isCurrent ? 'page' : undefined}
              className={cn(
                'h-8 min-w-[32px] rounded-xl px-2 text-xs font-semibold cursor-pointer',
                isCurrent
                  ? 'bg-primary text-primary-foreground shadow-xs pointer-events-none'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-secondary hover:text-foreground'
              )}
            >
              {page}
            </Button>
          );
        })}
      </div>

      {/* Tombol halaman berikutnya */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Ke halaman berikutnya"
        className="h-8 gap-1 rounded-xl px-2.5 text-xs font-medium cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span className="hidden sm:inline">{nextLabel}</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}
