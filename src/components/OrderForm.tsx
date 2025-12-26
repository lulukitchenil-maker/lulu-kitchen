import { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, CreditCard, Mail, Phone, User, AlertCircle } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useCart } from '../hooks/useCart';
import { isValidFullName, isValidEmail, isValidPhone, isValidDeliveryTime, isValidDeliveryDate, getAvailableDeliveryTimes, getMinDeliveryDate } from '../lib/validation';
import { getCityNames, getStreetSuggestions, isValidDeliveryAddress } from '../lib/deliveryAreas';
import { submitOrder } from '../lib/api';
import GrowPaymentModal from './GrowPaymentModal';
import { supabase } from '../lib/supabaseClient';
import type { OrderDetails } from '../types';
import CONFIG from '../config/config';

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
    paymentMethod: 'cash' as 'cash' | 'grow'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [streetSuggestions, setStreetSuggestions] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [pendingOrderDetails, setPendingOrderDetails] = useState<OrderDetails | null>(null);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [isVacationActive, setIsVacationActive] = useState(false);
  const [vacationMessage, setVacationMessage] = useState('');

  useEffect(() => {
    async function fetchCities() {
      const cityNames = await getCityNames();
      setCities(cityNames);
    }
    fetchCities();
  }, []);

  useEffect(() => {
    async function checkVacation() {
      const { data } = await supabase
        .from('vacation_settings')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();

      if (data) {
        setIsVacationActive(true);
        setVacationMessage(data.message_he || 'העסק סגור לחופשה');
      }
    }
    checkVacation();
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
    if (!isValidFullName(formData.fullName)) newErrors.fullName = t('נא להזין שם מלא', 'Please enter full name');
    if (!isValidEmail(formData.email)) newErrors.email = t('כתובת מייל לא תקינה', 'Invalid email address');
    if (!isValidPhone(formData.phone)) newErrors.phone = t('מספר טלפון לא תקין', 'Invalid phone number');
    if (!formData.deliveryDate) newErrors.deliveryDate = t('נא לבחור תאריך משלוח', 'Please select delivery date');
    if (!formData.deliveryTime) newErrors.deliveryTime = t('נא לבחור שעת משלוח', 'Please select delivery time');
    if (!formData.city) newErrors.city = t('נא לבחור עיר', 'Please select city');
    if (!formData.street) newErrors.street = t('נא להזין רחוב', 'Please enter street');
    if (!formData.houseNumber) newErrors.houseNumber = t('נא להזין מספר בית', 'Please enter house number');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isVacationActive) {
      alert(vacationMessage);
      return;
    }

    const isValid = await validateForm();
    if (!isValid) return;

    const orderDetails: OrderDetails = {
      ...formData,
      address: formData.apartment ? `${formData.street} ${formData.houseNumber}, דירה ${formData.apartment}` : `${formData.street} ${formData.houseNumber}`,
      floor: formData.apartment
    };

    if (formData.paymentMethod === 'grow') {
      setPendingOrderDetails(orderDetails);
      await createPaymentLink(orderDetails);
    } else {
      await processOrder(orderDetails);
    }
  };

  const createPaymentLink = async (orderDetails: OrderDetails) => {
    setPaymentLoading(true);
    setPaymentError(null);
    setShowPaymentModal(true);

    try {
      const subtotal = getTotalPrice();
      const shipping = getShippingCost();
      const total = subtotal + shipping;

      const sanitizedItems = cartItems.map(item => ({
        id: item.menuItem.id,
        name_he: item.menuItem.name_he,
        price: item.menuItem.price,
        quantity: item.quantity,
        selectedAddOns: item.selectedAddOns
      }));

      const { data: order, error: insertError } = await supabase
        .from('orders')
        .insert({
          customer_name: orderDetails.fullName,
          email: orderDetails.email,
          phone: orderDetails.phone,
          city: orderDetails.city,
          street: orderDetails.street,
          house_number: orderDetails.houseNumber,
          delivery_date: orderDetails.deliveryDate,
          delivery_time: orderDetails.deliveryTime,
          payment_method: 'grow',
          total_price: total,
          items: sanitizedItems,
          status: 'pending',
          payment_status: 'pending',
        })
        .select()
        .single();

      if (insertError) throw insertError;
      setCurrentOrderId(order.id);

      const { createGrowPaymentLink } = await import('../lib/payment');
      const link = createGrowPaymentLink(order.id, total);
      setPaymentLink(link);
    } catch (error: any) {
      setPaymentError(error.message);
    } finally {
      setPaymentLoading(false);
    }
  };

  const processOrder = async (orderDetails: OrderDetails) => {
    setSubmitting(true);
    try {
      const subtotal = getTotalPrice();
      const shipping = getShippingCost();
      const total = subtotal + shipping;

      const result = await submitOrder(orderDetails, cartItems, subtotal, shipping, total);
      if (result.success) {
        onClose();
        onSubmit(orderDetails);
      } else {
        alert(result.error || 'שגיאה בשליחת ההזמנה');
      }
    } catch (error) {
      alert('שגיאה בשליחת ההזמנה');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold">{t('פרטי הזמנה', 'Order Details')}</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-6 h-6" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {isVacationActive && (
                <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 mb-6 flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                  <p className="font-bold text-red-900">{vacationMessage}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="שם מלא" className="w-full px-4 py-2 border rounded-lg" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                <input type="tel" placeholder="טלפון" className="w-full px-4 py-2 border rounded-lg" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="date" className="w-full px-4 py-2 border rounded-lg" value={formData.deliveryDate} onChange={e => setFormData({...formData, deliveryDate: e.target.value})} />
                <select className="w-full px-4 py-2 border rounded-lg" value={formData.deliveryTime} onChange={e => setFormData({...formData, deliveryTime: e.target.value})}>
                    <option value="">בחר שעה</option>
                    {getAvailableDeliveryTimes(formData.deliveryDate).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="space-y-4">
                <select value={formData.city} onChange={e => handleCityChange(e.target.value)} className="w-full px-4 py-2 border rounded-lg">
                  <option value="">בחר עיר</option>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input type="text" placeholder="רחוב" className="w-full px-4 py-2 border rounded-lg" value={formData.street} onChange={e => handleStreetChange(e.target.value)} />
                <input type="text" placeholder="מספר בית" className="w-full px-4 py-2 border rounded-lg" value={formData.houseNumber} onChange={e => setFormData({...formData, houseNumber: e.target.value})} />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer">
                  <input type="radio" name="payment" value="cash" checked={formData.paymentMethod === 'cash'} onChange={e => setFormData({...formData, paymentMethod: 'cash'})} />
                  <span>{t('מזומן', 'Cash')}</span>
                </label>
                <label className="flex items-center gap-3 p-4 border-2 border-chinese-red rounded-lg cursor-pointer bg-red-50">
                  <input type="radio" name="payment" value="grow" checked={formData.paymentMethod === 'grow'} onChange={e => setFormData({...formData, paymentMethod: 'grow'})} />
                  <div>
                    <div className="font-semibold">תשלום מאובטח (אשראי / Bit / Pay)</div>
                  </div>
                </label>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between font-bold text-xl">
                  <span>סה"כ:</span>
                  <span>₪{(getTotalPrice() + getShippingCost()).toFixed(2)}</span>
                </div>
              </div>

              <button type="submit" disabled={submitting} className="w-full py-3 bg-chinese-red text-white rounded-lg font-bold">
                {submitting ? 'שולח...' : 'אישור הזמנה'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <GrowPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        paymentLink={paymentLink}
        amount={getTotalPrice() + getShippingCost()}
        loading={paymentLoading}
        error={paymentError}
        onComplete={() => {
            setShowPaymentModal(false);
            window.location.href = `/payment-status?orderId=${currentOrderId}`;
        }}
        orderId={currentOrderId || undefined}
      />
    </>
  );
}
