"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Users,
  MessageSquareWarning,
  MessageSquare,
  CreditCard,
  Settings,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Sun,
  Moon,
  Bell,
  Trash2,
  Sparkles,
  ShieldAlert,
  UserCheck,
  UserX,
  Activity,
  DollarSign,
  Download,
  Send,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  adminStats,
  forumCategoryStats,
  initialUsers,
  initialModeration,
  initialTransactions,
  platformActivityLogs,
  type UserItem,
  type ModerationItem,
  type TransactionItem,
} from "./mock-data";

export default function AdminDashboard() {
  const { setTheme, resolvedTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "moderation" | "billing" | "settings"
  >("overview");

  // Interactive local states
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [userSearch, setUserSearch] = useState("");
  const [userPlanFilter, setUserPlanFilter] = useState<
    "Semua" | "Gratis" | "Pro"
  >("Semua");
  const [userStatusFilter, setUserStatusFilter] = useState<
    "Semua" | "Aktif" | "Ditangguhkan"
  >("Semua");

  const [moderations, setModerations] =
    useState<ModerationItem[]>(initialModeration);
  const [modFilter, setModFilter] = useState<
    "Semua" | "Perlu Tindakan" | "Diselesaikan" | "Diabaikan"
  >("Semua");

  const [transactions, setTransactions] =
    useState<TransactionItem[]>(initialTransactions);
  const [trxFilter, setTrxFilter] = useState<"Semua" | "Berhasil" | "Menunggu">(
    "Semua",
  );

  // Settings states
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [broadcastMessage, setBroadcastMessage] = useState("");

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

  // Filtered Moderations
  const filteredModerations = useMemo(() => {
    return moderations.filter((m) => {
      return modFilter === "Semua" || m.status === modFilter;
    });
  }, [moderations, modFilter]);

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
  const handleToggleUserStatus = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "Aktif" ? "Ditangguhkan" : "Aktif";
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: nextStatus as "Aktif" | "Ditangguhkan" }
          : u,
      ),
    );
    if (nextStatus === "Ditangguhkan") {
      toast.error(`Akun ${id} berhasil ditangguhkan dari sistem.`);
    } else {
      toast.success(`Akun ${id} telah diaktifkan kembali.`);
    }
  };

  const handleResolveModeration = (id: string, action: "Hapus" | "Abaikan") => {
    setModerations((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, status: action === "Hapus" ? "Diselesaikan" : "Diabaikan" }
          : m,
      ),
    );
    if (action === "Hapus") {
      toast.success(
        `Postingan berhasil dihapus dari forum dan laporan diselesaikan.`,
      );
    } else {
      toast.info(`Laporan telah diabaikan (postingan tetap tayang).`);
    }
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    toast.success(
      `Pengumuman berhasil disiarkan ke seluruh pengguna: "${broadcastMessage}"`,
    );
    setBroadcastMessage("");
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
          {/* ================= TAB 1: OVERVIEW ================= */}
          {activeTab === "overview" && (
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
                {adminStats.map((stat, i) => (
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
                      <p className="text-2xl font-bold tracking-tight">
                        {stat.value}
                      </p>
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
                      <h2 className="text-base font-bold">
                        Log Aktivitas Sistem
                      </h2>
                      <span className="text-xs text-muted-foreground">
                        Real-time
                      </span>
                    </div>

                    <div className="mt-4 space-y-3.5">
                      {platformActivityLogs.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-start gap-3 text-xs"
                        >
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
                            <p className="font-semibold text-foreground">
                              {log.title}
                            </p>
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
                    onClick={() => setActiveTab("users")}
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
                        <tr
                          key={u.id}
                          className="hover:bg-secondary/30 transition-colors"
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="h-7 w-7 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-[10px]">
                                {u.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-foreground">
                                  {u.name}
                                </p>
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
                              variant={
                                u.status === "Aktif" ? "default" : "destructive"
                              }
                              className="text-[10px]"
                            >
                              {u.status}
                            </Badge>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs cursor-pointer"
                              onClick={() =>
                                handleToggleUserStatus(u.id, u.status)
                              }
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
          )}

          {/* ================= TAB 2: PENGGUNA ================= */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Manajemen Pengguna
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Kelola akun pengguna, paket langganan, dan status aktif
                  komunitas petani TanamanKu.
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
                  {(["Semua", "Aktif", "Ditangguhkan"] as const).map(
                    (status) => (
                      <Button
                        key={status}
                        variant={
                          userStatusFilter === status ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setUserStatusFilter(status)}
                        className="rounded-xl text-xs cursor-pointer"
                      >
                        {status}
                      </Button>
                    ),
                  )}
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
                        <th className="px-5 py-3.5 text-right">
                          Aksi Moderator
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredUsers.map((u) => (
                        <tr
                          key={u.id}
                          className="hover:bg-secondary/30 transition-colors"
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs">
                                {u.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-foreground">
                                  {u.name}
                                </p>
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
                              variant={
                                u.status === "Aktif" ? "default" : "destructive"
                              }
                              className="text-[10px]"
                            >
                              {u.status}
                            </Badge>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <Button
                              size="sm"
                              variant={
                                u.status === "Aktif" ? "outline" : "default"
                              }
                              onClick={() =>
                                handleToggleUserStatus(u.id, u.status)
                              }
                              className="h-7 text-xs cursor-pointer"
                            >
                              {u.status === "Aktif" ? (
                                <>
                                  <UserX className="mr-1.5 h-3.5 w-3.5" />
                                  Tangguhkan
                                </>
                              ) : (
                                <>
                                  <UserCheck className="mr-1.5 h-3.5 w-3.5" />
                                  Aktifkan
                                </>
                              )}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredUsers.length === 0 && (
                  <div className="py-12 text-center text-muted-foreground text-sm">
                    Tidak ada pengguna yang cocok dengan kriteria pencarian atau
                    filter.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 3: MODERASI FORUM ================= */}
          {activeTab === "moderation" && (
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
                          Penulis: <strong>{mod.author}</strong> (
                          {mod.authorEmail})
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
                            onClick={() =>
                              handleResolveModeration(mod.id, "Hapus")
                            }
                            className="h-8 text-xs cursor-pointer"
                          >
                            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                            Hapus Postingan
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleResolveModeration(mod.id, "Abaikan")
                            }
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
          )}

          {/* ================= TAB 4: BILLING & LANGGANAN ================= */}
          {activeTab === "billing" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Langganan & Riwayat Transaksi
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Pantau pendapatan paket TumbuhKita Pro, pembayaran QRIS,
                  Virtual Account, dan status tagihan.
                </p>
              </div>

              {/* Transactions Table */}
              <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-border">
                  <h2 className="text-base font-bold">Transaksi Terbaru</h2>
                  <div className="flex gap-2">
                    {(["Semua", "Berhasil", "Menunggu"] as const).map(
                      (status) => (
                        <Button
                          key={status}
                          size="sm"
                          variant={trxFilter === status ? "default" : "outline"}
                          onClick={() => setTrxFilter(status)}
                          className="text-xs h-8 rounded-lg cursor-pointer"
                        >
                          {status}
                        </Button>
                      ),
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-secondary/50 text-muted-foreground uppercase font-bold border-b border-border">
                      <tr>
                        <th className="px-5 py-3.5">ID Transaksi</th>
                        <th className="px-5 py-3.5">Pelanggan</th>
                        <th className="px-5 py-3.5">Paket</th>
                        <th className="px-5 py-3.5">Metode</th>
                        <th className="px-5 py-3.5">Nominal</th>
                        <th className="px-5 py-3.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredTransactions.map((trx) => (
                        <tr
                          key={trx.id}
                          className="hover:bg-secondary/30 transition-colors"
                        >
                          <td className="px-5 py-3.5 font-mono font-bold">
                            {trx.id}
                          </td>
                          <td className="px-5 py-3.5">
                            <p className="font-bold text-foreground">
                              {trx.userName}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {trx.userEmail}
                            </p>
                          </td>
                          <td className="px-5 py-3.5 font-medium">
                            {trx.plan}
                          </td>
                          <td className="px-5 py-3.5 text-muted-foreground">
                            {trx.method}
                          </td>
                          <td className="px-5 py-3.5 font-bold text-foreground">
                            Rp {trx.amount.toLocaleString("id-ID")}
                          </td>
                          <td className="px-5 py-3.5">
                            <Badge
                              variant={
                                trx.status === "Berhasil"
                                  ? "default"
                                  : "secondary"
                              }
                              className={
                                trx.status === "Berhasil"
                                  ? "bg-emerald-600"
                                  : ""
                              }
                            >
                              {trx.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 5: PENGATURAN SISTEM ================= */}
          {activeTab === "settings" && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Pengaturan Sistem Admin
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Konfigurasi parameter operasional platform, pengumuman publik,
                  dan kontrol akses.
                </p>
              </div>

              {/* Broadcast Announcement */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-foreground">
                  Siarkan Pengumuman ke Pengguna (Broadcast)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Pesan pengumuman akan ditampilkan pada banner atas beranda
                  seluruh pengguna aplikasi.
                </p>
                <form onSubmit={handleSendBroadcast} className="flex gap-3">
                  <Input
                    placeholder="Tulis pengumuman penting (misal: Maintenance malam ini pukul 23:00 WIB)..."
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    className="bg-card rounded-xl text-xs flex-1"
                  />
                  <Button type="submit" size="sm" className="cursor-pointer">
                    <Send className="mr-1.5 h-3.5 w-3.5" />
                    Kirim Banner
                  </Button>
                </form>
              </div>

              {/* Access Controls */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-6">
                <h3 className="text-base font-bold text-foreground">
                  Kontrol Akses Platform
                </h3>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      Pendaftaran Pengguna Baru
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Bila dinonaktifkan, pendaftaran akun baru akan ditutup
                      sementara.
                    </p>
                  </div>
                  <Button
                    variant={allowRegistration ? "default" : "outline"}
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => {
                      setAllowRegistration(!allowRegistration);
                      toast.info(`Pendaftaran pengguna baru diubah`);
                    }}
                  >
                    {allowRegistration ? "Diizinkan" : "Ditutup"}
                  </Button>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-destructive">
                      Mode Pemeliharaan (Maintenance Mode)
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Hanya administrator yang dapat mengakses website bila
                      diaktifkan.
                    </p>
                  </div>
                  <Button
                    variant={maintenanceMode ? "destructive" : "outline"}
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => {
                      setMaintenanceMode(!maintenanceMode);
                      toast.info(
                        `Mode pemeliharaan ${!maintenanceMode ? "diaktifkan" : "dinonaktifkan"}`,
                      );
                    }}
                  >
                    {maintenanceMode ? "Sedang Aktif" : "Non-Aktif"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
