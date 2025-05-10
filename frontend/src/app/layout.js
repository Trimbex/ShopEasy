import './globals.css';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import ErrorBoundary from '../components/layout/ErrorBoundary';

export const metadata = {
  title: 'ShopEasy - Your Online Shopping Destination',
  description: 'Find the best products at great prices. Shop with ease and confidence.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <AuthProvider>
          <ErrorBoundary>
            <CartProvider>
              <Navbar />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
            </CartProvider>
          </ErrorBoundary>
        </AuthProvider>
      </body>
    </html>
  );
}
