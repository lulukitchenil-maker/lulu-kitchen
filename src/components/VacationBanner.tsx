import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../hooks/useLanguage';

interface VacationSettings {
  id: number;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  message_he: string;
  message_en: string;
}

export default function VacationBanner() {
  const { language } = useLanguage();
  const [vacation, setVacation] = useState<VacationSettings | null>(null);

  useEffect(() => {
    fetchVacationSettings();
  }, []);

  const fetchVacationSettings = async () => {
    const { data, error } = await supabase
      .from('vacation_settings')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();

    if (!error && data) {
      setVacation(data);
    }
  };

  if (!vacation || !vacation.is_active) {
    return null;
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const message = language === 'he' ? vacation.message_he : vacation.message_en;
  const dateRange = vacation.start_date && vacation.end_date
    ? `${formatDate(vacation.start_date)} - ${formatDate(vacation.end_date)}`
    : '';

  return (
    <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black py-3 px-4 shadow-lg">
      <div className="container mx-auto flex items-center justify-center gap-3">
        <AlertCircle className="w-6 h-6 flex-shrink-0" />
        <div className="text-center">
          <p className="font-bold text-lg">{message}</p>
          {dateRange && (
            <p className="text-sm font-semibold">{dateRange}</p>
          )}
        </div>
      </div>
    </div>
  );
}
