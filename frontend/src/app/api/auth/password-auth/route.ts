import { NextResponse } from "next/server";
import { authenticateUser, registerUser } from "@/lib/auth/userStore";
import { supabase, supabaseAdmin, isSupabaseConfigured } from "@/lib/supabaseClient";

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

    // =========================================================================
    // 1. KAYIT İŞLEMİ (REGISTER)
    // =========================================================================
    if (action === "register") {
      let createdUserId = "";
      let createdUserName = fullName || email.split("@")[0];

      if (isSupabaseConfigured()) {
        try {
          const { data: supaUser, error: supaErr } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: createdUserName },
          });

          if (!supaErr && supaUser?.user) {
            createdUserId = supaUser.user.id;
            // Profiles tablosuna kaydet
            await supabaseAdmin.from("profiles").upsert({
              id: createdUserId,
              email,
              full_name: createdUserName,
              updated_at: new Date().toISOString(),
            });
          }
        } catch (e) {
          console.warn("[PASSWORD-AUTH] Supabase register fallback:", e);
        }
      }

      // Yerel önbelleğe de yedekle
      const regRes = registerUser(email, createdUserName, password);
      if (!createdUserId && !regRes.success) {
        return NextResponse.json(
          { success: false, error: regRes.error || "Kayıt işlemi başarısız oldu." },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Kayıt işlemi başarıyla tamamlandı.",
        user: {
          id: createdUserId || regRes.user?.id || `usr-${Date.now()}`,
          email,
          fullName: createdUserName,
        },
      });
    }

    // =========================================================================
    // 2. GİRİŞ İŞLEMİ (LOGIN)
    // =========================================================================
    if (isSupabaseConfigured()) {
      try {
        const { data: signData, error: signErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!signErr && signData?.user) {
          const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("full_name")
            .eq("id", signData.user.id)
            .single();

          const resolvedName =
            profile?.full_name ||
            (signData.user.user_metadata?.full_name as string) ||
            email.split("@")[0];

          return NextResponse.json({
            success: true,
            message: "Giriş başarılı.",
            user: {
              id: signData.user.id,
              email: signData.user.email || email,
              fullName: resolvedName,
            },
          });
        }
      } catch (e) {
        console.warn("[PASSWORD-AUTH] Supabase login fallback:", e);
      }
    }

    // Supabase dışı veya yerel kullanıcı doğrulaması (Fallback)
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
