import { createFileRoute } from "@tanstack/react-router";
import { Building2, ClipboardList, ShieldCheck, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { StatsCard } from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { users } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — SICP Jharkhand" },
      { name: "description", content: "Manage users, universities and system-wide settings." },
      { property: "og:title", content: "Admin Dashboard — SICP Jharkhand" },
      { property: "og:description", content: "Manage users, universities and system-wide settings." },
    ],
  }),
  component: AdminDashboard,
});

const statusStyle: Record<string, string> = {
  Active: "bg-success/12 text-success ring-success/25",
  Pending: "bg-accent/15 text-accent ring-accent/25",
  Suspended: "bg-destructive/12 text-destructive ring-destructive/25",
};

function AdminDashboard() {
  return (
    <AppLayout role="admin" title="System Administration" subtitle="Users, institutions and platform health at a glance.">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard label="Total Users" value="8,412" icon={Users} hint="Across all roles" />
        <StatsCard label="Total Challenges" value="1,247" icon={ClipboardList} tone="accent" />
        <StatsCard label="Active Universities" value="45" icon={Building2} tone="success" />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={() => toast.success("Add University form opened")}>
          <Building2 className="mr-2 size-4" /> Add University
        </Button>
        <Button variant="outline" onClick={() => toast.success("Verification queue opened")}>
          <ShieldCheck className="mr-2 size-4" /> Verify User
        </Button>
        <Button variant="outline" onClick={() => toast.success("Invite link copied")}>
          <UserPlus className="mr-2 size-4" /> Invite Officer
        </Button>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-semibold">User management</h2>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.name}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-muted-foreground">{u.role}</TableCell>
                  <TableCell className="text-muted-foreground">{u.org}</TableCell>
                  <TableCell>
                    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset", statusStyle[u.status])}>
                      {u.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => toast.success(`${u.name} verified`)}>
                        Verify
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => toast.success(`${u.name} suspended`)}>
                        Suspend
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
}
