Great work so far! You've laid a solid foundation by building a high-converting landing page and the core backend authentication logic.

Here is the breakdown of your progress based on the Phase 1 — Auth & Onboarding requirements.

🏗️ What you HAVE built
Category	Component	Status	Location
Frontend	Landing Page	✅ Done	apps/web/app/page.tsx
Frontend	Waitlist Capture	✅ Done	apps/web/app/waitlist
Backend	POST /api/waitlist	✅ Done	apps/api/src/routes/waitlist.routes.ts
Backend	POST /api/auth/signup	✅ Done	apps/api/src/routes/auth.routes.ts
Backend	POST /api/auth/login	✅ Done	apps/api/src/routes/auth.routes.ts
Backend	GET /api/auth/me	✅ Done	apps/api/src/routes/auth.routes.ts
Backend	JWT Middleware	✅ Done	apps/api/src/middleware/auth.middleware.ts
🚧 What you HAVEN'T built (The Roadmap)
The remaining items are almost all Frontend UI and Integration tasks. Here is your step-by-step guide to finishing Phase 1:

1. Signup & Login Screens (Frontend)
Before users can use those backend routes, they need a portal.

Step 1: Create a route group in Next.js (e.g., (auth)) to handle layout specifically for auth pages (no navbar/footer).
Step 2: Build the Login page with fields for email and password.
Step 3: Build the Signup page with fields for name, email, and password.
Step 4: Add client-side validation (using a library like Zod or custom logic) to ensure fields aren't empty and emails are valid before hitting the API.
2. Onboarding Slides (3 Screens)
Once a user signs up but before they see their wallet, you should "sell" them on how to use PocketWise.

Step 1: Create an onboarding page.
Step 2: Design a simple carousel or multi-step state that shows three key value propositions (e.g., "Track Expenses," "Smart Budgeting," "Financial Freedom").
Step 3: Add a "Next" button that transitions between slides and a "Get Started" button on the final slide.
3. Post-Signup Setup Flow
This is where you collect initial user data to personalize the experience.

Step 1: Create a multi-step form after onboarding.
Step 2: Step A — Choose currency and primary bank name.
Step 3: Step B — Set an initial monthly savings goal.
Step 4: Step C — Link a (mock) account or input an initial balance.
4. Wallet Home Screen (Dashboard)
The main event! This is what the user sees after logging in.

Step 1: Create a (dashboard) route group.
Step 2: Design a layout with a Sidebar and Header.
Step 3: Implement the Wallet Card (showing total balance), Recent Transactions list, and Budget Progress bars using mock data.
5. Connecting Auth to the API
The bridge between your frontend and backend.

Step 1: Create a login handler that sends the form data to your POST /api/v1/auth/login endpoint.
Step 2: Store the returned JWT (token) securely (usually in an httpOnly cookie or local storage).
Step 3: Create an "Auth Provider" in React context to track if a user is logged in globally.
6. Next.js Middleware Protection
Ensuring hackers can't just type /dashboard in the URL.

Step 1: Create a middleware.ts file in your web app root.
Step 2: Configure it to check for the presence of your auth token whenever a user tries to access any path starting with /dashboard.
Step 3: If no token exists, redirect them back to the /login page.
Which of these would you like to start with first? I can guide you through the logic for any of them!

