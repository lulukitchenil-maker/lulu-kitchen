import { useEffect, useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Cart from './components/Cart';
import OrderForm from './components/OrderForm';
import OrderConfirmation from './components/OrderConfirmation';
import ExitIntentPopup from './components/ExitIntentPopup';
import VacationBanner from './components/VacationBanner';
import Home from './pages/Home';
import Menu from './pages/Menu';
import About from './pages/About';
import Reviews from './pages/Reviews';
import Contact from './pages/Contact';
import Accessibility from './pages/Accessibility';
import Terms from './pages/Terms';
import AdminReviews from './pages/AdminReviews';
import AdminAddOns from './pages/AdminAddOns';
import AdminRecommendations from './pages/AdminRecommendations';
import AdminVacation from './pages/AdminVacation';
import { LanguageProvider } from './hooks/useLanguage';
import { CartProvider, useCart } from './hooks/useCart';
import type { OrderDetails, MenuItem } from './types';

function Router() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [orderTotal, setOrderTotal] = useState(0);
  const [allMenuItems, setAllMenuItems] = useState<MenuItem[]>([]);
  const { getTotalPrice, getShippingCost } = useCart();

  useEffect(() => {
    const handleNavigation = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleNavigation);

    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');

      if (link && link.href && link.host === window.location.host) {
        e.preventDefault();
        window.history.pushState({}, '', link.href);
        setCurrentPath(link.pathname);
        window.scrollTo(0, 0);
      }
    });

    return () => {
      window.removeEventListener('popstate', handleNavigation);
    };
  }, []);

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsOrderFormOpen(true);
  };

  const handleOrderSubmit = (details: OrderDetails) => {
    const subtotal = getTotalPrice();
    const shipping = getShippingCost();
    const total = subtotal + shipping;
    setOrderTotal(total);
    setOrderDetails(details);
    setIsOrderFormOpen(false);
    setIsConfirmationOpen(true);
  };

  const handleConfirmationClose = () => {
    setIsConfirmationOpen(false);
    setOrderDetails(null);
  };

  let PageComponent: React.ComponentType<any>;
  let pageProps: any = {};

  switch (currentPath) {
    case '/menu':
      PageComponent = Menu;
      pageProps = {
        onMenuItemsLoad: setAllMenuItems
      };
      break;
    case '/about':
      PageComponent = About;
      break;
    case '/reviews':
      PageComponent = Reviews;
      break;
    case '/contact':
      PageComponent = Contact;
      break;
    case '/accessibility':
      PageComponent = Accessibility;
      break;
    case '/terms':
      PageComponent = Terms;
      break;
    case '/admin/reviews':
      PageComponent = AdminReviews;
      break;
    case '/admin/addons':
      PageComponent = AdminAddOns;
      break;
    case '/admin/recommendations':
      PageComponent = AdminRecommendations;
      break;
    case '/admin/vacation':
      PageComponent = AdminVacation;
      break;
    default:
      PageComponent = Home;
  }

  return (
    <>
      <Header onCartClick={() => setIsCartOpen(true)} />
      <VacationBanner />
      <main>
        <PageComponent {...pageProps} />
      </main>
      <Footer />
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={handleCheckout}
        allMenuItems={allMenuItems}
      />
      <OrderForm
        isOpen={isOrderFormOpen}
        onClose={() => setIsOrderFormOpen(false)}
        onSubmit={handleOrderSubmit}
      />
      {orderDetails && (
        <OrderConfirmation
          isOpen={isConfirmationOpen}
          orderDetails={orderDetails}
          totalAmount={orderTotal}
          onClose={handleConfirmationClose}
        />
      )}
      <ExitIntentPopup onViewCart={() => setIsCartOpen(true)} />
    </>
  );
}

function App() {
  return (
    <LanguageProvider>
      <CartProvider>
        <div className="min-h-screen bg-gray-50">
          <Router />
        </div>
      </CartProvider>
    </LanguageProvider>
  );
}

export default App;
