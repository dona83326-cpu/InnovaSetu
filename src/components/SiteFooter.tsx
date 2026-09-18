import { Landmark } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-lg bg-accent text-accent-foreground">
              <Landmark className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold leading-tight">
                Societal Innovation Collaboration Portal
              </p>
              <p className="text-xs opacity-80">Government of Jharkhand</p>
            </div>
          </div>
          <p className="mt-4 max-w-xs text-sm opacity-80">
            A state initiative connecting citizens, administration and academia to solve
            real problems on the ground.
          </p>
        </div>
        <div className="text-sm">
          <p className="font-semibold">Quick Links</p>
          <ul className="mt-3 space-y-2 opacity-80">
            <li>Report a Challenge</li>
            <li>University Partners</li>
            <li>Open Data & Reports</li>
            <li>Grievance Redressal</li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-semibold">Contact</p>
          <ul className="mt-3 space-y-2 opacity-80">
            <li>Department of IT & e-Governance</li>
            <li>Project Bhawan, Dhurwa, Ranchi 834004</li>
            <li>helpdesk@sicp.jharkhand.gov.in</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/15 px-6 py-4 text-center text-xs opacity-75">
        © {new Date().getFullYear()} Government of Jharkhand. All rights reserved. Content
        owned and maintained by the Department of IT & e-Governance.
      </div>
    </footer>
  );
}
