import { useEffect, useState } from 'react';
import { Calendar, Save, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ProtectedRoute from '../components/ProtectedRoute';

interface VacationSettings {
  id: number;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  message_he: string;
  message_en: string;
}

function AdminVacationContent() {
  const [vacation, setVacation] = useState<VacationSettings>({
    id: 0,
    is_active: false,
    start_date: null,
    end_date: null,
    message_he: 'העסק סגור לחופשה',
    message_en: 'Business closed for vacation'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchVacationSettings();
  }, []);

  const fetchVacationSettings = async () => {
    const { data, error } = await supabase
      .from('vacation_settings')
      .select('*')
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      setVacation(data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('vacation_settings')
        .upsert({
          id: vacation.id || undefined,
          is_active: vacation.is_active,
          start_date: vacation.start_date,
          end_date: vacation.end_date,
          message_he: vacation.message_he,
          message_en: vacation.message_en
        }, {
          onConflict: 'id'
        });

      if (error) throw error;

      setMessage('ההגדרות נשמרו בהצלחה!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving vacation settings:', error);
      setMessage('שגיאה בשמירת ההגדרות');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-8">
            <Calendar className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900">ניהול חופשה</h1>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${message.includes('שגיאה') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <p className="font-semibold">{message}</p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* סטטוס פעיל/לא פעיל */}
            <div className="border-2 border-gray-200 rounded-lg p-6">
              <label className="flex items-center gap-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={vacation.is_active}
                  onChange={(e) => setVacation({ ...vacation, is_active: e.target.checked })}
                  className="w-6 h-6 text-red-600 rounded focus:ring-red-500"
                />
                <div>
                  <p className="text-xl font-bold text-gray-900">הפעל מצב חופשה</p>
                  <p className="text-sm text-gray-600">כאשר מופעל, יוצג Banner בראש האתר</p>
                </div>
              </label>
            </div>

            {/* תאריכים */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  תאריך התחלה
                </label>
                <input
                  type="date"
                  value={vacation.start_date || ''}
                  onChange={(e) => setVacation({ ...vacation, start_date: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  תאריך סיום
                </label>
                <input
                  type="date"
                  value={vacation.end_date || ''}
                  onChange={(e) => setVacation({ ...vacation, end_date: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            {/* הודעות */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                הודעה בעברית
              </label>
              <textarea
                value={vacation.message_he}
                onChange={(e) => setVacation({ ...vacation, message_he: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                placeholder="העסק סגור לחופשה"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                הודעה באנגלית
              </label>
              <textarea
                value={vacation.message_en}
                onChange={(e) => setVacation({ ...vacation, message_en: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                placeholder="Business closed for vacation"
              />
            </div>

            {/* תצוגה מקדימה */}
            {vacation.is_active && (
              <div className="border-2 border-yellow-400 rounded-lg p-6 bg-gradient-to-r from-yellow-50 to-orange-50">
                <p className="text-sm font-bold text-gray-700 mb-3">תצוגה מקדימה:</p>
                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black py-3 px-4 rounded-lg">
                  <div className="flex items-center justify-center gap-3">
                    <AlertCircle className="w-6 h-6 flex-shrink-0" />
                    <div className="text-center">
                      <p className="font-bold text-lg">{vacation.message_he}</p>
                      {vacation.start_date && vacation.end_date && (
                        <p className="text-sm font-semibold">
                          {new Date(vacation.start_date).toLocaleDateString('he-IL')} - {new Date(vacation.end_date).toLocaleDateString('he-IL')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* כפתור שמירה */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-4 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>שומר...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>שמור הגדרות</span>
                </>
              )}
            </button>
          </div>

          {/* הוראות שימוש */}
          <div className="mt-8 p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
            <h3 className="font-bold text-lg text-blue-900 mb-3">איך זה עובד?</h3>
            <ol className="space-y-2 text-sm text-blue-800">
              <li><strong>1.</strong> סמן "הפעל מצב חופשה" כדי להפעיל</li>
              <li><strong>2.</strong> בחר תאריכי התחלה וסיום</li>
              <li><strong>3.</strong> התאם את ההודעה לפי הצורך</li>
              <li><strong>4.</strong> לחץ "שמור הגדרות"</li>
              <li><strong>5.</strong> Banner צהוב יופיע בראש האתר לכל המבקרים</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminVacation() {
  return (
    <ProtectedRoute>
      <AdminVacationContent />
    </ProtectedRoute>
  );
}
