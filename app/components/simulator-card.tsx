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
              <CardTitle className="mb-2">HyperEVM Transaction Simulator</CardTitle>
              <CardDescription>
                  Simulate transactions to preview their exact outcomes in a safe environment.
                  <br/>
                  Test transaction execution, prevent failures, and optimize contracts before going to production.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <br />
          <Button className="w-full group-hover:bg-blue-600 transition-colors">
            Simulate Transaction
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}
