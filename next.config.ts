/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Eliminar los rewrites para evitar conflictos con el proxy interno
  // Los rewrites pueden causar problemas cuando usamos /api/proxy/
}

export default nextConfig
