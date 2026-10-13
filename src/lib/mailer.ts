import { Resend } from 'resend';

/**
 * Mailer via Resend.
 *
 * Env (server-only, JANGAN prefix NEXT_PUBLIC_):
 *   RESEND_API_KEY          = re_xxxxxxxx  (Resend Dashboard → API Keys)
 *   RESEND_FROM_EMAIL       = "TumbuhKita <noreply@domainmu.co.id>"
 *                             default development: "TumbuhKita <onboarding@resend.dev>"
 *                             (onboarding@resend.dev hanya bisa kirim ke owner akun)
 *
 * Kalau RESEND_API_KEY kosong → mode dev: OTP ditulis ke server log, bukan dikirim.
 * Itu membuat seluruh alur tetap bisa dites end-to-end tanpa setup email.
 */

const isConfigured = () => Boolean(process.env.RESEND_API_KEY);

let cached: Resend | null = null;
function getClient(): Resend | null {
  if (!isConfigured()) return null;
  if (!cached) cached = new Resend(process.env.RESEND_API_KEY!);
  return cached;
}

const fromAddress = () =>
  process.env.RESEND_FROM_EMAIL?.trim() || 'TumbuhKita <onboarding@resend.dev>';

export type MailResult = { sent: true; id: string } | { sent: false; reason: string };

/**
 * Kirim email. `idempotencyKey` mencegah terkirim dua kali kalau caller retry
 * (Resend dedupe 24 jam) — penting untuk tombol "kirim ulang OTP".
 */
async function sendMail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey?: string;
}): Promise<MailResult> {
  const resend = getClient();

  if (!resend) {
    console.warn(
      `[mailer] RESEND_API_KEY belum di-set. Email tidak dikirim.\n` +
        `[mailer] to=${params.to} subject=${params.subject}`,
    );
    return { sent: false, reason: 'RESEND_API_KEY belum dikonfigurasi' };
  }

  try {
    const { data, error } = await resend.emails.send(
      {
        from: fromAddress(),
        to: [params.to],
        subject: params.subject,
        html: params.html,
        text: params.text,
      },
      params.idempotencyKey ? { idempotencyKey: params.idempotencyKey } : undefined,
    );

    if (error) {
      console.error('[mailer] Resend error:', error);
      return { sent: false, reason: error.message };
    }

    return { sent: true, id: data?.id ?? 'unknown' };
  } catch (error) {
    console.error('[mailer] Resend throw:', error);
    return { sent: false, reason: error instanceof Error ? error.message : 'Kesalahan SMTP internal' };
  }
}

function layout(content: string): string {
  return `<!doctype html>
<html lang="id">
  <body style="margin:0;padding:24px;background:#f4f6f4;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#123526;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #dfe6e1;">
      <tr>
        <td style="background:#1b5e3f;padding:20px 28px;">
          <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.2px;">TumbuhKita</span>
        </td>
      </tr>
      <tr>
        <td style="padding:28px;font-size:15px;line-height:1.65;">
          ${content}
        </td>
      </tr>
      <tr>
        <td style="padding:16px 28px;background:#f7faf8;border-top:1px solid #e6ece8;font-size:12px;color:#59625d;">
          Email otomatis dari TumbuhKita. Jangan membalas pesan ini.
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function sendOtpEmail(params: {
  to: string;
  name: string;
  otp: string;
  ttlMinutes: number;
  idempotencyKey?: string;
}): Promise<MailResult> {
  const { to, name, otp, ttlMinutes } = params;
  const greeting = name.trim() || 'Petani';

  const html = layout(`
    <p style="margin:0 0 16px;">Halo <strong>${escapeHtml(greeting)}</strong>,</p>
    <p style="margin:0 0 20px;">Terima kasih sudah mendaftar di TumbuhKita. Masukkan kode verifikasi berikut untuk mengaktifkan akun Anda:</p>
    <div style="margin:0 0 20px;padding:18px 0;text-align:center;background:#f0f5f2;border:1px solid #dfe6e1;border-radius:12px;">
      <span style="font-size:32px;font-weight:700;letter-spacing:8px;color:#1b5e3f;font-family:'SFMono-Regular',Consolas,monospace;">${otp}</span>
    </div>
    <p style="margin:0 0 8px;font-size:14px;color:#59625d;">Kode berlaku selama <strong>${ttlMinutes} menit</strong> dan hanya bisa dipakai sekali.</p>
    <p style="margin:0;font-size:14px;color:#59625d;">Tidak ada permintaan kode ini? Abaikan saja.</p>
  `);

  const text =
    `Halo ${greeting},\n\n` +
    `Kode verifikasi TumbuhKita: ${otp}\n\n` +
    `Kode berlaku ${ttlMinutes} menit dan hanya bisa dipakai satu kali.\n` +
    `Jika tidak kamu permintaan, abaikan email ini.`;

  return sendMail({
    to,
    subject: `Kode verifikasi TumbuhKita: ${otp}`,
    html,
    text,
    idempotencyKey: params.idempotencyKey,
  });
}

export function sendPasswordResetEmail(params: {
  to: string;
  name: string;
  otp: string;
  ttlMinutes: number;
  idempotencyKey?: string;
}): Promise<MailResult> {
  const { to, name, otp, ttlMinutes } = params;
  const greeting = name.trim() || 'Pengguna';

  const html = layout(`
    <p style="margin:0 0 16px;">Halo <strong>${escapeHtml(greeting)}</strong>,</p>
    <p style="margin:0 0 20px;">Kami menerima permintaan untuk mengatur ulang kata sandi akun TumbuhKita Anda. Gunakan kode verifikasi di bawah ini:</p>
    <div style="margin:0 0 20px;padding:18px 0;text-align:center;background:#f0f5f2;border:1px solid #dfe6e1;border-radius:12px;">
      <span style="font-size:32px;font-weight:700;letter-spacing:8px;color:#1b5e3f;font-family:'SFMono-Regular',Consolas,monospace;">${otp}</span>
    </div>
    <p style="margin:0 0 8px;font-size:14px;color:#59625d;">Kode berlaku selama <strong>${ttlMinutes} menit</strong> dan hanya bisa dipakai satu kali.</p>
    <p style="margin:0;font-size:14px;color:#59625d;">Jika Anda tidak merasa meminta reset kata sandi, amankan akun Anda dan abaikan email ini.</p>
  `);

  const text =
    `Halo ${greeting},\n\n` +
    `Kode reset kata sandi TumbuhKita Anda: ${otp}\n\n` +
    `Kode berlaku selama ${ttlMinutes} menit.\n` +
    `Jika Anda tidak meminta reset kata sandi, abaikan email ini.`;

  return sendMail({
    to,
    subject: `Kode Reset Kata Sandi TumbuhKita: ${otp}`,
    html,
    text,
    idempotencyKey: params.idempotencyKey,
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}