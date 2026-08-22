# INKWAVE — PRODUCTION TECH STACK & CODING GUIDELINES

## 1. CORE TECHNOLOGIES & VERSIONS
- **Framework:** Next.js 14+ (App Router with Server Components & Server Actions)
- **Language:** TypeScript (Strict Mode enabled, no `any` types)
- **Styling:** Tailwind CSS (Dark Glassmorphism Theme)
- **UI & Icons:** Lucide React, Radix UI Primitives (Headless)
- **Animations:** Framer Motion (Page transitions, bottom sheets, modals)
- **State Management:** Zustand (Cart state, try-on modal drawer state, UI toggles)
- **Backend / Database / Auth:** Supabase (`@supabase/ssr`, PostgreSQL, Auth, Realtime, Edge Functions)
- **Media Engine:** Cloudinary (Dynamic image transformations, WebP/AVIF delivery)
- **Payments:** Razorpay API Integration
- **Form Validation:** React Hook Form + Zod Schema Validation

---

## 2. ARCHITECTURAL & CODING RULES

### Component Rules:
- Default to **Next.js Server Components (RSC)** for data fetching (PDPs, catalog, CMS content).
- Mark interactive components explicitly with `'use client';` at the top of the file (modals, slide-out cart, live sliders, try-on canvas).
- Place reusable atomic UI elements under `components/ui` and page-specific blocks under `components/storefront` or `components/admin`.

### Styling Rules:
- **Primary Aesthetic:** Dark Theme Base (`#0d0f12`), Translucent Glass Cards (`rgba(22, 25, 34, 0.8)` with `backdrop-blur-md`), Accent Colors (`Emerald #10b981`, `Indigo #6366f1`, `Violet #8b5cf6`).
- Border Radius: Standardize components with `rounded-xl` (`12px`) or pill shapes (`rounded-full`).
- Do NOT hardcode colors; use Tailwind utility tokens and variables defined in `tailwind.config.ts`.

### Database & Auth Rules:
- Always use the Supabase `@supabase/ssr` helper client for Server Components, Route Handlers, and Client Components.
- Always check Row Level Security (RLS) policies on database queries.
- Do NOT expose the `SUPABASE_SERVICE_ROLE_KEY` on the client side; use it strictly inside server-side Edge Functions or API Route Handlers.

### Error Handling & Typing:
- All API request bodies and environment variables must be validated using **Zod**.
- Explicitly type all component props using TypeScript interfaces imported from `@/types`.
