import { useEffect, useState } from 'react';
import { CheckCircle, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { supabase } from '../lib/supabase';
import { useCart } from '../hooks/useCart';

export default function PaymentStatus() {
  const { t } = useLanguage();
  const { clearCart } = useCart();

  const [status, setStatus] = useState<'loading' | 'success' | 'timeout'>('loading');
  const [orderData, setOrderData] = useState<any>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const TIMEOUT_SECONDS = 45;

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');

    if (!orderId) {
      window.location.href = '/';
      return;
    }

    let timer: NodeJS.Timeout;
    let timeoutTimer: NodeJS.Timeout;

    // Timer to track elapsed time
    timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    // Timeout after 45 seconds
    timeoutTimer = setTimeout(() => {
      if (status === 'loading') {
        setStatus('timeout');
      }
    }, TIMEOUT_SECONDS * 1000);

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          console.log('Payment status update:', payload);

          if (payload.new.payment_status === 'paid') {
            setOrderData(payload.new);
            setStatus('success');
            setShowConfetti(true);
            clearCart();

            // Clear cart from storage
            localStorage.removeItem('lulu_k_cart');
            sessionStorage.removeItem('lulu_k_cart');

            // Redirect to thank you page after 2 seconds
            setTimeout(() => {
              window.location.href = `/thank-you?orderId=${orderId}&payment_success=true`;
            }, 2000);
          }
        }
      )
      .subscribe();

    // Initial check
    checkPaymentStatus(orderId);

    return () => {
      clearInterval(timer);
      clearTimeout(timeoutTimer);
      supabase.removeChannel(channel);
    };
  }, [clearCart, status]);

  const checkPaymentStatus = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();

      if (error) throw error;

      if (data?.payment_status === 'paid') {
        setOrderData(data);
        setStatus('success');
        setShowConfetti(true);
        clearCart();

        setTimeout(() => {
          window.location.href = `/thank-you?orderId=${orderId}&payment_success=true`;
        }, 2000);
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  };

  const handleManualCheck = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');

    if (orderId) {
      setStatus('loading');
      setTimeElapsed(0);
      checkPaymentStatus(orderId);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
            <div className="flex justify-center mb-6">
              <Loader2 className="w-20 h-20 text-blue-500 animate-spin" />
            </div>

            <h1 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">
              {t('מאמת תשלום...', 'Verifying Payment...')}
            </h1>

            <p className="text-lg text-gray-600 mb-6">
              {t(
                'אנא המתן בזמן שאנו מאמתים את התשלום שלך',
                'Please wait while we verify your payment'
              )}
            </p>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-800">
                {t(
                  `זמן המתנה: ${timeElapsed} שניות`,
                  `Waiting time: ${timeElapsed} seconds`
                )}
              </p>
            </div>

            <div className="space-y-2 text-sm text-gray-500">
              <p>✓ {t('התחברנו למערכת התשלומים', 'Connected to payment system')}</p>
              <p>✓ {t('מאמת את הפרטים שלך', 'Verifying your details')}</p>
              <p className="animate-pulse">⏳ {t('ממתין לאישור תשלום', 'Waiting for payment confirmation')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'timeout') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
            <div className="flex justify-center mb-6">
              <AlertCircle className="w-20 h-20 text-orange-500" />
            </div>

            <h1 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">
              {t('אימות התשלום לוקח זמן', 'Payment Verification Taking Time')}
            </h1>

            <p className="text-lg text-gray-600 mb-6">
              {t(
                'לא קיבלנו אישור תשלום עדיין. אם שילמת, ייתכן שהאישור מתעכב.',
                "We haven't received payment confirmation yet. If you paid, the confirmation might be delayed."
              )}
            </p>

            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-yellow-800 font-semibold mb-2">
                {t('מה לעשות?', 'What to do?')}
              </p>
              <ul className="text-sm text-yellow-700 text-right space-y-1">
                <li>• {t('בדוק שסיימת את התשלום במערכת התשלומים', 'Check that you completed the payment')}</li>
                <li>• {t('לחץ על "בדוק סטטוס תשלום" למטה', 'Click "Check Payment Status" below')}</li>
                <li>• {t('או צור קשר איתנו לבירור', 'Or contact us for clarification')}</li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleManualCheck}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg"
              >
                <RefreshCw className="w-5 h-5" />
                {t('בדוק סטטוס תשלום', 'Check Payment Status')}
              </button>

              <a
                href="https://api.whatsapp.com/send?phone=972525201978"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all"
              >
                {t('צור קשר בוואטסאפ', 'Contact via WhatsApp')}
              </a>

              <a
                href="/"
                className="text-gray-600 hover:text-gray-900 font-semibold"
              >
                {t('חזרה לדף הבית', 'Back to Home')}
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4">
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-10%',
                  animationDelay: `${Math.random() * 2}s`,
                  fontSize: `${Math.random() * 20 + 10}px`,
                }}
              >
                🎉
              </div>
            ))}
          </div>
        )}

        <div className="max-w-lg w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 rounded-full p-4 animate-bounce">
                <CheckCircle className="w-20 h-20 text-green-500" />
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              {t('התשלום אושר!', 'Payment Confirmed!')}
            </h1>

            <p className="text-xl text-gray-700 mb-6">
              {t(
                'תודה רבה! ההזמנה שלך התקבלה בהצלחה',
                'Thank you! Your order has been received successfully'
              )}
            </p>

            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
              <p className="text-green-800 font-semibold">
                ✓ {t('התשלום עבר בהצלחה', 'Payment processed successfully')}
              </p>
            </div>

            <p className="text-gray-600">
              {t('מעביר לעמוד אישור...', 'Redirecting to confirmation page...')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
