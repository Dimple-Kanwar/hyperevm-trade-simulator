"use client";

import { useUser } from "@account-kit/react";
import LoginCard from "./components/login-card";
import Header from "./components/header/Header";
import SimulatorCard from "./components/simulator-card";
import { useNetwork } from "./context/Network-Context";
import { useEffect, useState } from "react";
import LoginCardTestnet from "./components/header/login-card-testnet";

export default function Home() {
  const user = useUser();
  const { network } = useNetwork(); // "mainnet" | "testnet"
  const [simAddress, setSimAddress] = useState<string | null>(null);

  const isMainnet = network === "mainnet";
  const isLoggedInMainnet = !!user?.address;
  const isLoggedInTestnet = !!simAddress;

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true); // ensures hydration happens only on client
  }, []);

  console.log({user_address: user?.address});
  if (!mounted) {
    return null; // prevents SSR mismatch
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Header from={simAddress!}/>
      <div className="bg-bg-main bg-cover bg-center bg-no-repeat h-[calc(100vh-4rem)]">
        <main className="container mx-auto px-4 py-8 h-full">
          {isMainnet ? (
            isLoggedInMainnet ? (
              <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
                <SimulatorCard from={user.address} />
              </div>
            ) : (
               <div className="flex justify-center items-center h-full pb-[4rem]">
                <LoginCard /> {/* Alchemy Smart Wallet login */}
              </div>
            )
          ) : (
            isLoggedInTestnet ? (
              <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
                <SimulatorCard from={simAddress} />
              </div>
            ) : (
               <div className="flex justify-center items-center h-full pb-[4rem]">
                <LoginCardTestnet onLogin={setSimAddress} />
              </div>
            )
          )}
        </main>
      </div>
    </div>
  );
}
