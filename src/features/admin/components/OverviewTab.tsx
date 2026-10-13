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
    <div className="space-y-8">
      {/* Header Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Ringkasan Platform & Operasional
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Pantau pertumbuhan pengguna, pendapatan langganan, aktivitas
          forum, dan moderasi laporan komunitas.
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={stat.title}
            className="rounded-2xl border border-border bg-card p-5 shadow-xs transition-all hover:border-primary/40"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {stat.title}
              </span>
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                {i === 0 && <Users className="h-4 w-4" />}
                {i === 1 && <CreditCard className="h-4 w-4" />}
                {i === 2 && <MessageSquare className="h-4 w-4" />}
                {i === 3 && <AlertTriangle className="h-4 w-4" />}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
                <span
                  className={
                    stat.isPositive
                      ? "font-semibold text-emerald-600 dark:text-emerald-400"
                      : "font-semibold text-amber-600"
                  }
                >
                  {stat.change}
                </span>
                <span>{stat.period}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 2 Grid: Forum Categories & Activity Logs */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Forum Categories Activity */}
        <div className="lg:col-span-7 rounded-2xl border border-border bg-card p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div>
              <h2 className="text-base font-bold">
                Aktivitas Kategori Forum Komunitas
              </h2>
              <p className="text-xs text-muted-foreground">
                Distribusi topik diskusi dari total 5.420 postingan
              </p>
            </div>
            <Badge variant="outline" className="text-xs">
              Aktif
            </Badge>
          </div>

          <div className="mt-5 space-y-4">
            {forumCategoryStats.map((cat) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-foreground">{cat.name}</span>
                  <span className="text-muted-foreground font-semibold">
                    {cat.postsCount} diskusi ({cat.percentage}%)
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden">
                  <div
                    className={`h-full rounded-full ${cat.color}`}
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Activity & Logs */}
        <div className="lg:col-span-5 rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h2 className="text-base font-bold">Log Aktivitas Sistem</h2>
              <span className="text-xs text-muted-foreground">Real-time</span>
            </div>

            <div className="mt-4 space-y-3.5">
              {platformActivityLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 text-xs">
                  <span
                    className={`p-1.5 rounded-lg mt-0.5 ${
                      log.type === "success"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : log.type === "warning"
                          ? "bg-amber-500/10 text-amber-600"
                          : "bg-blue-500/10 text-blue-600"
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
                  <div>
                    <p className="font-semibold text-foreground">{log.title}</p>
                    <p className="text-muted-foreground">{log.desc}</p>
                    <span className="text-[10px] text-muted-foreground">
                      {log.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs cursor-pointer"
              onClick={() =>
                toast.success("Semua metrik dan log telah diperbarui")
              }
            >
              Segarkan Metrik
            </Button>
          </div>
        </div>
      </div>

      {/* Quick User List Table */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="text-base font-bold">Pengguna Terbaru</h2>
            <p className="text-xs text-muted-foreground">
              Pengguna yang baru mendaftar di TanamanKu
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onNavigateToUsers}
            className="cursor-pointer"
          >
            Kelola Semua Pengguna
            <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/50 text-muted-foreground uppercase font-bold border-b border-border">
              <tr>
                <th className="px-5 py-3.5">Pengguna</th>
                <th className="px-5 py-3.5">Paket Akun</th>
                <th className="px-5 py-3.5">Postingan Forum</th>
                <th className="px-5 py-3.5">Tanggal Daftar</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.slice(0, 4).map((u) => (
                <tr key={u.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-[10px]">
                        {u.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{u.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {u.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge
                      variant="outline"
                      className={
                        u.plan === "Pro"
                          ? "bg-primary/10 border-primary text-primary font-bold"
                          : ""
                      }
                    >
                      {u.plan}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-foreground">
                    {u.postsCount} postingan
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {u.joinDate}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge
                      variant={u.status === "Aktif" ? "default" : "destructive"}
                      className="text-[10px]"
                    >
                      {u.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={updatingUserId === u.id}
                      className="h-7 text-xs cursor-pointer"
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
