import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import Link from "next/link";

export default function SimulatorCard() {
  return (
    <Link href="/simulate" passHref>
    <Card className="overflow-hidden">
      <CardHeader className="pb-0">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="mb-2">HyperEVM Transaction Simulation</CardTitle>
            <CardDescription>
              Simulate and analyze HyperEVM transactions off-chain with precision and insights. Try it out.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      {/* <CardContent className="pt-6"> */}
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Test smart contract interactions, gas usage, and state changes in a safe environment.
        </p>
        <Button className="w-full group-hover:bg-blue-600 transition-colors">
          Launch Simulator
        </Button>
      </CardContent>
      {/* </CardContent> */}
    </Card>
    </Link>
  );
}
