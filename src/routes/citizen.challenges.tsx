import { createFileRoute, redirect } from "@tanstack/react-router";

// The challenge list is now merged into the unified citizen dashboard.
export const Route = createFileRoute("/citizen/challenges")({
  beforeLoad: () => {
    throw redirect({ to: "/citizen/dashboard", replace: true });
  },
  component: () => null,
});
