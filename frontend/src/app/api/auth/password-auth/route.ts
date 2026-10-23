import { NextResponse } from "next/server";
import { authenticateUser, registerUser } from "@/lib/auth/userStore";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body.action; // "login" | "register"
    const email = body.email?.toLowerCase().trim();
    const password = body.password?.trim();
    const fullName = body.fullName?.trim() || "";

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Geçerli bir e-posta adresi giriniz." },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Şifre en az 6 karakter olmalıdır." },
        { status: 400 }
      );
    }

    if (action === "register") {
      const regRes = registerUser(email, fullName, password);
      if (!regRes.success || !regRes.user) {
        return NextResponse.json(
          { success: false, error: regRes.error || "Kayıt işlemi başarısız oldu." },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Kayıt işlemi başarıyla tamamlandı.",
        user: {
          id: regRes.user.id,
          email: regRes.user.email,
          fullName: regRes.user.fullName,
        },
      });
    }

    // Default: login
    const authRes = authenticateUser(email, password);
    if (!authRes.success || !authRes.user) {
      return NextResponse.json(
        { success: false, error: authRes.error || "Girdiğiniz e-posta veya şifre hatalı." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Giriş başarılı.",
      user: {
        id: authRes.user.id,
        email: authRes.user.email,
        fullName: authRes.user.fullName,
      },
    });
  } catch (err: any) {
    console.error("[PASSWORD-AUTH] Error:", err);
    return NextResponse.json(
      { success: false, error: "Kimlik doğrulama işlemi sırasında bir sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}
