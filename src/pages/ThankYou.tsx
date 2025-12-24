import { useEffect } from 'react';
import { CheckCircle, Home, Phone } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useCart } from '../hooks/useCart';

export default function ThankYou() {
  const { t, language } = useLanguage();
  const { clearCart } = useCart();

  useEffect(() => {
    window.scrollTo(0, 0);

    const urlParams = new URLSearchParams(window.location.search);
    const paymentSuccess = urlParams.get('payment_success');

    if (paymentSuccess === 'true') {
      clearCart();
      localStorage.removeItem('lulu_k_cart');
      sessionStorage.removeItem('lulu_k_cart');
    }
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle className="w-20 h-20 text-green-500" />
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            {t('תודה על ההזמנה!', 'Thank You for Your Order!')}
          </h1>

          <p className="text-xl text-gray-700 mb-8">
            {t(
              'התשלום התקבל בהצלחה והזמנתך בדרך אלינו',
              'Payment received successfully and your order is on its way to us'
            )}
          </p>

          <div className={`bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8 ${language === 'he' ? 'text-right' : 'text-left'}`}>
            <h2 className="font-bold text-lg text-blue-900 mb-3">
              {t('מה הלאה?', 'What\'s Next?')}
            </h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                <span>{t('נשלח אליך אישור הזמנה למייל ולטלפון תוך דקות', 'We will send you order confirmation via email and phone within minutes')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                <span>{t('המטבח שלנו יתחיל להכין את ההזמנה שלך', 'Our kitchen will start preparing your order')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                <span>{t('המשלוח יגיע במועד שנקבע', 'Delivery will arrive at the scheduled time')}</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl p-6 mb-8">
            <h3 className="font-bold text-lg mb-2">
              {t('🍜 Lulu Kitchen - המטבח הסיני שלך', '🍜 Lulu Kitchen - Your Chinese Kitchen')}
            </h3>
            <p className="text-sm opacity-90">
              {t('תודה שבחרת בנו! נתראה בהזמנה הבאה', 'Thank you for choosing us! See you in the next order')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-bold hover:from-red-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl"
            >
              <Home className="w-5 h-5" />
              {t('חזרה לדף הבית', 'Back to Home')}
            </a>
            <a
              href="https://api.whatsapp.com/send?phone=972525201978"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Phone className="w-5 h-5" />
              {t('צור קשר בוואטסאפ', 'Contact via WhatsApp')}
            </a>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              {t(
                'שאלות? צור קשר: 052-520-1978',
                'Questions? Contact us: 052-520-1978'
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
