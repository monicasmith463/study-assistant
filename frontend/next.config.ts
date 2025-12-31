import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /* config options here */
  webpack(config) {
    // Only apply SVG loader to SVGs in src/icons directory
    // Files in src/app (like icon.svg) will be handled by Next.js metadata loader
    config.module.rules.push({
      test: /\.svg$/,
      include: /src\/icons/,
      use: ["@svgr/webpack"],
    })
    return config
  },
}

export default nextConfig
