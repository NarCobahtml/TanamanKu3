'use client';

import { useState, useEffect, useCallback } from 'react';
import { Sun, CloudSun, Cloud, CloudRain } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { SlotStatus } from './types';
import { weatherNum as defaultWeatherNum, timeSlots as defaultTimeSlots, forecast as defaultForecast } from './constants';

export interface WeatherData {
  locationName: string;
  city: string;
  weatherNum: {
    temp: string;
    tempRange: string;
    sunset: string;
    humidity: string;
  };
  timeSlots: Array<{ time: string; status: SlotStatus; temp?: string; reason?: string }>;
  forecast: Array<{ day: string; temp: string; icon: LucideIcon }>;
  condition: string;
  aiSummary?: string;
  aiSaran?: string;
  loading?: boolean;
}

export interface UseWeatherOptions {
  plantName?: string;
  plantCategory?: string;
  plantType?: string;
}

const ICON_MAP: Record<string, LucideIcon> = {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
};

export function useWeather(options?: UseWeatherOptions) {
  const plantName = options?.plantName;
  const plantCategory = options?.plantCategory;
  const plantType = options?.plantType;

  const [data, setData] = useState<WeatherData>({
    locationName: 'Memuat lokasi...',
    city: 'Jakarta',
    weatherNum: defaultWeatherNum,
    timeSlots: defaultTimeSlots,
    forecast: defaultForecast,
    condition: 'Cerah Berawan',
  });
  const [loading, setLoading] = useState(true);

  const fetchWeather = useCallback(async (lat?: number, lon?: number) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (typeof lat === 'number' && typeof lon === 'number') {
        params.set('lat', lat.toString());
        params.set('lon', lon.toString());
      }
      if (plantName) params.set('plantName', plantName);
      if (plantCategory) params.set('plantCategory', plantCategory);
      if (plantType) params.set('plantType', plantType);

      const qs = params.toString();
      const url = qs ? `/api/weather?${qs}` : '/api/weather';

      const res = await fetch(url);
      if (!res.ok) throw new Error('Gagal mengambil data cuaca');

      const json = await res.json();
      if (!json.success || !json.data) throw new Error('Data cuaca tidak valid');

      const raw = json.data;

      const mappedForecast = (raw.forecast || []).map((f: { day: string; temp: string; icon: string }) => ({
        day: f.day,
        temp: f.temp,
        icon: ICON_MAP[f.icon] || CloudSun,
      }));

      setData({
        locationName: raw.location.label || raw.location.city || 'Lokasi Anda',
        city: raw.location.city || 'Lokasi Anda',
        weatherNum: raw.weatherNum || defaultWeatherNum,
        timeSlots: (raw.timeSlots || []).map((s: { time: string; status: SlotStatus; temp?: string }) => ({
          time: s.time,
          status: s.status as SlotStatus,
          temp: s.temp,
        })),
        forecast: mappedForecast.length > 0 ? mappedForecast : defaultForecast,
        condition: raw.current?.condition || 'Cerah Berawan',
        aiSummary: raw.aiSummary,
        aiSaran: raw.aiSaran,
      });
    } catch (err) {
      console.warn('Gagal memuat cuaca live, menggunakan default:', err);
    } finally {
      setLoading(false);
    }
  }, [plantName, plantCategory, plantType]);

  useEffect(() => {
    let isMounted = true;

    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!isMounted) return;
          fetchWeather(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          console.info('Izin lokasi tidak diberikan atau timeout, menggunakan lokasi default Jakarta:', err.message);
          if (isMounted) fetchWeather();
        },
        { timeout: 7000, enableHighAccuracy: false }
      );
    } else {
      queueMicrotask(() => {
        if (isMounted) fetchWeather();
      });
    }

    return () => {
      isMounted = false;
    };
  }, [fetchWeather]);

  return {
    ...data,
    loading,
    refresh: fetchWeather,
  };
}
