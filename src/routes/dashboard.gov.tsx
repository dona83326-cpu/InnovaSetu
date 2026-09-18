import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/gov")({
  beforeLoad: () => {
    throw redirect({ to: "/government/dashboard", replace: true });
  },
  component: () => null,
});
