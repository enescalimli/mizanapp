import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname, "../"),
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://accounts.google.com/gsi/client https://apis.google.com https://s3.tradingview.com https://*.tradingview.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com/gsi/style",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: https: blob: https://*.googleusercontent.com https://*.tradingview.com https://s3.tradingview.com",
              "connect-src 'self' https://*.supabase.co https://api.resend.com https://va.vercel-scripts.com https://vitals.vercel-insights.com https://accounts.google.com https://www.googleapis.com https://scanner.tradingview.com https://*.tradingview.com",
              "frame-src 'self' https://accounts.google.com https://s.tradingview.com https://www.tradingview.com https://s3.tradingview.com https://*.tradingview.com",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
