"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
            {(["Semua", "Berhasil", "Menunggu"] as const).map((status) => (
              <Button
                key={status}
                size="sm"
                variant={trxFilter === status ? "default" : "outline"}
                onClick={() => setTrxFilter(status)}
                className="text-xs h-8 rounded-lg cursor-pointer"
              >
                {status}
              </Button>
            ))}
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
                    <p className="font-bold text-foreground">{trx.userName}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {trx.userEmail}
                    </p>
                  </td>
                  <td className="px-5 py-3.5 font-medium">{trx.plan}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {trx.method}
                  </td>
                  <td className="px-5 py-3.5 font-bold text-foreground">
                    Rp {trx.amount.toLocaleString("id-ID")}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge
                      variant={
                        trx.status === "Berhasil" ? "default" : "secondary"
                      }
                      className={trx.status === "Berhasil" ? "bg-emerald-600" : ""}
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
  );
}
