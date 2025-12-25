import { useEffect } from 'react';

import { CheckCircle, ExternalLink, MessageCircle } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useCart } from '../hooks/useCart';
import { createBitPaymentLink, getPayBoxLink } from '../lib/payment';

import { CheckCircle } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useCart } from '../hooks/useCart';

import type { OrderDetails, CartItem } from '../types';

interface OrderConfirmationProps {
  isOpen: boolean;
  orderDetails: OrderDetails;
  totalAmount: number;
  cartItems?: CartItem[];
  onClose: () => void;
}

export default function OrderConfirmation({ isOpen, orderDetails, totalAmount, cartItems, onClose }: OrderConfirmationProps) {
  const { t, language } = useLanguage();
  const { clearCart, cartItems: contextCartItems } = useCart();

  // Clear cart when order confirmation opens
  useEffect(() => {
    if (isOpen) {
      clearCart();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const items = cartItems || contextCartItems;

  const createWhatsAppOrderMessage = () => {
    const itemsList = items.map(item => {
      const itemName = language === 'he' ? item.menuItem.name_he : item.menuItem.name_en;
      let itemStr = `${itemName} x${item.quantity}`;

      if (item.selectedAddOns && item.selectedAddOns.length > 0) {
        const addOnsNames = item.selectedAddOns.map(addon =>
          language === 'he' ? addon.name_he : addon.name_en
        ).join(', ');
        itemStr += ` (${addOnsNames})`;
      }

      return itemStr;
    }).join('\n');

    const paymentMethodText = orderDetails.paymentMethod === 'cash' ?
      (language === 'he' ? 'מזומן' : 'Cash') :

      orderDetails.paymentMethod === 'bit' ? 'Bit' : 'PayBox';

      (language === 'he' ? 'תשלום מאובטח' : 'Secure Payment');


    const deliveryDateTime = orderDetails.deliveryDate && orderDetails.deliveryTime
      ? `${orderDetails.deliveryDate} ${orderDetails.deliveryTime}`
      : orderDetails.deliveryTime || orderDetails.deliveryDate || '';

    const message = language === 'he' ?
      `🍜 הזמנה חדשה מ-Lulu Kitchen\n\n👤 שם: ${orderDetails.fullName}\n📞 טלפון: ${orderDetails.phone}\n📍 כתובת: ${orderDetails.address}, ${orderDetails.city}\n📅 מועד אספקה: ${deliveryDateTime}\n💳 תשלום: ${paymentMethodText}\n\n🛒 פריטים:\n${itemsList}\n\n💰 סה"כ לתשלום: ₪${totalAmount}\n\n${orderDetails.notes ? `📝 הערות: ${orderDetails.notes}` : ''}` :
      `🍜 New Order from Lulu Kitchen\n\n👤 Name: ${orderDetails.fullName}\n📞 Phone: ${orderDetails.phone}\n📍 Address: ${orderDetails.address}, ${orderDetails.city}\n📅 Delivery: ${deliveryDateTime}\n💳 Payment: ${paymentMethodText}\n\n🛒 Items:\n${itemsList}\n\n💰 Total: ₪${totalAmount}\n\n${orderDetails.notes ? `📝 Notes: ${orderDetails.notes}` : ''}`;

    return encodeURIComponent(message);
  };

  const whatsappLink = `https://api.whatsapp.com/send?phone=972525201978&text=${createWhatsAppOrderMessage()}`;


  const handleBitPayment = () => {
    const bitLink = createBitPaymentLink(totalAmount);
    // Open in new tab for better UX
    window.open(bitLink, '_blank');
  };

  const handlePayBoxPayment = () => {
    const payboxLink = getPayBoxLink(totalAmount);
    // Open in new tab for better UX
    window.open(payboxLink, '_blank');
  };



  const handleClose = () => {
    clearCart();
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
            <div className="flex justify-center mb-6">
              <CheckCircle className="w-20 h-20 text-green-500" />
            </div>

            <h2 className="text-2xl font-bold mb-4">
              {t('ההזמנה התקבלה בהצלחה!', 'Order Received Successfully!')}
            </h2>

            <div className="text-right bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
              <p><strong>{t('שם:', 'Name:')}</strong> {orderDetails.fullName}</p>
              <p><strong>{t('תאריך משלוח:', 'Delivery Date:')}</strong> {orderDetails.deliveryDate}</p>
              <p><strong>{t('שעת משלוח:', 'Delivery Time:')}</strong> {orderDetails.deliveryTime}</p>
              <p><strong>{t('כתובת:', 'Address:')}</strong> {orderDetails.address}, {orderDetails.city}</p>
              <p><strong>{t('אמצעי תשלום:', 'Payment Method:')}</strong> {

                orderDetails.paymentMethod === 'cash' ? t('מזומן', 'Cash') :
                orderDetails.paymentMethod === 'bit' ? 'Bit' : 'PayBox'
              }</p>
            </div>

            {orderDetails.paymentMethod === 'cash' && (
              <p className="text-gray-600 mb-6">
                {t(
                  'תשלום במזומן בעת האספקה. נשלח אליך אישור למייל ולטלפון בקרוב. תודה שבחרת בנו!',
                  'Cash payment upon delivery. Confirmation will be sent to your email and phone. Thank you!'
                )}
              </p>
            )}

            {orderDetails.paymentMethod === 'bit' && (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-blue-900 font-semibold mb-2">
                    {t('סכום לתשלום:', 'Amount to pay:')}
                  </p>
                  <p className="text-3xl font-bold text-blue-900 mb-3">₪{totalAmount.toFixed(2)}</p>
                  <p className="text-blue-800 text-sm">
                    {t(
                      'לחץ על הכפתור למטה ואפליקציית Bit תיפתח עם הסכום מולא אוטומטית',
                      'Click the button below and the Bit app will open with the amount filled automatically'
                    )}
                  </p>
                </div>
                <button
                  onClick={handleBitPayment}
                  className="w-full py-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors mb-3 flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-5 h-5" />
                  {t('פתח Bit לתשלום', 'Open Bit to Pay')}
                </button>
                <p className="text-gray-600 text-sm mb-6">
                  {t(
                    'לאחר ביצוע התשלום, נשלח אליך אישור למייל ולטלפון. תודה שבחרת בנו!',
                    'After completing the payment, confirmation will be sent. Thank you!'
                  )}
                </p>
              </>
            )}

            {orderDetails.paymentMethod === 'paybox' && (
              <>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                  <p className="text-purple-900 font-semibold mb-2">
                    {t('סכום לתשלום:', 'Amount to pay:')}
                  </p>
                  <p className="text-3xl font-bold text-purple-900 mb-3">₪{totalAmount.toFixed(2)}</p>
                  <p className="text-purple-800 text-sm">
                    {t(
                      'לחץ על הכפתור למטה ותועבר לדף התשלום של PayBox',
                      'Click the button below and you will be redirected to PayBox payment page'
                    )}
                  </p>
                </div>
                <button
                  onClick={handlePayBoxPayment}
                  className="w-full py-4 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors mb-3 flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-5 h-5" />
                  {t('פתח PayBox לתשלום', 'Open PayBox to Pay')}
                </button>
                <p className="text-gray-600 text-sm mb-6">
                  {t(
                    'לאחר ביצוע התשלום, נשלח אליך אישור למייל ולטלפון. תודה שבחרת בנו!',
                    'After completing the payment, confirmation will be sent. Thank you!'
                  )}
                </p>
              </>
            )}

                orderDetails.paymentMethod === 'cash' ? t('מזומן', 'Cash') : t('תשלום מאובטח', 'Secure Payment')
              }</p>
            </div>

            <p className="text-gray-600 mb-6">
              {t(
                'תשלום במזומן בעת האספקה. נשלח אליך אישור למייל ולטלפון בקרוב. תודה שבחרת בנו!',
                'Cash payment upon delivery. Confirmation will be sent to your email and phone. Thank you!'
              )}
            </p>


            <button
              onClick={handleClose}
              className="w-full py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              {t('סגור', 'Close')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
