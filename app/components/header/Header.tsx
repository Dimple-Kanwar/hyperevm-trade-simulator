import { useSignerStatus, useUser } from "@account-kit/react";
import { Logo } from "./Logo";
import { UserInfoDisplay } from "./UserInfoDisplay";
import { WalletAddressBadge } from "./WalletAddressBadge";
import { LogoutButton } from "./LogoutButton";
import { BalanceDisplay } from "./BalanceDisplay";
import { ThemeToggle } from "../ThemeToggle";
import Link from "next/link";


export default function Header() {
  const user = useUser();
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
        <Logo />
        {user?.address ? (
          <div className="flex items-center gap-3">
            <UserInfoDisplay />
            <BalanceDisplay />
            <WalletAddressBadge />
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