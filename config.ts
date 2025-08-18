import {
  AlchemyAccountsUIConfig,
  cookieStorage,
  createConfig,
} from "@account-kit/react";
import { alchemy, defineAlchemyChain } from "@account-kit/infra";
import { QueryClient } from "@tanstack/react-query";
import { defineChain, http } from "viem";

const API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
if (!API_KEY) {
  throw new Error("NEXT_PUBLIC_ALCHEMY_API_KEY is not set");
}

const SPONSORSHIP_POLICY_ID = process.env.NEXT_PUBLIC_ALCHEMY_POLICY_ID;
if (!SPONSORSHIP_POLICY_ID) {
  throw new Error("NEXT_PUBLIC_ALCHEMY_POLICY_ID is not set");
}
export const hype = defineChain({
  id: 999,
  name: "Hype Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "Hype",
    symbol: "HYPE",
  },
  rpcUrls: {
    default: {
      http: [`https://hyperliquid-mainnet.g.alchemy.com/v2/${API_KEY}`],
      webSocket: [`wss://hyperliquid-mainnet.g.alchemy.com/v2/${API_KEY}`],
    },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://hyperevmscan.io/" },
  },
});

export const hype_testnet = defineChain({
  id: 998,
  name: "Hype Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Hype",
    symbol: "HYPE",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.hyperliquid-testnet.xyz/evm"],
      webSocket: ["wss://api.hyperliquid-testnet.xyz/ws"],
    },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://testnet.purrsec.com/" },
  },
});

// const chain = defineAlchemyChain({
//   chain: hype_testnet,
//   rpcBaseUrl: "https://rpc.hyperliquid-testnet.xyz/evm",
// });

const chain = defineAlchemyChain({
  chain: hype,
  rpcBaseUrl: `https://hyperliquid-mainnet.g.alchemy.com/v2/${API_KEY}`,
});

const uiConfig: AlchemyAccountsUIConfig = {
  illustrationStyle: "outline",
  auth: {
    sections: [
      [{ type: "email" }],
      [
        { type: "passkey" },
        { type: "social", authProviderId: "google", mode: "popup" },
        { type: "social", authProviderId: "facebook", mode: "popup" },
      ],
      [
        {
          type: "external_wallets",
        },
      ],
    ],
    addPasskeyOnSignup: false,
  },
};

const transport =
  chain.id === 999
    ? alchemy({ apiKey: API_KEY })
    : alchemy({rpcUrl: "https://rpc.hyperliquid-testnet.xyz/evm"}); // ✅ viem's http transport
export const config = createConfig(
  {
    transport,
    // Note: This quickstart is configured for Arbitrum Sepolia.
    chain: chain,
    ssr: true, // more about ssr: https://www.alchemy.com/docs/wallets/react/ssr
    storage: cookieStorage, // more about persisting state with cookies: https://www.alchemy.com/docs/wallets/react/ssr#persisting-the-account-state
    enablePopupOauth: true, // must be set to "true" if you plan on using popup rather than redirect in the social login flow
    policyId: SPONSORSHIP_POLICY_ID,
  },
  uiConfig
);

export const queryClient = new QueryClient();
