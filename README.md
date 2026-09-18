# InnovaSetu

Build a complete multi-page React application called "Societal Innovation Collaboration Portal" for Jharkhand government. This is a platform where citizens report societal challenges, AI categorizes them, government assigns them to universities, and universities solve them.

TECH STACK:

- React + Vite + TypeScript

- Tailwind CSS

- shadcn/ui components (use them extensively)

- React Router v6

- Recharts for analytics

- Lucide React for icons

- Use mock data (no real backend yet)

DESIGN SYSTEM:

- Primary color: Deep Blue (#1e40af)

- Accent color: Saffron (#f97316) - for Jharkhand identity

- Success: Green (#16a34a)

- Background: Light gray (#f8fafc)

- Font: Inter

- Style: Professional, government-grade, trustworthy (like MyGov.in)

- Must be fully responsive (mobile + desktop)

USER ROLES (each has different dashboard):

1. Citizen - reports challenges

2. Government Officer - reviews & assigns challenges

3. University Coordinator - receives & manages assignments

4. Admin - system management

CREATE THESE SCREENS (all in one app with proper routing):

=== PUBLIC SCREENS ===

1. LANDING PAGE (/)

   - Hero section: "Empowering Jharkhand Through Collaborative Innovation"

   - Stats bar: "1,247 Challenges | 45 Universities | 89 Solved"

   - Features section (3 cards): Citizen Reporting, AI Categorization, University Collaboration

   - How it works (4 steps with icons)

   - CTA buttons: "Report a Challenge" and "Login"

   - Footer with Jharkhand government branding

2. LOGIN PAGE (/login)

   - Clean card-based login form

   - Email + password fields

   - "Login as:" role selector (Citizen / Gov Officer / University / Admin)

   - "Don't have an account? Register" link

   - Mock login (any credentials work, redirects based on role)

3. REGISTER PAGE (/register)

   - Full name, email, phone, password

   - Role selection (radio buttons with descriptions)

   - If University role: show "Organization Name" field

   - If Gov role: show "Department" and "District" fields

   - Terms & conditions checkbox

=== CITIZEN SCREENS (layout: sidebar + main content) ===

4. CITIZEN DASHBOARD (/citizen/dashboard)

   - Welcome message with user name

   - Stats cards: "My Challenges", "In Progress", "Solved"

   - Recent challenges table with columns: Title, Category, Status, Date

   - Status badges (color-coded): Submitted (blue), Assigned (orange), In Progress (yellow), Solved (green)

   - "Report New Challenge" button (prominent)

5. SUBMIT CHALLENGE (/citizen/submit)

   - Multi-section form:

     * Section 1: Title + Description (textarea)

     * Section 2: Category dropdown (Water, Roads, Education, Health, Sanitation, Electricity, Other) - mention "AI will auto-suggest"

     * Section 3: Location - District dropdown (Ranchi, Dhanbad, Jamshedpur, Bokaro, Hazaribagh, Deoghar, etc.), Block text field, "Use My Location" button

     * Section 4: Photo upload (drag & drop zone, max 3 photos, show preview)

     * Section 5: Priority self-assessment (Low/Medium/High/Critical)

   - Submit button

   - After submit: show success message with mock challenge ID

6. MY CHALLENGES (/citizen/challenges)

   - Filter tabs: All | Submitted | In Progress | Solved

   - Card-based list showing: thumbnail, title, district, status, date

   - Click card → opens detail modal (mock)

=== GOVERNMENT OFFICER SCREENS ===

7. GOV DASHBOARD (/gov/dashboard)

   - Top stats row: Total Challenges, Pending Review, Assigned, Solved

   - Analytics section:

     * Pie chart: Challenges by category

     * Bar chart: Challenges by district (top 5)

     * Line chart: Submissions over last 30 days

   - Recent submissions table (5 rows) with "Review" button

8. CHALLENGE REVIEW (/gov/review)

   - Table with filters: Status, District, Category, Date range

   - Columns: ID, Title, District, Category, Priority, Submitted On, Actions

   - Actions: "View" and "Assign" buttons

   - Bulk actions: "Assign Selected to University"

9. CHALLENGE DETAIL (/gov/challenge/:id)

   - Left side: Challenge info (title, description, photos gallery, location on mock map, submitter info)

   - Right side: AI Analysis panel (mock):

     * "AI Category: Water & Sanitation (94% confidence)"

     * "AI Priority: High"

     * "Similar Challenges: 2 found"

   - Bottom: "Assign to University" form:

     * University dropdown

     * Department dropdown

     * Deadline date picker

     * Notes textarea

     * "Assign" button

=== UNIVERSITY SCREENS ===

10. UNIVERSITY DASHBOARD (/university/dashboard)

    - Stats: Assigned Challenges, In Progress, Completed

    - Active projects table: Challenge title, Department, Deadline, Status

    - Recent activity feed

11. CHALLENGE PROGRESS (/university/challenge/:id)

    - Challenge details (read-only)

    - Progress timeline: Research → Prototype → Field Testing → Deployed

    - Update status dropdown

    - Add notes textarea

    - Upload progress photos

    - "Mark as Complete" button

=== ADMIN SCREENS ===

12. ADMIN DASHBOARD (/admin/dashboard)

    - System stats: Total Users, Total Challenges, Active Universities

    - User management table: Name, Role, Organization, Status, Actions

    - Quick actions: "Add University", "Verify User"

=== SHARED COMPONENTS ===

- Sidebar Navigation (collapsible, role-based menu items, active state highlighted in primary blue)

- Top Navbar (logo on left, notification bell with badge, user avatar dropdown with logout)

- Footer (Jharkhand government branding, copyright)

- Status Badge component (reusable, color-coded)

- Stats Card component (reusable)

- Empty State component (when no data)

ROUTING:

- Use React Router v6

- Create a Layout component that wraps authenticated pages with sidebar + navbar

- Public pages (landing, login, register) have no sidebar

- After mock login, redirect to role-specific dashboard

MOCK DATA:

- Create realistic mock data for:

  * 10 sample challenges with Jharkhand districts

  * 5 universities (BIT Sindri, NIT Jamshedpur, RVM Ranchi, etc.)

  * Sample users for each role

- Use this mock data to populate all dashboards and tables

IMPORTANT:

- Make it look PRODUCTION-READY, not like a student project

- Use proper spacing, typography hierarchy, and visual hierarchy

- All buttons should have hover states

- Forms should have proper validation UI (even if mock)

- Charts should be interactive (hover tooltips)

- Mobile responsive (sidebar collapses to hamburger menu)

- Use loading states and empty states appropriately

Generate ALL screens in one go. I want a complete, navigable prototype where I can click through all pages and see realistic mock data.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3292e3ad-daba-46c7-926c-577f5b875db7).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
