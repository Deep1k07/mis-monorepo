/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output for Docker — produces a self-contained .next/standalone
  // build that can run with just `node server.js`.
  output: "standalone",
  // Required when running standalone build from a monorepo so Next traces
  // workspace dependencies (e.g. @repo/ui) correctly.
  outputFileTracingRoot: new URL("../../", import.meta.url).pathname,
};

export default nextConfig;
