// RPC URLs
// export const RPC_URLS = {
//   mainnet: `https://hyperliquid-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
//   testnet: "https://spectrum-01.simplystaking.xyz/hyperliquid-tn-rpc/evm", // Verified on Purrsec
// };

export const CHAINS = {
  mainnet: {
    id: 999,
    name: "HyperEVM Mainnet",
    rpcUrl: `https://hyperliquid-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  },
  testnet: {
    id: 998,
    name: "HyperEVM Testnet",
    rpcUrl: "https://spectrum-01.simplystaking.xyz/hyperliquid-tn-rpc/evm",
  },
} as const;

export type NetworkKey = keyof typeof CHAINS; // "mainnet" | "testnet"
