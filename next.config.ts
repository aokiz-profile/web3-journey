import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/lib/i18n.ts");

const nextConfig: NextConfig = {
  // Enable static export for easy deployment
  // output: 'export', // Uncomment for static export
};

export default withNextIntl(nextConfig);
