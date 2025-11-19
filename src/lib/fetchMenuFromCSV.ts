import type { MenuItem } from '../types';
import { supabase } from './supabase';

const CACHE_KEY = 'menu_items_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 דקות

interface CachedData {
  items: MenuItem[];
  timestamp: number;
}

export async function fetchMenuFromCSV(): Promise<MenuItem[]> {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const { items, timestamp }: CachedData = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL) {
          fetchMenuFromSupabase().then(items => {
            if (items.length > 0) {
              localStorage.setItem(
                CACHE_KEY,
                JSON.stringify({ items, timestamp: Date.now() })
              );
            }
          }).catch(err => console.error('Background refresh failed:', err));
          return items;
        }
      } catch (e) {
        console.error('Cache parse error:', e);
      }
    }

    const items = await fetchMenuFromSupabase();
    if (items.length > 0) {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ items, timestamp: Date.now() })
      );
      return items;
    }

    return [];
  } catch (error) {
    console.error('Error fetching menu:', error);
    return [];
  }
}

async function fetchMenuFromSupabase(): Promise<MenuItem[]> {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;

    return (data || []).map(item => {
      let tags = [];
      if (item.tags) {
        try {
          tags = typeof item.tags === 'string' ? JSON.parse(item.tags) : item.tags;
        } catch (e) {
          tags = [];
        }
      }

      return {
        id: item.id,
        name_he: item.name_he,
        name_en: item.name_en,
        description_he: item.description_he || '',
        description_en: item.description_en || '',
        price: item.price || 0,
        category: item.category_en?.toLowerCase() || 'other',
        category_he: item.category_he || '',
        category_en: item.category_en || '',
        image_url: item.image_url || '',
        is_vegetarian: item.vegetarian === true || item.vegetarian === 'כן',
        is_vegan: item.vegan === true || item.vegan === 'כן',
        available: item.availability_status !== 'לא זמין',
        sort_order: item.display_order || 0,
        spice_level: item.spice_level || '',
        tags: tags
      };
    });
  } catch (error) {
    console.error('Error fetching from Supabase:', error);
    return [];
  }
}
