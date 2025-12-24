import { ShoppingCart, X, Plus, Minus, Trash2, Tag } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../hooks/useCart';
import { useLanguage } from '../hooks/useLanguage';
import Recommendations from './Recommendations';
import type { MenuItem } from '../types';
<<<<<<< HEAD
=======
import CONFIG from '../config/config';
>>>>>>> f0a58e6 (Initial commit)

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
  allMenuItems?: MenuItem[];
}

export default function Cart({ isOpen, onClose, onCheckout, allMenuItems = [] }: CartProps) {
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice, getShippingCost, getTotalItems, applyCoupon, couponDiscount, appliedCoupon } = useCart();
  const { language, t } = useLanguage();
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState('');

  if (!isOpen) return null;

  const subtotal = getTotalPrice();
  const shipping = getShippingCost();
  const total = subtotal + shipping - couponDiscount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponMessage(t('נא להזין קוד קופון', 'Please enter a coupon code'));
      return;
    }

    const result = await applyCoupon(couponCode);
    setCouponMessage(result.message);

    if (result.success) {
      setTimeout(() => setCouponMessage(''), 3000);
    }
  };
<<<<<<< HEAD
  const freeShippingThreshold = 800;
  const freeShippingRemaining = freeShippingThreshold - subtotal;
  const progressPercentage = Math.min((subtotal / freeShippingThreshold) * 100, 100);
=======
>>>>>>> f0a58e6 (Initial commit)

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
      <div className={`fixed top-0 ${language === 'he' ? 'right-0' : 'left-0'} h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-chinese-red" />
              <h2 className="text-xl font-bold">
                {t('עגלת קניות', 'Shopping Cart')} ({getTotalItems()})
              </h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-6 h-6" />
            </button>
          </div>

          {cartItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">{t('העגלה ריקה', 'Your cart is empty')}</p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2 bg-chinese-red text-white rounded-lg hover:bg-chinese-darkRed"
              >
                {t('המשך קניות', 'Continue Shopping')}
              </button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {allMenuItems.length > 0 && cartItems.length > 0 && (
                  <Recommendations
                    allMenuItems={allMenuItems}
                  />
                )}

<<<<<<< HEAD
                {freeShippingRemaining > 0 ? (
                  <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <ShoppingCart className="w-5 h-5 text-green-600" />
                      <p className="text-sm font-semibold text-green-800">
                        {t(
                          `עוד ₪${freeShippingRemaining.toFixed(0)} למשלוח חינם!`,
                          `₪${freeShippingRemaining.toFixed(0)} more for free shipping!`
                        )}
                      </p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-1"
                        style={{ width: `${progressPercentage}%` }}
                      >
                        {progressPercentage > 15 && (
                          <span className="text-[10px] text-white font-bold">{Math.round(progressPercentage)}%</span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 p-3 bg-green-100 border-2 border-green-300 rounded-xl">
                    <p className="text-sm font-bold text-green-800 text-center">
                      🎉 {t('משלוח חינם!', 'Free Shipping!')}
                    </p>
                  </div>
                )}

=======
>>>>>>> f0a58e6 (Initial commit)
                <div className="space-y-4">
                  {cartItems.map((item, index) => {
                    const itemTotal = (item.menuItem.price + item.selectedAddOns.reduce((sum, addon) => sum + addon.price, 0)) * item.quantity;
                    const imagesBase = import.meta.env.VITE_IMAGES_BASE || 'https://lulu-k.com/images';
                    // Check if image_url is already a full URL or just a filename
                    const imageUrl = item.menuItem.image_url
                      ? (item.menuItem.image_url.startsWith('http')
                          ? item.menuItem.image_url
                          : `${imagesBase}/${item.menuItem.image_url}`)
                      : null;

                    return (
                      <div key={`${item.menuItem.id}-${index}`} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex gap-3 mb-2">
                          {imageUrl && (
                            <img
                              src={imageUrl}
                              alt={language === 'he' ? item.menuItem.name_he : item.menuItem.name_en}
                              className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                              loading="lazy"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          )}
                          <div className="flex-1 flex justify-between items-start">
                            <h3 className="font-semibold">
                              {language === 'he' ? item.menuItem.name_he : item.menuItem.name_en}
                            </h3>
                            <button
                              onClick={() => removeFromCart(item.menuItem.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        {item.selectedAddOns.length > 0 && (
                          <div className="text-sm text-gray-600 mb-2">
                            {item.selectedAddOns.map((addon, idx) => (
                              <div key={idx}>
                                + {language === 'he' ? addon.name_he : addon.name_en} (+₪{addon.price})
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                              className="p-1 bg-white rounded hover:bg-gray-100"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                              className="p-1 bg-white rounded hover:bg-gray-100"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <span className="font-bold text-chinese-red">₪{itemTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t p-4 bg-gray-50">
                <div className="mb-4">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Tag className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder={t('קוד קופון', 'Coupon Code')}
                        disabled={!!appliedCoupon}
                        className="w-full pl-3 pr-10 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-chinese-red disabled:bg-gray-100"
                      />
                    </div>
                    <button
                      onClick={handleApplyCoupon}
                      disabled={!!appliedCoupon}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        appliedCoupon
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : 'bg-chinese-red text-white hover:bg-chinese-darkRed'
                      }`}
                    >
                      {appliedCoupon ? t('הופעל', 'Applied') : t('החל', 'Apply')}
                    </button>
                  </div>
                  {couponMessage && (
                    <p className={`text-sm mt-2 ${couponDiscount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {couponDiscount > 0 ? '✓ ' : ''}{couponMessage}
                    </p>
                  )}
                  {appliedCoupon && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ {t('קופון הופעל', 'Coupon applied')}: {appliedCoupon}
                    </p>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-gray-600">
                    <span>{t('סכום ביניים', 'Subtotal')}</span>
                    <span>₪{subtotal.toFixed(2)}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>{t('הנחה', 'Discount')}</span>
                      <span>-₪{couponDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>{t('משלוח', 'Shipping')}</span>
<<<<<<< HEAD
                    <span className={shipping === 0 ? 'text-green-600 font-semibold' : ''}>
                      {shipping === 0 ? t('חינם!', 'Free!') : `₪${shipping.toFixed(2)}`}
                    </span>
=======
                    <span>₪{shipping.toFixed(2)}</span>
>>>>>>> f0a58e6 (Initial commit)
                  </div>
                  <div className="flex justify-between text-xl font-bold pt-2 border-t">
                    <span>{t('סה"כ', 'Total')}</span>
                    <span className="text-chinese-red">₪{total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={onCheckout}
                  className="w-full py-3 bg-chinese-red text-white rounded-lg font-semibold hover:bg-chinese-darkRed transition-colors"
                >
                  {t('המשך לתשלום', 'Proceed to Checkout')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
