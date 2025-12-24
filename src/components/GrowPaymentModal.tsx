import { useState, useEffect } from 'react';
import { X, Loader2, Copy, Check, ExternalLink } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useLanguage } from '../hooks/useLanguage';
import { isMobileDevice } from '../lib/payment';

interface GrowPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentLink: string | null;
  amount: number;
  loading: boolean;
  error: string | null;
  onComplete: () => void;
  orderId?: string;
}

export default function GrowPaymentModal({
  isOpen,
  onClose,
  paymentLink,
  amount,
  loading,
  error,
  onComplete,
  orderId
}: GrowPaymentModalProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [isMobile] = useState(isMobileDevice());

  const [showMobileOptions, setShowMobileOptions] = useState(false);

  useEffect(() => {
    if (paymentLink && isMobile && !loading && !error) {
      setShowMobileOptions(true);
    }
  }, [paymentLink, isMobile, loading, error]);


  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopy = () => {
    if (paymentLink) {
      navigator.clipboard.writeText(paymentLink);
      setCopied(true);
    }
  };

  if (!isOpen) return null;

  if (isMobile && paymentLink && !loading && !error && showMobileOptions) {
    return (
      <>
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">
                  {t('המשך לתשלום', 'Continue to Payment')}
                </h2>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-center mb-6">
                <p className="text-gray-600 text-sm mb-2">
                  {t('סכום לתשלום', 'Amount to pay')}
                </p>
                <p className="text-3xl font-bold text-chinese-red">
                  ₪{amount.toFixed(2)}
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    if (paymentLink) {
                      window.location.assign(paymentLink);
                    }
                  }}
                  className="flex items-center justify-center gap-3 w-full py-4 bg-chinese-red text-white rounded-xl font-semibold hover:bg-chinese-darkRed transition-colors shadow-lg"
                >
                  <span className="text-lg">{t('המשך לתשלום', 'Continue to Payment')}</span>
                  <ExternalLink className="w-5 h-5" />
                </button>

                <div className="bg-gray-50 rounded-lg p-3 mt-4">
                  <p className="text-xs text-gray-600 text-center">
                    {t('אמצעי תשלום זמינים: Bit, כרטיס אשראי, Google Pay, Apple Pay, העברה בנקאית',
                       'Available payment methods: Bit, Credit card, Google Pay, Apple Pay, Bank transfer')}
                  </p>
                </div>

                <button
                  onClick={onComplete}
                  className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors mt-4"
                >
                  {t('סיימתי לשלם - המשך', 'I completed payment - Continue')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold">
                {t('תשלום מאובטח', 'Secure Payment')}
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {loading && (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <Loader2 className="w-12 h-12 animate-spin text-chinese-red" />
                  <p className="text-gray-600">
                    {t('יוצר לינק תשלום...', 'Creating payment link...')}
                  </p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4">
                  <p className="text-red-900 font-semibold">{t('שגיאה', 'Error')}</p>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              )}

              {paymentLink && !loading && !error && (
                <div className="space-y-6">
                  <div className="text-center">
                    <p className="text-gray-600 mb-2">
                      {t('סכום לתשלום', 'Amount to pay')}
                    </p>
                    <p className="text-3xl font-bold text-chinese-red">
                      ₪{amount.toFixed(2)}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <p className="text-center font-semibold mb-4">
                      {t('סרוק את הברקוד לתשלום', 'Scan QR code to pay')}
                    </p>
                    <div className="flex justify-center">
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <QRCodeSVG
                          value={paymentLink}
                          size={200}
                          level="H"
                          includeMargin={true}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-center text-sm text-gray-600">
                      {t('או העתק את הלינק', 'Or copy the link')}
                    </p>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={paymentLink}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                      />
                      <button
                        onClick={handleCopy}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        title={t('העתק', 'Copy')}
                      >
                        {copied ? (
                          <Check className="w-5 h-5 text-green-600" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        if (paymentLink) {
                          window.location.assign(paymentLink);
                        }
                      }}
                      className="flex items-center justify-center gap-2 w-full py-3 bg-chinese-red text-white rounded-lg font-semibold hover:bg-chinese-darkRed transition-colors"
                    >
                      <span>{t('פתח דף תשלום', 'Open payment page')}</span>
                      <ExternalLink className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                    <p className="text-sm text-blue-900">
                      <strong>{t('אפשרויות תשלום זמינות:', 'Available payment methods:')}</strong>
                    </p>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Bit</li>
                      <li>• {t('כרטיס אשראי', 'Credit Card')}</li>
                      <li>• Google Pay</li>
                      <li>• Apple Pay</li>
                      <li>• {t('העברה בנקאית', 'Bank Transfer')}</li>
                    </ul>
                  </div>

                  <button
                    onClick={onComplete}
                    className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    {t('סיימתי לשלם - המשך', 'I completed payment - Continue')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
