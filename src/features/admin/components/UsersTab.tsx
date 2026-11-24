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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Manajemen Pengguna
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Kelola akun pekebun, tingkat langganan, dan hak akses komunitas TanamanKu.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-muted-foreground font-medium">
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
            className="pl-9 h-9 bg-card rounded-xl text-xs border-border/60 focus-visible:ring-1"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Plan Filter Segment */}
          <div className="flex items-center p-1 bg-muted/40 rounded-xl">
            {(["Semua", "Gratis", "Pro"] as const).map((plan) => (
              <button
                key={plan}
                onClick={() => setUserPlanFilter(plan)}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer ${
                  userPlanFilter === plan
                    ? "bg-foreground text-background font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {plan}
              </button>
            ))}
          </div>

          {/* Status Filter Segment */}
          <div className="flex items-center p-1 bg-muted/40 rounded-xl">
            {(["Semua", "Aktif", "Ditangguhkan"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setUserStatusFilter(status)}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer ${
                  userStatusFilter === status
                    ? "bg-foreground text-background font-semibold shadow-xs"
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
      <div className="rounded-2xl border border-border/60 bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/30 text-muted-foreground uppercase text-[10px] font-semibold tracking-wider border-b border-border/40">
              <tr>
                <th className="px-5 py-3">Pengguna</th>
                <th className="px-4 py-3">Paket</th>
                <th className="px-4 py-3">Aktivitas Forum</th>
                <th className="px-4 py-3">Tanggal Bergabung</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filteredUsers.map((u) => (
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
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={updatingUserId === u.id}
                        onClick={() => onToggleUserPlan(u)}
                        className="h-7 text-xs px-2.5 rounded-lg cursor-pointer border-border/70 hover:bg-muted font-medium"
                        title="Ubah paket langganan"
                      >
                        {u.plan === "Pro" ? "Ubah ke Gratis" : "Jadikan Pro"}
                      </Button>

                      <Button
                        size="sm"
                        variant={u.status === "Aktif" ? "outline" : "default"}
                        disabled={updatingUserId === u.id}
                        onClick={() => onToggleUserStatus(u)}
                        className={`h-7 text-xs px-2.5 rounded-lg cursor-pointer font-medium ${
                          u.status === "Aktif"
                            ? "border-border/70 hover:bg-muted"
                            : "bg-foreground text-background hover:bg-foreground/90"
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
                        className="h-7 w-7 p-0 rounded-lg cursor-pointer text-muted-foreground hover:text-destructive hover:bg-destructive/10"
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
