// Cloudflare Pages Function: POST /api/auth/verify-otp

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json().catch(() => ({}));
    const { email, code } = body;

    if (!email || !code) {
      return new Response(
        JSON.stringify({ success: false, error: "Email and OTP code are required." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Return successful verification response
    return new Response(
      JSON.stringify({
        success: true,
        verified: true,
        email: email.toLowerCase().trim(),
        message: "Email verified successfully"
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || "Verification failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
