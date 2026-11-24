"use client";

import { Search, UserX, UserCheck, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { UserItem } from "../types";

interface UsersTabProps {
  userSearch: string;
  setUserSearch: (val: string) => void;
  userPlanFilter: "Semua" | "Gratis" | "Pro";
  setUserPlanFilter: (val: "Semua" | "Gratis" | "Pro") => void;
  userStatusFilter: "Semua" | "Aktif" | "Ditangguhkan";
  setUserStatusFilter: (val: "Semua" | "Aktif" | "Ditangguhkan") => void;
  filteredUsers: UserItem[];
  updatingUserId: string | null;
  onToggleUserStatus: (user: UserItem) => void;
  onToggleUserPlan: (user: UserItem) => void;
  onDeleteUser: (user: UserItem) => void;
}

export function UsersTab({
  userSearch,
  setUserSearch,
  userPlanFilter,
  setUserPlanFilter,
  userStatusFilter,
  setUserStatusFilter,
  filteredUsers,
  updatingUserId,
  onToggleUserStatus,
  onToggleUserPlan,
  onDeleteUser,
}: UsersTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/50">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Manajemen Pengguna
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Kelola akun pekebun, tingkat langganan, dan hak akses komunitas TanamanKu.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-semibold tabular-nums text-muted-foreground bg-muted px-2.5 py-1 rounded-md border border-border/60">
            Total {filteredUsers.length} Pengguna
          </span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau email..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="pl-9 h-9 bg-card rounded-lg text-xs border-border/70 focus-visible:ring-1"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Plan Filter Segment */}
          <div className="flex items-center p-1 bg-muted/60 border border-border/60 rounded-lg">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80 px-2">
              Paket
            </span>
            {(["Semua", "Gratis", "Pro"] as const).map((plan) => (
              <button
                key={plan}
                onClick={() => setUserPlanFilter(plan)}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all cursor-pointer ${
                  userPlanFilter === plan
                    ? "bg-card text-foreground font-semibold shadow-2xs border border-border/60"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {plan}
              </button>
            ))}
          </div>

          {/* Status Filter Segment */}
          <div className="flex items-center p-1 bg-muted/60 border border-border/60 rounded-lg">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80 px-2">
              Status
            </span>
            {(["Semua", "Aktif", "Ditangguhkan"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setUserStatusFilter(status)}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all cursor-pointer ${
                  userStatusFilter === status
                    ? "bg-card text-foreground font-semibold shadow-2xs border border-border/60"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-border/70 bg-card shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] font-semibold tracking-wider border-b border-border/70">
              <tr>
                <th className="px-5 py-3">Pengguna</th>
                <th className="px-4 py-3">Paket</th>
                <th className="px-4 py-3">Aktivitas Forum</th>
                <th className="px-4 py-3">Tanggal Bergabung</th>
                <th className="px-4 py-3">Status Akun</th>
                <th className="px-5 py-3 text-right">Aksi Moderator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-md bg-primary/10 text-primary border border-primary/20 font-bold flex items-center justify-center text-[10px] shrink-0">
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
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={updatingUserId === u.id}
                        onClick={() => onToggleUserPlan(u)}
                        className="h-7 text-xs px-2.5 rounded-md cursor-pointer border-border hover:bg-muted font-medium"
                        title="Ubah paket langganan"
                      >
                        {u.plan === "Pro" ? "Ubah ke Gratis" : "Jadikan Pro"}
                      </Button>

                      <Button
                        size="sm"
                        variant={u.status === "Aktif" ? "outline" : "default"}
                        disabled={updatingUserId === u.id}
                        onClick={() => onToggleUserStatus(u)}
                        className={`h-7 text-xs px-2.5 rounded-md cursor-pointer font-medium ${
                          u.status === "Aktif"
                            ? "border-border hover:bg-muted"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white"
                        }`}
                      >
                        {u.status === "Aktif" ? (
                          <>
                            <UserX className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                            Tangguhkan
                          </>
                        ) : (
                          <>
                            <UserCheck className="mr-1 h-3.5 w-3.5" />
                            Aktifkan
                          </>
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={updatingUserId === u.id}
                        onClick={() => onDeleteUser(u)}
                        className="h-7 w-7 p-0 rounded-md cursor-pointer text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title="Hapus pengguna permanen"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="py-16 text-center text-muted-foreground text-xs">
            Tidak ada pengguna yang cocok dengan kriteria pencarian atau filter.
          </div>
        )}
      </div>
    </div>
  );
}
