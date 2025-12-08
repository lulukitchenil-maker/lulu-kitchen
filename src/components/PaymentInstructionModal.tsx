import { X, Smartphone, ExternalLink, QrCode } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

interface PaymentInstructionModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentMethod: 'bit' | 'paybox';
  paymentLink: string;
  amount: number;
  onProceed: () => void;
}

export default function PaymentInstructionModal({
  isOpen,
  onClose,
  paymentMethod,
  paymentLink,
  amount,
  onProceed
}: PaymentInstructionModalProps) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentLink)}&color=1e40af&bgcolor=ffffff`;

  const isBit = paymentMethod === 'bit';
  const title = isBit ? 'Bit' : 'PayBox';
  const bgColor = isBit ? 'bg-blue-50' : 'bg-green-50';
  const bgColorDark = isBit ? 'bg-blue-100' : 'bg-green-100';
  const textColor = isBit ? 'text-blue-900' : 'text-green-900';
  const buttonColor = isBit ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700';
  const iconColor = isBit ? 'text-blue-600' : 'text-green-600';

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const bitPhone = '052-520-1978';

  const handleOpenPayment = () => {
    if (isBit && isMobile) {
      const deepLink = `bit://pay?phone=0525201978&amount=${Math.round(amount)}`;
      window.location.href = deepLink;
      setTimeout(() => {
        onProceed();
      }, 1000);
    } else {
      window.open(paymentLink, '_blank');
      setTimeout(() => {
        onProceed();
      }, 500);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-60 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative">
            <div className={`flex items-center justify-between p-6 border-b ${bgColor}`}>
              <h2 className="text-2xl font-bold">{t(`תשלום ב-${title}`, `Pay with ${title}`)}</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 text-center">
              <div className={`${bgColorDark} rounded-lg p-6 mb-6`}>
                <p className={`${textColor} font-semibold mb-2`}>
                  {t('סכום לתשלום:', 'Amount to pay:')}
                </p>
                <p className={`text-4xl font-bold ${textColor}`}>₪{amount.toFixed(2)}</p>
              </div>

{isBit && !isMobile ? (
                <>
                  <div className="bg-white border-4 border-blue-500 rounded-xl p-6 mb-6 flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-4">
                      <QrCode className="w-6 h-6 text-blue-600" />
                      <p className="font-bold text-lg text-blue-900">
                        {t('סרוק את הברקוד מהנייד', 'Scan QR Code with your phone')}
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-lg mb-4">
                      <img src={qrCodeUrl} alt="QR Code" className="mx-auto w-[200px] h-[200px]" />
                    </div>

                    <div className="text-center text-sm text-gray-700 space-y-1">
                      <p className="font-semibold text-blue-800">{t('לאחר הסריקה:', 'After scanning:')}</p>
                      <p>{t('✓ תיפתח אפליקציית Bit', '✓ Bit app will open')}</p>
                      <p>{t('✓ בחר "העבר כסף"', '✓ Choose "Transfer money"')}</p>
                      <p className="font-bold text-blue-900">{t('✓ הזן סכום:', '✓ Enter amount:')} ₪{amount.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className={`${bgColor} rounded-lg p-4 mb-6 text-right`}>
                    <p className="font-semibold text-sm mb-2 text-blue-800">
                      {t('💡 חלופה: תשלום ידני', '💡 Alternative: Manual payment')}
                    </p>
                    <div className="text-xs text-gray-700 space-y-1">
                      <p>{t('פתח Bit → העבר כסף → שלח למספר:', 'Open Bit → Transfer money → Send to number:')}</p>
                      <p className="font-bold text-blue-700">{bitPhone}</p>
                      <p className="font-bold text-blue-700">{t('סכום:', 'Amount:')} ₪{amount.toFixed(2)}</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className={`${bgColor} rounded-lg p-6 mb-6 text-right`}>
                    <div className="flex items-start gap-3">
                      <Smartphone className={`w-6 h-6 ${iconColor} flex-shrink-0 mt-1`} />
                      <div>
                        <p className="font-bold mb-3 text-lg">
                          {t('איך משלמים?', 'How to pay?')}
                        </p>
                        <ol className="text-sm space-y-3 text-gray-700">
                          <li className="flex items-start gap-2">
                            <span className="font-bold">1.</span>
                            <span>{t(`לחץ על כפתור "פתח ${title}"`, `Click "Open ${title}" button`)}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="font-bold">2.</span>
                            <span>{t(isBit ? 'תפתח אפליקציית Bit עם הסכום' : 'תפתח כרטיסיה חדשה עם דף התשלום', isBit ? 'Bit app will open with the amount' : 'A new tab will open with the payment page')}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="font-bold">3.</span>
                            <span>{t('בצע את התשלום', 'Complete the payment')}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="font-bold">4.</span>
                            <span>{t('חזור לכאן ולחץ "המשך להזמנה"', 'Return here and click "Continue to Order"')}</span>
                          </li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  {isBit && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <p className="text-sm text-blue-800 font-semibold">
                        {t('💳 תשלום מהנייד', '💳 Mobile Payment')}
                      </p>
                      <p className="text-xs text-blue-700 mt-2">
                        {t(
                          'האפליקציה תיפתח אוטומטית עם הסכום המלא',
                          'The app will open automatically with the full amount'
                        )}
                      </p>
                    </div>
                  )}
                </>
              )}

{isBit && !isMobile ? (
                <button
                  onClick={onProceed}
                  className={`w-full py-4 ${buttonColor} text-white rounded-lg font-bold transition-colors mb-3`}
                >
                  {t('המשך להזמנה', 'Continue to Order')}
                </button>
              ) : (
                <button
                  onClick={handleOpenPayment}
                  className={`w-full py-4 ${buttonColor} text-white rounded-lg font-bold transition-colors mb-3 flex items-center justify-center gap-2`}
                >
                  <ExternalLink className="w-5 h-5" />
                  {t(`פתח ${title}`, `Open ${title}`)}
                </button>
              )}

              <button
                onClick={onClose}
                className="w-full py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                {t('ביטול', 'Cancel')}
              </button>

              <p className="text-xs text-gray-500 mt-4">
                {t(
                  '* לאחר ביצוע התשלום, חזור לדף זה וסיים את ההזמנה',
                  '* After completing payment, return to this page and finish the order'
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
