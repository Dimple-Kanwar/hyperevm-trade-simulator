
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static.alchemyapi.io",
        port: "",
        pathname: "/**",
      },
    ],
  },
  // headers: () => {
  //   return [
  //     {
  //       source: "/login",
  //       headers: [
  //         {
  //           key: "Cross-Origin-Embedder-Policy",
  //           value: "unsafe-none",
  //         },
  //       ],
  //     },
  //   ];
  // }
};

export default nextConfig;