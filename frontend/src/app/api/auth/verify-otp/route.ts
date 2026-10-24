import { NextResponse } from "next/server";
import { verifyOtp } from "@/lib/auth/otpStore";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.email?.toLowerCase().trim();
    const code = body.code?.trim();
    const token = body.token?.trim();

    if (!email || !code || code.length !== 6) {
      return NextResponse.json(
        { success: false, error: "Lütfen 6 haneli doğrulama kodunu eksiksiz giriniz." },
        { status: 400 }
      );
    }

    const result = verifyOtp(email, code, token);

    if (!result.valid) {
      return NextResponse.json(
        { success: false, error: result.error || "Girdiğiniz kod geçersiz." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "E-posta başarıyla doğrulandı.",
      user: {
        email,
        fullName: result.fullName || email.split("@")[0] || "Katılım Yatırımcısı",
      },
    });
  } catch (err: any) {
    console.error("[AUTH-OTP] Verify error:", err);
    return NextResponse.json(
      { success: false, error: "Doğrulama işlemi sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}
