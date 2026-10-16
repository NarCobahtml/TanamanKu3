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
      {/* Top Header Card & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sprout className="h-5 w-5" />
            </span>
            Katalog Master Jenis Tanaman
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola daftar spesies tanaman (seperti Monstera, Mangga, Lidah Mertua, Cabai) beserta panduan ilmiah dan kebutuhan airnya.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-xs gap-2 shrink-0 h-10 px-4"
        >
          <Plus className="h-4 w-4" />
          Tambah Spesies Baru
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama (Mangga, Monstera...), nama ilmiah, atau slug..."
            className="pl-10 h-10 rounded-xl bg-card border-border"
          />
        </div>

        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground whitespace-nowrap">Kebutuhan Air:</Label>
          <Select value={waterNeedFilter} onValueChange={setWaterNeedFilter}>
            <SelectTrigger className="w-[150px] h-10 rounded-xl bg-card border-border text-sm">
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

      {/* Table List of Plant Species */}
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Spesies & Nama Ilmiah</th>
                <th className="px-4 py-3.5">Kebutuhan Air</th>
                <th className="px-4 py-3.5">Interval Siram Rekomendasi</th>
                <th className="px-4 py-3.5">Tanaman Pekebun</th>
                <th className="px-5 py-3.5">Deskripsi Karakteristik</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredTypes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                    <Sprout className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
                    <p className="font-medium">Tidak ada jenis tanaman yang cocok.</p>
                    <p className="text-xs mt-1">Coba kata kunci lain atau daftarkan jenis tanaman baru.</p>
                  </td>
                </tr>
              ) : (
                filteredTypes.map((type) => (
                  <tr key={type.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-foreground flex items-center gap-2">
                        <span>{type.name}</span>
                      </div>
                      <div className="text-xs italic text-primary/80 mt-0.5">
                        {type.scientificName || "Nama latin belum diisi"}
                      </div>
                      <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
                        slug: {type.slug}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          type.waterNeed === "rendah"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            : type.waterNeed === "tinggi"
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        }`}
                      >
                        <Droplets className="h-3 w-3" />
                        {type.waterNeed === "rendah"
                          ? "Air Rendah"
                          : type.waterNeed === "tinggi"
                          ? "Air Tinggi"
                          : "Air Sedang"}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-foreground whitespace-nowrap">
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        Tiap {type.defaultIntervalDays} hari sekali
                      </span>
                    </td>

                    <td className="px-4 py-4 text-foreground whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground">
                        <Layers className="h-3 w-3 text-muted-foreground" />
                        {type.plantsCount ?? 0} tanaman
                      </span>
                    </td>

                    <td className="px-5 py-4 max-w-xs text-xs text-muted-foreground truncate">
                      {type.description || "-"}
                    </td>

                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(type)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          title="Ubah jenis tanaman"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(type)}
                          className="h-8 w-8 p-0 text-destructive/80 hover:text-destructive hover:bg-destructive/10"
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

      {/* Modal Dialog: Tambah / Edit Jenis Tanaman */}
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

      {/* Modal Dialog: Konfirmasi Hapus */}
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
