"use client";

import {
  Users,
  CreditCard,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { AdminStat, UserItem, ForumCategoryStat } from "../types";

interface OverviewTabProps {
  stats: AdminStat[];
  users: UserItem[];
  forumCategoryStats: ForumCategoryStat[];
  platformActivityLogs: Array<{
    id: string | number;
    title: string;
    desc: string;
    time: string;
    type: "success" | "warning" | "info" | string;
  }>;
  onNavigateToUsers: () => void;
  onToggleUserStatus: (user: UserItem) => void;
  updatingUserId: string | null;
}

export function OverviewTab({
  stats,
  users,
  forumCategoryStats,
  platformActivityLogs,
  onNavigateToUsers,
  onToggleUserStatus,
  updatingUserId,
}: OverviewTabProps) {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-border/50">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Ringkasan Platform & Operasional
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Pantau pertumbuhan pengguna, aktivitas forum, status sistem, dan metrik operasional secara real-time.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Sistem Aktif
          </span>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={stat.title}
            className="rounded-xl border border-border/70 bg-card p-4 sm:p-5 shadow-2xs transition-all hover:border-primary/40 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {stat.title}
              </span>
              <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/15 transition-transform group-hover:scale-105">
                {i === 0 && <Users className="h-4 w-4" />}
                {i === 1 && <CreditCard className="h-4 w-4" />}
                {i === 2 && <MessageSquare className="h-4 w-4" />}
                {i === 3 && <AlertTriangle className="h-4 w-4" />}
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl sm:text-3xl font-bold tracking-tight tabular-nums text-foreground">
                {stat.value}
              </p>
              <div className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
                <span
                  className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-semibold tabular-nums ${
                    stat.isPositive
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {stat.change}
                </span>
                <span className="text-[11px] text-muted-foreground/80">{stat.period}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Grid kategori dan log */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Forum Categories Activity */}
        <div className="lg:col-span-7 rounded-xl border border-border/70 bg-card p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-border/60">
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-foreground">
                Aktivitas Kategori Forum Komunitas
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Distribusi topik diskusi dari total postingan forum
              </p>
            </div>
            <Badge variant="outline" className="text-[10px] font-medium tracking-wide uppercase">
              Distribusi
            </Badge>
          </div>

          <div className="mt-5 space-y-4">
            {forumCategoryStats.map((cat) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-foreground">{cat.name}</span>
                  <span className="text-muted-foreground tabular-nums font-semibold">
                    {cat.postsCount} diskusi <span className="text-muted-foreground/60 font-normal">({cat.percentage}%)</span>
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted/80 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${cat.color}`}
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Log aktivitas sistem */}
        <div className="lg:col-span-5 rounded-xl border border-border/70 bg-card p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <h2 className="text-sm sm:text-base font-semibold text-foreground">
                Log Aktivitas Sistem
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Live Feed
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {platformActivityLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 text-xs p-2 rounded-lg transition-colors hover:bg-muted/40">
                  <span
                    className={`p-1.5 rounded-md mt-0.5 shrink-0 border ${
                      log.type === "success"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : log.type === "warning"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                    }`}
                  >
                    {log.type === "success" && (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )}
                    {log.type === "warning" && (
                      <AlertTriangle className="h-3.5 w-3.5" />
                    )}
                    {log.type === "info" && (
                      <Activity className="h-3.5 w-3.5" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground leading-snug">{log.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{log.desc}</p>
                    <span className="text-[10px] text-muted-foreground/70 font-mono mt-1 inline-block">
                      {log.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-border/60">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs h-8 cursor-pointer rounded-lg border-border/80 hover:bg-muted font-medium"
              onClick={() =>
                toast.success("Semua metrik dan log telah diperbarui")
              }
            >
              Segarkan Log Metrik
            </Button>
          </div>
        </div>
      </div>

      {/* Tabel pengguna cepat */}
      <div className="rounded-xl border border-border/70 bg-card shadow-2xs overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-border/60">
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-foreground">
              Pengguna Terbaru
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Pekebun yang baru mendaftar di ekosistem TanamanKu
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onNavigateToUsers}
            className="cursor-pointer text-xs h-8 rounded-lg self-start sm:self-auto gap-1.5"
          >
            Kelola Semua Pengguna
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] font-semibold tracking-wider border-b border-border/60">
              <tr>
                <th className="px-5 py-3">Pengguna</th>
                <th className="px-4 py-3">Paket Akun</th>
                <th className="px-4 py-3">Aktivitas Forum</th>
                <th className="px-4 py-3">Tanggal Daftar</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {users.slice(0, 4).map((u) => (
                <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary border border-primary/20 font-bold flex items-center justify-center text-[10px] shrink-0">
                        {u.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{u.name}</p>
                        <p className="text-[11px] text-muted-foreground font-mono truncate">
                          {u.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                        u.plan === "Pro"
                          ? "bg-primary/10 border-primary/30 text-primary font-semibold"
                          : "bg-muted/60 border-border text-muted-foreground"
                      }`}
                    >
                      {u.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-foreground tabular-nums">
                    {u.postsCount} postingan
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground tabular-nums">
                    {u.joinDate}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium ${
                        u.status === "Aktif"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-destructive/10 text-destructive border border-destructive/20"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${u.status === "Aktif" ? "bg-emerald-500" : "bg-destructive"}`} />
                      {u.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={updatingUserId === u.id}
                      className="h-7 text-xs px-2.5 rounded-md cursor-pointer border-border hover:bg-muted"
                      onClick={() => onToggleUserStatus(u)}
                    >
                      {u.status === "Aktif" ? "Tangguhkan" : "Aktifkan"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
