// app/simulate/page.tsx
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";

export default function SimulatePage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Create New Simulation</h1>
      <Card>
        <CardHeader>
          <CardTitle>Simulation Type</CardTitle>
          <CardDescription>
            Choose how you'd like to configure your simulation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link href="/simulate/custom" passHref>
            <Button
              variant="outline"
              size="lg"
              className="h-auto w-full justify-start p-4 text-left"
            >
              <div>
                <div className="font-medium">Custom Contract Simulation</div>
                <div className="text-sm text-muted-foreground">
                  Deploy or interact with any contract using ABI and address
                </div>
              </div>
            </Button>
          </Link>

          {/* Optional: Add more types later */}
          {/* <Link href="/simulate/template" passHref>
            <Button
              variant="outline"
              size="lg"
              className="h-auto w-full justify-start p-4 text-left"
            >
              <div>
                <div className="font-medium">Template-Based Simulation</div>
                <div className="text-sm text-muted-foreground">
                  Use preloaded contracts (e.g., Uniswap, ERC20)
                </div>
              </div>
            </Button>
          </Link> */}
        </CardContent>
      </Card>
    </div>
  );
}