'use client';

import { useParams } from 'next/navigation';
import SitePage from '@/components/SitePage';
import TanamanDetailPage from '@/components/TanamanDetailPage';
import { tanamanList } from '@/components/TanamanPage';




export default function SiramDetailPage() {
  const { id } = useParams<{ id: string }>();
  const plant = tanamanList.find((t) => t.id === id) ?? tanamanList[0];
  const weatherData = {
    location: 'Kedungkandang, Hari Ini',
    temp: '27°C',
    tempRange: '27°C / 26°C',
    sunset: '17:30',
    humidity: '53%',
  };

  const aiSummary = `Berdasarkan prediksi cuaca, pagi hingga siang akan berawan tanpa hujan dengan suhu 26-27°C. Sore hari tetap mendung. Namun, ada peluang hujan ringan (~0,6mm) dan kelembapan bisa mencapai 80+.`;

  const timeSlots = [
    { time: 'Now', status: 'unfavourable' },
    { time: '4 PM', status: 'unfavourable' },
    { time: '5 PM', status: 'unfavourable' },
    { time: '6 PM', status: 'moderate' },
    { time: '7 PM', status: 'optimal' },
  ];

  const forecast = [
    { day: 'Sel', temp: '27°C', icon: 'forecast-1.svg' },
    { day: 'Rab', temp: '27°C', icon: 'forecast-1.svg' },
    { day: 'Kam', temp: '27°C', icon: 'forecast-1.svg' },
    { day: 'Jum', temp: '27°C', icon: 'forecast-2.svg' },
    { day: 'Sab', temp: '27°C', icon: 'forecast-3.svg' },
    { day: 'Min', temp: '26°C', icon: 'forecast-4.svg' },
    { day: 'Sen', temp: '28°C', icon: 'forecast-5.svg' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimal':
        return <img src="/figma-assets/icons-siram/siram-status-optimal.svg" alt="" />;
      case 'moderate':
        return <img src="/figma-assets/icons-siram/siram-status-moderate.svg" alt="" />;
      case 'unfavourable':
        return <img src="/figma-assets/icons-siram/siram-status-bad.svg" alt="" />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Desktop — t3 (tidak berubah) */}
      <div className="hidden lg:block">
        <SitePage>
          <TanamanDetailPage id={id} />
        </SitePage>
      </div>

      {/* Mobile — dari tumbuhkita #1 */}
      <div className="app-shell watering-detail pb-36 lg:hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <button className="result-back-button" onClick={() => window.history.back()}>
            <img src="/figma-assets/icons-scan/back.svg" width="16" height="16" alt="" />
          </button>
          <h1 className="text-xl font-bold">{plant.nama}</h1>
        </div>
      </header>

      <main className="app-container watering-main">
        {/* Weather Card */}
        <div className="siram-section weather-section">
          <p className="text-sm text-gray-600 mb-2">{weatherData.location}</p>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-5xl font-bold">{weatherData.temp}</p>
              <p className="text-gray-600">{weatherData.tempRange}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <img className="w-5 h-5" src="/figma-assets/icons-siram/siram-1.svg" alt="" />
              <span>Sunset {weatherData.sunset}</span>
            </div>
            <div className="flex items-center gap-2">
              <img className="w-5 h-5" src="/figma-assets/icons-siram/siram-6.svg" alt="" />
              <span>{weatherData.humidity}</span>
            </div>
          </div>
        </div>

        {/* AI Summary */}
        <div className="siram-section">
          <div className="flex items-center gap-2 mb-3">
            <img className="w-5 h-5" src="/figma-assets/icons-siram/siram-9.svg" alt="" />
            <h2 className="font-bold text-[#1B5E20]">AI Summary</h2>
          </div>
          <p className="text-sm text-gray-700 mb-4 leading-relaxed">
            {aiSummary}{' '}
            <span className="text-[#1B5E20] font-semibold">
              Disarankan menyiram ringan pagi ini dan hindari penyiraman berat sore nanti.
            </span>
          </p>
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-700">Dapatkan sebagai notifikasi harian</span>
            <button className="w-12 h-6 bg-gray-200 rounded-full relative">
              <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5 shadow-sm"></div>
            </button>
          </div>
        </div>

        {/* Watering Time */}
        <div className="siram-section">
          <div className="watering-time-heading flex items-center justify-between">
            <div>
              <h2 className="font-bold">Waktu Siram & Semprot</h2>
              <p className="text-xs text-gray-600">Berdasarkan kondisi cuaca saat ini</p>
            </div>
            <button className="watering-info-button" aria-label="Informasi waktu siram">
              <img src="/figma-assets/icons-siram/siram-5.svg" width="20" height="20" alt="" />
            </button>
          </div>

          <div className="watering-condition">
            <p>
              <span>Kondisi saat ini: </span>
              <span>Kurang Mendukung</span>
            </p>
          </div>

          {/* Time Slots */}
          <div className="watering-slots">
            {timeSlots.map((slot, idx) => (
              <div key={idx} className={`watering-slot ${slot.status}`}>
                <div className="watering-slot-icon">
                {getStatusIcon(slot.status)}
                </div>
                <span>{slot.time}</span>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="watering-legend">
            <div>
              <img src="/figma-assets/icons-siram/legend-optimal.svg" alt="" />
              <span>Optimal</span>
            </div>
            <div>
              <img src="/figma-assets/icons-siram/legend-moderate.svg" alt="" />
              <span>Moderate</span>
            </div>
            <div>
              <img src="/figma-assets/icons-siram/legend-bad.svg" alt="" />
              <span>Unfavourable</span>
            </div>
          </div>

          <button className="watering-learn-more text-sm text-[#1B5E20] font-medium">
            Pelajari Lebih Lanjut
          </button>
        </div>

        {/* 7-Day Forecast */}
        <div className="forecast-section">
          <h2 className="font-bold mb-3">Prediksi 7 Hari</h2>
          <div className="forecast-list">
            {forecast.map((day, idx) => (
              <div key={idx} className="forecast-card">
                <p>{day.day}</p>
                <img src={`/figma-assets/icons-siram/${day.icon}`} alt="" />
                <p>{day.temp}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Action Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-20">
        <div className="max-w-lg mx-auto">
          <button className="w-full bg-[#1B5E20] text-white py-4 rounded-xl font-semibold">
            Sudah Menyiram?
          </button>
          <p className="text-xs text-gray-600 text-center mt-2">
            Tandai jadwal hari ini sebagai selesai
          </p>
        </div>
      </div>
      </div>
    </>
  );
}

