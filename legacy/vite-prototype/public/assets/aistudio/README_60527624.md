# GetPhysical: The Fitness Super App Ecosystem

**GetPhysical** is a B2B2C fitness ecosystem. We provide enterprise-grade, free operational software to physical gyms and sports clubs (GymDash/ClubDash/CoachDash). By controlling the facility's front desk, court bookings, and access gates, we drive their consumer base to download the Sodia mobile app to gain physical entry and book services.

## Repository Map (Turborepo)

This codebase is a strict Monorepo managed by Turborepo and `pnpm`. It separates consumer interfaces, business dashboards, and shared database logic into isolated workspaces.

```text
GetPhysical/
├── AGENTS.md               # [CRITICAL] The absolute AI coding laws and tech stack rules
├── README.md               # This project map
├── turbo.json              # Turborepo build pipeline configuration
│
├── apps/
│   ├── mobile/             # (Sodia) - Unified React Native app. B2C consumer feed AND B2B role-based portals (Staff Selfie DTR and Portable Sales Scanner, Owner Quick Dash, Coach Dash, and Organizer Dash)
│   └── web/                # (GymDash/ClubDash) - B2B Next.js 14+ heavy administrative dashboards
│
├── packages/
│   ├── db/                 # Supabase client, migrations (.sql), and generated types
│   ├── ui/                 # Shared Tailwind & Shadcn UI components
│   └── utils/              # Shared Zod schemas, date formatting, and helpers
│
└── docs/
    └── specs/              # Obsidian Markdown files containing individual feature specs)
