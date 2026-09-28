// Cloudflare Pages Function: POST /api/auth/send-otp
// Sends a 6-digit Email Authentication & Verification code to users

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json().catch(() => ({}));
    const { email, fullName, code } = body;

    if (!email || !code) {
      return new Response(
        JSON.stringify({ success: false, error: "Email address and OTP code are required." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const resendKey = env.RESEND_API_KEY || env.EMAIL_API_KEY;
    const fromAddress = env.EMAIL_FROM || "Nà Mè Dèy Sell <onboarding@resend.dev>";

    const htmlContent = `
      <div style="background-color: #070709; color: #FFFFFF; font-family: sans-serif; padding: 30px; border-radius: 12px; max-width: 500px; margin: 0 auto; border: 1px solid #D4AF37;">
        <div style="color: #D4AF37; font-size: 12px; font-weight: bold; letter-spacing: 2px;">NÀ MÈ DÈY SELL</div>
        <h2 style="color: #FFFFFF; margin-top: 10px;">Your Email Verification Code</h2>
        <p style="color: #E2D9BC; font-size: 14px;">
          Use the 6-digit code below to authenticate your account and access your tickets:
        </p>
        <div style="background: rgba(212, 175, 55, 0.15); border: 2px dashed #D4AF37; padding: 18px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <span style="font-family: monospace; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #F5D061;">
            ${code}
          </span>
        </div>
        <p style="color: #948B75; font-size: 12px;">
          This code will expire in 10 minutes. Do not share this code with anyone.
        </p>
      </div>
    `;

    if (resendKey) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: fromAddress,
            to: [email],
            subject: `🔐 ${code} is your Nà Mè Dèy Sell Code`,
            html: htmlContent
          })
        });
      } catch (err) {
        console.warn("Resend OTP error:", err.message);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Verification code sent to ${email}`,
        code: code // Included for seamless development/testing
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || "Failed to send OTP" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
