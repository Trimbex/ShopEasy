# E-Commerce Platform

A modern, full-stack e-commerce solution built with Next.js and Express. This platform provides a complete online shopping experience with a responsive frontend and a robust backend API.

![E-Commerce Platform](https://via.placeholder.com/1200x400?text=E-Commerce+Platform)

## 📋 Features

- **User Management**
  - User registration and authentication
  - Profile management
  - Address book functionality
  - Order history

- **Shopping Experience**
  - Intuitive product browsing and search
  - Product categorization and filtering
  - Cart management
  - Wishlist functionality
  - Seamless checkout process

- **Admin Dashboard**
  - Product management
  - Inventory control
  - Order processing and fulfillment
  - Sales analytics
  - Campaign and promotion tools

- **Discounts & Promotions**
  - Coupon code system
  - Special deals and offers
  - Campaign management
  - Seasonal promotions

- **Reviews & Ratings**
  - Customer product reviews
  - Star rating system
  - User feedback collection

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (React)
- **Styling:** TailwindCSS
- **State Management:** React Context, SWR for data fetching
- **Animations:** Framer Motion
- **Charting:** Recharts
- **API Communication:** Axios

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL via Prisma ORM
- **Authentication:** JWT (JSON Web Tokens)
- **Cloud Services:** Supabase
- **Security:** bcrypt for password hashing

## 🏗️ Project Structure

```
Ecommerce_Store/
│
├── frontend/                  # Next.js frontend application
│   ├── public/                # Static assets
│   ├── src/
│   │   ├── app/               # Next.js App Router pages
│   │   ├── components/        # Reusable UI components
│   │   ├── context/           # React context providers
│   │   └── services/          # API and business logic services
│   └── utils/                 # Utility functions
│
├── backend/                   # Express.js backend API
│   ├── controllers/           # Request handlers
│   ├── middleware/            # Express middleware
│   ├── routes/                # API route definitions
│   ├── prisma/                # Prisma ORM schema and migrations
│   ├── utils/                 # Utility functions
│   └── server.js              # Entry point
│
└── migrations/                # Database migrations
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- PostgreSQL database
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Ecommerce_Store
   ```

2. **Set up environment variables**
   
   Create `.env` files in both the backend and frontend directories based on the examples below:

   **Backend `.env`**
   ```
   PORT=5000
   DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce"
   JWT_SECRET=your_jwt_secret
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   ```

   **Frontend `.env.local`**
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

4. **Set up the database**
   ```bash
   cd ../backend
   
   # Generate Prisma client
   npm run prisma:generate
   
   # Run migrations
   npm run prisma:migrate
   
   # Seed the database (optional)
   npm run prisma:seed
   ```

5. **Start the development servers**

   From the project root:
   ```bash
   # For Linux/Mac
   npm run dev
   
   # For Windows
   npm run dev:windows
   ```

   This will start both the frontend and backend servers concurrently.
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:5000/api](http://localhost:5000/api)
   - Prisma Studio (database UI): [http://localhost:5555](http://localhost:5555) (run with `cd backend && npm run db:studio`)

## 🔍 API Documentation

The API is organized around REST principles. It accepts JSON-encoded request bodies, returns JSON-encoded responses, and uses standard HTTP response codes.

### Base URL
```
http://localhost:5000/api
```

### Available Endpoints

- **Authentication:**
  - `POST /api/auth/register` - Register a new user
  - `POST /api/auth/login` - Login and get token
  - `GET /api/auth/me` - Get current user data

- **Products:**
  - `GET /api/products` - List all products
  - `GET /api/products/:id` - Get product details
  - `POST /api/products` - Create product (admin)
  - `PUT /api/products/:id` - Update product (admin)
  - `DELETE /api/products/:id` - Delete product (admin)

- **Orders:**
  - `POST /api/orders` - Create a new order
  - `GET /api/orders` - List user orders
  - `GET /api/orders/:id` - Get order details

- **Admin:**
  - `GET /api/admin/dashboard` - Get admin dashboard data
  - `GET /api/admin/orders` - List all orders (admin)
  - `PUT /api/admin/orders/:id` - Update order status (admin)

- For complete API documentation, refer to the API documentation page when the server is running.

## 📦 Available Scripts

### Root Directory

- `npm run dev` - Run both frontend and backend in development mode
- `npm run dev:windows` - Run both frontend and backend in development mode on Windows
- `npm run build` - Build the frontend for production
- `npm start` - Start the production server

### Frontend (`/frontend`)

- `npm run dev` - Start the Next.js development server
- `npm run build` - Build the Next.js app for production
- `npm start` - Start the Next.js production server
- `npm run lint` - Run ESLint

### Backend (`/backend`)

- `npm run dev` - Start the backend in development mode with hot reload
- `npm start` - Start the backend in production mode
- `npm run db:migrate` - Run Prisma migrations
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio
- `npm run prisma:seed` - Seed the database with initial data

## 🧪 Testing

*Testing implementation is in progress.*

## 🔒 Authentication

The application uses JWT (JSON Web Tokens) for authentication. When a user logs in, a token is generated and should be included in the Authorization header for protected API routes.

```
Authorization: Bearer YOUR_TOKEN_HERE
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- All the open-source libraries and frameworks that made this project possible
- The development team for their dedication and hard work

---
