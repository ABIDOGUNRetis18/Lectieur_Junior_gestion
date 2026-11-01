"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";

export default function ConnexionCheck({ children }: { children: (isAuthenticated: boolean) => React.ReactNode }) {
  const { data: session, status } = useSession();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Update authentication state when session status changes
  if (status === "authenticated" && !isAuthenticated) {
    setIsAuthenticated(true);
  } else if (status === "unauthenticated" && isAuthenticated) {
    setIsAuthenticated(false);
  }

  // Show loading state while checking
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children(isAuthenticated)}</>;
}
