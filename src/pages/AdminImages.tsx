import { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, Trash2, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { uploadMenuImage, deleteMenuImage, validateImageFile } from '../lib/imageUpload';
import ProtectedRoute from '../components/ProtectedRoute';

interface MenuItem {
  id: number;
  name_he: string;
  name_en: string;
  image: string;
}

function AdminImagesContent() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    const { data, error } = await supabase
      .from('menu_items')
      .select('id, name_he, name_en, image')
      .order('name_he');

    if (!error && data) {
      setMenuItems(data);
    }
    setLoading(false);
  };

  const handleImageUpload = async (itemId: number, file: File) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setMessage({ type: 'error', text: validation.error || 'שגיאה בקובץ' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setUploading(itemId);
    setMessage(null);

    const result = await uploadMenuImage(file, itemId.toString());

    if (result.success && result.url) {
      const { error } = await supabase
        .from('menu_items')
        .update({ image: result.url })
        .eq('id', itemId);

      if (!error) {
        setMessage({ type: 'success', text: 'התמונה הועלתה בהצלחה!' });
        fetchMenuItems();
      } else {
        setMessage({ type: 'error', text: 'שגיאה בעדכון הנתונים' });
      }
    } else {
      setMessage({ type: 'error', text: result.error || 'שגיאה בהעלאת התמונה' });
    }

    setUploading(null);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleImageDelete = async (itemId: number, imageUrl: string) => {
    if (!confirm('האם למחוק את התמונה?')) return;

    const success = await deleteMenuImage(imageUrl);

    if (success) {
      await supabase
        .from('menu_items')
        .update({ image: '' })
        .eq('id', itemId);

      setMessage({ type: 'success', text: 'התמונה נמחקה בהצלחה!' });
      fetchMenuItems();
    } else {
      setMessage({ type: 'error', text: 'שגיאה במחיקת התמונה' });
    }

    setTimeout(() => setMessage(null), 3000);
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
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-8">
            <ImageIcon className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900">ניהול תמונות מנות</h1>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 border-2 border-green-500' : 'bg-red-100 border-2 border-red-500'}`}>
              <div className="flex items-center gap-2">
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-700" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-700" />
                )}
                <p className={`font-semibold ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                  {message.text}
                </p>
              </div>
            </div>
          )}

          <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <h3 className="font-bold text-blue-900 mb-2">הוראות שימוש:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>1. וודא שיצרת bucket בשם <code className="bg-blue-200 px-1 rounded">menu-images</code> ב-Supabase Storage</li>
              <li>2. הבucket צריך להיות Public</li>
              <li>3. העלה תמונות בגודל עד 5MB (JPG, PNG, WEBP)</li>
              <li>4. התמונות יישמרו אוטומטית ב-Supabase</li>
            </ul>
          </div>

          <div className="grid gap-4">
            {menuItems.map((item) => (
              <div key={item.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-red-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {item.image ? (
                      <div className="relative group">
                        <img
                          src={item.image}
                          alt={item.name_he}
                          className="w-24 h-24 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/150?text=No+Image';
                          }}
                        />
                        <button
                          onClick={() => handleImageDelete(item.id, item.image)}
                          className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex-grow">
                    <h3 className="font-bold text-lg">{item.name_he}</h3>
                    <p className="text-gray-600 text-sm mb-2">{item.name_en}</p>

                    {item.image && (
                      <a
                        href={item.image}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1 mb-2"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span className="truncate max-w-md">{item.image}</span>
                      </a>
                    )}

                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer transition-colors">
                      {uploading === item.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          <span className="text-sm font-semibold">מעלה...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span className="text-sm font-semibold">
                            {item.image ? 'החלף תמונה' : 'העלה תמונה'}
                          </span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        disabled={uploading === item.id}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImageUpload(item.id, file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminImages() {
  return (
    <ProtectedRoute>
      <AdminImagesContent />
    </ProtectedRoute>
  );
}
