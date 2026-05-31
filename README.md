# Ecommerce by SiteReady

**Fastest way to launch your business through WhatsApp.**

A modern, open-source storefront that turns your product catalog into a WhatsApp-powered sales channel — no payment gateway setup, no complex onboarding, just share your store link and start selling.

**[View Sample Store →](https://ecommerce.siteready.dev)**

---

## What is this?

Ecommerce is a full-featured store builder where customers browse products and place orders directly through WhatsApp. You get a beautiful storefront and a clean admin dashboard — your WhatsApp handles the rest.

Perfect for small businesses, boutiques, local shops, and anyone who already uses WhatsApp to sell.

---

## Features

### For your customers
- Clean, mobile-first storefront with product catalog and category filtering
- Individual product pages with image/video galleries, pricing, and stock status
- One-tap **"Buy via WhatsApp"** button that opens a pre-filled conversation with you
- Fast page loads with server-rendered pages and on-demand cache revalidation
- SEO-ready pages with Open Graph tags and Schema.org structured data

### For store owners
- **Admin dashboard** with quick stats and recent activity
- **Product management** — images, videos, pricing, compare prices, SKU, stock, featured flags, and per-product SEO fields
- **Category management** — with images, drag-and-drop reordering, and product counts
- **Banner management** — full-screen or partial hero banners with optional CTA buttons
- **Media library** — centralized uploads with file metadata tracking
- **Store settings** — branding, contact info, social links, and WhatsApp number
- Secure admin login with JWT sessions and email-based OTP password reset

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router, Server Actions) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (jose) + bcryptjs |
| File Storage | Cloudflare R2 (S3-compatible) |
| Email | Nodemailer (SMTP) |
| UI Components | Radix UI + Lucide icons |
| Drag & Drop | dnd-kit |
| Image Processing | sharp |

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Cloudflare R2 bucket (for media uploads)
- SMTP server (for password reset emails — optional in development)

### 1. Clone and install

```bash
git clone https://github.com/siteready/ecommerce.git
cd ecommerce
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in the values:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
AUTH_SECRET="your-32-character-secret-key-here"

# Cloudflare R2 (media storage)
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET_NAME=""
R2_PUBLIC_URL=""

# SMTP (optional in development — OTPs print to console if not set)
SMTP_HOST=""
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM='"My Store" <noreply@example.com>'
```

### 3. Run database migrations

```bash
npx prisma migrate deploy
npx prisma generate
```

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the store and [http://localhost:3000/auth/setup](http://localhost:3000/auth/setup) to create your admin account.

---

## How the WhatsApp ordering works

1. Customer visits your store and finds a product they want
2. They tap **"Buy via WhatsApp"**
3. WhatsApp opens with a pre-filled message: *"Hi! I'm interested in buying: [Product Name]"*
4. You negotiate, confirm, and arrange payment directly in the chat

No checkout flow, no payment integration required. Just conversations.

---

## Deployment

The build script handles migrations automatically:

```bash
npm run build   # runs: prisma migrate deploy && prisma generate && next build
npm start
```

Deployable on any Node.js host — Vercel, Railway, Render, a VPS, etc. Requires `DATABASE_URL` at build time.

---

## Contributing

Contributions are welcome. Please open an issue before submitting a large PR so we can discuss the approach.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Open a pull request

---

## License

MIT — free to use, modify, and distribute.

---

Built by [SiteReady](https://siteready.dev)
