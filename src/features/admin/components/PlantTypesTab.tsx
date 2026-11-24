"use client";

import { useState } from "react";
import {
  Sprout,
  Plus,
  Search,
  Edit2,
  Trash2,
  Calendar,
  Layers,
  Sparkles,
  AlertCircle,
  Loader2,
  Droplets,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PlantTypeItem } from "../types";

interface PlantTypesTabProps {
  plantTypes: PlantTypeItem[];
  onRefresh: () => void;
}

export function PlantTypesTab({ plantTypes, onRefresh }: PlantTypesTabProps) {
  const [search, setSearch] = useState("");
  const [waterNeedFilter, setWaterNeedFilter] = useState("Semua");

  // Modal Create / Edit State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<PlantTypeItem | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    scientificName: "",
    waterNeed: "sedang",
    defaultIntervalDays: 2,
    description: "",
    imageUrl: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal Delete State
  const [deleteTarget, setDeleteTarget] = useState<PlantTypeItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredTypes = plantTypes.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase()) ||
      (t.scientificName && t.scientificName.toLowerCase().includes(search.toLowerCase())) ||
      (t.description && t.description.toLowerCase().includes(search.toLowerCase()));

    const matchesWaterNeed =
      waterNeedFilter === "Semua" ||
      (t.waterNeed && t.waterNeed.toLowerCase() === waterNeedFilter.toLowerCase());

    return matchesSearch && matchesWaterNeed;
  });

  const handleOpenCreate = () => {
    setEditingType(null);
    setForm({
      name: "",
      slug: "",
      scientificName: "",
      waterNeed: "sedang",
      defaultIntervalDays: 2,
      description: "",
      imageUrl: "",
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (item: PlantTypeItem) => {
    setEditingType(item);
    setForm({
      name: item.name,
      slug: item.slug,
      scientificName: item.scientificName || "",
      waterNeed: item.waterNeed || "sedang",
      defaultIntervalDays: item.defaultIntervalDays,
      description: item.description || "",
      imageUrl: item.imageUrl || "",
    });
    setIsDialogOpen(true);
  };

  const handleNameChange = (name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      slug: !editingType
        ? name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
        : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Nama jenis tanaman wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingType
        ? `/api/admin/plant-types/${editingType.id}`
        : "/api/admin/plant-types";
      const method = editingType ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal menyimpan jenis tanaman.");
      }

      toast.success(json.message || "Jenis tanaman berhasil disimpan!");
      setIsDialogOpen(false);
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/plant-types/${deleteTarget.id}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal menghapus jenis tanaman.");
      }

      toast.success(json.message || "Jenis tanaman berhasil dihapus!");
      setDeleteTarget(null);
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header dan aksi utama */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-border/40">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Sprout className="h-5 w-5 text-foreground" />
            Katalog Master Jenis Tanaman
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Kelola taksonomi spesies tanaman, profil kebutuhan penyiraman, dan panduan perawatan bagi pekebun.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="rounded-xl bg-foreground text-background hover:bg-foreground/90 font-medium shadow-xs gap-1.5 shrink-0 h-9 px-3.5 text-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Tambah Spesies Baru
        </Button>
      </div>

      {/* Kolom filter dan pencarian */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, nama latin, atau slug..."
            className="pl-9 h-9 rounded-xl bg-card border-border/60 text-xs focus-visible:ring-1"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Label className="text-xs text-muted-foreground font-medium whitespace-nowrap">Filter Kebutuhan Air:</Label>
          <Select value={waterNeedFilter} onValueChange={setWaterNeedFilter}>
            <SelectTrigger className="w-[160px] h-9 rounded-xl bg-card border-border/60 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Semua">Semua Kebutuhan</SelectItem>
              <SelectItem value="rendah">Rendah (Sukulen/Kaktus)</SelectItem>
              <SelectItem value="sedang">Sedang (Hias/Buah)</SelectItem>
              <SelectItem value="tinggi">Tinggi (Sayur/Pangan)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabel jenis tanaman */}
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/40 bg-muted/30 text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">
              <tr>
                <th className="px-5 py-3">Spesies & Nama Ilmiah</th>
                <th className="px-4 py-3">Kebutuhan Air</th>
                <th className="px-4 py-3">Interval Siram</th>
                <th className="px-4 py-3">Tanaman Terdaftar</th>
                <th className="px-5 py-3">Karakteristik</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filteredTypes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-muted-foreground">
                    <p className="font-semibold text-foreground text-sm">Tidak ada jenis tanaman yang cocok</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Coba kata kunci lain atau daftarkan spesies baru.</p>
                  </td>
                </tr>
              ) : (
                filteredTypes.map((type) => (
                  <tr key={type.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-foreground">
                        {type.name}
                      </div>
                      <div className="text-[11px] italic text-muted-foreground mt-0.5">
                        {type.scientificName || "Belum ada nama ilmiah"}
                      </div>
                      <div className="text-[10px] font-mono text-muted-foreground/70 mt-0.5">
                        slug: {type.slug}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="text-xs font-medium text-foreground">
                        {type.waterNeed === "rendah"
                          ? "Air Rendah"
                          : type.waterNeed === "tinggi"
                          ? "Air Tinggi"
                          : "Air Sedang"}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-foreground whitespace-nowrap">
                      <span className="text-xs text-muted-foreground tabular-nums">
                        Tiap {type.defaultIntervalDays} hari
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-foreground whitespace-nowrap">
                      <span className="text-xs text-muted-foreground tabular-nums font-medium">
                        {type.plantsCount ?? 0} tanaman
                      </span>
                    </td>

                    <td className="px-5 py-3.5 max-w-xs text-xs text-muted-foreground truncate">
                      {type.description || "-"}
                    </td>

                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(type)}
                          className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                          title="Ubah jenis tanaman"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(type)}
                          className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                          title="Hapus jenis tanaman"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal jenis tanaman */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {editingType ? "Ubah Spesies Tanaman" : "Tambah Spesies Tanaman Baru"}
            </DialogTitle>
            <DialogDescription>
              {editingType
                ? `Perbarui informasi taksonomi dan rekomendasi perawatan untuk ${editingType.name}.`
                : "Daftarkan jenis tanaman baru (misal: Mangga, Monstera, Tomat) agar pengguna dapat memilihnya saat mendaftarkan tanaman."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="typeName">Nama Tanaman (Umum) *</Label>
                <Input
                  id="typeName"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Contoh: Mangga, Monstera, Cabai"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="typeLatin">Nama Ilmiah / Latin</Label>
                <Input
                  id="typeLatin"
                  value={form.scientificName}
                  onChange={(e) => setForm({ ...form, scientificName: e.target.value })}
                  placeholder="Contoh: Mangifera indica"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="typeSlug">Kode Identifikasi (Slug) *</Label>
                <Input
                  id="typeSlug"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="contoh: mangga"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="typeWaterNeed">Tingkat Kebutuhan Air *</Label>
                <Select
                  value={form.waterNeed}
                  onValueChange={(val) => setForm({ ...form, waterNeed: val })}
                >
                  <SelectTrigger id="typeWaterNeed" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rendah">Rendah (Sukulen, Kaktus, Lidah Mertua)</SelectItem>
                    <SelectItem value="sedang">Sedang (Monstera, Calathea, Aglaonema)</SelectItem>
                    <SelectItem value="tinggi">Tinggi (Sayuran, Padi, Cabai, Buah)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="typeInterval">Rekomendasi Interval Siram (Hari) *</Label>
              <Input
                id="typeInterval"
                type="number"
                min="1"
                max="30"
                value={form.defaultIntervalDays}
                onChange={(e) =>
                  setForm({ ...form, defaultIntervalDays: parseInt(e.target.value, 10) || 1 })
                }
                required
              />
              <p className="text-[11px] text-muted-foreground">
                Rekomendasi ritme penyiraman alami untuk jenis tanaman ini.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="typeDesc">Deskripsi Karakteristik & Perawatan</Label>
              <textarea
                id="typeDesc"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Tuliskan kebutuhan sinar matahari, media tanah yang cocok, atau tips khas untuk spesies ini..."
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : editingType ? (
                  "Simpan Perubahan"
                ) : (
                  "Buat Spesies Tanaman"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal konfirmasi hapus */}
      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Hapus Jenis Tanaman
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus jenis tanaman{" "}
              <strong className="text-foreground">{deleteTarget?.name}</strong>?
            </DialogDescription>
          </DialogHeader>

          {deleteTarget && (deleteTarget.plantsCount ?? 0) > 0 ? (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
              Jenis tanaman ini sedang digunakan oleh{" "}
              <strong>{deleteTarget.plantsCount} tanaman</strong> milik pengguna. Sistem
              menolak penghapusan sampai seluruh tanaman dialihkan.
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Aksi ini bersifat permanen dan tidak dapat dibatalkan.
            </p>
          )}

          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting || Boolean(deleteTarget && (deleteTarget.plantsCount ?? 0) > 0)}
              className="gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                "Hapus Permanen"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
