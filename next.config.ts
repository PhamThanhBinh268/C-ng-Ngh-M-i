import type { NextConfig } from "next";

const supabaseRemotePattern = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? (() => {
      const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
      url.pathname = "/**";
      return url;
    })()
  : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL("https://res.cloudinary.com/**"),
      ...(supabaseRemotePattern ? [supabaseRemotePattern] : []),
    ],
  },
};

export default nextConfig;
