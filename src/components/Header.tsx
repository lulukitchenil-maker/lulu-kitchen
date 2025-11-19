import { Menu, ShoppingCart, Globe } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useCart } from '../hooks/useCart';

interface HeaderProps {
  onCartClick: () => void;
}

export default function Header({ onCartClick }: HeaderProps) {
  const { language, toggleLanguage, t } = useLanguage();
  const { getTotalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = getTotalItems();

  const currentPath = window.location.pathname;

  const navItems = [
    { path: '/', labelHe: 'בית', labelEn: 'Home' },
    { path: '/menu', labelHe: 'תפריט', labelEn: 'Menu' },
    { path: '/about', labelHe: 'אודות', labelEn: 'About' },
    { path: '/reviews', labelHe: 'המלצות', labelEn: 'Reviews' },
    { path: '/contact', labelHe: 'צור קשר', labelEn: 'Contact' },
  ];

  const legalNavItems = [
    { path: '/accessibility', labelHe: 'נגישות', labelEn: 'Accessibility' },
    { path: '/terms', labelHe: 'תקנון', labelEn: 'Terms' },
  ];

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <a href="/" className="flex items-center rtl-space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-chinese-red to-chinese-gold rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">לולו</span>
            </div>
            <div className="hidden sm:block text-right">
              <h1 className="text-xl font-bold gradient-text">
                {t('המטבח הסיני של לולו', "Lulu's Chinese Kitchen")}
              </h1>
              <p className="text-sm text-gray-600">
                {language === 'he' ? "Lulu's Chinese Kitchen" : 'המטבח הסיני של לולו'}
              </p>
            </div>
          </a>

          <nav className="hidden md:flex rtl-space-x-6">
            {navItems.map((item) => (
              <a
                key={item.path}
                href={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  currentPath === item.path
                    ? 'text-chinese-red bg-chinese-lightGold'
                    : 'text-gray-700 hover:text-chinese-red hover:bg-gray-100'
                }`}
              >
                {language === 'he' ? item.labelHe : item.labelEn}
              </a>
            ))}
          </nav>

          <div className="flex items-center rtl-space-x-4">
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 flex items-center"
              title={language === 'he' ? 'English' : 'עברית'}
            >
              <Globe className="w-5 h-5 text-gray-600" />
              <span className="mr-1 text-sm font-medium">
                {language === 'he' ? 'EN' : 'עב'}
              </span>
            </button>

            <button
              onClick={onCartClick}
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            >
              <ShoppingCart className="w-6 h-6 text-gray-600" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-chinese-red text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-chinese-red hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-4 py-3 space-y-2">
            {navItems.map((item) => (
              <a
                key={item.path}
                href={item.path}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  currentPath === item.path
                    ? 'text-chinese-red bg-chinese-lightGold'
                    : 'text-gray-700 hover:text-chinese-red hover:bg-gray-100'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {language === 'he' ? item.labelHe : item.labelEn}
              </a>
            ))}
            <div className="border-t border-gray-200 pt-2 mt-2">
              {legalNavItems.map((item) => (
                <a
                  key={item.path}
                  href={item.path}
                  className={`block px-3 py-2 rounded-md text-sm font-medium ${
                    currentPath === item.path
                      ? 'text-chinese-red bg-chinese-lightGold'
                      : 'text-gray-600 hover:text-chinese-red hover:bg-gray-100'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {language === 'he' ? item.labelHe : item.labelEn}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
