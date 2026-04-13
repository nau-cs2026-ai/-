# 校园二手 CampusTrade

A campus-exclusive second-hand marketplace platform with student ID verification, credit scoring, in-app messaging, and admin moderation.

## Project Structure

```
.
├── backend/
│   ├── config/
│   │   ├── constants.ts        # Server config
│   │   └── passport.ts         # JWT strategy
│   ├── db/
│   │   ├── index.ts            # Drizzle DB connection
│   │   ├── schema.ts           # All table definitions + Zod schemas
│   │   └── migrations/
│   │       └── 1_campus_trade_init.sql
│   ├── middleware/
│   │   ├── auth.ts             # JWT middleware (authenticateJWT, requireAdmin)
│   │   └── errorHandler.ts
│   ├── repositories/
│   │   ├── users.ts
│   │   ├── products.ts
│   │   ├── messages.ts
│   │   ├── orders.ts
│   │   └── reports.ts
│   ├── routes/
│   │   ├── auth.ts             # /api/auth/*
│   │   ├── products.ts         # /api/products/*
│   │   ├── messages.ts         # /api/messages/*
│   │   ├── orders.ts           # /api/orders/*
│   │   ├── reports.ts          # /api/reports/*
│   │   └── admin.ts            # /api/admin/*
│   └── server.ts
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── custom/
│       │   │   ├── Login.tsx
│       │   │   ├── Signup.tsx
│       │   │   └── OmniflowBadge.tsx
│       │   └── ui/             # shadcn/ui components
│       ├── contexts/
│       │   └── AuthContext.tsx  # JWT auth state
│       ├── lib/
│       │   ├── api.ts          # All API service methods
│       │   └── utils.ts
│       ├── pages/
│       │   └── Index.tsx       # Main app (home/browse/publish/chat/profile/admin)
│       ├── types/
│       │   └── index.ts        # All TypeScript types
│       ├── App.tsx             # HashRouter + AuthProvider + routes
│       └── index.css           # Tailwind v4 + Campus Fresh theme
```

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS v4, shadcn/ui, React Router DOM (HashRouter)
- **Backend**: Express.js, TypeScript, Drizzle ORM, Passport.js JWT
- **Database**: PostgreSQL (via postgres.js)
- **Auth**: JWT tokens, bcrypt password hashing

## Key Features

1. **Authentication** - Login/Signup with JWT, student ID verification
2. **Product Marketplace** - Browse, search, filter by category/condition/price
3. **Product Publishing** - Multi-image upload, ISBN scan hint, 30-day expiry
4. **In-App Messaging** - Real-time chat, quick phrases, risk keyword detection
5. **Order System** - Intent orders, completion with ratings
6. **Credit System** - Score-based trust labels (靠谱学长, 爽快买家, etc.)
7. **Report System** - One-click reporting, admin moderation
8. **Admin Dashboard** - Stats, product approval/rejection, user ban/unban
9. **Graduation Season** - Special flea market section

## API Routes

- `POST /api/auth/signup` - Register
- `POST /api/auth/login` - Login (returns JWT)
- `GET /api/auth/me` - Current user
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/verify-student` - Student ID verification
- `GET /api/products` - List products (public)
- `POST /api/products` - Create product (auth)
- `GET /api/messages/list` - Conversation list
- `POST /api/messages/send` - Send message
- `POST /api/orders` - Create intent order
- `POST /api/orders/:id/complete` - Complete + rate
- `POST /api/reports` - Submit report
- `GET /api/admin/stats` - Admin dashboard stats
- `POST /api/admin/products/:id/approve` - Approve product
- `POST /api/admin/users/:id/ban` - Ban user

## Design System (Campus Fresh)

- Primary: `#1E3A5F` (deep navy)
- Secondary: `#F59E0B` (amber)
- Accent: `#10B981` (emerald)
- Background: `#F8F7F4` (warm off-white)
- Fonts: Sora (headings), Inter (body)

## Code Generation Guidelines

- All views are in `Index.tsx` as inline sub-components
- Auth state from `useAuth()` hook in `AuthContext.tsx`
- API calls via `apiService` in `lib/api.ts`
- Types in `types/index.ts`
- Backend uses repository pattern: routes → repositories → Drizzle
- JWT payload: `{ userId, email, role }`
- `authenticateJWT` middleware sets `req.user = { id, email, role }`
