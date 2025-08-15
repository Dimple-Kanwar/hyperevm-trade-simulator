"use client";

import { useUser } from "@account-kit/react";
import LoginCard from "./components/login-card";
import Header from "./components/header/Header";
import SimulatorCard from "./components/simulator-card";

export default function Home() {
  const user = useUser();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Header />
      <div className="bg-bg-main bg-cover bg-center bg-no-repeat h-[calc(100vh-4rem)]">
        <main className="container mx-auto px-4 py-8 h-full">
          {
            user?.address ? (
              <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
                {/* <div className="flex flex-col gap-8"> */}
                <SimulatorCard />
                {/* </div> */}
              </div>
            ) : (
              <div className="flex justify-center items-center h-full pb-[4rem]">
                <LoginCard />
              </div>
            )
          }
        </main>
      </div>
    </div>
  );
}
