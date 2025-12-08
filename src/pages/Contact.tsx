import { Phone, Mail, MessageCircle, MapPin, Clock } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { submitContact } from '../lib/api';
import ColorfulText from '../components/ColorfulText';

export default function Contact() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    preferredDate: '',
    preferredTime: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const phoneNumber = '052-520-1978';
  const whatsappNumber = '972525201978';
  const email = 'lulu.kitchen.il@gmail.com';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const result = await submitContact({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        preferred_date: formData.preferredDate,
        preferred_time: formData.preferredTime,
        message: formData.message,
      });

      if (result.success) {
        setSubmitted(true);
        setFormData({
          name: '',
          phone: '',
          email: '',
          preferredDate: '',
          preferredTime: '',
          message: '',
        });
      } else {
        alert(result.error || t('שגיאה בשליחה', 'Error sending message'));
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      alert(t('שגיאה בשליחה', 'Error sending message'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-chinese-red via-chinese-darkRed to-chinese-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('צור קשר', 'Contact Us')}
          </h1>
          <p className="text-xl text-chinese-lightGold">
            {t('נשמח לשמוע מכם ולעזור עם כל שאלה או הזמנה', 'We\'d love to hear from you and help with any question or order')}
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <h2 className="text-3xl font-bold gradient-text">
                {t('פרטי התקשרות', 'Contact Details')}
              </h2>

              <div className="space-y-6">
                <div className="bg-gradient-to-br from-white to-chinese-lightGold p-6 rounded-2xl shadow-lg">
                  <div className="flex items-center mb-3">
                    <Phone className="w-6 h-6 text-chinese-red ml-3" />
                    <h3 className="text-xl font-bold text-chinese-black">
                      {t('טלפון', 'Phone')}
                    </h3>
                  </div>
                  <p className="text-lg mb-2">{phoneNumber}</p>
                  <p className="text-sm text-gray-600 mb-4">
                    {t("זמין א'-ה' 10:00-22:00", 'Available Sun-Thu 10:00-22:00')}
                  </p>
                  <a
                    href={`tel:${phoneNumber}`}
                    className="inline-block bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
                  >
                    {t('התקשר', 'Call')}
                  </a>
                </div>

                <div className="bg-gradient-to-br from-white to-chinese-lightGold p-6 rounded-2xl shadow-lg">
                  <div className="flex items-center mb-3">
                    <Mail className="w-6 h-6 text-chinese-red ml-3" />
                    <h3 className="text-xl font-bold text-chinese-black">
                      {t('אימייל', 'Email')}
                    </h3>
                  </div>
                  <p className="text-lg mb-2">{email}</p>
                  <p className="text-sm text-gray-600 mb-4">
                    {t('מענה תוך 24 שעות', 'Response within 24 hours')}
                  </p>
                  <a
                    href={`mailto:${email}`}
                    className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
                  >
                    {t('שלח מייל', 'Send Email')}
                  </a>
                </div>

                <div className="bg-gradient-to-br from-white to-chinese-lightGold p-6 rounded-2xl shadow-lg">
                  <div className="flex items-center mb-3">
                    <MessageCircle className="w-6 h-6 text-chinese-red ml-3" />
                    <h3 className="text-xl font-bold text-chinese-black">
                      {t('ווטסאפ', 'WhatsApp')}
                    </h3>
                  </div>
                  <p className="text-lg mb-2">{phoneNumber}</p>
                  <p className="text-sm text-gray-600 mb-4">
                    {t('מענה מהיר ונוח', 'Fast and convenient response')}
                  </p>
                  <a
                    href={`https://api.whatsapp.com/send?phone=${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
                  >
                    {t('ווטסאפ', 'WhatsApp')}
                  </a>
                </div>

                <div className="bg-gradient-to-br from-white to-chinese-lightGold p-6 rounded-2xl shadow-lg">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <MapPin className="w-6 h-6 text-chinese-red ml-3" />
                      <div>
                        <h3 className="text-lg font-bold text-chinese-black">
                          {t('אזור משלוחים', 'Delivery Area')}
                        </h3>
                        <p className="text-gray-700">{t('ירושלים והסביבה', 'Jerusalem and surroundings')}</p>
                        <p className="text-sm text-gray-600">{t('משלוח חינם מעל ₪800', 'Free delivery over ₪800')}</p>
                      </div>
                    </div>

                    <div className="flex items-center pt-3 border-t border-gray-200">
                      <Clock className="w-6 h-6 text-chinese-red ml-3" />
                      <div>
                        <h3 className="text-lg font-bold text-chinese-black">
                          {t('שעות משלוחים', 'Delivery Hours')}
                        </h3>
                        <p className="text-gray-700">{t("א'-ה': 13:00-21:00", 'Sun-Thu: 13:00-21:00')}</p>
                        <p className="text-gray-700">{t("ו': 13:00-15:00", 'Fri: 13:00-15:00')}</p>
                        <p className="text-gray-700">{t("ש': סגור", 'Sat: Closed')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-chinese-red to-chinese-darkRed text-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold mb-4">
                  {t('דרכי התקשרות מהירות', 'Quick Contact')}
                </h3>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={`tel:${phoneNumber}`}
                    className="flex-1 min-w-[140px] bg-white text-chinese-red px-4 py-3 rounded-lg font-semibold text-center hover:bg-gray-100 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Phone className="w-5 h-5" />
                    {t('התקשר עכשיו', 'Call Now')}
                  </a>
                  <a
                    href={`https://api.whatsapp.com/send?phone=${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-w-[140px] bg-green-600 text-white px-4 py-3 rounded-lg font-semibold text-center hover:bg-green-700 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    {t('ווטסאפ', 'WhatsApp')}
                  </a>
                  <a
                    href={`mailto:${email}`}
                    className="flex-1 min-w-[140px] bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold text-center hover:bg-blue-700 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Mail className="w-5 h-5" />
                    {t('שלח מייל', 'Send Email')}
                  </a>
                </div>
              </div>

              <div className="bg-chinese-lightGold p-6 rounded-2xl border-2 border-chinese-gold">
                <h3 className="text-xl font-bold text-chinese-black mb-2">
                  {t('הזמנות מראש', 'Order in Advance')}
                </h3>
                <p className="text-gray-700">
                  {t(
                    'עדיף להזמין יום מראש כי לוקח זמן להכין את האוכל כי הכל מוכן טרי ובזמן ההזמנה',
                    'Better to order a day in advance as it takes time to prepare the food because everything is made fresh at the time of order'
                  )}
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-center">
                <ColorfulText text={t('שלחו לנו הודעה', 'Send us a Message')} />
              </h2>

              {submitted ? (
                <div className="bg-green-50 border-2 border-green-500 rounded-xl p-8 text-center">
                  <div className="text-green-600 text-5xl mb-4">✓</div>
                  <h3 className="text-2xl font-bold text-green-700 mb-2">
                    {t('תודה רבה!', 'Thank you!')}
                  </h3>
                  <p className="text-gray-700">
                    {t('הודעתכם התקבלה ונחזור אליכם בהקדם', 'Your message has been received and we will get back to you soon')}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('שם מלא', 'Full Name')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-chinese-red"
                      placeholder={t('הכניסו את שמכם המלא', 'Enter your full name')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('טלפון', 'Phone')} *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-chinese-red"
                      placeholder="050-123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('אימייל', 'Email')}
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-chinese-red"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t('תאריך הזמנה מועדף', 'Preferred Order Date')}
                      </label>
                      <input
                        type="date"
                        value={formData.preferredDate}
                        onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-chinese-red"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t('שעה מועדפת', 'Preferred Time')}
                      </label>
                      <input
                        type="time"
                        value={formData.preferredTime}
                        onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-chinese-red"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('הודעה', 'Message')} *
                    </label>
                    <textarea
                      required
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-chinese-red"
                      placeholder={t(
                        'ספרו לנו על ההזמנה שלכם, העדפות מיוחדות או כל שאלה אחרת...',
                        'Tell us about your order, special preferences or any other question...'
                      )}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-chinese-red text-white py-4 rounded-lg font-semibold hover:bg-chinese-darkRed transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? t('שולח...', 'Sending...') : t('שלח הודעה', 'Send Message')}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
