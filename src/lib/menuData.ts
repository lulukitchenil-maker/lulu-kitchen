import { supabase } from './supabase';
import type { MenuItem } from '../types';

export async function fetchMenuFromCSV() {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error loading menu:', error)
    return []
  }

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
  })
}
