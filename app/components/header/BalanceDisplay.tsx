import { useSmartAccountClient } from "@account-kit/react";
import { useEffect, useState } from "react";
import { formatEther } from "viem";

export function BalanceDisplay() {
    const { client } = useSmartAccountClient({});
    const [balance, setBalance] = useState<string | null>(null);

    useEffect(() => {
        async function fetchBalance() {
            if (!client?.account?.address || !client.chain) return;

            try {
                const balanceHex = await client.request({
                    method: "eth_getBalance",
                    params: [client.account.address, "latest"],
                });
                const balanceInEth = formatEther(BigInt(balanceHex));
                setBalance(parseFloat(balanceInEth).toFixed(4));
            } catch (err) {
                console.error("Failed to fetch balance:", err);
                setBalance("–");
            }
        }

        fetchBalance();

        // Optional: Poll every 15s
        const interval = setInterval(fetchBalance, 15_000);
        return () => clearInterval(interval);
    }, [client]);

    if (!balance) return null;

    return (
        <span className="text-sm font-medium hidden sm:inline">
            {balance} {client?.chain?.nativeCurrency?.symbol || "HYPE"}
        </span>
    );
}