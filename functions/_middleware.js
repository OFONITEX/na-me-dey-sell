export async function onRequest(context) {
  const url = new URL(context.request.url);

  // Let API endpoints be handled normally by functions/api/*
  if (url.pathname.startsWith("/api/")) {
    return context.next();
  }

  // 1. Attempt to fetch the requested static asset
  const response = await context.env.ASSETS.fetch(context.request);

  // 2. If the asset doesn't exist natively, fallback to root index.html for client-side SPA routing
  if (response.status === 404) {
    // Don't fallback for static resource files like missing images or bundles
    const isStaticFile = /\.(png|jpg|jpeg|gif|webp|svg|ico|css|js|map|json|txt|woff|woff2)$/i.test(url.pathname);
    if (!isStaticFile) {
      const indexUrl = new URL("/", context.request.url);
      return context.env.ASSETS.fetch(indexUrl);
    }
  }

  return response;
}
