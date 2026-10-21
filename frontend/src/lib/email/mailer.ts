import nodemailer from "nodemailer";

export interface SendOtpEmailParams {
  toEmail: string;
  recipientName?: string;
  otpCode: string;
}

/**
 * Mizan Katılım Resmi HTML E-Posta Şablonu
 */
function generateOtpEmailHtml(name: string, code: string): string {
  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mizan Katılım Güvenlik Kodu</title>
</head>
<body style="margin: 0; padding: 0; background-color: #EBEEF2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #182542;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #EBEEF2; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 24px; box-shadow: 0 10px 40px rgba(24,37,66,0.06); border: 1px solid #E2E8F0; overflow: hidden;" cellspacing="0" cellpadding="0">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #182542 0%, #273869 100%); padding: 32px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">
                mizan <span style="font-size: 13px; font-weight: 400; color: #87A8CD; margin-left: 4px;">katılım</span>
              </h1>
              <p style="margin: 6px 0 0; color: #E2E8F0; font-size: 12px; font-weight: 500;">
                BIST Katılım Finansı &amp; Arındırma Platformu
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 36px 32px 28px;">
              <h2 style="margin: 0 0 12px; color: #182542; font-size: 18px; font-weight: 800;">
                Giriş Doğrulama Kodunuz
              </h2>
              <p style="margin: 0 0 24px; color: #6E81A0; font-size: 14px; line-height: 1.5;">
                Merhaba <strong>${name || "Değerli Yatırımcımız"}</strong>,<br>
                Mizan Katılım hesabınıza güvenli erişim sağlamak için aşağıdaki 6 haneli tek kullanımlık doğrulama kodunu kullanın:
              </p>

              <!-- OTP Display Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 20px 0 28px;">
                <tr>
                  <td align="center" style="background-color: #F8FAFC; border: 2px dashed #CBD5E1; border-radius: 16px; padding: 22px;">
                    <span style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 900; letter-spacing: 10px; color: #182542; display: inline-block;">
                      ${code}
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Warning Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 14px 16px; margin-bottom: 24px;">
                <tr>
                  <td style="color: #166534; font-size: 12px; line-height: 1.5;">
                    ⏱️ Bu kod <strong>10 dakika</strong> süreyle geçerlidir.<br>
                    🔒 Güvenliğiniz için bu kodu Mizan Katılım personeli dahil hiç kimseyle paylaşmayınız.
                  </td>
                </tr>
              </table>

              <p style="margin: 0; color: #94A3B8; font-size: 12px; line-height: 1.4;">
                Bu işlemi siz başlatmadıysanız bu e-postayı dikkate almayınız. Hesabınız güvendedir.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 20px 32px; text-align: center;">
              <p style="margin: 0; color: #94A3B8; font-size: 11px;">
                © 2026 Mizan Katılım Finansal Teknolojiler A.Ş. • Tüm hakları saklıdır.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * E-Posta gönderici sağlayıcısını yapılandırır ve gerçek e-postayı iletir.
 */
export async function sendOtpEmail({
  toEmail,
  recipientName = "Yatırımcı",
  otpCode,
}: SendOtpEmailParams): Promise<{ success: boolean; error?: string; messageId?: string }> {
  // 1. Resend API Kontrolü (Varsa doğrudan HTTP ile hızlı gönderim)
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.MAIL_FROM || "Mizan Katılım <onay@mizanapp.tr>",
          to: [toEmail],
          subject: `${otpCode} - Mizan Katılım Güvenlik Onay Kodunuz`,
          html: generateOtpEmailHtml(recipientName, otpCode),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return { success: true, messageId: data.id };
      }
    } catch (err: any) {
      console.warn("Resend API dispatch failed, trying SMTP:", err?.message);
    }
  }

  // 2. SMTP Sağlayıcısı (Gmail, Brevo, Yandex, Postmark, AWS SES vb.)
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = parseInt(process.env.SMTP_PORT || "465", 10);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const info = await transporter.sendMail({
        from: process.env.MAIL_FROM || `"Mizan Katılım" <${smtpUser}>`,
        to: toEmail,
        subject: `${otpCode} — Mizan Katılım Giriş Doğrulama Kodunuz`,
        html: generateOtpEmailHtml(recipientName, otpCode),
        text: `Mizan Katılım giriş doğrulama kodunuz: ${otpCode}. Bu kod 10 dakika geçerlidir.`,
      });

      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      console.error("SMTP dispatch failed:", err);
      return { success: false, error: err?.message || "SMTP gönderim hatası" };
    }
  }

  // 3. Yerel Sendmail Transport (macOS / Linux postfix fallback)
  try {
    const transporter = nodemailer.createTransport({
      sendmail: true,
      newline: "unix",
      path: "/usr/sbin/sendmail",
    });

    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM || `"Mizan Katılım" <onay@mizanapp.tr>`,
      to: toEmail,
      subject: `${otpCode} — Mizan Katılım Giriş Doğrulama Kodunuz`,
      html: generateOtpEmailHtml(recipientName, otpCode),
      text: `Mizan Katılım giriş doğrulama kodunuz: ${otpCode}. Bu kod 10 dakika geçerlidir.`,
    });

    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.warn("Local sendmail transport failed:", err?.message);
  }

  return {
    success: false,
    error: "E-posta sunucusu henüz yapılandırılmamış. Lütfen SMTP veya Resend bilgilerini giriniz.",
  };
}
