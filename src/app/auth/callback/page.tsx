"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      try {
        const hash = window.location.hash.substring(1);
        const search = window.location.search.substring(1);
        const params = new URLSearchParams(hash || search);

        const errorParam = params.get("error");
        const errorDesc = params.get("error_description");

        if (errorParam || errorDesc) {
          const msg = decodeURIComponent(errorDesc || errorParam || "Login OAuth gagal.");
          if (msg.includes("provider is not enabled")) {
            setError("Google Auth belum diaktifkan di Supabase Dashboard (Auth -> Providers -> Google). Sila aktifkan provider Google di Supabase.");
          } else {
            setError(msg);
          }
          return;
        }

        const accessToken = params.get("access_token");

        let email = "";
        let name = "";
        let photoUrl = "";
        let userId = "";

        if (accessToken) {
          try {
            const payloadBase64 = accessToken.split(".")[1];
            if (payloadBase64) {
              const jsonPayload = decodeURIComponent(
                atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"))
                  .split("")
                  .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                  .join("")
              );
              const decoded = JSON.parse(jsonPayload);
              userId = decoded.sub || "";
              email = decoded.email || "";
              name = decoded.user_metadata?.full_name || decoded.user_metadata?.name || decoded.user_metadata?.custom_claims?.global_name || "";
              photoUrl = decoded.user_metadata?.avatar_url || decoded.user_metadata?.picture || "";
            }
          } catch (e) {
            console.error("Error parsing JWT:", e);
          }
        }

        if (!email) {
          email = params.get("email") || "";
          name = params.get("name") || "";
          photoUrl = params.get("photo_url") || params.get("avatar_url") || "";
          userId = params.get("sub") || params.get("user_id") || "";
        }

        if (!email) {
          setError("Tidak dapat mengambil informasi akun dari OAuth. Silakan coba login kembali.");
          return;
        }

        const res = await fetch("/api/auth/oauth-sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: userId,
            email,
            name,
            photoUrl,
          }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          setError(data.error?.message || "Gagal memproses sesi login OAuth.");
          return;
        }

        if (data.data?.user) {
          localStorage.setItem("tumbuhkita_user", JSON.stringify(data.data.user));
          window.dispatchEvent(new Event("auth-changed"));
        }

        router.push("/home");
        router.refresh();
      } catch (err: unknown) {
        console.error("Error in OAuth callback:", err);
        setError("Terjadi kesalahan saat memproses login.");
      }
    }

    handleCallback();
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-card text-foreground">
      {error ? (
        <div className="max-w-md space-y-4 rounded-xl border border-destructive/30 bg-destructive/10 p-6">
          <AlertCircle className="mx-auto size-10 text-destructive" />
          <h2 className="text-lg font-bold text-destructive">Autentikasi OAuth</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Kembali ke Halaman Login
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <Loader2 className="mx-auto size-10 animate-spin text-primary" />
          <h2 className="text-lg font-semibold">Menghubungkan Akun...</h2>
          <p className="text-sm text-muted-foreground">Mohon tunggu sebentar, Anda sedang dialihkan.</p>
        </div>
      )}
    </div>
  );
}
