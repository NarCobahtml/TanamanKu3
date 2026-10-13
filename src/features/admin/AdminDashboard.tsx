"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Users,
  MessageSquareWarning,
  CreditCard,
  Settings,
  Sun,
  Moon,
  Bell,
} from "lucide-react";
import {
  adminStats as defaultStats,
  forumCategoryStats,
  initialUsers,
  initialModeration,
  initialTransactions,
  platformActivityLogs,
} from "./mock-data";
import type {
  AdminStat,
  UserItem,
  ModerationItem,
  TransactionItem,
} from "./types";
import {
  OverviewTab,
  UsersTab,
  ModerationTab,
  BillingTab,
  SettingsTab,
} from "./components";

export default function AdminDashboard() {
  const { setTheme, resolvedTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "moderation" | "billing" | "settings"
  >("overview");

  // Interactive local & live database states
  const [stats, setStats] = useState<AdminStat[]>(defaultStats);
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [userSearch, setUserSearch] = useState("");
  const [userPlanFilter, setUserPlanFilter] = useState<
    "Semua" | "Gratis" | "Pro"
  >("Semua");
  const [userStatusFilter, setUserStatusFilter] = useState<
    "Semua" | "Aktif" | "Ditangguhkan"
  >("Semua");
  const [moderations, setModerations] = useState<ModerationItem[]>(initialModeration);
  const [transactions, setTransactions] = useState<TransactionItem[]>(initialTransactions);

  // Settings states
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [isSubmittingBroadcast, setIsSubmittingBroadcast] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const fetchAdminData = () => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          if (json.data.stats && Array.isArray(json.data.stats)) {
            setStats(json.data.stats);
          }
          if (json.data.users && Array.isArray(json.data.users) && json.data.users.length > 0) {
            setUsers(json.data.users);
          }
          if (json.data.moderations && Array.isArray(json.data.moderations)) {
            setModerations(json.data.moderations);
          }
          if (json.data.transactions && Array.isArray(json.data.transactions) && json.data.transactions.length > 0) {
            setTransactions(json.data.transactions);
          }
          if (json.data.settings) {
            setMaintenanceMode(Boolean(json.data.settings.maintenanceMode));
            setAllowRegistration(Boolean(json.data.settings.allowRegistration));
          }
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch admin stats:', err);
      });
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const [trxFilter, setTrxFilter] = useState<"Semua" | "Berhasil" | "Menunggu">(
    "Semua",
  );

  const isDark = resolvedTheme === "dark";

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase());
      const matchPlan = userPlanFilter === "Semua" || u.plan === userPlanFilter;
      const matchStatus =
        userStatusFilter === "Semua" || u.status === userStatusFilter;
      return matchSearch && matchPlan && matchStatus;
    });
  }, [users, userSearch, userPlanFilter, userStatusFilter]);

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      return trxFilter === "Semua" || t.status === trxFilter;
    });
  }, [transactions, trxFilter]);

  const pendingReportsCount = useMemo(() => {
    return moderations.filter((m) => m.status === "Perlu Tindakan").length;
  }, [moderations]);

  // Action handlers
  const handleToggleUserStatus = async (user: UserItem) => {
    const targetId = user.fullId || user.id;
    const nextStatus = user.status === "Aktif" ? "Ditangguhkan" : "Aktif";
    setUpdatingUserId(user.id);

    try {
      const res = await fetch(`/api/admin/users/${targetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal memperbarui status pengguna");
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? { ...u, status: nextStatus as "Aktif" | "Ditangguhkan" }
            : u,
        ),
      );

      if (nextStatus === "Ditangguhkan") {
        toast.error(`Akun ${user.name} berhasil ditangguhkan dari sistem.`);
      } else {
        toast.success(`Akun ${user.name} telah diaktifkan kembali.`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      toast.error(message);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleToggleUserPlan = async (user: UserItem) => {
    const targetId = user.fullId || user.id;
    const nextPlan = user.plan === "Pro" ? "FREE" : "PRO";
    setUpdatingUserId(user.id);

    try {
      const res = await fetch(`/api/admin/users/${targetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: nextPlan }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal mengubah paket pengguna");
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? { ...u, plan: nextPlan === "PRO" ? "Pro" : "Gratis" }
            : u,
        ),
      );
      toast.success(
        `Paket ${user.name} berhasil diubah menjadi ${nextPlan === "PRO" ? "Pro" : "Gratis"}`
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      toast.error(message);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteUser = async (user: UserItem) => {
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin MENGHAPUS PERMANEN akun "${user.name}" (${user.email})? Seluruh data tanaman, scan, dan postingan pengguna ini akan dihapus.`
    );
    if (!confirmDelete) return;

    const targetId = user.fullId || user.id;
    setUpdatingUserId(user.id);

    try {
      const res = await fetch(`/api/admin/users/${targetId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal menghapus pengguna");
      }

      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      toast.success(`Akun ${user.name} berhasil dihapus permanen.`);
      fetchAdminData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      toast.error(message);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleResolveModeration = async (id: string, action: "Hapus" | "Abaikan") => {
    try {
      if (action === "Hapus") {
        const confirmDelete = window.confirm(
          "Hapus postingan ini secara permanen dari basis data?"
        );
        if (!confirmDelete) return;

        const res = await fetch(`/api/admin/moderation/${id}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Gagal menghapus postingan");
        }

        setModerations((prev) =>
          prev.map((m) =>
            m.id === id ? { ...m, status: "Diselesaikan" as const } : m,
          ),
        );
        toast.success(`Postingan berhasil dihapus dari forum dan laporan diselesaikan.`);
      } else {
        const res = await fetch(`/api/admin/moderation/${id}`, {
          method: "PATCH",
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Gagal menyetujui laporan");
        }

        setModerations((prev) =>
          prev.map((m) =>
            m.id === id ? { ...m, status: "Diabaikan" as const } : m,
          ),
        );
        toast.info(`Laporan telah disetujui/diabaikan (postingan tetap tayang).`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      toast.error(message);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    setIsSubmittingBroadcast(true);
    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: broadcastMessage.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal mengirim pengumuman broadcast');
      }

      toast.success(
        `Pengumuman berhasil disiarkan ke ${data.data.recipientCount} pengguna di sistem.`
      );
      setBroadcastMessage("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      toast.error(message);
    } finally {
      setIsSubmittingBroadcast(false);
    }
  };

  const handleUpdateSettings = async (updates: {
    allowRegistration?: boolean;
    maintenanceMode?: boolean;
  }) => {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal memperbarui pengaturan sistem');
      }

      if (typeof updates.allowRegistration !== 'undefined') {
        setAllowRegistration(updates.allowRegistration);
        toast.success(
          updates.allowRegistration
            ? "Pendaftaran pengguna baru kini DIBUKA."
            : "Pendaftaran pengguna baru DITUTUP sementara."
        );
      }
      if (typeof updates.maintenanceMode !== 'undefined') {
        setMaintenanceMode(updates.maintenanceMode);
        toast.success(
          updates.maintenanceMode
            ? "Mode pemeliharaan DIAKTIFKAN."
            : "Mode pemeliharaan DINONAKTIFKAN."
        );
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      toast.error(message);
    }
  };

  return (
    <div className="flex min-h-screen bg-secondary/30 text-foreground">
      {/* ================= SIDEBAR ================= */}
      <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-border bg-card p-5 lg:flex">
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-6 border-b border-border">
          <Link href="/admin" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                isDark
                  ? "/figma-assets/logo-fix.svg"
                  : "/figma-assets/logo-fix-ink.svg"
              }
              alt="TanamanKu"
              className="h-8 w-auto"
            />
          </Link>
        </div>

        {/* Navigation Items */}
        <div className="mt-6 flex-1 space-y-1.5">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Menu Utama
          </p>

          <button
            onClick={() => setActiveTab("overview")}
            className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
              activeTab === "overview"
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Ringkasan</span>
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
              activeTab === "users"
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4" />
              <span>Pengguna</span>
            </div>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${activeTab === "users" ? "bg-white/20 text-white font-bold" : "bg-secondary text-muted-foreground"}`}
            >
              {users.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("moderation")}
            className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
              activeTab === "moderation"
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-3">
              <MessageSquareWarning className="h-4 w-4" />
              <span>Moderasi Forum</span>
            </div>
            {pendingReportsCount > 0 ? (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  activeTab === "moderation"
                    ? "bg-white/20 text-white"
                    : "bg-red-500/15 text-red-600 dark:text-red-400"
                }`}
              >
                {pendingReportsCount}
              </span>
            ) : null}
          </button>

          <button
            onClick={() => setActiveTab("billing")}
            className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
              activeTab === "billing"
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <CreditCard className="h-4 w-4" />
            <span>Langganan & Transaksi</span>
          </button>

          <div className="pt-3">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Sistem
            </p>
          </div>

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
              activeTab === "settings"
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Pengaturan Sistem</span>
          </button>
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                AD
              </div>
              <div className="text-left">
                <p className="text-xs font-bold leading-none">Admin Utama</p>
                <p className="text-[10px] text-muted-foreground">
                  Super Administrator
                </p>
              </div>
            </div>

            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              aria-label="Toggle theme"
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/90 px-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Admin Console</span>
              <span>/</span>
              <span className="font-semibold text-foreground capitalize">
                {activeTab === "overview"
                  ? "Ringkasan"
                  : activeTab === "users"
                    ? "Manajemen Pengguna"
                    : activeTab === "moderation"
                      ? "Moderasi Forum"
                      : activeTab === "billing"
                        ? "Langganan & Transaksi"
                        : "Pengaturan Sistem"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Tab Pills */}
            <div className="flex lg:hidden overflow-x-auto py-1 max-w-[200px] sm:max-w-xs gap-1">
              {(
                [
                  "overview",
                  "users",
                  "moderation",
                  "billing",
                  "settings",
                ] as const
              ).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 text-xs rounded-lg font-medium whitespace-nowrap cursor-pointer ${
                    activeTab === tab
                      ? "bg-primary text-white font-bold"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {tab === "overview"
                    ? "Ringkasan"
                    : tab === "users"
                      ? "Pengguna"
                      : tab === "moderation"
                        ? "Moderasi"
                        : tab === "billing"
                          ? "Billing"
                          : "Pengaturan"}
                </button>
              ))}
            </div>

            <button
              onClick={() =>
                toast.info(
                  `Terdapat ${pendingReportsCount} laporan forum yang butuh tindakan`,
                )
              }
              className="relative p-2 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
              aria-label="Notifikasi"
            >
              <Bell className="h-4 w-4" />
              {pendingReportsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
              )}
            </button>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="p-6 sm:p-8 space-y-8 flex-1 max-w-7xl w-full mx-auto">
          {activeTab === "overview" && (
            <OverviewTab
              stats={stats}
              users={users}
              forumCategoryStats={forumCategoryStats}
              platformActivityLogs={platformActivityLogs}
              onNavigateToUsers={() => setActiveTab("users")}
              onToggleUserStatus={handleToggleUserStatus}
              updatingUserId={updatingUserId}
            />
          )}

          {activeTab === "users" && (
            <UsersTab
              userSearch={userSearch}
              setUserSearch={setUserSearch}
              userPlanFilter={userPlanFilter}
              setUserPlanFilter={setUserPlanFilter}
              userStatusFilter={userStatusFilter}
              setUserStatusFilter={setUserStatusFilter}
              filteredUsers={filteredUsers}
              updatingUserId={updatingUserId}
              onToggleUserStatus={handleToggleUserStatus}
              onToggleUserPlan={handleToggleUserPlan}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {activeTab === "moderation" && (
            <ModerationTab
              filteredModerations={moderations}
              onResolveModeration={handleResolveModeration}
            />
          )}

          {activeTab === "billing" && (
            <BillingTab
              trxFilter={trxFilter}
              setTrxFilter={setTrxFilter}
              filteredTransactions={filteredTransactions}
            />
          )}

          {activeTab === "settings" && (
            <SettingsTab
              broadcastMessage={broadcastMessage}
              setBroadcastMessage={setBroadcastMessage}
              isSubmittingBroadcast={isSubmittingBroadcast}
              onSendBroadcast={handleSendBroadcast}
              allowRegistration={allowRegistration}
              maintenanceMode={maintenanceMode}
              onUpdateSettings={handleUpdateSettings}
            />
          )}
        </main>
      </div>
    </div>
  );
}
