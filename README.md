# Muqeem Caterers — Catering Management System

Cloudflare-based catering management with inquiry portal, menu management, event calendar, and quotation workflow.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Hono.js on Cloudflare Workers |
| Database | Cloudflare D1 (SQLite) — remote only, no local |
| Frontend | Vanilla HTML + CSS + JS (History API SPA) |
| Hosting | Frontend: Cloudflare Pages (auto-deploy from GitHub) |
| Worker | `wrangler deploy` (manual) |
| Storage | Cloudflare R2 (planned) |

## URLs

- **Worker API**: https://muqeem-caterers.pulpbit.workers.dev
- **Frontend**: https://muqeem-caterers.pages.dev
- **GitHub**: https://github.com/pulpbit/muqeem-caterers.git

## Accounts

- Wrangler authenticated as `abdulsayed56@gmail.com` (Account: PulpBit, ID: `6cbeb7d08d0af64e10c11c3364996448`)
- D1 DB: `muqeem-db` (ID: `6110d36b-ee67-435f-a7f0-930b2e3b643d`)

## Users

| Username | Password | Role |
|----------|----------|------|
| admin | 123 | admin |
| staff | 123 | staff |

## Development Commands

```bash
# Root
npm install           # Install all workspaces
npm run dev           # Start frontend dev server (localhost:3000)

# Backend
cd apps/backend
npm run dev           # Start wrangler dev (localhost:8787)
npm run deploy        # Deploy worker to Cloudflare

# Run migrations
npx wrangler d1 execute muqeem-db --remote --file=migrations/<file>.sql

# Frontend
cd apps/frontend
npm run dev           # Start local server for testing
```

---

## Architecture

### Clean Architecture Layers

```
Route (index.js)
  → API Handler (api/*.js)   — parse request, call service, return response
    → Validator (validators/*.js) — validate input, throw ValidationError
    → Service (services/*.js) — business logic, orchestrate repositories
      → Repository (repositories/*.js) — raw SQL queries via D1
```

### Folder Structure

```
muqeem-caterers/
├── apps/
│   ├── backend/
│   │   ├── migrations/          # SQL migration files (0001-0009)
│   │   ├── src/
│   │   │   ├── api/             # Route handlers
│   │   │   ├── core/            # Middleware, errors, DB client
│   │   │   ├── db/              # D1 client getter
│   │   │   ├── repositories/    # Data access layer
│   │   │   ├── services/        # Business logic
│   │   │   ├── validators/      # Input validation
│   │   │   └── index.js         # Route registrations
│   │   ├── seeds/               # Seed data scripts
│   │   └── wrangler.toml        # Worker config
│   └── frontend/
│       ├── public/
│       │   └── _redirects       # SPA fallback rule
│       └── src/
│           ├── components/      # Header, shared components
│           ├── pages/           # One file per page
│           ├── services/        # API client, auth
│           ├── styles/          # main.css
│           ├── utils/           # Router, toast, authState
│           └── main.js          # App entry, route defs
├── database/migrations/         # Mirror of backend migrations
├── package_menu.txt             # Source menu data
└── README.md                    # This file
```

---

## Phases Completed

### Phase 1 — Project Setup
- Monorepo with npm workspaces
- Hono backend with wrangler.toml, D1 binding
- Frontend SPA scaffold: History API router, API client, toast notifications
- Health endpoint `GET /api/health`
- Git initialized, pushed to GitHub

### Phase 2 — Authentication
- Simple username/password auth (no JWT)
- Session tokens stored in D1 with HttpOnly cookies
- Users: `admin`/`123` (admin), `staff`/`123` (staff)
- Endpoints: `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`
- Frontend: Login page, auth state store, route guards

### Phase 3 — Master Menu Management
- 4 menu categories: NON VEGETARIAN STARTERS, NON VEGETARIAN MAIN COURSE, VEGETARIAN STARTERS, MAIN COURSE
- Sub-categories stored in `description` field prefixed with `"Sub: "`
- 230 menu items seeded from `package_menu.txt`
- CRUD for categories + items, toggle enable/disable
- Frontend: sidebar navigation, grouped by sub-category, add/edit modals

### Phase 4 — Event Calendar
- Monthly calendar grid with color-coded statuses
  - Inquiry = yellow, Quotation Sent = blue, Negotiation = orange
  - Confirmed = green, Completed = gray, Cancelled = red
- Auto-generated event codes (`EVT-YYYY-NNNN`)
- CRUD for events, status updates
- List view toggle, day-click shows events, detail modal
- Frontend: Calendar.js with calendar + list modes

### Phase 5 — Customer Self-Service Inquiry Portal
- `event_menu_selections` table linking events to menu items
- `POST /api/public/inquiry` — public endpoint
  - Creates event (status=Inquiry) + saves selected menu items
- Frontend: EventPlanner.js with collapsible menu categories, checkbox grid
- Event detail in calendar now shows selected menu items grouped by category

### Phase 6 — Quotation Management
- `quotations` table + `quotation_charges` table (additional charges)
- Auto-generated quotation codes (`QTN-YYYY-NNNN`)
- Fields: rate per plate, service fee, transport charges, additional charges (dynamic add), discount
- Auto-computed totals: Plate Total + Service Fee + Transport + Charges - Discount
- Status workflow: Draft → Sent → Approved (auto-confirms event) / Rejected
- Print button for sharing
- Nav: "Quotations" link in admin header
- Calendar: "Quotation" button in event detail modal

---

## API Reference

### Public
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/public/inquiry | No | Submit customer inquiry with menu selections |

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/login | No | Login, returns session cookie |
| POST | /api/auth/logout | Yes | Clear session |
| GET | /api/auth/me | Yes | Get current user |

### Menu
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/menu/categories | No | List all categories |
| POST | /api/menu/categories | Yes | Create category |
| PUT | /api/menu/categories/:id | Yes | Update category |
| DELETE | /api/menu/categories/:id | Yes | Delete category |
| GET | /api/menu/items | No | List all items (query: ?category_id=) |
| POST | /api/menu/items | Yes | Create item |
| PUT | /api/menu/items/:id | Yes | Update item |
| DELETE | /api/menu/items/:id | Yes | Delete item |
| PATCH | /api/menu/items/:id/toggle | Yes | Toggle item enabled/disabled |

### Events
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/events | No | List events by month (query: ?year=&month=) |
| GET | /api/events/all | No | List all events (query: ?status=&limit=) |
| GET | /api/events/:id | No | Get event detail with menu selections |
| POST | /api/events | No | Create event |
| PUT | /api/events/:id | No | Update event |
| PATCH | /api/events/:id/status | No | Update event status |
| DELETE | /api/events/:id | Yes | Delete event |

### Quotations
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/quotations/event/:eventId | Yes | Get quotation for an event |
| GET | /api/quotations/:id | Yes | Get quotation by ID |
| POST | /api/quotations | Yes | Create quotation |
| PUT | /api/quotations/:id | Yes | Update quotation |
| PATCH | /api/quotations/:id/status | Yes | Update quotation status |
| DELETE | /api/quotations/:id | Yes | Delete quotation |

---

## Key Decisions

- **Auth**: Session-based (no JWT). HttpOnly cookies with `SameSite=None; Secure`.
- **DB**: Always `--remote` for D1. No local development database.
- **CORS**: Dynamic origin allow list — Pages domain + localhost. Credentials enabled.
- **Menu Structure**: 4 top-level categories only. Sub-categories stored as `'Sub: <name>'` prefix in `description`. Frontend groups by sub-category.
- **Frontend Routing**: History API with `_redirects` SPA fallback rule (`/* /index.html 200`).
- **API Base URL**: Auto-detects production (Pages domain) → Worker URL. Dev → relative `/api`.
- **No Build Step**: Frontend is served as static files directly. No bundler.
- **Styling**: Plain CSS with custom properties. No frameworks.
- **Event Code Format**: `EVT-YYYY-NNNN`
- **Quotation Code Format**: `QTN-YYYY-NNNN`

---

## Future Phases

### Phase 7 — Grocery / Vendor Management
- Grocery list from menu items (auto-calculate ingredients per event?)
- Vendor directory (name, contact, items supplied, rates)
- Purchase orders linked to events

### Phase 8 — Expense Tracking
- Log expenses per event (vendor payments, miscellaneous)
- Categorize expenses
- Attach receipts (R2 storage)

### Phase 9 — Payment Tracking
- Record payments from customers
- Track partial/full payments per event
- Payment status (Pending, Partial, Paid)

### Phase 10 — P&L Reporting
- Profit & Loss per event
- Revenue (from quotation total)
- Costs (grocery + vendor + expenses)
- Net profit/loss
- Dashboard with charts

### Phase 11 — PDF Generation
- Generate professional quotation PDFs (instead of browser print)
- Maybe generate event summary / invoice PDFs

### Phase 12 — Email / Notification
- Send quotation via email to customer
- Send SMS alerts (Twilio or similar)
- Status change notifications

### Phase 13 — User Management
- CRUD for staff users
- Role-based permissions (admin vs staff)

### Phase 14 — Dashboard & Analytics
- Summary cards (total events, confirmed, revenue, etc.)
- Charts (monthly revenue, event types distribution)
- Quick actions

### Phase 15 — Multi-tenancy / Company Profile
- Company info settings (name, logo, address, GST)
- Multiple companies support

---

## Migration Checklist (for future sessions)

```bash
# 1. Run new migration
cd apps/backend
npx wrangler d1 execute muqeem-db --remote --file=migrations/<number>_<name>.sql

# 2. Copy to database folder
cp migrations/<file> ../../database/migrations/

# 3. Deploy worker
npm run deploy

# 4. Commit and push for Pages auto-deploy
git add -A
git commit -m "feat: description"
git push
```

---

## Notes for AI

When resuming a session:
1. Read this README for full context
2. Check `git log --oneline -5` for latest changes
3. Check `apps/backend/migrations/` for latest migration number
4. Verify D1 state with a simple API call (GET /api/health)
5. Continue from next uncompleted phase
