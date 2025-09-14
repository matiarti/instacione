
# 🚗 Parking Hub App — MVP Implementation Plan

Stack: **Node.js + MongoDB + React (Next.js) + TypeScript + Tailwind**  
Hosting: **Vercel (serverless)**

---

## 🏗️ Architecture

- **Frontend**: Next.js (React + TS + Tailwind) on Vercel.
- **Backend**: Next.js API Routes (Node.js/TS) on Vercel (serverless).
- **DB**: MongoDB Atlas (Vercel integration).
- **Auth**: NextAuth with:
  - **Magic Link (Email provider)** as default
  - **Password (Credentials provider)** still supported but hidden in UI
- **Payments**: Stripe (reservation fee) → later Mercado Pago/PIX.
- **Realtime**: Start with polling → upgrade to Pusher/Ably later.
- **Maps**: Google Maps Places/Geocoding (or Mapbox).
- **Emails**: Resend or SendGrid.
- **Analytics/Logs**: PostHog + Vercel Analytics.

---

## 📂 Monorepo Structure
```
/app
  /src
    /pages
      /api          # Next.js API Routes
      /(public pages)
      /auth         # signin + verifyRequest pages
    /components
    /lib            # db, auth, payments, validators
    /styles
    /types
  /models           # mongoose models
  /scripts          # seeds, jobs
vercel.json
.env.local.example
```

---

## 🔑 Core User Flows

1. **Search & Discover**: user enters destination → list nearby lots (distance, price, availability).
2. **Reserve**: pay reservation fee % → hold spot (time-limited window).
3. **Arrive**: show QR/plate → operator checks in.
4. **Checkout**: user pays remaining directly at lot (MVP).
5. **Operator**: subscribe, manage availability, view reservations.

---

## 🗄️ Data Model (MongoDB)

```ts
// User
{
  _id: ObjectId,
  role: "DRIVER" | "OPERATOR" | "ADMIN",
  name: string,
  email: string,
  phone?: string,
  car?: { plate?: string; model?: string; color?: string },
  password?: string,  // keep, but UI hides this option
  createdAt: Date, updatedAt: Date
}

// Parking Lot
{
  _id: ObjectId,
  name: string,
  operatorUserId: ObjectId,
  location: {
    address: string,
    geo: { type: "Point", coordinates: [lng, lat] }
  },
  pricing: { hourly: number, dailyMax?: number },
  capacity: number,
  availabilityManual: number,
  amenities?: string[],
  status: "ACTIVE" | "INACTIVE",
  subscription: {
    plan: "BASIC" | "PLUS",
    status: "ACTIVE" | "PAST_DUE" | "CANCELLED",
    provider: "stripe",
    stripeCustomerId?: string
  },
  createdAt: Date, updatedAt: Date
}

// Reservation
{
  _id: ObjectId,
  userId: ObjectId,
  lotId: ObjectId,
  state: "PENDING_PAYMENT" | "CONFIRMED" | "EXPIRED" | "CANCELLED" | "NO_SHOW" | "CHECKED_IN" | "CHECKED_OUT",
  arrivalWindow: { start: Date, end: Date },
  car: { plate: string },
  priceEstimate: { hourly: number, expectedHours?: number },
  fees: { reservationPct: number, reservationFeeAmount: number },
  payment: {
    provider: "stripe",
    intentId?: string,
    status: "REQUIRES_PAYMENT" | "PAID" | "REFUNDED" | "FAILED"
  },
  checkinAt?: Date,
  checkoutAt?: Date,
  createdAt: Date, updatedAt: Date
}
```

---

## 🔌 API Endpoints

**Auth**
- `POST /api/auth/register` (password kept for admin/legacy use)
- `POST /api/auth/signin/email` (magic link)
- `POST /api/auth/signin/credentials` (hidden password flow)
- `GET /api/auth/session`

**Lots**
- `GET /api/lots?lat=…&lng=…&radius=…`
- `GET /api/lots/[id]`

**Reservations**
- `POST /api/reservations`
- `POST /api/reservations/[id]/confirm`
- `POST /api/reservations/[id]/cancel`
- `POST /api/reservations/[id]/checkin`
- `POST /api/reservations/[id]/checkout`

**Operator**
- `GET /api/operator/lots`
- `POST /api/operator/lots`
- `PATCH /api/operator/lots/[id]`
- `PATCH /api/operator/lots/[id]/availability`
- `GET /api/operator/reservations`

**Payments**
- `POST /api/payments/create-intent`
- `POST /api/payments/webhook`

---

## 🔄 Reservation State Machine

```
PENDING_PAYMENT --(payment success)--> CONFIRMED
PENDING_PAYMENT --(timeout 10m)-----> EXPIRED
CONFIRMED -------(arrival expired)--> NO_SHOW
CONFIRMED -------(operator checkin)--> CHECKED_IN
CHECKED_IN ------(checkout)----------> CHECKED_OUT
```

---

## 📊 Availability (MVP)

- Start manual (operator updates # spots).
- On `CONFIRMED` → decrement.
- On `CANCEL/EXPIRE/NO_SHOW/CHECKOUT` → increment.
- Poll operator dashboard every 10–15s.

---

## 🎨 UI Pages (Next.js + Tailwind)

**Public**
- `/` → search/map
- `/lot/[id]` → details/reserve
- `/reservation/[id]` → status/QR

**User**
- `/account/reservations`
- `/account/vehicle`

**Operator**
- `/operator`
- `/operator/lots/[id]`
- `/operator/reservations`

**Auth**
- `/auth/signin` → **Magic Link form only (password hidden)**  
- `/auth/verify` → “Check your email” page  
- Hidden fallback: “Use password instead” link reveals password fields

---

## 🔐 Auth (NextAuth with Magic Link + Hidden Password)

- **Email Provider** (Magic Link via Resend/SendGrid).
- **Credentials Provider** (password) kept in config, but UI hides it by default.
- Password field revealed only when user clicks “Use password instead”.
- Data model still stores hashed password (for admin/legacy users).
- Magic links expire in **10 minutes**, one-time use.

---

## 💳 Payments & Policy

- Reservation fee = % of estimated 1st hour (e.g. 12%).
- **No-show**: fee kept, no refund.
- **Cancellation**:
  - Free within 5 min of booking.
  - 50% refund if ≥15 min before arrival.
  - No refund inside 15 min window.

---

## ⚙️ Environment Variables

```
MONGODB_URI=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
GOOGLE_MAPS_API_KEY=
RESEND_API_KEY=
EMAIL_FROM="no-reply@yourdomain.com"

RESERVATION_FEE_PCT=0.12
ARRIVAL_WINDOW_MIN=30
PENDING_PAYMENT_TTL_MIN=10
```

---

## 🛡️ Security & Compliance

- NextAuth JWT sessions.
- Magic links: short-lived tokens (10m).
- Role-based middleware checks.
- Input validation with Zod.
- Idempotency on payments.
- Webhook signature validation.
- Minimal PII (plate, email, name).

---

## 📈 Analytics & Observability

- PostHog events:  
  `search_performed`, `lot_viewed`, `reservation_started`, `payment_succeeded`, `reservation_confirmed`, `check_in`, `check_out`.
- Vercel log drains for API errors.
- Feature flags for experiments.

---

## 🌱 Seeding & Test Data

- Script: generate 10 parking lots (Pinheiros, Paulista).
- Fake drivers/operators.
- Sample reservations across states.

---

## 📅 Milestones (4 Weeks)

**Week 1**  
- Setup repo, CI/CD, Tailwind.  
- Mongo models (users, lots, reservations).  
- Auth with Magic Link + hidden password UI.  
- Public search & details.  

**Week 2**  
- Reservation flow + Stripe payments.  
- Reservation state machine + cron sweeper.  
- Operator dashboard (availability, reservations).  
- Email confirmations.  

**Week 3**  
- Map-based search.  
- Cancellation/no-show policies.  
- Analytics/logging.  
- QA + edge cases.  

**Week 4**  
- Operator subscriptions (Stripe Billing OR manual).  
- Empty states, 404/500 pages.  
- Soft launch with pilot lots.  

---

## 📌 Indices (Mongo)

- `parking_lots.location.geo` → 2dsphere index.  
- `reservations.lotId`, `reservations.userId`, `reservations.state`.  
- TTL index for pending reservations.

---

## ✨ Nice-to-Haves (Post-MVP)

- License plate OCR / QR check-in.  
- Realtime via Pusher/Ably.  
- Corporate credits/monthly passes.  
- Dynamic pricing + featured lots.  
- Hardware integration (IoT gates).  

---
