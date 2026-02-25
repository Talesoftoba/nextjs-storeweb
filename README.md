Production-Grade Full Stack E-commerce Platform
Live: https://nextjs-storeweb.vercel.app/⁠
Nextjs-storeweb is a modern, production-oriented e-commerce system built with Next.js 15 App Router, secure server-side Stripe payments, and real-time order updates using Server-Sent Events.
The project emphasizes architectural clarity, security, performance, and refined UI/UX execution.

 Core Engineering Focus
This project demonstrates:
App Router architecture with Server Components
Secure server-side payment handling (Stripe Payment Intents)
Real-time order status updates using SSE
Role-protected application flows
Type-safe database modeling with Prisma
Clean separation between client and server logic
Production deployment pipeline via Vercel
🛠 Tech Stack
Frontend
Next.js 15 (App Router + Server Components)
TypeScript
Tailwind CSS v4
Backend
Prisma ORM
PostgreSQL
NextAuth.js (Credentials Provider)
Payments & Storage
Stripe (Card Elements + Payment Intents)
Supabase (Product image storage)
Supporting Libraries
react-hot-toast
lucide-react
react-icons
Native EventSource (SSE)

 Authentication & Route Protection
Email/password authentication via NextAuth
Session-based access control
Protected routes (Dashboard, Cart, Checkout)
Secure logout handling
Server-side validation for sensitive actions
Authentication logic is enforced at both UI and server layers to prevent unauthorized mutations.
🛍 Product & Cart System
Real-time product search
Category filtering
Stock-aware product detail pages
Dynamic cart badge updates without refresh
Quantity management with recalculated totals
Cart persistence across navigation using custom events
The cart system is designed to avoid unnecessary re-renders and maintain a smooth UX.

Payment Architecture
Payment flow is intentionally designed in a production-safe order:
Order is created in the database
Payment Intent is generated server-side
Stripe Card Element processes payment
SSE channel listens for payment confirmation
UI updates in real time (confirmed / pending / failed)
This eliminates polling and improves perceived performance.

 UI/UX Engineering
The design system focuses on a refined dark luxury aesthetic with performance-conscious styling.
Notable implementations:
Frosted glass header using backdrop blur
Radial glow accents for depth
Subtle CSS grid background texture
Dynamic viewport height handling for mobile
Scroll reset on route change
Loading and transition states on all async actions
No visible scrollbar for a clean visual experience
The UI remains fully responsive across mobile and desktop.

 Architectural Highlights
Server Components reduce client bundle size
Server Actions isolate sensitive mutations
Stripe logic runs exclusively server-side
Environment-variable-driven configuration
Strong type consistency from database to UI
Clean folder organization aligned with App Router standards

Local Development
git clone <repo-url>
npm install
npx prisma migrate dev
npm run dev

Environment variables required
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=

Deployment
Deployed on Vercel with automatic CI/CD integration from GitHub.
Production environment variables are securely configured in the Vercel dashboard.

Author
Samuel Ayoola
Full Stack Developer
Lagos, Nigeria



