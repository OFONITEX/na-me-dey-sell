// Cloudflare Pages Function: POST /api/auth/logout

export async function onRequestPost() {
  return new Response(
    JSON.stringify({ success: true, message: "Logged out" }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": "nmds_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"
      }
    }
  );
}
