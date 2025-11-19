import { Phone, Mail, MessageCircle, MapPin, Clock } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

export default function Footer() {
  const { t } = useLanguage();

  const phoneNumber = '052-520-1978';
  const email = 'lulu.kitchen.il@gmail.com';

  return (
    <footer className="bg-chinese-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-chinese-red to-chinese-gold rounded-full flex items-center justify-center">
                <span className="text-white font-bold">לולו</span>
              </div>
              <h3 className="text-xl font-bold text-chinese-gold">
                {t('המטבח הסיני של לולו', "Lulu's Chinese Kitchen")}
              </h3>
            </div>
            <p className="text-gray-300 leading-relaxed">
              {t(
                'אוכל סיני אותנטי מוכן טרי בזמן ההזמנה. עדיף להזמין יום מראש.',
                'Authentic Chinese food made fresh when ordered. Better to order a day in advance.'
              )}
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-chinese-gold">
              {t('פרטי התקשרות', 'Contact Details')}
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-chinese-red" />
                  <span>{phoneNumber}</span>
                </div>
                <a
                  href={`tel:${phoneNumber}`}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm transition-colors duration-200 transform hover:scale-105"
                >
                  {t('התקשר', 'Call')}
                </a>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-chinese-red" />
                  <span className="text-sm">{email}</span>
                </div>
                <a
                  href={`mailto:${email}`}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm transition-colors duration-200 transform hover:scale-105"
                >
                  {t('מייל', 'Email')}
                </a>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MessageCircle className="w-5 h-5 text-chinese-red" />
                  <span>{phoneNumber}</span>
                </div>
                <a
                  href={`https://wa.me/972${phoneNumber.replace(/-/g, '').substring(1)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm transition-colors duration-200 transform hover:scale-105"
                >
                  {t('ווטסאפ', 'WhatsApp')}
                </a>
              </div>

              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-chinese-red" />
                <span>{t('ירושלים והסביבה', 'Jerusalem and surroundings')}</span>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-chinese-red" />
                <span>{t("א'-ה' 10:00-22:00", 'Sun-Thu 10:00-22:00')}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-chinese-gold">
              {t('אמצעי תשלום', 'Payment Methods')}
            </h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">₪</span>
                </div>
                <span>{t('מזומן', 'Cash')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">bit</span>
                </div>
                <span>{t('ביט', 'Bit')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">PB</span>
                </div>
                <span>{t('פייבוקס', 'Paybox')}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-700">
              <h5 className="text-sm font-semibold text-chinese-gold mb-3">
                {t('התקשרות מהירה', 'Quick Contact')}
              </h5>
              <div className="flex space-x-2">
                <a
                  href={`tel:${phoneNumber}`}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg text-sm transition-colors duration-200 flex items-center justify-center space-x-1"
                >
                  <Phone className="w-4 h-4" />
                  <span>{t('חייג', 'Call')}</span>
                </a>
                <a
                  href={`https://wa.me/972${phoneNumber.replace(/-/g, '').substring(1)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm transition-colors duration-200 flex items-center justify-center space-x-1"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{t('ווטסאפ', 'WhatsApp')}</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
            <div className="flex gap-6 text-sm">
              <a
                href="/accessibility"
                className="text-gray-300 hover:text-chinese-gold transition-colors duration-200"
              >
                {t('נגישות', 'Accessibility')}
              </a>
              <a
                href="/terms"
                className="text-gray-300 hover:text-chinese-gold transition-colors duration-200"
              >
                {t('תקנון האתר', 'Terms of Use')}
              </a>
              <a
                href="/contact"
                className="text-gray-300 hover:text-chinese-gold transition-colors duration-200"
              >
                {t('צור קשר', 'Contact')}
              </a>
            </div>
          </div>
          <p className="text-gray-400 text-center text-sm">
            {t(
              '© 2025 המטבח הסיני של לולו. כל הזכויות שמורות.',
              "© 2025 Lulu's Chinese Kitchen. All rights reserved."
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}
