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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Moderasi Forum
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Tinjau laporan postingan forum, spam, dan kepatuhan komunitas TanamanKu.
          </p>
        </div>

        <div className="flex items-center gap-1 self-start sm:self-auto p-1 bg-muted/40 rounded-xl">
          {(
            [
              { key: "Semua", label: "Semua", count: counts.all },
              { key: "Perlu Tindakan", label: "Perlu Tindakan", count: counts.pending },
              { key: "Diselesaikan", label: "Diselesaikan", count: counts.resolved },
              { key: "Diabaikan", label: "Diabaikan", count: counts.dismissed },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-medium transition-all cursor-pointer ${
                statusFilter === tab.key
                  ? "bg-foreground text-background font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[11px] tabular-nums ${
                  statusFilter === tab.key
                    ? "text-background/80"
                    : "text-muted-foreground"
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

          return (
            <div
              key={mod.id}
              className="rounded-2xl border border-border/60 bg-card p-4 sm:p-5 shadow-xs transition-all hover:border-border"
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="space-y-2.5 min-w-0 flex-1">
                  {/* Meta Pills Row */}
                  <div className="flex flex-wrap items-center gap-2.5 text-xs">
                    <span className="font-mono text-[11px] text-muted-foreground">
                      #{mod.id.slice(0, 8)}
                    </span>
                    <span className="text-muted-foreground/40">·</span>
                    <span className="text-muted-foreground font-medium">
                      {mod.category}
                    </span>
                    <span className="text-muted-foreground/40">·</span>
                    {/* Status: hanya teks */}
                    <span className="font-medium text-foreground">
                      {mod.status}
                    </span>
                    <span className="text-muted-foreground/40">·</span>
                    {/* Laporan: teks sederhana */}
                    <span className="text-muted-foreground font-medium">
                      {mod.reportsCount} Laporan ({mod.reportReason})
                    </span>
                  </div>

                  {/* Post Title */}
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-base text-foreground leading-snug">
                      {mod.postTitle}
                    </h3>
                    <Link
                      href={`/forum/${mod.id}`}
                      target="_blank"
                      className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                      title="Buka postingan forum di tab baru"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  {/* Snippet Quote */}
                  <div className="bg-muted/30 px-3.5 py-2.5 rounded-xl text-xs text-foreground/85 leading-relaxed">
                    &ldquo;{mod.snippet}&rdquo;
                  </div>

                  {/* Author Meta */}
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    <span>
                      Penulis: <strong className="text-foreground font-medium">{mod.author}</strong> ({mod.authorEmail})
                    </span>
                    <span className="text-muted-foreground/40">·</span>
                    <span>{mod.date}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end lg:self-center pt-2 lg:pt-0">
                  {isPending ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onResolveModeration(mod.id, "Hapus")}
                        className="h-8 text-xs px-3 rounded-xl cursor-pointer font-medium hover:bg-destructive/10 hover:text-destructive border-border/70"
                      >
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                        Hapus Post
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onResolveModeration(mod.id, "Abaikan")}
                        className="h-8 text-xs px-3 rounded-xl cursor-pointer text-muted-foreground hover:text-foreground font-medium"
                      >
                        Abaikan
                      </Button>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground font-medium px-2 py-1">
                      Kasus {mod.status.toLowerCase()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {displayedList.length === 0 && (
          <div className="py-16 text-center text-muted-foreground text-xs rounded-2xl border border-dashed border-border/60 bg-card/40">
            <p className="font-semibold text-foreground text-sm">Tidak ada laporan</p>
            <p className="text-muted-foreground mt-0.5">Semua postingan forum telah ditinjau.</p>
          </div>
        )}
      </div>
    </div>
  );
}
