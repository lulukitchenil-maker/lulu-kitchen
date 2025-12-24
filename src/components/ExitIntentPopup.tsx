import { useEffect, useState } from 'react';
import { X, ShoppingCart } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useCart } from '../hooks/useCart';
<<<<<<< HEAD
=======
import CONFIG from '../config/config';
>>>>>>> f0a58e6 (Initial commit)

interface ExitIntentPopupProps {
  onViewCart: () => void;
}

export default function ExitIntentPopup({ onViewCart }: ExitIntentPopupProps) {
  const { t } = useLanguage();
  const { cartItems, getTotalPrice, getShippingCost } = useCart();
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (
        e.clientY <= 0 &&
        !hasShown &&
        cartItems.length > 0 &&
        !isVisible
      ) {
        setIsVisible(true);
        setHasShown(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [cartItems.length, hasShown, isVisible]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleViewCart = () => {
    setIsVisible(false);
    onViewCart();
  };

  if (!isVisible || cartItems.length === 0) return null;

  const subtotal = getTotalPrice();
  const shipping = getShippingCost();
  const total = subtotal + shipping;
<<<<<<< HEAD
  const freeShippingRemaining = 800 - subtotal;
=======
>>>>>>> f0a58e6 (Initial commit)

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[60]" onClick={handleClose} />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-[70] w-full max-w-md p-6">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <ShoppingCart className="w-16 h-16 text-chinese-red mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">
            {t('רגע, לא לשכוח את ההזמנה!', "Wait! Don't forget your order!")}
          </h2>
          <p className="text-gray-600">
            {t(
              'יש לך פריטים בעגלה. השלם את ההזמנה עכשיו!',
              'You have items in your cart. Complete your order now!'
            )}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">{t('פריטים בעגלה', 'Items in cart')}</span>
            <span className="font-semibold">{cartItems.length}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">{t('סכום', 'Subtotal')}</span>
            <span className="font-semibold">₪{subtotal.toFixed(2)}</span>
          </div>
<<<<<<< HEAD
          {freeShippingRemaining > 0 && (
            <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-center">
              <p className="text-sm text-green-800">
                {t(
                  `הוסף עוד ₪${freeShippingRemaining.toFixed(2)} למשלוח חינם!`,
                  `Add ₪${freeShippingRemaining.toFixed(2)} more for free shipping!`
                )}
              </p>
            </div>
          )}
=======
>>>>>>> f0a58e6 (Initial commit)
          <div className="flex justify-between text-lg font-bold mt-3 pt-3 border-t">
            <span>{t('סה"כ', 'Total')}</span>
            <span className="text-chinese-red">₪{total.toFixed(2)}</span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleViewCart}
            className="w-full py-3 bg-chinese-red text-white rounded-lg font-semibold hover:bg-chinese-darkRed transition-colors"
          >
            {t('צפה בעגלה והשלם הזמנה', 'View Cart & Complete Order')}
          </button>
          <button
            onClick={handleClose}
            className="w-full py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            {t('המשך גלישה', 'Continue Browsing')}
          </button>
        </div>
      </div>
    </>
  );
}
