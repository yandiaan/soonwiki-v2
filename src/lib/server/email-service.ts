/**
 * SoonWiki Profile Reminder Email Service
 * Handles rendering rich branded HTML emails and sending them via Resend REST API.
 */

export interface ReminderRecipient {
  userId: string;
  email: string;
  name: string;
  isDraft?: boolean | undefined;
}

export interface EmailSendResult {
  ok: boolean;
  id?: string | undefined;
  error?: string | undefined;
}

export interface BatchReminderSummary {
  total: number;
  successCount: number;
  failedCount: number;
  failures: Array<{ email: string; reason: string }>;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Builds a rich, responsive HTML email tailored to SoonWiki's editorial design system.
 */
export function buildProfileReminderHtml(params: {
  name: string;
  editUrl: string;
  isDraft?: boolean | undefined;
}): string {
  const safeName = escapeHtml(params.name || 'Rekan SOON');
  const safeEditUrl = escapeHtml(params.editUrl);

  const headline = params.isDraft
    ? 'Langkah Terakhir: Terbitkan Profilmu di SoonWiki'
    : 'Cerita dan Jejak Langkahmu Dinantikan di SoonWiki';

  const introParagraph = params.isDraft
    ? 'Draf profilmu di SoonWiki sudah tersimpan, namun belum dipublikasikan ke galeri arsip komunitas. Mari luangkan 1 menit untuk meninjau dan menerbitkannya agar rekan-rekan komunitas dapat membaca ceritamu.'
    : 'Sebagai bagian dari komunitas SOON, setiap cerita, karya, dan titik balik hidupmu adalah bagian penting dari arsip hidup yang kita bangun bersama. Mari lengkapi profilmu sekarang.';

  return `<!DOCTYPE html>
<html lang="id" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${headline}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, a { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f7f6f2; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #121514;">
  <!-- Preheader text (hidden in body, shown in inbox preview) -->
  <div style="display: none; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: #f7f6f2; opacity: 0;">
    ${headline} · Arsip Hidup Komunitas SOON
  </div>

  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f7f6f2; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e7e6df; overflow: hidden; box-shadow: 0 4px 12px rgba(18, 21, 20, 0.04);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #23376e; padding: 28px 32px; text-align: left;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.12em; color: #a4b7e6; text-transform: uppercase; margin-bottom: 6px;">
                      ARSIP HIDUP KOMUNITAS
                    </div>
                    <div style="font-size: 24px; font-weight: 800; letter-spacing: -0.02em; color: #ffffff; line-height: 1.2;">
                      SoonWiki
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Area -->
          <tr>
            <td style="padding: 36px 32px 28px 32px;">
              <!-- Greeting -->
              <p style="margin: 0 0 16px 0; font-size: 15px; color: #575e59; font-weight: 500;">
                Halo <strong style="color: #121514;">${safeName}</strong>,
              </p>

              <!-- Headline -->
              <h1 style="margin: 0 0 18px 0; font-size: 22px; line-height: 1.35; font-weight: 700; color: #121514; letter-spacing: -0.02em;">
                ${headline}
              </h1>

              <!-- Intro text -->
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #374151;">
                ${introParagraph}
              </p>

              <!-- Checklist Box -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fbfbf9; border: 1px solid #e7e6df; border-radius: 8px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 20px 22px;">
                    <div style="font-size: 12px; font-weight: 700; letter-spacing: 0.05em; color: #23376e; text-transform: uppercase; margin-bottom: 12px;">
                      APA SAJA YANG BISA KAMU BAGIKAN?
                    </div>

                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding: 6px 0; font-size: 14px; line-height: 1.5; color: #121514;">
                          <span style="display: inline-block; width: 22px; font-size: 16px; vertical-align: middle;">📷</span>
                          <strong>Foto & Aktivitas Saat Ini</strong> — Nama, foto terbaik, dan apa yang sedang kamu geluti.
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 14px; line-height: 1.5; color: #121514;">
                          <span style="display: inline-block; width: 22px; font-size: 16px; vertical-align: middle;">🧭</span>
                          <strong>Cerita & Titik Balik</strong> — Perubahan arah, pengalaman bermakna, dan perjalanan hidupmu.
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 14px; line-height: 1.5; color: #121514;">
                          <span style="display: inline-block; width: 22px; font-size: 16px; vertical-align: middle;">🏆</span>
                          <strong>Momen Berharga</strong> — Karya, pencapaian, atau kenangan bersama komunitas SOON.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Call to Action Button -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 28px;">
                <tr>
                  <td align="center">
                    <a href="${safeEditUrl}" target="_blank" style="display: inline-block; background-color: #c84428; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 28px; border-radius: 8px; letter-spacing: 0.01em; box-shadow: 0 2px 6px rgba(200, 68, 40, 0.25);">
                      Lengkapi &amp; Terbitkan Profil &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Secondary link fallback -->
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #88908b; text-align: center;">
                Jika tombol di atas tidak berfungsi, buka tautan ini di browsermu:<br>
                <a href="${safeEditUrl}" style="color: #23376e; word-break: break-all;">${safeEditUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer Area -->
          <tr>
            <td style="background-color: #f7f6f2; border-top: 1px solid #e7e6df; padding: 24px 32px; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 600; color: #121514;">
                SoonWiki · Komunitas Alumni &amp; Rekan SOON
              </p>
              <p style="margin: 0; font-size: 12px; color: #767e78; line-height: 1.5;">
                Email ini dikirim secara khusus untuk member aktif SoonWiki.<br>
                Dikirim dari <a href="https://soonwiki.com" style="color: #575e59; text-decoration: underline;">soonwiki.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function getResendApiKey(): string {
  const key = import.meta.env.RESEND_API_KEY || '';
  return key.trim();
}

function getSiteUrl(explicitUrl?: string): string {
  if (explicitUrl && explicitUrl.trim()) return explicitUrl.trim().replace(/\/$/, '');
  const envUrl = import.meta.env.PUBLIC_SITE_URL || 'https://soonwiki.com';
  return envUrl.trim().replace(/\/$/, '');
}

/**
 * Sends a single profile reminder email via Resend REST API.
 */
export async function sendProfileReminderEmail(
  recipient: ReminderRecipient,
  siteUrl?: string,
): Promise<EmailSendResult> {
  const apiKey = getResendApiKey();
  if (!apiKey) {
    return { ok: false, error: 'RESEND_API_KEY belum dikonfigurasi di environment variable.' };
  }

  const cleanEmail = recipient.email?.trim();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { ok: false, error: `Alamat email tidak valid: "${recipient.email}"` };
  }

  const baseUrl = getSiteUrl(siteUrl);
  const editUrl = `${baseUrl}/me/edit`;
  const html = buildProfileReminderHtml({
    name: recipient.name,
    editUrl,
    isDraft: recipient.isDraft,
  });

  const subject = recipient.isDraft
    ? 'Langkah Terakhir: Terbitkan Profilmu di SoonWiki ✨'
    : 'Mari Lengkapi dan Terbitkan Profilmu di SoonWiki ✨';

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'SoonWiki <no-reply@soonwiki.com>',
        to: [cleanEmail],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const errBody = (await response.json().catch(() => ({}))) as {
        message?: string;
        name?: string;
      };
      const errorMessage = errBody.message || `Resend API error (${response.status})`;
      console.error('[sendProfileReminderEmail] Resend API error:', errorMessage, errBody);
      return { ok: false, error: errorMessage };
    }

    const data = (await response.json()) as { id?: string };
    return { ok: true, id: data.id ?? undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal mengirim email';
    console.error('[sendProfileReminderEmail] Network error:', error);
    return { ok: false, error: message };
  }
}

/**
 * Sends reminder emails in controlled batches to prevent exceeding rate limits.
 */
export async function sendBatchProfileReminders(
  recipients: ReminderRecipient[],
  siteUrl?: string,
): Promise<BatchReminderSummary> {
  const summary: BatchReminderSummary = {
    total: recipients.length,
    successCount: 0,
    failedCount: 0,
    failures: [],
  };

  for (const recipient of recipients) {
    const result = await sendProfileReminderEmail(recipient, siteUrl);
    if (result.ok) {
      summary.successCount++;
    } else {
      summary.failedCount++;
      summary.failures.push({
        email: recipient.email,
        reason: result.error || 'Terjadi kesalahan yang tidak diketahui',
      });
    }

    // Small delay to prevent bursting against Resend rate limits
    if (recipients.length > 1) {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  return summary;
}
