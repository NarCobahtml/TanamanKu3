import SitePage from '@/components/SitePage';
import ProfilPage from '@/components/ProfilPage';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import Link from 'next/link';
import { Bell, BellRing, CreditCard, LogOut, BadgeCheck, MapPin } from 'lucide-react';

const menuItems = [
  { label: 'Pengaturan Notifikasi', Icon: Bell, href: '#' },
  { label: 'Riwayat Scan', Icon: BellRing, href: '/riwayat' },
  { label: 'Langganan', Icon: CreditCard, href: '/langganan' },
];

export default function Page() {
  return (
    <>
      {/* Desktop — t3 (tidak berubah) */}
      <div className="hidden lg:block">
        <SitePage>
          <ProfilPage />
        </SitePage>
      </div>

      {/* Mobile — mobile1 Figma */}
      <div className="app-shell pb-[86px] lg:hidden">
        <Header title="Profil" showProfile />

        <main className="app-container px-4 py-6 space-y-6">
          {/* Profile card */}
          <div className="bg-primary/10 rounded-2xl pt-8 pb-6 px-4 flex flex-col items-center">
            <div className="relative">
              <img
                src="/figma-assets/avatar.png"
                alt="Foto profil Alex Graham"
                className="w-[120px] h-[120px] rounded-full border-4 border-white object-cover"
              />
              <span className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-[#1B5E20] border-2 border-primary/10 flex items-center justify-center">
                <BadgeCheck className="w-4 h-4 text-white" />
              </span>
            </div>
            <h1 className="text-[22px] font-bold text-ink mt-3">Alex Graham</h1>
            <p className="text-sm text-ink/70 mt-0.5">alex.graham@mail.com</p>
            <span className="mt-3 inline-flex items-center gap-1.5 bg-white border border-[#1B5E20] text-[#1B5E20] rounded-full px-3 py-1.5 text-xs font-semibold">
              <MapPin className="w-3.5 h-3.5" />
              Petani Pemula
            </span>
          </div>

          {/* Menu card */}
          <div className="bg-white rounded-xl border border-ink/15">
            {menuItems.map(({ label, Icon, href }, i) => (
              <Link
                key={label}
                href={href}
                className={`flex items-center gap-4 px-5 py-4 text-ink ${i > 0 ? 'border-t border-ink/15' : ''}`}
              >
                <Icon className="w-5 h-5 text-[#1B5E20]" />
                <span className="font-semibold text-sm">{label}</span>
              </Link>
            ))}
            <div className="border-t-4 border-background" />
            <Link
              href="/login"
              className="flex items-center gap-4 px-5 py-4 text-destructive"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-semibold text-sm">Keluar</span>
            </Link>
          </div>

          <p className="text-center text-xs text-ink/70">TanamanKu Versi 1.2.0</p>
        </main>

        <BottomNav />
      </div>
    </>
  );
}
