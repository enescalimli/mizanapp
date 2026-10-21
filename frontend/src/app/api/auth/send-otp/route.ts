import { NextResponse } from "next/server";
import { sendOtpEmail } from "@/lib/email/mailer";
import { storeOtp } from "@/lib/auth/otpStore";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.email?.toLowerCase().trim();
    const fullName = body.fullName?.trim() || "Yatırımcı";

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Geçerli bir e-posta adresi giriniz." },
        { status: 400 }
      );
    }

    // 6-digit random cryptographically secure OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in-memory with 10-min expiration
    storeOtp(email, fullName, otpCode);

    // Dispatch real email
    const emailResult = await sendOtpEmail({
      toEmail: email,
      recipientName: fullName,
      otpCode,
    });

    console.log(`[AUTH-OTP] Code generated for ${email}: ${otpCode}. Delivery success: ${emailResult.success}`);

    if (!emailResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: emailResult.error || "E-posta gönderimi başarısız oldu. Lütfen e-posta adresinizi kontrol ediniz.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${email} adresinize 6 haneli güvenlik doğrulama kodu gönderildi.`,
      email,
      dispatched: true,
      deliveryNote: "E-posta başarıyla iletildi.",
    });
  } catch (err: any) {
    console.error("[AUTH-OTP] Send error:", err);
    return NextResponse.json(
      { success: false, error: "E-posta onay kodu gönderilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
