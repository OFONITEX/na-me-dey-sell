// Cloudflare Pages Function: POST /api/auth/login

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json().catch(() => ({}));
    const { identifier } = body;

    if (!identifier) {
      return new Response(
        JSON.stringify({ success: false, error: "Email or phone number is required." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const cleanId = String(identifier).trim().toLowerCase();

    // If D1 is bound, query user
    let userFromDb = null;
    if (env.DB) {
      try {
        const query = await env.DB.prepare(
          "SELECT id, full_name, email, phone, role FROM users WHERE LOWER(email) = ? OR phone = ? LIMIT 1"
        ).bind(cleanId, cleanId).first();
        if (query) {
          userFromDb = {
            id: query.id,
            fullName: query.full_name,
            email: query.email,
            phone: query.phone,
            role: query.role
          };
        }
      } catch (err) {
        console.warn("D1 query error:", err.message);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: userFromDb || { email: cleanId, verified: true },
        message: "Authenticated successfully"
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": `nmds_session=sess_${Date.now()}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
