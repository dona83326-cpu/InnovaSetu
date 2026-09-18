import { createFileRoute } from "@tanstack/react-router";
import { RoleGuard } from "@/components/RoleGuard";
import { IndustryWorkspace } from "./industry.dashboard";

export const Route = createFileRoute("/industry/bids")({ component: IndustryBidsRoute });
function IndustryBidsRoute() {
  return (
    <RoleGuard role="industry">
      <IndustryWorkspace view="bids" />
    </RoleGuard>
  );
}
