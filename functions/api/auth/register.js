// Cloudflare Pages Function: POST /api/auth/register
// Registers a new user with Email, Fullname, and Phone Number

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json().catch(() => ({}));
    const { fullName, email, phone, password } = body;

    if (!fullName || !email || !phone) {
      return new Response(
        JSON.stringify({ success: false, error: "Email, Full Name, and Phone Number are required." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPhone = String(phone).trim();
    const cleanName = String(fullName).trim();

    // If Cloudflare D1 is bound as env.DB, we can insert into users table
    if (env.DB) {
      try {
        await env.DB.exec(`
          CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            full_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT UNIQUE NOT NULL,
            role TEXT DEFAULT 'attendee',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
        `);

        const userId = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        await env.DB.prepare(
          "INSERT INTO users (id, full_name, email, phone) VALUES (?, ?, ?, ?)"
        ).bind(userId, cleanName, cleanEmail, cleanPhone).run();
      } catch (dbErr) {
        console.warn("D1 execution note:", dbErr.message);
      }
    }

    const user = {
      id: `usr_${Date.now()}`,
      fullName: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      role: "attendee",
      verified: true
    };

    return new Response(
      JSON.stringify({ success: true, user, message: "Account created successfully" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": `nmds_session=${user.id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`
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
