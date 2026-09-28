import type { HealthLevel } from "@/components/shared/HealthStatus";
import type { KategoriTanaman, Tanaman } from "./types";

export const kategoriList: Array<"Semua" | KategoriTanaman> = [
  "Semua",
  "Indoor",
  "Outdoor",
  "Kebun",
];

export function healthLevel(t: Tanaman): HealthLevel {
  return t.status === "terlambat" ? "perhatian" : "sehat";
}
