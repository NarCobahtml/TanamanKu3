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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-border/40">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Ringkasan Platform & Operasional
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Pantau pertumbuhan pengguna, aktivitas forum, status sistem, dan metrik operasional secara real-time.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-muted-foreground font-medium">
            Sistem Aktif
          </span>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={stat.title}
            className="rounded-2xl border border-border/60 bg-card p-4 sm:p-5 shadow-xs transition-all hover:border-border"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground">
                {stat.title}
              </span>
              <div className="p-2 rounded-xl bg-muted/70 text-foreground">
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
              <div className="text-xs mt-1.5 flex items-center gap-1.5">
                <span className="font-medium text-foreground tabular-nums">
                  {stat.change}
                </span>
                <span className="text-muted-foreground">{stat.period}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Grid kategori dan log */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Forum Categories Activity */}
        <div className="lg:col-span-7 rounded-2xl border border-border/60 bg-card p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-border/40">
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-foreground">
                Aktivitas Kategori Forum Komunitas
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Distribusi topik diskusi dari total postingan forum
              </p>
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              Distribusi
            </span>
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
                <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-foreground/80 transition-all duration-500"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Log aktivitas sistem */}
        <div className="lg:col-span-5 rounded-2xl border border-border/60 bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-border/40">
              <h2 className="text-sm sm:text-base font-semibold text-foreground">
                Log Aktivitas Sistem
              </h2>
              <span className="text-xs text-muted-foreground font-medium">
                Real-time
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {platformActivityLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 text-xs p-2 rounded-xl transition-colors hover:bg-muted/30">
                  <span className="p-1.5 rounded-lg mt-0.5 shrink-0 bg-muted text-foreground">
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

          <div className="pt-4 mt-4 border-t border-border/40">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs h-8 cursor-pointer rounded-xl border-border/70 hover:bg-muted font-medium"
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
      <div className="rounded-2xl border border-border/60 bg-card shadow-xs overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-border/40">
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
            className="cursor-pointer text-xs h-8 rounded-xl self-start sm:self-auto gap-1.5 border-border/70 hover:bg-muted"
          >
            Kelola Semua Pengguna
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/30 text-muted-foreground uppercase text-[10px] font-semibold tracking-wider border-b border-border/40">
              <tr>
                <th className="px-5 py-3">Pengguna</th>
                <th className="px-4 py-3">Paket Akun</th>
                <th className="px-4 py-3">Aktivitas Forum</th>
                <th className="px-4 py-3">Tanggal Daftar</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {users.slice(0, 4).map((u) => (
                <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-lg bg-muted text-foreground font-semibold flex items-center justify-center text-[10px] shrink-0">
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
                    <span className="text-xs font-medium text-foreground">
                      {u.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground tabular-nums">
                    {u.postsCount} postingan
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground tabular-nums">
                    {u.joinDate}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-medium ${u.status === "Aktif" ? "text-foreground" : "text-muted-foreground"}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={updatingUserId === u.id}
                      className="h-7 text-xs px-2.5 rounded-lg cursor-pointer border-border/70 hover:bg-muted font-medium"
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
