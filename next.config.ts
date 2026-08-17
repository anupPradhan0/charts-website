import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `pg` is the Prisma driver adapter's native PostgreSQL client. It must stay
  // an external require on the server rather than being bundled.
  serverExternalPackages: ["pg"],
};

export default nextConfig;
