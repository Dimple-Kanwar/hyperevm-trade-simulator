import { useSignerStatus, useUser } from "@account-kit/react";
import { Logo } from "./Logo";
import { UserInfoDisplay } from "./UserInfoDisplay";
import { WalletAddressBadge } from "./WalletAddressBadge";
import { LogoutButton } from "./LogoutButton";
import { BalanceDisplay } from "./BalanceDisplay";
import { ThemeToggle } from "../ThemeToggle";
import Link from "next/link";
import NetworkSwitch from "./NetworkSwitch";
import { useNetwork } from "@/app/context/Network-Context";

interface Props {
  from: string
}
export default function Header({ from }: Props) {
  const user = useUser();
  const { network } = useNetwork();

  const user_address = network === "mainnet" ? user?.address : from;
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
        <Logo />
        <NetworkSwitch />
        {user_address ? (
          <div className="flex items-center gap-3">
            <UserInfoDisplay />
            {/* <BalanceDisplay /> */}
            <WalletAddressBadge from={from!} />
            <ThemeToggle isCollapsed={false} />
            <LogoutButton />
          </div>
        ) : (
          <Link href="/" passHref>
            <div className="flex items-center gap-3">
              <ThemeToggle isCollapsed={false} />
            </div>
          </Link>
        )}
      </div>
    </header>
  );
}