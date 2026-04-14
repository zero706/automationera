import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const urlError = searchParams.get("error");
  const urlErrorDescription = searchParams.get("error_description");
  const rawRedirect = searchParams.get("redirect") ?? "/dashboard";
  // Only allow relative paths to prevent open-redirect attacks
  const redirect = rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
    ? rawRedirect
    : "/dashboard";

  // Supabase redirected here with an error (e.g. expired token)
  if (urlError) {
    console.error("[auth/callback] Supabase returned error:", {
      urlError,
      urlErrorDescription,
    });
    const msg = encodeURIComponent(urlErrorDescription ?? urlError);
    return NextResponse.redirect(`${origin}/login?error=${msg}`);
  }

  if (!code) {
    console.error("[auth/callback] No code in callback URL");
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("Missing auth code")}`,
    );
  }

  const supabase = createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] exchangeCodeForSession failed:", {
      name: error.name,
      message: error.message,
      status: error.status,
    });
    const msg = encodeURIComponent(error.message || "Auth exchange failed");
    return NextResponse.redirect(`${origin}/login?error=${msg}`);
  }

  return NextResponse.redirect(`${origin}${redirect}`);
}
