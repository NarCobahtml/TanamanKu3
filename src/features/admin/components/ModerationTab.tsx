"use client";

import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ModerationItem } from "../types";

interface ModerationTabProps {
  filteredModerations: ModerationItem[];
  onResolveModeration: (id: string, action: "Hapus" | "Abaikan") => void;
}

export function ModerationTab({
  filteredModerations,
  onResolveModeration,
}: ModerationTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Moderasi Diskusi & Laporan Forum
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tinjau dan tindak lanjuti postingan forum yang dilaporkan
            karena indikasi spam, penipuan, atau informasi yang
            berbahaya.
          </p>
        </div>
      </div>

      {/* Moderation Cards */}
      <div className="space-y-4">
        {filteredModerations.map((mod) => (
          <div
            key={mod.id}
            className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-colors hover:border-primary/30"
          >
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-bold text-muted-foreground">
                  {mod.id}
                </span>
                <Badge variant="outline" className="text-[10px]">
                  Kategori: {mod.category}
                </Badge>
                <span className="text-xs font-bold text-red-600 dark:text-red-400">
                  ⚠ {mod.reportsCount} ({mod.reportReason})
                </span>
              </div>

              <h3 className="font-bold text-base text-foreground leading-snug">
                {mod.postTitle}
              </h3>
              <p className="text-xs text-muted-foreground italic bg-secondary/50 p-2.5 rounded-lg border border-border/50">
                &ldquo;{mod.snippet}&rdquo;
              </p>

              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <span>
                  Penulis: <strong>{mod.author}</strong> ({mod.authorEmail})
                </span>
                <span>·</span>
                <span>Dilaporkan pada: {mod.date}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              {mod.status === "Perlu Tindakan" ? (
                <>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onResolveModeration(mod.id, "Hapus")}
                    className="h-8 text-xs cursor-pointer"
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Hapus Postingan
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onResolveModeration(mod.id, "Abaikan")}
                    className="h-8 text-xs cursor-pointer"
                  >
                    Abaikan Laporan
                  </Button>
                </>
              ) : (
                <span className="text-xs text-muted-foreground font-medium">
                  Kasus ini telah {mod.status.toLowerCase()}
                </span>
              )}
            </div>
          </div>
        ))}

        {filteredModerations.length === 0 && (
          <div className="py-12 text-center text-muted-foreground text-sm rounded-2xl border border-dashed border-border">
            Tidak ada laporan moderasi yang sesuai dengan filter ini.
          </div>
        )}
      </div>
    </div>
  );
}
