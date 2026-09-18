import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { getSession, type Role } from "@/lib/session";

export function RoleGuard({ role, children }: { role: Role; children: React.ReactNode }) {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const session = getSession();
    
    // If no session or wrong role, send to LOGIN, not front page
    if (!session || session.role !== role) {
      navigate({ to: "/login" });
      return;
    }
    
    setAuthorized(true);
  }, [role, navigate]);

  if (!authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-lg font-semibold text-muted-foreground">Checking authorization...</p>
      </div>
    );
  }

  return <>{children}</>;
}