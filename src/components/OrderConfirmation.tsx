import { CheckCircle, Calendar, Clock, MapPin, CreditCard, ShoppingBag } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import type { OrderDetails } from '../types';

interface OrderConfirmationProps {
  orderDetails: OrderDetails;
  onClose: () => void;
}

export default function OrderConfirmation({ orderDetails, onClose }: OrderConfirmationProps) {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="bg-green-500 p-8 text-center text-white">
          <CheckCircle className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2">{t('ההזמנה התקבלה!', 'Order Received!')}</h2>
          <p className="opacity-90">{t('תודה רבה על הזמנתך', 'Thank you for your order')}</p>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="font-bold text-lg border-b pb-2">{t('פרטי משלוח', 'Delivery Details')}</h3>
            
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-chinese-red mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">{t('תאריך', 'Date')}</p>
                <p className="font-medium">{orderDetails.deliveryDate}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-chinese-red mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">{t('שעה מוערכת', 'Estimated Time')}</p>
                <p className="font-medium">{orderDetails.deliveryTime}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-chinese-red mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">{t('כתובת', 'Address')}</p>
                <p className="font-medium">{orderDetails.city}, {orderDetails.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-chinese-red mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">{t('אמצעי תשלום', 'Payment Method')}</p>
                <p className="font-medium">
                  {orderDetails.paymentMethod === 'cash' ? t('מזומן', 'Cash') : t('תשלום מאובטח', 'Secure Payment')}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-4 bg-chinese-red text-white rounded-xl font-bold hover:bg-chinese-darkRed transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-5 h-5" />
            {t('חזרה לתפריט', 'Back to Menu')}
          </button>
        </div>
      </div>
    </div>
  );
}
