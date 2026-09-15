'use client';

import { MessageCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import TkRevealClient from './tk-reveal-client';

const POSTS = [
  {
    avatar: '/figma-assets/profile-2.jpg',
    name: 'Rani Pratiwi',
    role: 'Pemilik 23 tanaman',
    title: 'Daun cabai saya berbintik kuning, ini penyakit apa?',
    body: 'Sudah seminggu makin meluas ke daun sebelah. Ada yang pernah mengalaminya?',
    replies: '12 balasan',
  },
  {
    avatar: '/figma-assets/plant-chili.jpg',
    name: 'Bagus Setiawan',
    role: 'Anggota sejak 2025',
    title: 'Tanah gambut cocok untuk apa ya?',
    body: 'Mau tanam sayur di pekarangan, tanahnya agak asam dan gembur.',
    replies: '5 balasan',
  },
  {
    avatar: '/figma-assets/profile-3.jpg',
    name: 'Reza Mahendra',
    role: 'Ahli hortikultura',
    title: 'Panduan: jarak penyiraman musim kemarau',
    body: 'Ringkasan pola penyiraman yang saya pakai untuk 40+ tanaman hias selama kemarau.',
    replies: '38 balasan',
  },
] as const;

export default function Community() {
  const t = useTranslations('landing.community');
  return (
    <section id="komunitas" className="bg-[#F2F5F2] py-24 sm:py-32 px-6">
      <div className="max-w-[1200px] mx-auto">
        <TkRevealClient>
          <h2 className="text-3xl sm:text-5xl font-medium tracking-[-0.03em] text-[#171B17] max-w-2xl">
            {t('judul')}
          </h2>
          <p className="mt-5 text-sm sm:text-base text-[#59625D] leading-relaxed max-w-xl">
            Ribuan pengguna saling membantu mengenali penyakit dan berbagi cara perawatan yang
            terbukti.
          </p>
        </TkRevealClient>

        <TkRevealClient className="mt-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {POSTS.map((post) => (
              <div
                key={post.name}
                className="rounded-md border border-[#E5E8E4] bg-white p-6 flex flex-col gap-4"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={post.avatar}
                    alt={post.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-[#171B17]">{post.name}</p>
                    <p className="text-xs text-[#59625D]">{post.role}</p>
                  </div>
                </div>
                <h3 className="text-base font-semibold text-[#171B17]">{post.title}</h3>
                <p className="text-sm text-[#59625D] leading-relaxed">{post.body}</p>
                <div className="mt-auto flex items-center gap-1.5 text-xs text-[#59625D]">
                  <MessageCircle className="w-3.5 h-3.5" />
                  {post.replies}
                </div>
              </div>
            ))}
          </div>
        </TkRevealClient>
      </div>
    </section>
  );
}
