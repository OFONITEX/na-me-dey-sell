/**
 * Cloudflare Pages Function to securely expose public Monnify credentials
 * configured in the Cloudflare Pages Dashboard environment variables.
 * 
 * Works with any naming convention:
 * - NEXT_PUBLIC_MONNIFY_API_KEY, MONNIFY_API_KEY, MONNIFY_PUBLIC_KEY, MONNIFY_KEY, MONNIFY_TOKEN
 * - NEXT_PUBLIC_MONNIFY_CONTRACT_CODE, MONNIFY_CONTRACT_CODE, CONTRACT_CODE, MONNIFY_CONTRACT
 * - NEXT_PUBLIC_MONNIFY_IS_SANDBOX, MONNIFY_IS_SANDBOX, MONNIFY_SANDBOX
 *
 * Case-insensitive matching and intelligent fallback ensures that however the user
 * pasted the tokens in Cloudflare, they are safely resolved.
 */

function findEnvValue(env, candidateKeys) {
  if (!env || typeof env !== "object") return "";

  // 1. Direct match
  for (const k of candidateKeys) {
    if (env[k] !== undefined && env[k] !== null && String(env[k]).trim()) {
      return String(env[k]).trim();
    }
  }

  // 2. Case-insensitive match
  const envKeys = Object.keys(env);
  for (const candidate of candidateKeys) {
    const lowerCandidate = candidate.toLowerCase();
    for (const ek of envKeys) {
      if (ek.toLowerCase() === lowerCandidate && env[ek]) {
        return String(env[ek]).trim();
      }
    }
  }

  return "";
}

export async function onRequest(context) {
  const env = context.env || {};

  // Find API Key
  let apiKey = findEnvValue(env, [
    "NEXT_PUBLIC_MONNIFY_API_KEY",
    "MONNIFY_API_KEY",
    "MONNIFY_PUBLIC_KEY",
    "MONNIFY_PUBLIC_API_KEY",
    "MONNIFY_KEY",
    "MONNIFY_TOKEN",
    "MONNIFY_API_TOKEN",
    "API_KEY"
  ]);

  // Substring fallback for API key if not matched directly (ignoring secret keys)
  if (!apiKey) {
    for (const [k, v] of Object.entries(env)) {
      const lk = k.toLowerCase();
      if (lk.includes("monnify") && (lk.includes("key") || lk.includes("token")) && !lk.includes("secret")) {
        if (v && String(v).trim()) {
          apiKey = String(v).trim();
          break;
        }
      }
    }
  }

  // Find Contract Code
  let contractCode = findEnvValue(env, [
    "NEXT_PUBLIC_MONNIFY_CONTRACT_CODE",
    "MONNIFY_CONTRACT_CODE",
    "MONNIFY_CONTRACT",
    "MONNIFY_CONTRACT_NUMBER",
    "CONTRACT_CODE",
    "CONTRACT_NUMBER"
  ]);

  // Substring fallback for Contract Code
  if (!contractCode) {
    for (const [k, v] of Object.entries(env)) {
      const lk = k.toLowerCase();
      if (lk.includes("contract") || (lk.includes("monnify") && lk.includes("code"))) {
        if (v && String(v).trim()) {
          contractCode = String(v).trim();
          break;
        }
      }
    }
  }

  // Determine Sandbox / Production Mode
  const isSandboxVal = findEnvValue(env, [
    "NEXT_PUBLIC_MONNIFY_IS_SANDBOX",
    "MONNIFY_IS_SANDBOX",
    "MONNIFY_SANDBOX",
    "IS_SANDBOX"
  ]);

  let isSandbox = true;
  if (isSandboxVal) {
    isSandbox = isSandboxVal.toLowerCase() === "true" || isSandboxVal === "1";
  } else if (apiKey.startsWith("MK_PROD_")) {
    isSandbox = false;
  } else if (apiKey.startsWith("MK_TEST_")) {
    isSandbox = true;
  }

  const configured = Boolean(
    apiKey &&
    contractCode &&
    apiKey !== "YOUR_MONNIFY_API_KEY_HERE" &&
    contractCode !== "YOUR_CONTRACT_CODE_HERE"
  );

  return new Response(
    JSON.stringify({
      apiKey,
      contractCode,
      isSandbox,
      configured
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Access-Control-Allow-Origin": "*"
      }
    }
  );
}
