import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next only serves quality values named here, and 400s on any other — so
    // the 90 the case-study tiles ask for has to be declared. 75 stays for
    // everything else.
    qualities: [75, 90],
  },
};

export default nextConfig;
