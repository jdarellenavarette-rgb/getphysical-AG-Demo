import { fileURLToPath } from 'node:url';

/**
 * zod is resolved from sodia-core's own dependency so web forms validate with
 * the exact same zod instance as the shared schemas, without adding a second
 * copy to apps/web (lockfile untouched). Mirrored in tsconfig "paths".
 */
const zodFromSodiaCore = fileURLToPath(new URL('../../packages/sodia-core/node_modules/zod', import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['sodia-core'],
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = { ...(config.resolve.alias ?? {}), zod$: zodFromSodiaCore };
    return config;
  },
};

export default nextConfig;
