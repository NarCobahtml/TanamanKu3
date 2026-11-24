"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Trash2,
  ShieldAlert,
  ShieldCheck,
  CheckCheck,
  ExternalLink,
  AlertTriangle,
  Clock,
  User,
} from "lucide-react";
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
  const [statusFilter, setStatusFilter] = useState<
    "Semua" | "Perlu Tindakan" | "Diselesaikan" | "Diabaikan"
  >("Semua");

  const counts = {
    all: filteredModerations.length,
    pending: filteredModerations.filter((m) => m.status === "Perlu Tindakan").length,
    resolved: filteredModerations.filter((m) => m.status === "Diselesaikan").length,
    dismissed: filteredModerations.filter((m) => m.status === "Diabaikan").length,
  };

  const displayedList = filteredModerations.filter((m) => {
    if (statusFilter === "Semua") return true;
    return m.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header and Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/50">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            Moderasi Diskusi & Laporan Forum
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Tinjau dan ambil tindakan cepat terhadap laporan pelanggaran komunitas, konten spam, atau informasi merugikan.
          </p>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto p-1 bg-muted/60 border border-border/60 rounded-lg">
          {(
            [
              { key: "Semua", label: "Semua", count: counts.all, alert: false },
              { key: "Perlu Tindakan", label: "Butuh Tindakan", count: counts.pending, alert: counts.pending > 0 },
              { key: "Diselesaikan", label: "Dihapus", count: counts.resolved, alert: false },
              { key: "Diabaikan", label: "Diabaikan", count: counts.dismissed, alert: false },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md font-medium transition-all cursor-pointer ${
                statusFilter === tab.key
                  ? "bg-card text-foreground font-semibold shadow-2xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] tabular-nums px-1.5 py-0.2 rounded-md font-bold ${
                  tab.alert
                    ? "bg-destructive/15 text-destructive border border-destructive/20"
                    : statusFilter === tab.key
                      ? "bg-muted text-foreground"
                      : "bg-muted/60 text-muted-foreground"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Incident Cards */}
      <div className="space-y-3.5">
        {displayedList.map((mod) => {
          const isPending = mod.status === "Perlu Tindakan";
          const isDeleted = mod.status === "Diselesaikan";

          return (
            <div
              key={mod.id}
              className={`rounded-xl border bg-card p-4 sm:p-5 shadow-2xs transition-all ${
                isPending
                  ? "border-destructive/30 hover:border-destructive/60 bg-gradient-to-r from-destructive/[0.02] to-transparent"
                  : "border-border/70 hover:border-border"
              }`}
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="space-y-2.5 min-w-0 flex-1">
                  {/* Meta Pills Row */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono text-[11px] font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded border border-border/50">
                      ID: {mod.id.slice(0, 16)}...
                    </span>

                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-muted text-muted-foreground border border-border/50">
                      {mod.category}
                    </span>

                    {/* Status Pill */}
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium ${
                        isPending
                          ? "bg-destructive/10 text-destructive border border-destructive/25 font-semibold"
                          : isDeleted
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            : "bg-muted text-muted-foreground border border-border"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          isPending
                            ? "bg-destructive animate-pulse"
                            : isDeleted
                              ? "bg-amber-500"
                              : "bg-muted-foreground"
                        }`}
                      />
                      {mod.status}
                    </span>

                    {/* Report count & Reason */}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-destructive/10 text-destructive border border-destructive/20">
                      <AlertTriangle className="h-3 w-3" />
                      {mod.reportsCount} Laporan ({mod.reportReason})
                    </span>
                  </div>

                  {/* Post Title */}
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm sm:text-base text-foreground leading-snug">
                      {mod.postTitle}
                    </h3>
                    <Link
                      href={`/forum/${mod.id}`}
                      target="_blank"
                      className="text-muted-foreground hover:text-primary transition-colors shrink-0"
                      title="Buka postingan forum di tab baru"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  {/* Snippet Quote */}
                  <div className="bg-muted/40 border-l-2 border-primary/60 px-3 py-2 rounded-r-md text-xs text-foreground/80 leading-relaxed italic">
                    &ldquo;{mod.snippet}&rdquo;
                  </div>

                  {/* Author Meta */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3 text-muted-foreground/70" />
                      <span>Penulis:</span>
                      <strong className="text-foreground font-medium">{mod.author}</strong>
                      <span className="font-mono text-muted-foreground/70">({mod.authorEmail})</span>
                    </span>
                    <span className="text-muted-foreground/40">·</span>
                    <span className="flex items-center gap-1 font-mono text-muted-foreground/80">
                      <Clock className="h-3 w-3 text-muted-foreground/70" />
                      {mod.date}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end lg:self-center pt-2 lg:pt-0">
                  {isPending ? (
                    <>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onResolveModeration(mod.id, "Hapus")}
                        className="h-8 text-xs px-3 rounded-lg cursor-pointer gap-1.5 shadow-2xs font-medium"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Hapus Postingan
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onResolveModeration(mod.id, "Abaikan")}
                        className="h-8 text-xs px-3 rounded-lg cursor-pointer border-border/80 hover:bg-muted font-medium gap-1.5"
                      >
                        <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                        Abaikan Laporan
                      </Button>
                    </>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/60 text-xs text-muted-foreground">
                      <CheckCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Kasus {mod.status.toLowerCase()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {displayedList.length === 0 && (
          <div className="py-16 text-center text-muted-foreground text-xs rounded-xl border border-dashed border-border/70 bg-card/40">
            <ShieldCheck className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="font-semibold text-foreground text-sm">Tidak ada laporan pada filter ini</p>
            <p className="text-muted-foreground mt-0.5">Semua postingan forum aman dan terkontrol dengan baik.</p>
          </div>
        )}
      </div>
    </div>
  );
}
