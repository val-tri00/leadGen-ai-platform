# Frontend UI Structure

The web app now uses a two-layout App Router structure designed for the LeadGen AI SaaS shell:

- `app/(auth)/...` contains public auth screens such as `/login` and `/register`
- `app/(app)/...` contains protected product routes rendered inside the dashboard shell

## Layouts And Route Strategy

### Auth layout

The auth layout keeps login and registration outside the product sidebar while still using the same dark design system. If a valid session already exists, the layout redirects the user to `/dashboard`.

### App layout

The product layout uses a shared `AppShell` with:

- left sidebar navigation
- topbar with current section title, user summary, and logout
- responsive mobile drawer navigation
- shared content padding and page framing

All protected routes live inside this layout:

- `/dashboard`
- `/generate`
- `/runs`
- `/runs/[runId]`
- `/lead-board`
- `/billing`
- `/settings`

Protection is still client-side in this MVP because auth state is restored from browser session storage. The shell waits for auth bootstrap, redirects unauthenticated users to `/login`, and keeps the gateway-relative API flow unchanged.

## Reusable Component Structure

The UI is organized around reusable component groups:

- `app/components/ui`
  - Tailwind + shadcn-style primitives such as `Button`, `Card`, `Input`, `Badge`, `Tabs`, `Table`, `Select`, `Skeleton`, `Sheet`
- `app/components/shell`
  - `AppShell`, `Sidebar`, `Topbar`
- `app/components/shared`
  - `PageHeader`, `StatusBadge`, `EmptyState`, `LoadingSkeleton`
- `app/components/dashboard`
  - `MetricCard`
- `app/components/auth`
  - `AuthForm`, `AuthLayoutShell`
- `app/components/runs`
  - `GenerateRunForm`, `RunRequestSummary`, `RunTable`, `RunTimeline`, `RunSummaryCard`
- `app/components/leads`
  - `LeadTable`

## Page Responsibilities

- `/dashboard`
  - summary metrics derived from real runs
  - quick action card
  - recent runs table
- `/generate`
  - SaaS-style request form plus live summary card
- `/runs`
  - full runs table with refresh, loading, empty, and error states
- `/runs/[runId]`
  - tabs for overview, timeline, and leads
  - polling remains active while the run is non-terminal
- `/lead-board`
  - stored leads table with simple run filter
- `/billing`
  - placeholder plan and usage structure
- `/settings`
  - placeholder profile, integrations, API keys, and account sections

## Real Vs Placeholder

Real in this phase:

- auth bootstrap and protected navigation
- gateway-relative API calls
- run creation
- run list and run details
- async timeline polling
- stored leads display

Placeholder in this phase:

- billing logic
- settings actions
- enterprise auth hardening
- final marketing polish

The styling system is now Tailwind-based with a dark token set and shadcn-style component primitives, which prepares the app for future pipeline and product work without changing backend contracts.
