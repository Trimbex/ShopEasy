# Ecommerce Store

A full-stack ecommerce application built with Node.js, Express, and Supabase.

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- npm (Node Package Manager)
- A Supabase account

## Setup

1. Clone the repository:
```bash
git clone <your-repository-url>
cd Ecommerce_Store
```

2. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Create a `.env` file in the backend directory with the following variables:
```env
PORT=3000
JWT_SECRET=your_jwt_secret
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up your Supabase database:
- Create a new project in Supabase
- Create a `users` table with the following columns:
  - id (uuid, primary key)
  - name (text)
  - email (text, unique)
  - password (text)
- Copy your Supabase URL and anon key to the `.env` file

## Running the Project

1. Start the backend server:
```bash
cd backend
npm start
```

2. Open a new terminal and start the frontend development server:
```bash
cd frontend
npm start
```

3. Access the application:
- Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
Ecommerce_Store/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   └── .env
└── frontend/
    ├── css/
    ├── js/
    ├── images/
    ├── index.html
    ├── login.html
    ├── register.html
    └── cart.html
```

## Features

- User authentication (login/register)
- Product browsing
- Shopping cart functionality
- Secure payment processing
- Responsive design

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.