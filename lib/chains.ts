export const hype = {
  id: 999,
  name: "HyperEVM",
  nativeCurrency: {
    decimals: 18,
    name: "Hype",
    symbol: "HYPE",
  },
  rpcUrls: {
    default: {
      http: [`https://hyperliquid-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`],
    },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://hyperevmscan.io" },
  },
};

export const hype_testnet = {
  id: 998,
  name: "HyperEVM Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Hype",
    symbol: "HYPE",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.hyperliquid-testnet.xyz/evm"],
    },
  },
  blockExplorers: {
    default: { name: "Purrsec", url: "https://testnet.purrsec.com" },
  },
};

