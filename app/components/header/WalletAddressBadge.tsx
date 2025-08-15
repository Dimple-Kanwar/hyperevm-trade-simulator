import { Copy } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/components/ui/tooltip";
import { formatAddress } from "@/lib/utils";
import { useUser } from "@account-kit/react";
import { useState } from "react";
import { config } from "@/config";

export function WalletAddressBadge() {
  const [isCopied, setIsCopied] = useState(false);
  const user = useUser();
  const client = config._internal.wagmiConfig.getClient();
  const address = user?.address;
  // console.log({ address });
  const chain = client.chain;

  const handleCopy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // const openExplorer = () => {
  //   if (address && chain?.blockExplorers?.default?.url) {
  //     window.open(`${chain.blockExplorers.default.url}/address/${address}`, "_blank");
  //   }
  // };

  if (!address) return null;

  return (
    <div className="flex items-center gap-1 bg-muted rounded-full px-2 py-1">
      <span className="font-mono text-xs text-muted-foreground">
        {formatAddress(address)}
      </span>

      <TooltipProvider>
        {/* Copy Button */}
        <Tooltip open={isCopied}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleCopy}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Copied!</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <span className="text-xs text-gray-500">
        {chain.name}
      </span>
    </div>

  );
}