import { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, CreditCard, Mail, Phone, User } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useCart } from '../hooks/useCart';
import { isValidFullName, isValidEmail, isValidPhone, isValidDeliveryTime, isValidDeliveryDate, getAvailableDeliveryTimes, getMinDeliveryDate } from '../lib/validation';
import { getCityNames, getStreetSuggestions, isValidDeliveryAddress } from '../lib/deliveryAreas';
import { submitOrder } from '../lib/api';
import { createBitPaymentLink, getPayBoxLink } from '../lib/payment';
import PaymentInstructionModal from './PaymentInstructionModal';
import type { OrderDetails } from '../types';
// מייבאים את כל אובייקט הקונפיגורציה
import { CONFIG as config } from '../config/config'; 

interface OrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (orderDetails: OrderDetails) => void;
}

export default function OrderForm({ isOpen, onClose, onSubmit }: OrderFormProps) {
  const { t } = useLanguage();
  const { getTotalPrice, getShippingCost, cartItems } = useCart();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    deliveryDate: '',
    deliveryTime: '',
    city: '',
    street: '',
    houseNumber: '',
    apartment: '',
    notes: '',
    paymentMethod: 'cash' as 'cash' | 'bit' | 'paybox'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [streetSuggestions, setStreetSuggestions] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [, setLoadingCities] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingOrderDetails, setPendingOrderDetails] = useState<OrderDetails | null>(null);

  useEffect(() => {
    async function fetchCities() {
      const cityNames = await getCityNames();
      setCities(cityNames);
      setLoadingCities(false);
    }
    fetchCities();
  }, []);

  const handleCityChange = (city: string) => {
    setFormData({ ...formData, city, street: '' });
    setStreetSuggestions([]);
  };

  const handleStreetChange = async (street: string) => {
    setFormData({ ...formData, street });

    if (formData.city && street.length >= 1) {
      const suggestions = await getStreetSuggestions(formData.city, street);
      setStreetSuggestions(suggestions);
    } else {
      setStreetSuggestions([]);
    }
  };

  const handleStreetSelect = (street: string) => {
    setFormData({ ...formData, street });
    setStreetSuggestions([]);
  };

  const validateForm = async (): Promise<boolean> => {
    const newErrors: Record<string, string> = {};

    if (!isValidFullName(formData.fullName)) {
      newErrors.fullName = t('נא להזין שם מלא', 'Please enter full name');
    }

    if (!isValidEmail(formData.email)) {
      newErrors.email = t('כתובת מייל לא תקינה', 'Invalid email address');
    }

    if (!isValidPhone(formData.phone)) {
      newErrors.phone = t('מספר טלפון לא תקין', 'Invalid phone number');
    }

    if (!formData.deliveryDate) {
      newErrors.deliveryDate = t('נא לבחור תאריך משלוח', 'Please select delivery date');
    } else if (!isValidDeliveryDate(formData.deliveryDate)) {
      const selectedDate = new Date(formData.deliveryDate);
      const dayOfWeek = selectedDate.getDay();
      if (dayOfWeek === 6) {
        newErrors.deliveryDate = t('אין משלוחים בשבת', 'No deliveries on Saturday');
      } else {
        newErrors.deliveryDate = t('יש להזמין יום מראש לפחות', 'Must order at least one day in advance');
      }
    }

    if (!formData.deliveryTime) {
      newErrors.deliveryTime = t('נא לבחור שעת משלוח', 'Please select delivery time');
    } else if (!isValidDeliveryTime(formData.deliveryTime, formData.deliveryDate)) {
      const selectedDate = new Date(formData.deliveryDate);
      const dayOfWeek = selectedDate.getDay();
      if (dayOfWeek === 5) {
        newErrors.deliveryTime = t('שעות משלוח ביום שישי: 13:00-15:00', 'Friday delivery: 13:00-15:00');
      } else {
        newErrors.deliveryTime = t('שעות משלוח: 13:00-21:00', 'Delivery hours: 13:00-21:00');
      }
    }

    if (!formData.city) {
      newErrors.city = t('נא לבחור עיר', 'Please select city');
    }

    if (!formData.street) {
      newErrors.street = t('נא להזין רחוב', 'Please enter street');
    } else if (formData.city) {
      const isValid = await isValidDeliveryAddress(formData.city, formData.street);
      if (!isValid) {
        newErrors.street = t('כתובת לא באזור משלוח', 'Address not in delivery area');
      }
    }

    if (!formData.houseNumber) {
      newErrors.houseNumber = t('נא להזין מספר בית', 'Please enter house number');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = await validateForm();
    if (!isValid) {
      return;
    }

    const orderDetails: OrderDetails = {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      deliveryDate: formData.deliveryDate,
      deliveryTime: formData.deliveryTime,
      address: formData.apartment
        ? `${formData.street} ${formData.houseNumber}, דירה ${formData.apartment}`
        : `${formData.street} ${formData.houseNumber}`,
      city: formData.city,
      street: formData.street,
      houseNumber: formData.houseNumber,
      apartment: formData.apartment,
      floor: formData.apartment,
      notes: formData.notes,
      paymentMethod: formData.paymentMethod
    };

    // Show payment modal for Bit/PayBox
    if (formData.paymentMethod === 'bit' || formData.paymentMethod === 'paybox') {
      setPendingOrderDetails(orderDetails);
      setShowPaymentModal(true);
      return;
    }

    // Process order directly for cash
    await processOrder(orderDetails);
  };

  const handlePaymentProceed = async () => {
    setShowPaymentModal(false);
    if (pendingOrderDetails) {
      await processOrder(pendingOrderDetails);
      setPendingOrderDetails(null);
    }
  };

  const processOrder = async (orderDetails: OrderDetails) => {
    setSubmitting(true);

    const timeoutId = setTimeout(() => {
      setSubmitting(false);
      alert(t('תם הזמן המוקצב - אנא נסה שוב', 'Request timed out - please try again'));
    }, 30000);

    try {
      const subtotal = getTotalPrice();
      const shipping = getShippingCost();
      const total = subtotal + shipping;

      const makePayload = {
        // שדה מפתח עבור ה-Router ב-Make.com
        formType: 'Orders', 
        timestamp: new Date().toISOString(), // זמן יצירת הפנייה

        // פרטי הלקוח והמשלוח
        ...orderDetails,

        // פרטי העגלה והסכומים
        cartItems: cartItems, 
        subtotal: subtotal,
        shipping: shipping,
        total: total,
      };

      // 1. ** שליחה ל-MAKE.COM Webhook **
      const makeResponse = await fetch(config.MAKE_WEBHOOK_URL, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(makePayload),
      });

      if (!makeResponse.ok) {
        console.warn('Warning: Make Webhook failed with status:', makeResponse.status, await makeResponse.text());
      }
      

      // 2. ** שליחה ל-Supabase/API (הקוד המקורי שלך) **
      const result = await submitOrder(orderDetails, cartItems, subtotal, shipping, total);

      clearTimeout(timeoutId);

      if (result.success) {
        // Reset form after successful submission
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          deliveryDate: '',
          deliveryTime: '',
          city: '',
          street: '',
          houseNumber: '',
          apartment: '',
          notes: '',
          paymentMethod: 'cash'
        });
        setErrors({});
        setSubmitting(false);
        onSubmit(orderDetails);
      } else {
        // 👈 הוספת נקודה-פסיק כאן
        alert(result.error || t('שגיאה בשליחת ההזמנה', 'Error submitting order'));
        setSubmitting(false);
      }
    // 👈 הבעיה הייתה בפקודה האחרונה לפני סגירת הבלוק
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Error submitting order:', error);
      // 👈 הוספת נקודה-פסיק כאן
      alert(t('שגיאה בשליחת ההזמנה', 'Error submitting order'));
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const subtotal = getTotalPrice();
  const shipping = getShippingCost();
  const total = subtotal + shipping;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold">{t('פרטי הזמנה', 'Order Details')}</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-2">
                  <User className="w-4 h-4" />
                  {t('שם מלא', 'Full Name')} *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder={t('הזן שם מלא', 'Enter full name')}
                />
                {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold mb-2">
                    <Mail className="w-4 h-4" />
                    {t('מייל', 'Email')} *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder={t('your@email.com', 'your@email.com')}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold mb-2">
                    <Phone className="w-4 h-4" />
                    {t('טלפון', 'Phone')} *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder={t('050-1234567', '050-1234567')}
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold mb-2">
                    <Calendar className="w-4 h-4" />
                    {t('תאריך משלוח', 'Delivery Date')} *
                  </label>
                  <input
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      setFormData({ ...formData, deliveryDate: newDate, deliveryTime: '' });
                      const times = getAvailableDeliveryTimes(newDate);
                      setAvailableTimes(times);
                    }}
                    className={`w-full px-4 py-2 border rounded-lg ${errors.deliveryDate ? 'border-red-500' : 'border-gray-300'}`}
                    min={getMinDeliveryDate()}
                  />
                  {errors.deliveryDate && <p className="text-red-500 text-sm mt-1">{errors.deliveryDate}</p>}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold mb-2">
                    <Clock className="w-4 h-4" />
                    {t('שעת משלוח', 'Delivery Time')} *
                  </label>
                  <select
                    value={formData.deliveryTime}
                    onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg ${errors.deliveryTime ? 'border-red-500' : 'border-gray-300'}`}
                    disabled={!formData.deliveryDate}
                  >
                    <option value="">{t('בחר שעה', 'Select Time')}</option>
                    {availableTimes.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                  {errors.deliveryTime && <p className="text-red-500 text-sm mt-1">{errors.deliveryTime}</p>}
                  {formData.deliveryDate && availableTimes.length === 0 && (
                    <p className="text-amber-600 text-sm mt-1">{t('אין משלוחים בתאריך זה', 'No deliveries on this date')}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-2">
                  <MapPin className="w-4 h-4" />
                  {t('עיר', 'City')} *
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">{t('בחר עיר', 'Select City')}</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2 relative">
                  <label className="text-sm font-semibold mb-2 block">
                    {t('רחוב', 'Street')} *
                  </label>
                  <input
                    type="text"
                    value={formData.street}
                    onChange={(e) => handleStreetChange(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg ${errors.street ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder={t('הזן שם רחוב', 'Enter street name')}
                    disabled={!formData.city}
                  />
                  {streetSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                      {streetSuggestions.map((street, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleStreetSelect(street)}
                          className="w-full px-4 py-2 text-right hover:bg-gray-100"
                        >
                          {street}
                        </button>
                      ))}
                    </div>
                  )}
                  {errors.street && <p className="text-red-500 text-sm mt-1">{errors.street}</p>}
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">
                    {t('מספר בית', 'House Number')} *
                  </label>
                  <input
                    type="text"
                    value={formData.houseNumber}
                    onChange={(e) => setFormData({ ...formData, houseNumber: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg ${errors.houseNumber ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder={t('123', '123')}
                  />
                  {errors.houseNumber && <p className="text-red-500 text-sm mt-1">{errors.houseNumber}</p>}
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">
                    {t('דירה', 'Apartment')}
                  </label>
                  <input
                    type="text"
                    value={formData.apartment}
                    onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder={t('קומה/דירה', 'Floor/Apt')}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block">
                  {t('הערות למשלוח', 'Delivery Notes')}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                  placeholder={t('קומה, דירה, הערות נוספות...', 'Floor, apartment, additional notes...')}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-3">
                  <CreditCard className="w-4 h-4" />
                  {t('אמצעי תשלום', 'Payment Method')} *
                </label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="cash"
                      checked={formData.paymentMethod === 'cash'}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                      className="w-4 h-4"
                    />
                    <span>{t('מזומן', 'Cash')}</span>
                  </label>

                  <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="bit"
                      checked={formData.paymentMethod === 'bit'}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                      className="w-4 h-4"
                    />
                    <span>Bit</span>
                  </label>

                  <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="paybox"
                      checked={formData.paymentMethod === 'paybox'}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                      className="w-4 h-4"
                    />
                    <span>PayBox</span>
                  </label>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span>{t('סכום ביניים', 'Subtotal')}</span>
                  <span>₪{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('משלוח', 'Shipping')}</span>
                  <span className={shipping === 0 ? 'text-green-600 font-semibold' : ''}>
                    {shipping === 0 ? t('חינם!', 'Free!') : `₪${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-2 border-t">
                  <span>{t('סה"כ לתשלום', 'Total')}</span>
                  <span className="text-chinese-red">₪{total.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-chinese-red text-white rounded-lg font-semibold hover:bg-chinese-darkRed transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? t('שולח...', 'Sending...') : t('אישור הזמנה', 'Confirm Order')}
              </button>
            </form>
          </div>
        </div>
      </div>

      <PaymentInstructionModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setPendingOrderDetails(null);
        }}
        paymentMethod={formData.paymentMethod === 'bit' ? 'bit' : 'paybox'}
        paymentLink={
          formData.paymentMethod === 'bit'
            ? createBitPaymentLink(getTotalPrice() + getShippingCost())
            : getPayBoxLink()
        }
        amount={getTotalPrice() + getShippingCost()}
        onProceed={handlePaymentProceed}
      />
    </>
  );
}