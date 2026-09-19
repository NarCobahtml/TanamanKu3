import type { Metadata } from "next";
import Landing from "@/components/landing";

export const metadata: Metadata = {
  title: "TanamanKu - Platform Kesehatan Tanaman",
  description:
    "Deteksi penyakit tanaman dengan AI, pantau kondisi tanaman, dan kelola jadwal penyiraman dalam satu platform.",
};

export default function Page() {
  return <Landing />;
}
