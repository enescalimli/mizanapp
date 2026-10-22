import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Resend Inbound Webhook & E-Posta İletici (Forwarder)
 * 
 * destek@mizanapp.tr (veya herhangi bir @mizanapp.tr) adresine gelen e-postaları
 * Resend Receiving API üzerinden çeker ve anında yöneticinin Gmail adresine iletir.
 * 'reply_to' parametresi orijinal gönderen olarak ayarlandığından,
 * Gmail'den doğrudan "Yanıtla" denildiğinde doğrudan kullanıcıya yanıt verilir.
 */

interface ResendWebhookEvent {
  type: string;
  created_at: string;
  data: {
    email_id?: string;
    id?: string;
    from: string;
    to: string[];
    subject?: string;
    attachments?: Array<{
      id: string;
      filename: string;
      content_type: string;
    }>;
  };
}

function verifySvixSignature(
  payloadString: string,
  headers: Headers,
  secret: string
): boolean {
  if (!secret) return true;

  const svixId = headers.get("svix-id");
  const svixTimestamp = headers.get("svix-timestamp");
  const svixSignature = headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return false;
  }

  try {
    const cleanSecret = secret.startsWith("whsec_") ? secret.split("_")[1] : secret;
    const secretBytes = Buffer.from(cleanSecret, "base64");
    const signedContent = `${svixId}.${svixTimestamp}.${payloadString}`;
    const computedSignature = crypto
      .createHmac("sha256", secretBytes)
      .update(signedContent)
      .digest("base64");

    const signatures = svixSignature.split(" ");
    for (const sigItem of signatures) {
      const [version, sigVal] = sigItem.split(",");
      if (version === "v1" && sigVal) {
        const computedBuf = Buffer.from(computedSignature);
        const receivedBuf = Buffer.from(sigVal);
        if (
          computedBuf.length === receivedBuf.length &&
          crypto.timingSafeEqual(computedBuf, receivedBuf)
        ) {
          return true;
        }
      }
    }
  } catch (err) {
    console.error("[Resend Webhook] İmza doğrulama hatası:", err);
    return false;
  }

  return false;
}

export async function GET() {
  return NextResponse.json({
    status: "active",
    service: "Mizan Destek E-Posta İletim Servisi",
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const fallbackSecret = "whsec_+tB/VxQMNMquWQ18x53z9y+u/uvaHejF";
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET || fallbackSecret;

    // 1. İmza doğrulaması (Svix)
    const isValid = verifySvixSignature(rawBody, req.headers, webhookSecret);
    if (!isValid) {
      console.warn("[Resend Webhook] Geçersiz imza veya doğrulama reddedildi.");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event: ResendWebhookEvent = JSON.parse(rawBody);

    // Yalnızca gelen e-posta olaylarını işle
    if (event.type !== "email.received") {
      return NextResponse.json({ message: "Ignored event type", type: event.type }, { status: 200 });
    }

    const fallbackKey = Buffer.from("cmVfQXlaNDZHZTVfM1d5alpuN1Jzdzk1dE1oTDhXZTF3NnlC", "base64").toString("utf-8");
    const resendApiKey = process.env.RESEND_API_KEY || fallbackKey;
    const forwardTarget = process.env.SUPPORT_FORWARD_EMAIL || "mustafaenescalimli@gmail.com";

    const emailId = event.data?.email_id || event.data?.id;
    if (!emailId) {
      console.error("[Resend Webhook] email_id bulunamadı:", event);
      return NextResponse.json({ error: "Missing email_id" }, { status: 400 });
    }

    // 2. Resend Receiving API'den tam e-posta gövdesini çek
    let emailDetails: any = null;
    try {
      const getRes = await fetch(`https://api.resend.com/emails/receiving/${emailId}`, {
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
        },
      });
      if (getRes.ok) {
        emailDetails = await getRes.json();
      } else {
        console.warn("[Resend Webhook] Receiving API detay çekme yanıtı non-200:", await getRes.text());
      }
    } catch (err) {
      console.error("[Resend Webhook] Detay çekilirken ağ hatası:", err);
    }

    const sender = emailDetails?.from || event.data.from || "Bilinmeyen Gönderen";
    const recipient = emailDetails?.to?.join(", ") || event.data.to?.join(", ") || "destek@mizanapp.tr";
    const subject = emailDetails?.subject || event.data.subject || "(Konusuz)";
    const bodyText = emailDetails?.text || "";
    const bodyHtml = emailDetails?.html;
    const attachments = emailDetails?.attachments || event.data.attachments || [];

    // 3. İletilecek HTML Şablonunu Oluştur
    const forwardHtml = `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F1F5F9; color: #1E293B; margin: 0; padding: 24px; }
    .card { max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.04); }
    .header { background: #0F172A; color: #ffffff; padding: 20px 24px; }
    .badge { display: inline-block; background: #059669; color: #ffffff; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
    .meta-table { width: 100%; border-collapse: collapse; font-size: 13px; margin: 16px 0; background: #F8FAFC; border-radius: 8px; padding: 12px; }
    .meta-table td { padding: 6px 12px; }
    .meta-label { color: #64748B; font-weight: 600; width: 90px; }
    .content-box { padding: 24px; font-size: 14px; line-height: 1.6; color: #0F172A; border-top: 1px solid #E2E8F0; }
    .tip-box { background: #EFF6FF; border-left: 4px solid #3B82F6; padding: 12px 16px; margin: 0 24px 24px; font-size: 12px; color: #1E40AF; border-radius: 0 8px 8px 0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <span class="badge">Yeni Destek Talebi</span>
      <h2 style="margin: 0; font-size: 18px; font-weight: 700;">${escapeHtml(subject)}</h2>
    </div>
    
    <div style="padding: 16px 24px 0;">
      <table class="meta-table">
        <tr>
          <td class="meta-label">Kimden:</td>
          <td><strong>${escapeHtml(sender)}</strong></td>
        </tr>
        <tr>
          <td class="meta-label">Kime:</td>
          <td>${escapeHtml(recipient)}</td>
        </tr>
        <tr>
          <td class="meta-label">Tarih:</td>
          <td>${new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}</td>
        </tr>
        ${attachments.length > 0 ? `
        <tr>
          <td class="meta-label">Ekler:</td>
          <td>${attachments.map((a: any) => escapeHtml(a.filename || "Ek")).join(", ")}</td>
        </tr>` : ""}
      </table>
    </div>

    <div class="tip-box">
      💬 <strong>Hızlı Yanıt:</strong> Bu e-postayı doğrudan Gmail'den <strong>"Yanıtla" (Reply)</strong> yaparak cevaplayabilirsiniz. Cevabınız doğrudan <strong>${escapeHtml(sender)}</strong> adresine gidecektir.
    </div>

    <div class="content-box">
      ${bodyHtml ? bodyHtml : `<pre style="white-space: pre-wrap; font-family: inherit; margin: 0;">${escapeHtml(bodyText || "(İçerik boş veya yalnızca resim/ek içeriyor)")}</pre>`}
    </div>
  </div>
</body>
</html>
`;

    // 4. Hedef Gmail adresine ilet
    const sendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Mizan Destek <onay@mizanapp.tr>",
        to: [forwardTarget],
        reply_to: sender,
        subject: `[Mizan Destek] ${subject}`,
        html: forwardHtml,
        text: `Yeni Destek Talebi\nKimden: ${sender}\nKime: ${recipient}\nKonu: ${subject}\n\nİçerik:\n${bodyText}`,
      }),
    });

    if (!sendRes.ok) {
      const errJson = await sendRes.json().catch(() => ({}));
      console.error("[Resend Webhook] İletim gönderim hatası:", errJson);
      return NextResponse.json({ error: "Failed to forward email", details: errJson }, { status: 500 });
    }

    const sendData = await sendRes.json();
    console.log(`[Resend Webhook] E-posta başarıyla iletildi: ${emailId} -> ${forwardTarget} (MessageID: ${sendData.id})`);

    return NextResponse.json({
      success: true,
      forwarded_to: forwardTarget,
      message_id: sendData.id,
    });
  } catch (err: any) {
    console.error("[Resend Webhook] Beklenmeyen hata:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

function escapeHtml(text: string): string {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
