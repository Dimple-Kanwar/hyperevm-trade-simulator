import { useUser } from "@account-kit/react";

export function UserInfoDisplay() {
  const user = useUser();
  const email = user?.email ?? "Anonymous";
  return (
    <span className="text-sm text-muted-foreground hidden sm:inline">
      {email}
    </span>
  );
}