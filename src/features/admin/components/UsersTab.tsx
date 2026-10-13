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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Manajemen Pengguna</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kelola akun pengguna, paket langganan, dan status aktif komunitas petani TanamanKu.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau email pengguna..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="pl-9 bg-card rounded-xl"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-muted-foreground font-medium mr-1">
            Paket:
          </span>
          {(["Semua", "Gratis", "Pro"] as const).map((plan) => (
            <Button
              key={plan}
              variant={userPlanFilter === plan ? "default" : "outline"}
              size="sm"
              onClick={() => setUserPlanFilter(plan)}
              className="rounded-xl text-xs cursor-pointer"
            >
              {plan}
            </Button>
          ))}

          <span className="text-xs text-muted-foreground font-medium ml-2 mr-1">
            Status:
          </span>
          {(["Semua", "Aktif", "Ditangguhkan"] as const).map((status) => (
            <Button
              key={status}
              variant={userStatusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setUserStatusFilter(status)}
              className="rounded-xl text-xs cursor-pointer"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/50 text-muted-foreground uppercase font-bold border-b border-border">
              <tr>
                <th className="px-5 py-3.5">Pengguna</th>
                <th className="px-5 py-3.5">Paket</th>
                <th className="px-5 py-3.5">Aktivitas Forum</th>
                <th className="px-5 py-3.5">Tanggal Bergabung</th>
                <th className="px-5 py-3.5">Status Akun</th>
                <th className="px-5 py-3.5 text-right">Aksi Moderator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs">
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
                  <td className="px-5 py-3.5 text-muted-foreground">
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
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={updatingUserId === u.id}
                        onClick={() => onToggleUserPlan(u)}
                        className="h-7 text-xs px-2 cursor-pointer"
                        title="Ubah paket langganan"
                      >
                        {u.plan === "Pro" ? "Jadikan Gratis" : "Jadikan Pro"}
                      </Button>

                      <Button
                        size="sm"
                        variant={u.status === "Aktif" ? "outline" : "default"}
                        disabled={updatingUserId === u.id}
                        onClick={() => onToggleUserStatus(u)}
                        className="h-7 text-xs px-2 cursor-pointer"
                      >
                        {u.status === "Aktif" ? (
                          <>
                            <UserX className="mr-1 h-3.5 w-3.5" />
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
                        variant="destructive"
                        disabled={updatingUserId === u.id}
                        onClick={() => onDeleteUser(u)}
                        className="h-7 w-7 p-0 cursor-pointer"
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
          <div className="py-12 text-center text-muted-foreground text-sm">
            Tidak ada pengguna yang cocok dengan kriteria pencarian atau filter.
          </div>
        )}
      </div>
    </div>
  );
}
