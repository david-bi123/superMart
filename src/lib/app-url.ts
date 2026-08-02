export function getAppUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (configured && configured !== "http://localhost:3000") return configured.replace(/\/$/, "");

  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  return configured ? configured.replace(/\/$/, "") : "http://localhost:3000";
}