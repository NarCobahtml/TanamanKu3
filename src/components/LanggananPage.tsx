"use client";

import { useState } from "react";
import Script from "next/script";
import { CreditCard, Sparkles, CircleCheck, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/PageHeader";
import { ActionButton } from "@/components/ui/action-button";
import { CurrentPlanCard } from "@/components/shared/subscription/CurrentPlanCard";
import { ScanUsageCard } from "@/components/shared/subscription/ScanUsageCard";
import TkRevealClient from "@/components/landing/tk-reveal-client";
import { toast } from "sonner";

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options?: {
          onSuccess?: (result: unknown) => void;
          onPending?: (result: unknown) => void;
          onError?: (result: unknown) => void;
          onClose?: () => void;
        },
      ) => void;
    };
  }
}

export default function LanggananPage() {
  const t = useTranslations("langganan");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const plans = [
    {
      id: "gratis",
      name: t("paketGratis"),
      price: t("gratis"),
      amount: 0,
      period: t("selamanya"),
      features: [t("scanBulan"), t("fitur1"), t("fitur2")],
      buttonLabel: t("paketAktif"),
      isCurrent: true,
    },
    {
      id: "premium",
      name: t("premium"),
      price: t("harga"),
      amount: 29000,
      period: t("perBulan"),
      features: [
        t("fiturPremium1"),
        t("fiturPremium2"),
        t("fiturPremium3"),
        t("fiturPremium4"),
      ],
      buttonLabel: t("upgradeSekarang"),
      isCurrent: false,
    },
  ];

  const handleSubscribe = async (plan: (typeof plans)[0]) => {
    if (plan.isCurrent) return;

    setLoadingPlan(plan.id);

    try {
      const res = await fetch("/api/payment/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          planName: plan.name,
          price: plan.amount,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.data?.token) {
        throw new Error(
          data.error?.message || "Gagal memproses sesi pembayaran.",
        );
      }

      if (typeof window !== "undefined" && window.snap) {
        window.snap.pay(data.data.token, {
          onSuccess: function (result: unknown) {
            console.log("Payment success:", result);
            toast.success(
              "Pembayaran berhasil! Akun Anda telah ditingkatkan ke Paket Premium.",
            );
          },
          onPending: function (result: unknown) {
            console.log("Payment pending:", result);
            toast.info("Menunggu pembayaran Anda diselesaikan.");
          },
          onError: function (result: unknown) {
            console.error("Payment error:", result);
            toast.error("Pembayaran gagal atau dibatalkan.");
          },
          onClose: function () {
            toast.info("Popup pembayaran ditutup.");
          },
        });
      } else if (data.data?.redirectUrl) {
        window.location.href = data.data.redirectUrl;
      }
    } catch (err: unknown) {
      console.error("Subscribe error:", err);
      const msg =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat memproses pembayaran.";
      toast.error(msg);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div>
      {/* Midtrans Snap Sandbox Script */}
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />

      <PageHeader
        overline={t("paketTagihan")}
        title={t("langganan")}
        accent={t("langganan")}
        description={t("langgananDesc")}
      >
        {/* Current usage stat */}
        <div className="flex flex-wrap gap-x-12 gap-y-6">
          <div>
            <p className="tnum text-4xl font-extrabold leading-none text-primary">
              3/5
            </p>
            <p className="overline mt-2">{t("scanTerpakai")}</p>
          </div>
          <div>
            <p className="tnum text-4xl font-extrabold leading-none">
              {t("gratis")}
            </p>
            <p className="overline mt-2">{t("paketAktif")}</p>
          </div>
        </div>
      </PageHeader>

      <div className="mx-auto w-full max-w-7xl space-y-16 px-4 pb-24 pt-14 sm:px-6">
        {/* Current plan + usage */}
        <TkRevealClient>
          <section>
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <CreditCard className="h-5 w-5 text-primary" aria-hidden="true" />
              {t("paketAktif")}
            </h2>
            <div className="mt-5 grid gap-8 md:grid-cols-2">
              <CurrentPlanCard
                name={t("paketGratis")}
                badgeLabel={t("aktif")}
                description={t("paketDesc")}
                renewalNote={t("perpanjangan")}
                className="p-5"
              />
              <ScanUsageCard
                title={t("penggunaanScan")}
                usageText="3/5"
                current={3}
                max={5}
                barHeightClass="h-1.5"
                className="p-5"
              >
                <p className="mt-2 text-xs text-muted-foreground">
                  {t("tersisa")}
                </p>
              </ScanUsageCard>
            </div>
          </section>
        </TkRevealClient>

        {/* Plans */}
        <TkRevealClient>
          <section className="rule pt-14">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
              {t("pilihPaket")}
            </h2>
            <div className="mt-5 grid gap-8 md:grid-cols-2">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40 flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-xl font-semibold">{plan.name}</h3>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-primary">
                        {plan.price}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {plan.period}
                      </span>
                    </div>
                    <ul className="mt-6 space-y-3">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm">
                          <CircleCheck
                            className="h-4 w-4 text-success shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {plan.isCurrent ? (
                    <ActionButton
                      variant="outline"
                      icon={null}
                      disabled
                      className="mt-8 w-full cursor-not-allowed opacity-80"
                    >
                      {plan.buttonLabel}
                    </ActionButton>
                  ) : (
                    <ActionButton
                      variant="primary"
                      icon={loadingPlan === plan.id ? Loader2 : Sparkles}
                      disabled={loadingPlan === plan.id}
                      onClick={() => handleSubscribe(plan)}
                      className="mt-8 w-full"
                    >
                      {loadingPlan === plan.id
                        ? "Memproses..."
                        : plan.buttonLabel}
                    </ActionButton>
                  )}
                </div>
              ))}
            </div>
          </section>
        </TkRevealClient>
      </div>
    </div>
  );
}
