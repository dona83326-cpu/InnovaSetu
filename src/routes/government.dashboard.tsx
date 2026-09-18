import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/government/dashboard")({
  beforeLoad: () => {
    throw redirect({
      to: "/gov/dashboard",
      replace: true,
    });
  },
  component: () => null,
});