"use client";
import { config, queryClient } from "@/config";
import { AlchemyClientState } from "@account-kit/core";
import { AlchemyAccountProvider } from "@account-kit/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren, ReactNode, useEffect, useState } from "react";
import { NetworkContext, NetworkType, usePersistentState } from "./context/Network-Context";

// Root Providers
export const Providers = (
  props: PropsWithChildren<{ initialState?: AlchemyClientState }>
) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AlchemyAccountProvider
        config={config}
        queryClient={queryClient}
        initialState={props.initialState}
      >
       <NetworkProvider>{props.children}</NetworkProvider>
      </AlchemyAccountProvider>
    </QueryClientProvider>
  );
};

// Network Provider
export const NetworkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [network, setNetwork] = usePersistentState<NetworkType>("hyperEvmNetwork", "mainnet");

  return (
    <NetworkContext.Provider value={{ network, setNetwork }}>
      {children}
    </NetworkContext.Provider>
  );
};
