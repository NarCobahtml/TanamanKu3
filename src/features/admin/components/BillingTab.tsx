"use client";

import { CreditCard, CheckCircle2, Clock } from "lucide-react";
import type { TransactionItem } from "../types";

interface BillingTabProps {
  trxFilter: "Semua" | "Berhasil" | "Menunggu";
  setTrxFilter: (val: "Semua" | "Berhasil" | "Menunggu") => void;
  filteredTransactions: TransactionItem[];
}

export function BillingTab({
  trxFilter,
  setTrxFilter,
  filteredTransactions,
}: BillingTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/50">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Langganan & Riwayat Transaksi
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Pantau arus pendapatan langganan TanamanKu Pro, metode pembayaran, dan status tagihan pengguna.
          </p>
        </div>
      </div>

      {/* Transactions Table Card */}
      <div className="rounded-xl border border-border/70 bg-card shadow-2xs overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-border/60">
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-foreground">
              Daftar Transaksi Terbaru
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Total {filteredTransactions.length} transaksi tercatat di sistem
            </p>
          </div>

          <div className="flex items-center p-1 bg-muted/60 border border-border/60 rounded-lg self-start sm:self-auto">
            {(["Semua", "Berhasil", "Menunggu"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setTrxFilter(status)}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all cursor-pointer ${
                  trxFilter === status
                    ? "bg-card text-foreground font-semibold shadow-2xs border border-border/60"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] font-semibold tracking-wider border-b border-border/70">
              <tr>
                <th className="px-5 py-3">ID Transaksi</th>
                <th className="px-4 py-3">Pelanggan</th>
                <th className="px-4 py-3">Paket</th>
                <th className="px-4 py-3">Metode</th>
                <th className="px-4 py-3">Nominal</th>
                <th className="px-5 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredTransactions.map((trx) => (
                <tr
                  key={trx.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-[11px] font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded border border-border/50">
                      {trx.id}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-foreground">{trx.userName}</p>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      {trx.userEmail}
                    </p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                        trx.plan === "Pro"
                          ? "bg-primary/10 border-primary/30 text-primary font-semibold"
                          : "bg-muted/60 border-border text-muted-foreground"
                      }`}
                    >
                      {trx.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground font-medium">
                    {trx.method}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-foreground tabular-nums">
                    Rp {trx.amount.toLocaleString("id-ID")}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium ${
                        trx.status === "Berhasil"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {trx.status === "Berhasil" ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          Berhasil
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3" />
                          Menunggu
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="py-16 text-center text-muted-foreground text-xs">
            Tidak ada transaksi dengan status &ldquo;{trxFilter}&rdquo;.
          </div>
        )}
      </div>
    </div>
  );
}
