import { Button } from "@/app/components/ui/button";
import { LogOut } from "lucide-react";
import { useLogout } from "@account-kit/react";

export function LogoutButton() {
  const { logout } = useLogout();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="gap-2"
      onClick={() => logout()}
    >
      <LogOut className="h-4 w-4" />
      <span>Logout</span>
    </Button>
  );
}