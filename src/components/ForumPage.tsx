'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from '@/components/layout/LocaleProvider';
import Link from 'next/link';
import { Heart, MessageSquare, Plus, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ActionButton } from '@/components/ui/action-button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageCtaBand } from '@/components/shared/PageCtaBand';
import { FilterPill } from '@/components/ui/filter-pill';
import { ForumPostCard } from '@/components/forum/ForumPostCard';
import { cn } from '@/lib/utils';

const categories = [
  { id: 'Semua', key: 'semua', section: 'common' },
  { id: 'Hama & Penyakit', key: 'hama', section: 'forum' },
  { id: 'Perawatan', key: 'perawatan', section: 'forum' },
  { id: 'Nutrisi', key: 'nutrisi', section: 'forum' },
  { id: 'Tanya Ahli', key: 'tanyaAhli', section: 'common' },
];

export type ForumPost = {
  id: string;
  author: string;
  initials: string;
  avatar?: string;
  expert?: boolean;
  time: string;
  category: string;
  title: string;
  excerpt: string;
  content?: string[];
  image?: string;
  likes: number;
  views: number;
  comments: { author: string; time: string; text: string; replyTo?: string }[];
};

export const forumPosts: ForumPost[] = [
  {
    id: 'bercak-kuning-monstera',
    author: 'Budi Santoso',
    initials: 'BS',
    avatar: '/figma-assets/profile-2.jpg',
    time: '2 jam yang lalu',
    category: 'Hama & Penyakit',
    title: 'Bercak kuning pada daun Monstera, kenapa ya?',
    excerpt:
      'Halo semua, akhir-akhir ini daun Monstera saya mulai muncul bercak kuning di pinggirannya. Daun bawah kena dulu, sekarang merambat ke atas...',
    content: [
      'Halo semuanya, saya mau tanya nih. Monstera Deliciosa saya yang baru dibeli 2 minggu lalu daunnya mulai menguning. Awalnya bagus banget, daunnya hijau mengkilap dan terlihat sehat.',
      'Tapi beberapa hari terakhir, daun-daunnya mulai menguning dari bagian bawah dan muncul bercak kecil di pinggiran daun. Tanaman ini saya taruh di dekat jendela tapi tidak kena sinar matahari langsung. Penyiraman saya sekitar 2 hari sekali sampai air keluar dari lubang pot.',
      'Sudah coba cek bagian bawah daun untuk hama, tidak ada bintik putih atau telernya. Tanahnya juga terasa selalu lembab, hampir tidak pernah kering.',
      'Apakah ini kelebihan air, kekurangan nutrisi, atau penyakit? Mohon bantuannya dong teman-teman, sayang banget kalau tanamannya makin parah.',
    ],
    image: '/figma-assets/plant-bananaleaf.jpg',
    likes: 24,
    views: 312,
    comments: [
      {
        author: 'Tania Susanti',
        time: '1 jam lalu',
        text: 'Kemungkinan besar overwatering. Cek tanah kedalaman 3-5 cm, kalau masih lembab jangan disiram dulu. Monstera suka tanah agak kering di antara penyiraman.',
      },
      {
        author: 'Rina Kartika',
        time: '50 mnt lalu',
        text: 'Bercak kuning di pinggir + tanah selalu lembab = akar kekurangan oksigen. Coba angkat dari pot, cek akarnya sehat atau cokelat lembek.',
      },
      {
        author: 'Dewi Anggraini',
        time: '30 mnt lalu',
        replyTo: 'Rina Kartika',
        text: 'Setuju dengan yang atas. Saya pernah alami sama, ganti media tanam pakai perlit + kulit pinus, daun baru muncul sehat semua.',
      },
    ],
  },
  {
    id: 'panen-cabai-rawit-pertama',
    author: 'Ayu Lestari',
    initials: 'AL',
    avatar: '/figma-assets/profile-1.jpg',
    time: '5 jam yang lalu',
    category: 'Perawatan',
    title: 'Berbagi keberhasilan: Panen Cabai Rawit pertama!',
    excerpt:
      'Senang banget hari ini akhirnya bisa panen cabai rawit dari pot di balkon. Kuncinya ternyata rajin pemangkasan tunas air dan pupuk tinggi K...',
    content: [
      'Senang banget hari ini akhirnya bisa panen cabai rawit pertama dari pot di balkon! Dari semai sampai panen sekitar 3 bulan. Mau berbagi pengalaman siapa tahu ada yang mau mulai.',
      'Kuncinya ternyata di tiga hal: rajin petik tunas air yang tumbuh di ketiak daun, pupuk tinggi kalium (K) mulai masa vegetatif selesai, dan sinar matahari minimal 6 jam sehari.',
      'Untuk media tanam saya pakai campuran tanah, kompos, dan sekam bakar dengan perbandingan 2:1:1. Penyiraman pagi dan sore, tapi tidak sampai genang.',
      'Hasilnya satu tanaman bisa panen 1,2 kg untuk putaran pertama. Selamat mencoba, cabai rawit ternyata cocok banget untuk pemula!',
    ],
    image: '/figma-assets/plant-chili.jpg',
    likes: 89,
    views: 1024,
    comments: [
      {
        author: 'Hendra Wijaya',
        time: '3 jam lalu',
        text: 'Keren bang! Kalau daunnya mulai keriting sedikit itu normal nggak ya setelah pupuk?',
      },
      {
        author: 'Ayu Lestari',
        time: '2 jam lalu',
        replyTo: 'Hendra Wijaya',
        text: 'Kalau keritingnya ringan setelah pemupukan biasanya masih aman, tinggal siram lebih banyak untuk melarutkan garam pupuk.',
      },
      {
        author: 'Rina Kartika',
        time: '1 jam lalu',
        text: 'Tips tunas air ini emang wajib. Tanpa dipangkas tanaman tinggi tapi buah sedikit.',
      },
    ],
  },
  {
    id: 'jadwal-penyiraman-kaktus-mini',
    author: 'Reza P.',
    initials: 'RP',
    avatar: '/figma-assets/profile-3.jpg',
    time: 'Kemarin',
    category: 'Perawatan',
    title: 'Jadwal penyiraman Kaktus Mini di ruangan ber-AC?',
    excerpt:
      'Saya baru beli kaktus mini untuk meja kantor. Ruangannya ber-AC dan kurang sinar matahari. Seberapa sering sih sebaiknya disiram?',
    content: [
      'Saya baru beli kaktus mini untuk di meja kantor. Ruangannya ber-AC 24 jam dan hampir tidak kena sinar matahari langsung.',
      'Saya baca kaktus harus disiram jarang, tapi kalau di ruangan ber-AC udaranya kering, apakah jadwalnya perlu lebih sering? Sekarang saya siram 2 minggu sekali sekitar 50 ml.',
      'Kondisi kaktusnya masih bagus, tidak ada bagian yang lembek atau menghitam. Cuma saya khawatir salah pola siram dari awal.',
      'Kalau ada yang punya pengalaman merawat kaktus di ruangan ber-AC, mohon masukannya. Terima kasih!',
    ],
    likes: 5,
    views: 187,
    comments: [
      {
        author: 'Dewi Anggraini',
        time: '20 jam lalu',
        text: 'AC membuat tanah lebih lambat kering, bukan lebih cepat. 2 minggu sekali sudah pas, bahkan bisa 3 minggu. Selalu cek tanah dulu.',
      },
      {
        author: 'Tania Susanti',
        time: '18 jam lalu',
        replyTo: 'Dewi Anggraini',
        text: 'Tambahkan: pindahkan beberapa jam ke dekat jendela tiap akhir pekan biar tetap dapat cahaya.',
      },
    ],
  },
  {
    id: 'pupuk-npk-untuk-monstera',
    author: 'Dewi Anggraini',
    initials: 'DA',
    expert: true,
    time: 'Kemarin',
    category: 'Nutrisi',
    title: 'Rekomendasi pupuk NPK untuk Monstera & Philodendron?',
    excerpt:
      'Monstera dan philodendron saya udah 4 bulan tidak dipupuk dan daun barunya mulai mengecil. Boleh minta rekomendasi NPK yang pas?',
    content: [
      'Monstera dan philodendron saya sudah 4 bulan tidak dipupuk dan akhir-akhir ini daun barunya mulai mengecil, warnanya juga tidak seberapa hijau dibanding dulu.',
      'Rencananya mau beli pupuk NPK, tapi bingung pilih komposisi yang mana. Ada yang bilang NPK 16-16-16 cukup, ada yang menyarankan formula tinggi nitrogen untuk tanaman daun.',
      'Soal dosis, saya takut overfertilize karena pernah merawat sirih gading sampai ujung daunnya gosong karena pupuk terlalu pekat.',
      'Kalau ada yang punya pengalaman soal jadwal dan dosis pupuk untuk tanaman daun indoor, mohon berbagi. Terima kasih sebelumnya!',
    ],
    likes: 12,
    views: 264,
    comments: [
      {
        author: 'Sari Melati',
        time: '22 jam lalu',
        text: 'NPK 16-16-16 saja dulu, dosis setengah dari label, sebulan sekali. Kalau daun baru mulai besar, naikkan perlahan.',
      },
      {
        author: 'Hendra Wijaya',
        time: '20 jam lalu',
        text: 'Ujung gosong biasanya karena garam pupuk menumpuk. Once sebulan, siram sampai air keluar bawah pot untuk flush.',
      },
    ],
  },
  {
    id: 'tanaman-keriting-daun-cabai',
    author: 'Hendra Wijaya',
    initials: 'HW',
    time: '2 hari yang lalu',
    category: 'Tanya Ahli',
    title: 'Daun cabai keriting dan menggulung, serangan virus?',
    excerpt:
      'Daun cabai rawit saya keriting ke bawah dan menggulung. Yang atas kena duluan, buahnya juga tidak bertambah. Apakah ini virus atau kutu?',
    content: [
      'Tanaman cabai rawit saya umur 2 bulan. Daun-daun muda di bagian atas mulai keriting ke bawah dan menggulung, yang bawah masih normal.',
      'Buah yang sudah ada tidak berkembang dan ada beberapa yang rontok. Saya tidak melihat kutu daun secara kasat mata, tapi ada semut yang lalu-lalang di batang.',
      'Saya dengar keriting daun bisa karena virus yang dibawa kutu daun atau thrips, dan kalau virus sebaiknya tanamannya langsung dibuang.',
      'Sebelum mengambil keputusan buang, mohon pencerahan dari teman-teman atau pakar. Apakah masih bisa diselamatkan dengan pestisida nabati?',
    ],
    image: '/figma-assets/plant-cherryleaf.jpg',
    likes: 7,
    views: 158,
    comments: [
      {
        author: 'Sari Melati',
        time: '1 hari yang lalu',
        text: 'Keberadaan semut + keriting = indikasi kutu daun yang dikebali semut. Cek bagian bawah daun pakai lup, kalau ada serangga kecil hijau/hitam itu dia.',
      },
      {
        author: 'Budi Santoso',
        time: '1 hari yang lalu',
        replyTo: 'Sari Melati',
        text: 'Semprot air sabun cuci piring encer dulu 2-3 hari sekali. Kalau daun baru yang muncul tetap keriting tanpa ada hama, baru curiga virus dan pisahkan tanamannya.',
      },
    ],
  },
  {
    id: 'sansevieria-busuk-pangkal',
    author: 'Rina Kartika',
    initials: 'RK',
    time: '3 hari yang lalu',
    category: 'Tanya Ahli',
    title: 'Sansevieria lembek di pangkal, masih bisa diselamatkan?',
    excerpt:
      'Pangkal sansevieria saya terasa lembek dan baunya agak apek. Daunnya masih tegak tapi satu per satu mulai menguning. Tolong bantu cek penyebabnya...',
    content: [
      'Sansevieria saya umur setahun lebih, selama ini sehat dan jarang tersiram. Minggu lalu pangkalnya mulai terasa lembek saat ditekan.',
      'Sekarang baunya agak apek dan satu daun sudah menguning seluruhnya. Daun lain masih tegak tapi saya takut ikut lanjut membusuk.',
      'Saya dua minggu lalu menyiramnya dua kali dalam sepekan karena ada tamu yang "menolong" menyiram.',
      'Kalau akarnya membusuk, apakah masih bisa diselamatkan dengan memotong bagian sehat lalu diangin-anginkan? Mohon pengalamannya.',
    ],
    likes: 9,
    views: 203,
    comments: [
      {
        author: 'Dewi Anggraini',
        time: '2 hari yang lalu',
        text: 'Keluarkan dari pot sekarang. Buang semua bagian busuk sampai jaringan putih sehat, taburi kayu manis, keringkan 2-3 hari, lalu tanam ulang di media kering.',
      },
      {
        author: 'Reza P.',
        time: '2 hari yang lalu',
        text: 'Saya pernah selamatkan dengan cara ini, tinggal satu roset sehat dan sekarang sudah punya 5 anakan.',
      },
    ],
  },
];

const CATEGORY_KEY: Record<string, string> = {
  'Hama & Penyakit': 'hama',
  Perawatan: 'perawatan',
  Nutrisi: 'nutrisi',
  'Tanya Ahli': 'tanyaAhli',
};

/** Category text translated; fallback raw string. */
export function CategoryText({ category }: { category: string }) {
  const t = useTranslations('forum');
  const tc = useTranslations('common');
  const k = CATEGORY_KEY[category];
  return <>{k ? k === 'tanyaAhli' ? tc(k) : t(k) : category}</>;
}

export function ExpertBadge() {
  const t = useTranslations('forum');
  return <Badge variant="outline" className="border-primary/30 bg-accent text-primary">{t('ahliTanaman')}</Badge>;
}

const topics = [
  { tag: 'bercakdaun', count: 18 },
  { tag: 'overwatering', count: 14 },
  { tag: 'panenpertama', count: 9 },
  { tag: 'pupukorganik', count: 7 },
  { tag: 'monstera', count: 5 },
];

export default function ForumPage() {
  const t = useTranslations('forum');
  const tc = useTranslations('common');
  const { locale: lang } = useLocale();
  const [category, setCategory] = useState('Semua');
  const [query, setQuery] = useState('');
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [allPosts, setAllPosts] = useState<ForumPost[]>(forumPosts);

  useEffect(() => {
    try {
      const existing = localStorage.getItem('tumbuhkita_custom_posts');
      if (existing) {
        const parsed = JSON.parse(existing);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAllPosts([...parsed, ...forumPosts]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const filtered = allPosts.filter(
    (p) =>
      (category === 'Semua' || p.category === category) &&
      (query.trim() === '' ||
        (p.title + ' ' + p.excerpt).toLowerCase().includes(query.trim().toLowerCase())),
  );

  const toggleLike = (id: string) => {
    const next = !liked[id];
    setLiked((m) => ({ ...m, [id]: next }));
  };

  const likeCount = (p: ForumPost) => p.likes + (liked[p.id] ? 1 : 0);

  return (
    <div>
      <PageHeader
        overline={t("komunitas")}
        title={t("forumKomunitas")}
        accent={t("komunitas")}
        description={t("forumSub")}
        actions={
          <ActionButton href="/forum/create">
            {t("buatPostingan")}
          </ActionButton>
        }
      />

      <div className="mx-auto w-full max-w-7xl space-y-12 px-4 pt-12 pb-24 sm:px-6">
      {/* Category rail */}
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t("filterKategori")}>
        {categories.map((c) => (
          <FilterPill
            key={c.id}
            active={category === c.id}
            onClick={() => setCategory(c.id)}
          >
            {c.section === "common" ? tc(c.key) : t(c.key)}
          </FilterPill>
        ))}
      </div>

      <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr]">
        {/* Feed, editorial divider list, not card stack */}
        <div className="min-w-0">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-border">
              <EmptyState
                icon={<SearchX className="h-6 w-6" aria-hidden="true" />}
                title={t("tidakAdaPost")}
                message={t("cobaKataKategori")}
              />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((post) => (
                <ForumPostCard
                  key={post.id}
                  post={post}
                  isLiked={!!liked[post.id]}
                  onToggleLike={() => toggleLike(post.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar, writer rail on sage wash */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-6">
            <div className="overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/40">
              <h3 className="border-b border-border px-5 py-3.5 text-sm font-bold">{t("topikPopuler")}</h3>
              <ul className="divide-y divide-border">
                {topics.map((topic) => (
                  <li key={topic.tag}>
                    <button
                      type="button"
                      onClick={() => {
                        setQuery(topic.tag);
                      }}
                      className="flex w-full items-center justify-between px-5 py-3.5 text-left transition-colors hover:bg-secondary"
                    >
                      <span className="text-sm font-medium">#{topic.tag}</span>
                      <span className="tnum text-xs text-muted-foreground">{t("diskusiN", { n: topic.count })}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>
      </div>

      <PageCtaBand
        heading={t("punyaCerita")}
        accent={lang === "id" ? "dibagikan" : "shared"}
        description={t("pengalamanJawaban")}
        primary={{ href: '/forum/create', label: t('buatPostingan') }}
        secondary={{ href: '/scan', label: tc('scanTanaman') }}
      />
    </div>
  );
}
