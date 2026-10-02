'use client';
 
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global Application Error:', error);
  }, [error]);

  return (
    <html lang="id">
      <head>
        <title>Terjadi Kendala - TanamanKu</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          backgroundColor: '#F8FAF8',
          color: '#1A2E22',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            maxWidth: '480px',
            width: '90%',
            padding: '32px 24px',
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
            border: '1px solid #E2E8F0',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#FEF2F2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '28px',
            }}
          >
            ⚠️
          </div>

          <h1
            style={{
              fontSize: '22px',
              fontWeight: '700',
              color: '#123526',
              margin: '0 0 10px',
            }}
          >
            Halaman Mengalami Kendala
          </h1>

          <p
            style={{
              fontSize: '14px',
              color: '#4B5563',
              lineHeight: '1.6',
              margin: '0 0 24px',
            }}
          >
            Terjadi kesalahan teknis pada browser saat memuat aplikasi. Silakan coba muat ulang halaman.
          </p>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={() => reset()}
              style={{
                backgroundColor: '#1B5E20',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '9999px',
                padding: '10px 24px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Muat Ulang
            </button>

            <button
              type="button"
              onClick={() => (window.location.href = '/')}
              style={{
                backgroundColor: '#F3F4F6',
                color: '#374151',
                border: '1px solid #E5E7EB',
                borderRadius: '9999px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Ke Beranda
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
