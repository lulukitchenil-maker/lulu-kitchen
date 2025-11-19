import { MessageCircle } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

export default function WhatsAppButton() {
  const { t } = useLanguage();
  const whatsappNumber = '972525201978';
  const message = encodeURIComponent(
    t(
      'שלום! אני מעוניין להזמין מהמטבח הסיני של לולו',
      'Hello! I would like to order from Lulu Chinese Kitchen'
    )
  );

  return (
    <a
      href={`https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 group"
      aria-label={t('שלח הודעת WhatsApp', 'Send WhatsApp message')}
    >
      <MessageCircle className="w-6 h-6" />
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {t('שלח הודעה בוואטסאפ', 'Send WhatsApp message')}
      </span>
    </a>
  );
}
