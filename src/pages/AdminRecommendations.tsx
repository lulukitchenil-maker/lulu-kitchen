import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../hooks/useLanguage';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../hooks/useAuth';
import { LogOut } from 'lucide-react';

interface Recommendation {
  id: string;
  customer_name: string;
  email: string;
  rating: number;
  comment: string;
  comment_en: string;
  approved: boolean;
  featured: boolean;
  created_at: string;
}

function AdminRecommendationsContent() {
  const { language } = useLanguage();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  const isHebrew = language === 'he';

  useEffect(() => {
    fetchRecommendations();
  }, []);

  async function fetchRecommendations() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('recommendations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecommendations(data || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateRecommendation(id: string, updates: Partial<Recommendation>) {
    try {
      const { error } = await supabase
        .from('recommendations')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setRecommendations(prev =>
        prev.map(rec => rec.id === id ? { ...rec, ...updates } : rec)
      );
    } catch (error) {
      console.error('Error updating recommendation:', error);
      alert('שגיאה בעדכון ההמלצה');
    }
  }

  async function deleteRecommendation(id: string) {
    if (!confirm('האם אתה בטוח שברצונך למחוק המלצה זו?')) return;

    try {
      const { error } = await supabase
        .from('recommendations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRecommendations(prev => prev.filter(rec => rec.id !== id));
    } catch (error) {
      console.error('Error deleting recommendation:', error);
      alert('שגיאה במחיקת ההמלצה');
    }
  }

  const filteredRecommendations = recommendations.filter(rec => {
    if (filter === 'pending') return !rec.approved;
    if (filter === 'approved') return rec.approved;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">טוען המלצות...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-[#c41e3a]">
              {isHebrew ? 'ניהול המלצות לקוחות' : 'Manage Customer Reviews'}
            </h1>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              <LogOut className="w-5 h-5" />
              {isHebrew ? 'התנתק' : 'Logout'}
            </button>
          </div>

          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                filter === 'all'
                  ? 'bg-[#c41e3a] text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {isHebrew ? `הכל (${recommendations.length})` : `All (${recommendations.length})`}
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                filter === 'pending'
                  ? 'bg-[#c41e3a] text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {isHebrew ? `ממתינות לאישור (${recommendations.filter(r => !r.approved).length})` : `Pending (${recommendations.filter(r => !r.approved).length})`}
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                filter === 'approved'
                  ? 'bg-[#c41e3a] text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {isHebrew ? `מאושרות (${recommendations.filter(r => r.approved).length})` : `Approved (${recommendations.filter(r => r.approved).length})`}
            </button>
          </div>

          {filteredRecommendations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {isHebrew ? 'אין המלצות להצגה' : 'No reviews to display'}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredRecommendations.map((rec) => (
                <div
                  key={rec.id}
                  className={`border rounded-lg p-6 ${
                    rec.approved ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{rec.customer_name}</h3>
                      <p className="text-sm text-gray-600">{rec.email}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(rec.created_at).toLocaleDateString('he-IL')} | {new Date(rec.created_at).toLocaleTimeString('he-IL')}
                      </p>
                      <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        rec.approved ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
                      }`}>
                        {rec.approved ? '✓ מאושר' : '⏳ ממתין לאישור'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {[...Array(rec.rating)].map((_, i) => (
                        <span key={i} className="text-yellow-500 text-xl">★</span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4 space-y-2">
                    {rec.comment && (
                      <div className="bg-white p-4 rounded border">
                        <p className="text-sm text-gray-600 mb-1 font-semibold">בעברית:</p>
                        <p className="text-gray-800">{rec.comment}</p>
                      </div>
                    )}
                    {rec.comment_en && (
                      <div className="bg-white p-4 rounded border">
                        <p className="text-sm text-gray-600 mb-1 font-semibold">English:</p>
                        <p className="text-gray-800">{rec.comment_en}</p>
                      </div>
                    )}
                    {!rec.comment && !rec.comment_en && (
                      <div className="bg-gray-100 p-4 rounded border border-dashed">
                        <p className="text-sm text-gray-500 italic">אין תוכן המלצה</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 flex-wrap">
                    {!rec.approved ? (
                      <button
                        onClick={() => updateRecommendation(rec.id, { approved: true })}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                      >
                        ✓ אשר המלצה
                      </button>
                    ) : (
                      <button
                        onClick={() => updateRecommendation(rec.id, { approved: false })}
                        className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition font-semibold"
                      >
                        ✗ בטל אישור
                      </button>
                    )}

                    <button
                      onClick={() => updateRecommendation(rec.id, { featured: !rec.featured })}
                      className={`px-6 py-2 rounded-lg transition font-semibold ${
                        rec.featured
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                      }`}
                    >
                      {rec.featured ? '★ מוצגת בבולט' : '☆ הפוך למוצגת'}
                    </button>

                    <button
                      onClick={() => deleteRecommendation(rec.id)}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                    >
                      🗑 מחק
                    </button>
                  </div>

                  {rec.approved && (
                    <div className="mt-3 text-sm text-green-700 font-semibold">
                      ✓ המלצה זו מוצגת באתר
                    </div>
                  )}
                  {rec.featured && rec.approved && (
                    <div className="mt-2 text-sm text-purple-700 font-semibold">
                      ★ מוצגת בבולט בדף הבית
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">💡 איך זה עובד?</h3>
          <ul className="space-y-2 text-blue-800">
            <li><strong>📝 קבלת המלצות:</strong> לקוחות שולחים המלצות דרך הטופס באתר</li>
            <li><strong>⏳ ממתין לאישור:</strong> כל ההמלצות מגיעות במצב "ממתין לאישור"</li>
            <li><strong>✓ אישור:</strong> לחץ "אשר המלצה" כדי להפוך אותה לציבורית</li>
            <li><strong>⭐ Featured (מוצגת בבולט):</strong> המלצות מסומנות ב-★ יופיעו בדף הבית</li>
            <li><strong>🗑 מחיקה:</strong> מחק המלצות לא רלוונטיות או ספאם</li>
            <li className="mt-3 pt-3 border-t border-blue-300"><strong>🎯 חשוב:</strong> רק המלצות <u>מאושרות</u> מופיעות באתר. רק המלצות <u>featured</u> מופיעות בדף הבית.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function AdminRecommendations() {
  return (
    <ProtectedRoute>
      <AdminRecommendationsContent />
    </ProtectedRoute>
  );
}
