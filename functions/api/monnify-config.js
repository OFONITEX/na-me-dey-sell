/**
 * Cloudflare Pages Function: /api/monnify-config
 * Reads Monnify public configuration directly from Cloudflare Pages Environment Variables.
 * No credentials or secrets are hardcoded in the codebase.
 */
export async function onRequestGet(context) {
  const env = context.env || {};

  const apiKey = env.NEXT_PUBLIC_MONNIFY_API_KEY || env.MONNIFY_API_KEY || "";
  const contractCode = env.NEXT_PUBLIC_MONNIFY_CONTRACT_CODE || env.MONNIFY_CONTRACT_CODE || "";
  const isSandbox = (env.NEXT_PUBLIC_MONNIFY_IS_SANDBOX || env.MONNIFY_IS_SANDBOX) === "true";

  const isConfigured = Boolean(
    apiKey &&
    contractCode &&
    apiKey !== "YOUR_MONNIFY_API_KEY_HERE" &&
    contractCode !== "YOUR_CONTRACT_CODE_HERE"
  );

  return new Response(
    JSON.stringify({
      apiKey: isConfigured ? apiKey : "",
      contractCode: isConfigured ? contractCode : "",
      isSandbox,
      configured: isConfigured
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, max-age=0"
      }
    }
  );
}
