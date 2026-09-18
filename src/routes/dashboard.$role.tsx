import { createFileRoute, redirect } from "@tanstack/react-router";
import { roleHome, type Role } from "@/lib/session";

const aliases: Record<string, Role> = {
  citizen: "citizen",
  gov: "gov",
  government: "gov",
  university: "university",
  industry: "industry",
  admin: "admin",
};

export const Route = createFileRoute("/dashboard/$role")({
  beforeLoad: ({ params }) => {
    const role = aliases[params.role.toLowerCase()];
    throw redirect({ to: role ? roleHome[role] : "/login", replace: true });
  },
  component: () => null,
});
