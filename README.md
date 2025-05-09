# Ecommerce Store

A full-stack e-commerce platform built with a modern web stack. This repository contains both the backend (API, database, business logic) and frontend (user interface) for a complete online store.


## Features

- User authentication and registration
- Product catalog with categories and filters
- Shopping cart and checkout flow
- Order management
- Admin dashboard for campaigns, deals, and orders
- Responsive frontend UI

## Project Structure

```
Ecommerce Final/
  Ecommerce_Store/
    archive/                # Old or backup code
    backend/                # Backend API and business logic
      controllers/
      middleware/
      prisma/               # Prisma ORM and migrations
      routes/
      utils/
    frontend/               # Frontend (Next.js app)
      public/
      src/
        app/                # App routes and pages
        components/         # Reusable UI components
        context/            # React context providers
        services/           # API and business logic services
      utils/
    migrations/             # SQL migration files
  package-lock.json
```

## Tech Stack

- **Frontend:** Next.js, React, CSS
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (via Prisma ORM)
- **Authentication:** JWT or similar (customizable)
- **Other:** RESTful APIs, modern JavaScript/TypeScript

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- PostgreSQL (or your preferred database)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd "Ecommerce Final"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables:**
   - Copy `.env.example` to `.env` in both `backend/` and `frontend/` if available.
   - Fill in your database credentials and other secrets.

4. **Run database migrations:**
   ```bash
   cd Ecommerce_Store/backend
   npx prisma migrate deploy
   ```

5. **Start the backend server:**
   ```bash
   npm run dev
   ```

6. **Start the frontend:**
   ```bash
   cd ../frontend
   npm run dev
   ```

7. **Visit the app:**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:5000](http://localhost:5000) (or your configured port)

## Development

- **Frontend:** All source code is in `Ecommerce_Store/frontend/src/`.
- **Backend:** All source code is in `Ecommerce_Store/backend/`.
- **Migrations:** Use Prisma for schema and migration management.

## Database Migrations

- Prisma migrations are in `Ecommerce_Store/backend/prisma/migrations/`.
- SQL migrations (if any) are in `migrations/sql/`.

## Scripts

Common scripts (run from the root or respective subfolders):

- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm run start` — Start production server
- `npx prisma migrate dev` — Run migrations and generate Prisma client

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a pull request

## License

This project is licensed under the MIT License.

---

**Feel free to update this README with more specific details about your project, screenshots, or deployment instructions!**
