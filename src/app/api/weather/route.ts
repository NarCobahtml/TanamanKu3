import { NextResponse } from 'next/server';

function getWeatherCondition(code: number): { condition: string; icon: string; status: 'optimal' | 'moderate' | 'unfavourable' } {
  if (code === 0) return { condition: 'Cerah', icon: 'Sun', status: 'moderate' };
  if (code === 1 || code === 2) return { condition: 'Sebagian Berawan', icon: 'CloudSun', status: 'optimal' };
  if (code === 3) return { condition: 'Berawan Tebal', icon: 'Cloud', status: 'optimal' };
  if (code >= 45 && code <= 48) return { condition: 'Berkabut', icon: 'Cloud', status: 'moderate' };
  if (code >= 51 && code <= 55) return { condition: 'Gerimis Ringan', icon: 'CloudRain', status: 'moderate' };
  if (code >= 61 && code <= 65) return { condition: 'Hujan', icon: 'CloudRain', status: 'unfavourable' };
  if (code >= 71 && code <= 77) return { condition: 'Hujan Es / Salju', icon: 'CloudRain', status: 'unfavourable' };
  if (code >= 80 && code <= 82) return { condition: 'Hujan Lebat', icon: 'CloudRain', status: 'unfavourable' };
  if (code >= 95) return { condition: 'Badai Petir', icon: 'CloudRain', status: 'unfavourable' };
  return { condition: 'Berawan', icon: 'Cloud', status: 'optimal' };
}

const DAY_NAMES_ID = ['min', 'sen', 'sel', 'rab', 'kam', 'jum', 'sab'];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const latParam = searchParams.get('lat');
    const lonParam = searchParams.get('lon');

    // Default to Jakarta if user coordinates are not yet available or denied
    const lat = latParam ? parseFloat(latParam) : -6.2088;
    const lon = lonParam ? parseFloat(lonParam) : 106.8456;

    // 1. Fetch real weather from Open-Meteo API (100% free, no API key required)
    const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,is_day&hourly=temperature_2m,relative_humidity_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunset&timezone=auto`;
    const weatherRes = await fetch(openMeteoUrl, { next: { revalidate: 900 } });

    if (!weatherRes.ok) {
      throw new Error(`Open-Meteo returned status ${weatherRes.status}`);
    }

    const weatherData = await weatherRes.json();

    // 2. Reverse geocode location name
    let locationName = 'Jakarta, Indonesia';
    let city = 'Jakarta';
    try {
      const geoRes = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=id`,
        { next: { revalidate: 3600 } }
      );
      if (geoRes.ok) {
        const geo = await geoRes.json();
        city = geo.city || geo.locality || 'Lokasi Anda';
        const locality = geo.locality || geo.principalSubdivision || '';
        locationName = locality && locality !== city ? `${locality}, ${city}` : city;
      }
    } catch {
      // Fallback
    }

    // 3. Process current weather
    const current = weatherData.current;
    const tempNow = Math.round(current.temperature_2m);
    const humidityNow = Math.round(current.relative_humidity_2m);
    const codeNow = current.weather_code;
    const { condition: conditionNow } = getWeatherCondition(codeNow);

    // 4. Process daily sunset and temperature range
    const daily = weatherData.daily;
    const maxTempToday = Math.round(daily.temperature_2m_max[0]);
    const minTempToday = Math.round(daily.temperature_2m_min[0]);
    const sunsetRaw = daily.sunset[0]; // e.g. "2026-09-28T17:53"
    let sunsetFormatted = '17:30';
    if (sunsetRaw) {
      const sunsetDate = new Date(sunsetRaw);
      const hours = String(sunsetDate.getHours()).padStart(2, '0');
      const mins = String(sunsetDate.getMinutes()).padStart(2, '0');
      sunsetFormatted = `${hours}:${mins}`;
    }

    const weatherNum = {
      temp: `${tempNow}°C`,
      tempRange: `${maxTempToday}°C / ${minTempToday}°C`,
      sunset: sunsetFormatted,
      humidity: `${humidityNow}%`,
    };

    // Process plant parameters if provided
    const plantName = searchParams.get('plantName') || undefined;
    const plantCategory = searchParams.get('plantCategory') || undefined;
    const plantType = searchParams.get('plantType') || undefined;

    const { resolvePlantProfile, evaluatePlantHourlySlot } = await import('@/features/watering/plant-rules');
    const plantProfile = resolvePlantProfile(plantName, plantCategory, plantType);

    // 5. Process next 5 hourly slots starting from current hour
    const hourly = weatherData.hourly;
    const nowIsoHour = new Date().toISOString().slice(0, 13); // "2026-09-28T13"
    let startIndex = hourly.time.findIndex((t: string) => t.startsWith(nowIsoHour));
    if (startIndex === -1) startIndex = 0;

    const timeSlots = [];
    for (let i = 0; i < 5; i++) {
      const idx = startIndex + i;
      if (idx >= hourly.time.length) break;

      const timeStr = hourly.time[idx]; // "2026-09-28T14:00"
      const hour = parseInt(timeStr.slice(11, 13), 10);
      const slotTemp = Math.round(hourly.temperature_2m[idx]);
      const slotCode = hourly.weather_code[idx];
      const slotHumidity = Math.round(hourly.relative_humidity_2m?.[idx] ?? humidityNow);

      let slotTimeLabel = i === 0 ? 'Sekarang' : `${hour}:00`;
      if (i !== 0 && hour >= 12) {
        slotTimeLabel = `${hour > 12 ? hour - 12 : 12} PM`;
      } else if (i !== 0) {
        slotTimeLabel = `${hour} AM`;
      }

      // Dynamic calculation based on plant botany profile & live hour weather
      const evalResult = evaluatePlantHourlySlot(
        hour,
        slotTemp,
        slotCode,
        slotHumidity,
        plantProfile
      );

      timeSlots.push({
        time: slotTimeLabel,
        temp: `${slotTemp}°C`,
        status: evalResult.status,
        reason: evalResult.reason,
        code: slotCode,
      });
    }

    // 6. Process 7 days forecast
    const forecast = [];
    for (let i = 0; i < Math.min(7, daily.time.length); i++) {
      const parts = daily.time[i].split('-').map(Number);
      const date = new Date(parts[0], parts[1] - 1, parts[2]);
      const dayName = DAY_NAMES_ID[date.getDay()];
      const dayTemp = Math.round(daily.temperature_2m_max[i]);
      const dayCode = daily.weather_code[i];
      const { icon } = getWeatherCondition(dayCode);

      forecast.push({
        day: dayName,
        temp: `${dayTemp}°C`,
        icon,
      });
    }

    // 7. Dynamic AI summary tailored for this specific plant
    const plantDisplayName = plantName || 'tanaman Anda';
    let aiSummary = `Untuk ${plantDisplayName} (${plantProfile.category}), kondisi lingkungan saat ini ${conditionNow.toLowerCase()} dengan suhu ${tempNow}°C dan kelembapan ${humidityNow}%.`;
    let aiSaran = 'Disarankan menyiram di pagi hari sebelum terik atau di sore hari.';

    if (codeNow >= 51) {
      if (plantProfile.category === 'Outdoor' || plantProfile.category === 'Kebun') {
        aiSummary = `Hujan sedang/berpotensi turun untuk area ${plantDisplayName}. Media tanam sudah mendapat pasokan air alami.`;
        aiSaran = 'Hindari menyiram hari ini agar akar tidak membusuk akibat genangan air berlebih.';
      } else {
        aiSummary = `Cuaca luar sedang hujan dengan kelembapan tinggi (${humidityNow}%). Meskipun ${plantDisplayName} berada di dalam ruangan, laju penguapannya lebih lambat.`;
        aiSaran = 'Cukup siram sedikit atau semprot kabut ringan jika media tanam mulai terasa kering.';
      }
    } else if (tempNow >= 32) {
      aiSummary = `Suhu lingkungan tergolong panas (${tempNow}°C). Laju transpirasi ${plantDisplayName} meningkat signifikan.`;
      aiSaran = 'Siram di sore hari setelah matahari teduh dan hindari menyiram daun di tengah hari terik.';
    } else if (plantProfile.waterNeed === 'low') {
      aiSummary = `${plantDisplayName} memiliki kebutuhan air rendah (tipe sukulen/kaktus). Kelembapan saat ini tercatat ${humidityNow}%.`;
      aiSaran = 'Pastikan tanah benar-benar kering hingga kedalaman 3 cm sebelum melakukan penyiraman berikutnya.';
    } else if (tempNow <= 25) {
      aiSummary = `Suhu lingkungan cukup sejuk (${tempNow}°C) dengan kondisi ${conditionNow.toLowerCase()}. Penyerapan air berlangsung stabil.`;
      aiSaran = 'Siram secukupnya di pangkal batang pada jam optimal yang bertanda centang hijau.';
    }

    return NextResponse.json({
      success: true,
      data: {
        location: {
          city,
          label: locationName,
          latitude: lat,
          longitude: lon,
        },
        plant: {
          name: plantName,
          category: plantProfile.category,
          waterNeed: plantProfile.waterNeed,
          kc: plantProfile.kc,
          intervalDays: plantProfile.intervalDays,
        },
        current: {
          temp: tempNow,
          humidity: humidityNow,
          condition: conditionNow,
          weatherCode: codeNow,
          isDay: Boolean(current.is_day),
        },
        weatherNum,
        timeSlots,
        forecast,
        aiSummary,
        aiSaran,
      },
    });
  } catch (error) {
    console.error('Error fetching real weather:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memuat data cuaca real-time.' },
      { status: 500 }
    );
  }
}
