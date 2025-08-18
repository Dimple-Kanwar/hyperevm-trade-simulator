"use client";

import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import Link from "next/link";
import { useNetwork } from "@/app/context/Network-Context";

interface SimulatorCardProps {
  from: string; // logged-in address (Alchemy or impersonated)
}

export default function SimulatorCard({ from }: SimulatorCardProps) {
  const { network } = useNetwork();
  console.log({from});
  return (
    <Link
      href={{
        pathname: "/simulate",
        query: { from, network }, // pass info to simulator page
      }}
      passHref
    >
      <Card className="overflow-hidden">
        <CardHeader className="pb-0">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="mb-2">
                HyperEVM Transaction Simulator
              </CardTitle>
              <CardDescription>
                {network === "mainnet" ? (
                  <>
                    Simulate real transactions with your{" "}
                    <b>Alchemy Smart Wallet</b>.
                  </>
                ) : (
                  <>
                    Simulate <b>testnet transactions</b> by impersonating any
                    address.
                  </>
                )}
                <br />
                Preview execution, debug failures, and optimize gas before
                production.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <br />
          <Button className="w-full group-hover:bg-blue-600 transition-colors">
            {network === "mainnet"
              ? "Simulate Mainnet Transaction"
              : "Simulate Testnet Transaction"}
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}
