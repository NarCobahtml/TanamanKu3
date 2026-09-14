# Graph Report - tumbuhkita3  (2026-09-13)

## Corpus Check
- 155 files · ~185,282 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1523 nodes · 1752 edges · 126 communities (111 shown, 15 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- app/page.tsx
- RiwayatPage.tsx
- ProfilPage.tsx
- Navbar.tsx
- dependencies
- compilerOptions
- devDependencies
- Model Queries
- components.json
- AuthForm.tsx
- layout.tsx
- eslint.config.mjs
- next.config.ts
- next-env.d.ts
- postcss.config.mjs
- test.js
- Driver Adapters
- Upgrade to Prisma ORM 7
- Relation Queries
- Removed Features
- Prisma CLI Reference
- Raw Queries
- Troubleshooting Prisma Compute
- Client Methods
- Filter Conditions and Operators
- Query Options
- prisma db push
- prisma dev
- prisma generate
- prisma studio
- Prisma Client API Reference
- Prisma Config
- prisma migrate dev
- prisma db seed
- Prisma Compute
- Environment Variables
- TanamanDetailPage.tsx
- prisma db pull
- prisma init
- prisma migrate deploy
- Constructor Options
- Prisma Database Setup
- Prisma Accelerate Users
- ESM and CommonJS Support
- ForumPage.tsx
- TanamanPage.tsx
- Schema Changes
- Transactions
- Workflow
- Prisma Compute Framework Readiness
- MongoDB Setup
- Prisma SQL Driver Adapter Implementation
- Core Workflows
- tk-reveal-client.tsx
- prisma db execute
- Prisma Platform CLI App Deploy
- MySQL Setup
- management-api
- prisma migrate diff
- prisma migrate reset
- PostgreSQL Setup
- Prisma Postgres Setup
- SQLite Setup
- SQL Server Setup
- create-db-cli
- api-basics
- TumbuhKita API Routes Documentation
- prisma format
- prisma migrate resolve
- prisma validate
- CockroachDB Setup
- decision-stay-or-migrate
- console-and-connections
- management-api-sdk
- prisma migrate status
- Prisma Compute Config
- create-prisma Compute Flow
- migrations-mapping
- schema-contract-mapping
- Prisma MongoDB Upgrade Path
- endpoints
- prisma mcp
- SDK and API Automation
- client-api-mapping
- Service Tokens
- Temuan yang harus dibetulkan:
- Redesign mobile viewport tumbuhkita3 — sesuaikan block `lg:hidden` semua halaman dengan referensi Figma mobile1
- prisma debug
- Prisma Client Setup
- verify-cutover-checklist
- Prisma 7 Client Instantiation
- 9. Forum Komunitas
- TanamanKu Color Palette
- Round 2 — transformasi berani: halaman desktop tumbuhkita3 pakai DNA desain landing page
- TANAMANKU — TOTAL UI REDESIGN (gen 3)
- 11. Admin
- 2. Autentikasi & Authorisasi
- 6. Manajemen Tanaman
- 7. Jadwal Siram Otomatis
- Redesign brief: sesuaikan UI seluruh halaman desktop tumbuhkita3 dengan gaya landing page (gen-5 editorial)
- 15. Arsitektur & Catatan Implementasi
- 1. Konvensi Umum
- 4. Knowledge Base Penyakit
- AI safety checkpoint for destructive commands
- 3. Sistem AI Scan Penyakit
- 5. Riwayat Scan & Quota
- README.md
- prisma complete
- 12. Format Error & Kode
- package.json
- STRUCTURE — Konvensi tumbuhkita3
- clsx
- cn
- next
- prisma
- radix-ui
- @radix-ui/react-slot
- react
- sonner

## God Nodes (most connected - your core abstractions)
1. `Troubleshooting Prisma Compute` - 22 edges
2. `cn()` - 21 edges
3. `TumbuhKita API Routes Documentation` - 17 edges
4. `TkRevealClient()` - 16 edges
5. `compilerOptions` - 16 edges
6. `Button()` - 15 edges
7. `Prisma Client API Reference` - 14 edges
8. `Prisma Compute Framework Readiness` - 14 edges
9. `Upgrade to Prisma ORM 7` - 14 edges
10. `Prisma Platform CLI App Deploy` - 13 edges

## Surprising Connections (you probably didn't know these)
- `ForumDetailPage()` --calls--> `cn()`  [EXTRACTED]
  src/components/ForumDetailPage.tsx → src/lib/utils.ts
- `HealthStatus()` --calls--> `cn()`  [EXTRACTED]
  src/components/HealthStatus.tsx → src/lib/utils.ts
- `ProfilPage()` --calls--> `cn()`  [EXTRACTED]
  src/components/ProfilPage.tsx → src/lib/utils.ts
- `TanamanDetailPage()` --calls--> `cn()`  [EXTRACTED]
  src/components/TanamanDetailPage.tsx → src/lib/utils.ts
- `PlantThumb()` --calls--> `cn()`  [EXTRACTED]
  src/components/TanamanPage.tsx → src/lib/utils.ts

## Import Cycles
- None detected.

## Communities (126 total, 15 thin omitted)

### Community 0 - "app/page.tsx"
Cohesion: 0.13
Nodes (12): Community(), POSTS, CtaBand(), Features, Footer(), Hero(), Pos, HowItWorks() (+4 more)

### Community 1 - "RiwayatPage.tsx"
Cohesion: 0.15
Nodes (18): conf, HealthLevel, HealthStatus(), healthById, PlantHealth, recentScans, wateringToday, PageCtaBand() (+10 more)

### Community 2 - "ProfilPage.tsx"
Cohesion: 0.17
Nodes (8): navItems, notifPrefs, Dialog(), DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogTitle()

### Community 3 - "Navbar.tsx"
Cohesion: 0.06
Nodes (29): Home(), menuItems, filters, Scan, scans, ScanStatus, statusVisual, treatments (+21 more)

### Community 4 - "dependencies"
Cohesion: 0.12
Nodes (17): class-variance-authority, lucide-react, next-themes, dependencies, class-variance-authority, lucide-react, next-themes, pg (+9 more)

### Community 5 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 6 - "devDependencies"
Cohesion: 0.11
Nodes (19): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node (+11 more)

### Community 7 - "Model Queries"
Cohesion: 0.07
Nodes (27): aggregate, Aggregation Operations, Atomic operations, count, create, Create Operations, createMany, createManyAndReturn (+19 more)

### Community 8 - "components.json"
Cohesion: 0.12
Nodes (16): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+8 more)

### Community 10 - "AuthForm.tsx"
Cohesion: 0.31
Nodes (3): AuthForm(), perks, Checkbox()

### Community 22 - "Driver Adapters"
Cohesion: 0.07
Nodes (27): Accept self-signed certificates, After (v7), Available Adapters, Before (v6), Configuration, Connection Pool Configuration, Driver Adapters, Installation (+19 more)

### Community 23 - "Upgrade to Prisma ORM 7"
Cohesion: 0.08
Nodes (25): 1. Update package.json for ESM-first projects, 2. Update tsconfig.json, 3. Update schema.prisma, 4. Create prisma.config.ts, 5. Install a driver adapter (SQL providers only), 6. Update client instantiation, 7. Replace Prisma.validator with satisfies, 8. Run migrations and generate (+17 more)

### Community 24 - "Relation Queries"
Cohesion: 0.08
Nodes (23): Connect existing, Count Relations, Create or connect, Create with relations, Delete related, Disconnect, every, Filter counted relations (+15 more)

### Community 25 - "Removed Features"
Cohesion: 0.08
Nodes (23): Alternatives, Auto-generate after migrate, Auto-seed after migrate, Automatic Behaviors Removed, CLI Flags Removed, Client Middleware, Common Middleware Patterns, Custom counter with extensions (+15 more)

### Community 26 - "Prisma CLI Reference"
Cohesion: 0.09
Nodes (21): AI Safety Checkpoint, Boundary: Platform and Compute, Bun Runtime, Client Generation, Command Categories, Current Command Behavior, Current Prisma CLI Setup, Database Operations (+13 more)

### Community 27 - "Raw Queries"
Cohesion: 0.09
Nodes (21): BigInt handling, Database-Specific Features, Date handling, Delete example, Dynamic table/column names, $executeRaw, Handling Results, Insert example (+13 more)

### Community 28 - "Troubleshooting Prisma Compute"
Cohesion: 0.09
Nodes (22): Accidental Prisma Postgres Provisioning, Auth Fails, Bun Entrypoint Missing, Compute Config Invalid, `create-prisma --yes` Did Not Deploy, Database Wiring or Schema Did Not Apply, Env Changes Did Not Apply, First Checks (+14 more)

### Community 29 - "Client Methods"
Cohesion: 0.10
Nodes (18): Add custom methods, Add model methods, Chain extensions, Client Methods, $connect(), $disconnect(), $extends(), Graceful shutdown (+10 more)

### Community 30 - "Filter Conditions and Operators"
Cohesion: 0.10
Nodes (20): AND (explicit), AND (implicit), Array Field Filters, Combined, Comparison, Equality, every, Filter Conditions and Operators (+12 more)

### Community 31 - "Query Options"
Cohesion: 0.10
Nodes (20): cursor, distinct, Filtered include, include, Include relation count, Multiple distinct fields, Negative take (reverse), Nested include (+12 more)

### Community 32 - "prisma db push"
Cohesion: 0.10
Nodes (19): Accept data loss, Basic push, Command, Common Patterns, Comparison with migrate dev, Examples, Follow-up Command, Force reset (+11 more)

### Community 33 - "prisma dev"
Cohesion: 0.10
Nodes (19): Background mode, Command, Configuration, Custom ports, Examples, Force remove (stops first), Instance Management, List all instances (+11 more)

### Community 34 - "prisma generate"
Cohesion: 0.10
Nodes (19): After schema changes, Basic generation, Bun Runtime, CI/CD pipeline, Command, Common Patterns, Compiler Build Tuning, Current Generator Behavior (+11 more)

### Community 35 - "prisma studio"
Cohesion: 0.10
Nodes (19): Command, Common Workflow, Custom port, Don't open browser, Edit Records, Examples, Features, Filter Data (+11 more)

### Community 36 - "Prisma Client API Reference"
Cohesion: 0.10
Nodes (19): Client Instantiation, Client Methods, Create records, Delete records, Filter Operators, Find records, How to Use, Model Query Methods (+11 more)

### Community 37 - "Prisma Config"
Cohesion: 0.10
Nodes (19): After (v7) - prisma.config.ts, Basic Configuration, Before (v6) - schema.prisma, Configuration Options, Custom Config Path, datasource.directUrl, datasource.shadowDatabaseUrl, datasource.url (+11 more)

### Community 38 - "prisma migrate dev"
Cohesion: 0.11
Nodes (18): After schema changes, Command, Common Patterns, Create and apply migration, Create without applying, Examples, Follow-up Commands, Full workflow (+10 more)

### Community 39 - "prisma db seed"
Cohesion: 0.11
Nodes (17): Best Practices, Command, Common Patterns, Common seed commands, Conditional seeding, Configuration, Current Workflow, Development reset (+9 more)

### Community 40 - "Prisma Compute"
Cohesion: 0.11
Nodes (18): 1. Command Verification, 2. Auth and Workspace Selection, 3. Framework Readiness, 4. Runtime Host and Port Binding, 5. Typed Compute Config, 6. Branch, Environment, and Database, 7. Deploy Operations, 8. SDK and API (+10 more)

### Community 41 - "Environment Variables"
Cohesion: 0.11
Nodes (17): 1. Install dotenv, 2. Import in prisma.config.ts, Application Code, Bun Users, CI/CD Considerations, Entry point, Environment Variables, Multiple .env Files (+9 more)

### Community 42 - "TanamanDetailPage.tsx"
Cohesion: 0.13
Nodes (16): categories, HARI, HARI_1, isWaterDay(), riwayatKesehatan, TanamanDetailPage(), tanamanList, Badge() (+8 more)

### Community 43 - "prisma db pull"
Cohesion: 0.12
Nodes (16): Basic introspection, Command, Examples, Force overwrite, Generated Schema Example, MongoDB Introspection, Options, Post-Introspection Cleanup (+8 more)

### Community 44 - "prisma init"
Cohesion: 0.12
Nodes (16): Add an example model, Basic initialization, Bun Runtime, Command, Examples, Generated Config (Bun), Generated Config (Node.js default), Generated Schema (+8 more)

### Community 45 - "prisma migrate deploy"
Cohesion: 0.12
Nodes (16): Basic deployment, Best Practices, Check status first, Command, Comparison with migrate dev, Configuration, Docker deployment, Error Handling (+8 more)

### Community 46 - "Constructor Options"
Cohesion: 0.12
Nodes (16): accelerateUrl (For Accelerate users), adapter (Required for the SQL provider workflow), Basic Instantiation, comments, Constructor Options, errorFormat, log, Log Events (+8 more)

### Community 47 - "Prisma Database Setup"
Cohesion: 0.12
Nodes (16): Bun Runtime, Configuration Files, Driver Adapters, How to Use, MongoDB, MySQL, PostgreSQL, Prisma Client Setup (Required) (+8 more)

### Community 48 - "Prisma Accelerate Users"
Cohesion: 0.12
Nodes (16): 1. Keep your Accelerate URL, 2. Install Accelerate extension, 3. Configure prisma.config.ts, 4. Instantiate client with accelerateUrl, Caching with Accelerate, Correct v7 Setup for Accelerate, Edge Runtime, Important (+8 more)

### Community 49 - "ESM and CommonJS Support"
Cohesion: 0.12
Nodes (16): Browser-Safe Types, Bun, "Cannot use import statement outside a module", CommonJS Projects, "ERR_REQUIRE_ESM", ESM and CommonJS Support, ESM Projects, File Extensions (+8 more)

### Community 50 - "ForumPage.tsx"
Cohesion: 0.18
Nodes (10): ForumDetailPage(), categories, ExpertBadge(), ForumPost, forumPosts, topics, Avatar(), AvatarFallback() (+2 more)

### Community 51 - "TanamanPage.tsx"
Cohesion: 0.14
Nodes (19): EmptyState(), PageBand(), PageHeader(), healthLevel(), jenisList, Kategori, kategoriList, PlantThumb() (+11 more)

### Community 52 - "Schema Changes"
Cohesion: 0.12
Nodes (15): 1. Provider name, 2. Output is required, 3. engineType changed, 4. moduleFormat is explicit when needed, After Schema Changes, Datasource Block, Example Output Paths, Generated Entrypoints (+7 more)

### Community 53 - "Transactions"
Cohesion: 0.13
Nodes (14): All or nothing, Best Practices, Handle errors, Interactive Transactions, Isolation levels, Keep transactions short, Nested Writes, OrThrow in Transactions (+6 more)

### Community 54 - "Workflow"
Cohesion: 0.13
Nodes (14): Error Handling, Prerequisites, Prisma Postgres Setup, Reference Files, Step 1: Authenticate, Step 2: List available regions, Step 3: Create a project with a database, Step 4: Create a named connection (optional) (+6 more)

### Community 55 - "Prisma Compute Framework Readiness"
Cohesion: 0.14
Nodes (14): Astro, Bun, Elysia, and Plain Source Servers, CLI-First Model, CLI Matrix, Custom Build Artifacts, Hono, NestJS, Next.js (+6 more)

### Community 56 - "MongoDB Setup"
Cohesion: 0.14
Nodes (13): 1. Schema Configuration, 2. Environment Variable, Common Issues, Current Verification Notes, Driver Adapters, ID Field Requirement, "Invalid ObjectID", Migrations vs Introspection (+5 more)

### Community 57 - "Prisma SQL Driver Adapter Implementation"
Cohesion: 0.14
Nodes (13): Commit and rollback, Contract snapshot, Error mapping, Factory, ownership, and shadow database, Priority rules, Prisma SQL Driver Adapter Implementation, Query implementation, Result mapping (+5 more)

### Community 58 - "Core Workflows"
Cohesion: 0.14
Nodes (13): 1. Console-first workflow, 2. Quick provisioning with create-db, 2b. Persistent databases with the Platform CLI, 3. Link an existing local project, 4. Programmatic provisioning with Management API, 5. Type-safe integration with Management API SDK, Core Workflows, How to Use (+5 more)

### Community 59 - "tk-reveal-client.tsx"
Cohesion: 0.18
Nodes (10): steps, TkRevealClient(), SectionHeader(), preventions, ScanResultPage(), symptoms, treatments, Button() (+2 more)

### Community 60 - "prisma db execute"
Cohesion: 0.15
Nodes (12): Command, Configuration, Current Option Surface, Examples, Execute from file, Execute from stdin, Execute `migrate diff` output, Limitations (+4 more)

### Community 61 - "Prisma Platform CLI App Deploy"
Cohesion: 0.15
Nodes (13): Agent Skill Installation, Auth and Project Binding, Build and Run Locally, Database and Env, Deploy, Deployment Story: GitHub vs CLI, Operations, Output Handling (+5 more)

### Community 62 - "MySQL Setup"
Cohesion: 0.15
Nodes (12): 1. Schema Configuration, 2. Config Configuration, 3. Environment Variable, Common Issues, Connection String Format, Driver Adapter, JSON Support, MySQL Setup (+4 more)

### Community 63 - "management-api"
Cohesion: 0.15
Nodes (12): API exploration, Authentication methods, Base URL, Current resource inventory, management-api, Notes, OAuth flow summary, Priority (+4 more)

### Community 64 - "prisma migrate diff"
Cohesion: 0.17
Nodes (11): Check for drift (CI), Command, Create baseline migration, Examples, Generate SQL for a schema change, Options, prisma migrate diff, Review pending migrations (+3 more)

### Community 65 - "prisma migrate reset"
Cohesion: 0.17
Nodes (11): Basic reset, Command, Configuration, Examples, Follow-up Steps, Force reset (CI/Automation), Options, prisma migrate reset (+3 more)

### Community 66 - "PostgreSQL Setup"
Cohesion: 0.17
Nodes (11): 1. Schema Configuration, 2. Config Configuration, 3. Environment Variable, "Authentication failed", "Can't reach database server", Common Issues, Connection String Format, Driver Adapter (+3 more)

### Community 67 - "Prisma Postgres Setup"
Cohesion: 0.17
Nodes (11): 1. Schema Configuration, 2. Config Configuration, Connection String, Driver Adapter, Edge/serverless option, Features, Overview, Prisma Postgres Setup (+3 more)

### Community 68 - "SQLite Setup"
Cohesion: 0.17
Nodes (11): 1. Schema Configuration, 2. Config Configuration, 3. Environment Variable, Common Issues, Connection String Format, "Database file not found", Driver Adapter, Limitations (+3 more)

### Community 69 - "SQL Server Setup"
Cohesion: 0.18
Nodes (10): 1. Schema Configuration, 2. Config Configuration, 3. Environment Variable, Common Issues, Connection String Format, Driver Adapter, "Login failed for user", Prerequisites (+2 more)

### Community 70 - "create-db-cli"
Cohesion: 0.18
Nodes (10): Command discovery (`--help`), Commands, Common patterns, create-db-cli, `create` options, Lifecycle and claim flow, Priority, Programmatic usage (library API) (+2 more)

### Community 71 - "api-basics"
Cohesion: 0.18
Nodes (10): api-basics, Base URL, Collection, Error codes by HTTP status, Error Responses, Pagination, Resource ID Prefixes, Response Envelope (+2 more)

### Community 72 - "TumbuhKita API Routes Documentation"
Cohesion: 0.18
Nodes (10): 10.1 Daftar Notifikasi, 10.2 Tandai Dibaca, 10. Notifikasi, 13. Konstanta Sistem, 14. Diagram Alur Sistem AI, 8.1 Logika Estimasi, 8.2 Ambil Estimasi, 8. Estimasi Panen (+2 more)

### Community 73 - "prisma format"
Cohesion: 0.20
Nodes (9): Behavior, Command, Examples, Format default schema, Format specific schema, Options, prisma format, Use in Editor (+1 more)

### Community 74 - "prisma migrate resolve"
Cohesion: 0.20
Nodes (9): Command, Examples, Mark as Applied (Baselining), Mark as Rolled Back (Fixing Failures), Options, prisma migrate resolve, References, Use Cases (+1 more)

### Community 75 - "prisma validate"
Cohesion: 0.20
Nodes (9): Command, Common Errors, Examples, Options, prisma validate, Use in CI, Validate default schema, Validate specific schema (+1 more)

### Community 76 - "CockroachDB Setup"
Cohesion: 0.20
Nodes (9): 1. Schema Configuration, 2. Config Configuration, 3. Environment Variable, CockroachDB Setup, Common Issues, Driver Adapter, ID Generation, Prerequisites (+1 more)

### Community 77 - "decision-stay-or-migrate"
Cohesion: 0.20
Nodes (9): Bad, Blocker checks before migrating, decision-stay-or-migrate, Good, Priority, References, Stay-on-v6 hygiene, The facts the decision rests on (+1 more)

### Community 78 - "console-and-connections"
Cohesion: 0.20
Nodes (9): Adapter choices, Connection setup, console-and-connections, Console workflow, Linking an existing project, Local Studio, Priority, References (+1 more)

### Community 79 - "management-api-sdk"
Cohesion: 0.20
Nodes (9): Full SDK (OAuth + refresh), Install, management-api-sdk, OAuth SDK flow, Priority, References, Simple client (existing token), Why It Matters (+1 more)

### Community 80 - "prisma migrate status"
Cohesion: 0.22
Nodes (8): Check status, Command, Examples, Exit Codes, Options, prisma migrate status, What It Does, When to Use

### Community 81 - "Prisma Compute Config"
Cohesion: 0.22
Nodes (9): App Fields, Basic Shape, Database Scope, File Names and Discovery, Generating a Config with `init`, Monorepos and Multi-App Repos, Precedence, Prisma Compute Config (+1 more)

### Community 82 - "create-prisma Compute Flow"
Cohesion: 0.22
Nodes (9): Addon Notes, Basic Commands, create-prisma Compute Flow, Failure Handling, Generated Deploy Script, Generated Files to Preserve, PostgreSQL and Database Behavior, Reference (+1 more)

### Community 83 - "migrations-mapping"
Cohesion: 0.22
Nodes (8): Bad, Good, migrations-mapping, Priority, Prisma Next: first-class, contract-driven migrations (Mongo included), References, v6: `db push` only, Why It Matters

### Community 84 - "schema-contract-mapping"
Cohesion: 0.22
Nodes (8): Bad, Environment requirements, Good, Priority, References, schema-contract-mapping, The mapping, Why It Matters

### Community 85 - "Prisma MongoDB Upgrade Path"
Cohesion: 0.22
Nodes (8): Decision table, Hand-off rule, If staying on v6: hygiene (a deliberate stay, not neglect), Prisma MongoDB Upgrade Path, Reference files, The decision, up front, The version landscape, Verified against

### Community 86 - "endpoints"
Cohesion: 0.22
Nodes (8): Create connection, Create project (with database), Delete database, Delete project, endpoints, Get database, List projects, List regions

### Community 87 - "prisma mcp"
Cohesion: 0.25
Nodes (7): Command, Notes, prisma mcp, References, Typical Use Cases, Usage, What It Does

### Community 88 - "SDK and API Automation"
Cohesion: 0.22
Nodes (8): Compute SDK, Management API Concepts, Prefer the CLI for App Workflows, Regions, Repository-snapshot detection, SDK and API Automation, SDK Build Strategies, Secrets and Redaction

### Community 89 - "client-api-mapping"
Cohesion: 0.25
Nodes (7): Bad, client-api-mapping, Good, Priority, References, The mapping, Why It Matters

### Community 90 - "Service Tokens"
Cohesion: 0.25
Nodes (7): auth, Creating a service token, OAuth 2.0 (for user-scoped access), Security practices, Service Tokens, Token scope, Using a service token

### Community 91 - "Temuan yang harus dibetulkan:"
Cohesion: 0.25
Nodes (7): 1. Siram route: pakai SLUG nama tanaman, konsisten desktop + mobile, 2. Hapus data duplikat — SATU sumber kebenaran, 3. Cek & rapikan sisa, 4. Konvensi tertulis (TULIS FILE `src/STRUCTURE.md`), Konsistensi & perbaikan struktur tumbuhkita3 — STOP pengembangan fitur baru, fokus rapikan, Temuan yang harus dibetulkan:, Verification (WAJIB semua):

### Community 92 - "Redesign mobile viewport tumbuhkita3 — sesuaikan block `lg:hidden` semua halaman dengan referensi Figma mobile1"
Cohesion: 0.25
Nodes (7): Aturan:, BottomNav (komponen `src/components/BottomNav.tsx` — update), Design tokens mobile (dari Figma), Header mobile (komponen `src/components/Header.tsx` — update), Per halaman (ganti ISI block mobile, bukan desktop):, Redesign mobile viewport tumbuhkita3 — sesuaikan block `lg:hidden` semua halaman dengan referensi Figma mobile1, Selesai bila:

### Community 93 - "prisma debug"
Cohesion: 0.29
Nodes (6): Command, Example Output, Options, prisma debug, What It Does, When to Use

### Community 95 - "Prisma Client Setup"
Cohesion: 0.29
Nodes (6): 1. Install dependencies, 2. Add generator block, 3. Generate Prisma Client, 4. Instantiate Prisma Client, 5. Use a single instance, Prisma Client Setup

### Community 96 - "verify-cutover-checklist"
Cohesion: 0.29
Nodes (6): Checklist, Ground rules, Priority, References, verify-cutover-checklist, Why It Matters

### Community 97 - "Prisma 7 Client Instantiation"
Cohesion: 0.29
Nodes (6): Basic instantiation, Common mistakes, Key rules, Prisma 7 Client Instantiation, Required packages, Usage in application code

### Community 98 - "9. Forum Komunitas"
Cohesion: 0.29
Nodes (7): 9.1 Daftar Post, 9.2 Buat Post, 9.3 Detail Post + Komentar, 9.4 Buat Komentar, 9.5 Upvote Komentar, 9.6 Tandai Jawaban Tersimpan (Penyuluh), 9. Forum Komunitas

### Community 99 - "TanamanKu Color Palette"
Cohesion: 0.29
Nodes (6): Borders & Radius, Primary Colors, Status Colors (never color-only — always icon + label), TanamanKu Color Palette, Text Colors, Usage Examples

### Community 100 - "Round 2 — transformasi berani: halaman desktop tumbuhkita3 pakai DNA desain landing page"
Cohesion: 0.29
Nodes (6): Definisi selesai:, LARANGAN:, Referensi gaya (baca dulu, jangan diubah), Round 2 — transformasi berani: halaman desktop tumbuhkita3 pakai DNA desain landing page, Target — desktop block (`hidden lg:block`) halaman:, Ubahan WAJIB per halaman (jangan asal tempel — sesuaikan konteks):

### Community 101 - "TANAMANKU — TOTAL UI REDESIGN (gen 3)"
Cohesion: 0.29
Nodes (6): Design tokens, Direction, Per-page, Shared components, TANAMANKU — TOTAL UI REDESIGN (gen 3), Verifikasi

### Community 102 - "11. Admin"
Cohesion: 0.33
Nodes (6): 11.1 Statistik Platform, 11.2 Kelola User, 11.3 CRUD Knowledge Base, 11.4 Moderasi Forum, 11.5 Manajemen Model & Engine, 11. Admin

### Community 103 - "2. Autentikasi & Authorisasi"
Cohesion: 0.33
Nodes (6): 2.1 Register, 2.2 Login, 2.3 Refresh Token, 2.4 Logout, 2.5 Peran & Matrix Hak Akses, 2. Autentikasi & Authorisasi

### Community 104 - "6. Manajemen Tanaman"
Cohesion: 0.33
Nodes (6): 6.1 Buat Tanaman, 6.2 Daftar Tanaman, 6.3 Detail Tanaman, 6.4 Update Tanaman, 6.5 Hapus Tanaman, 6. Manajemen Tanaman

### Community 105 - "7. Jadwal Siram Otomatis"
Cohesion: 0.33
Nodes (6): 7.1 Logika Perhitungan Otomatis, 7.2 Set Jadwal (Manual Override), 7.3 Tandai Sudah Disiram, 7.4 Ambil Jadwal Hari Ini (Agenda), 7.5 Ringkahan Cuaca untuk Siram, 7. Jadwal Siram Otomatis

### Community 106 - "Redesign brief: sesuaikan UI seluruh halaman desktop tumbuhkita3 dengan gaya landing page (gen-5 editorial)"
Cohesion: 0.33
Nodes (5): Definisi selesai, Karakteristik gaya landing yang harus diikuti, Redesign brief: sesuaikan UI seluruh halaman desktop tumbuhkita3 dengan gaya landing page (gen-5 editorial), Referensi gaya (JANGAN diubah), Yang harus DISESUAIKAN (desktop block `hidden lg:block` saja; JANGAN sentuh block mobile `lg:hidden`)

### Community 107 - "15. Arsitektur & Catatan Implementasi"
Cohesion: 0.40
Nodes (5): 15.1 Peta Route Handler Next.js (App Router), 15.2 Urutan Implementasi Bertahap (rekomendasi 12 hari), 15.3 Keamanan, 15.4 Catatan Status Frontend v1, 15. Arsitektur & Catatan Implementasi

### Community 108 - "1. Konvensi Umum"
Cohesion: 0.40
Nodes (5): 1. Konvensi Umum, Autentikasi, Base URL, Envelope Respons, Konvensi Lain

### Community 109 - "4. Knowledge Base Penyakit"
Cohesion: 0.40
Nodes (5): 4.1 Struktur Knowledge Entry, 4.2 Ambil Daftar Penyakit, 4.3 Ambil Detail Penyakit, 4.4 CRUD Admin (lihat §11), 4. Knowledge Base Penyakit

### Community 110 - "AI safety checkpoint for destructive commands"
Cohesion: 0.50
Nodes (3): AI safety checkpoint for destructive commands, Reference, Required workflow

### Community 111 - "3. Sistem AI Scan Penyakit"
Cohesion: 0.50
Nodes (4): 3.1 Upload & Analisis Scan, 3.2 Ambil Hasil Scan (by id), 3.3 Kongsi Hasil Scan ke Forum, 3. Sistem AI Scan Penyakit

### Community 112 - "5. Riwayat Scan & Quota"
Cohesion: 0.50
Nodes (4): 5.1 Riwayat Scan User, 5.2 Hapus Scan, 5.3 Quota Scan, 5. Riwayat Scan & Quota

### Community 113 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 115 - "12. Format Error & Kode"
Cohesion: 0.67
Nodes (3): 12. Format Error & Kode, Error Spesifik Domain, Error Umum

### Community 116 - "package.json"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, lint, start, version

### Community 117 - "STRUCTURE — Konvensi tumbuhkita3"
Cohesion: 0.29
Nodes (6): Data — SATU sumber kebenaran, Pattern responsif — dua block per page, Penamaan, Route map, STRUCTURE — Konvensi tumbuhkita3, Warna — dua ekosistem, memang beda (eksplisit)

## Knowledge Gaps
- **970 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+965 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `TkRevealClient()` connect `tk-reveal-client.tsx` to `app/page.tsx`, `RiwayatPage.tsx`, `ProfilPage.tsx`, `TanamanDetailPage.tsx`, `ForumPage.tsx`, `TanamanPage.tsx`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Why does `TumbuhKita API Routes Documentation` connect `TumbuhKita API Routes Documentation` to `9. Forum Komunitas`, `11. Admin`, `2. Autentikasi & Authorisasi`, `6. Manajemen Tanaman`, `7. Jadwal Siram Otomatis`, `15. Arsitektur & Catatan Implementasi`, `1. Konvensi Umum`, `4. Knowledge Base Penyakit`, `3. Sistem AI Scan Penyakit`, `5. Riwayat Scan & Quota`, `12. Format Error & Kode`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `Prisma Compute` connect `Prisma Compute` to `prisma-compute/SKILL.md`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _970 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12554112554112554 - nodes in this community are weakly interconnected._
- **Should `RiwayatPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.14666666666666667 - nodes in this community are weakly interconnected._
- **Should `Navbar.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06170598911070781 - nodes in this community are weakly interconnected._