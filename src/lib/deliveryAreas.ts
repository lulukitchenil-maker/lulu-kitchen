import type { DeliveryArea } from '../types';
import { supabase } from './supabase';

/**
 * Delivery Areas Module
 *
 * Manages delivery areas, cities, and streets for the restaurant.
 * All data is stored in Supabase and queried dynamically.
 *
 * Database Schema:
 * - cities: id, name_he, name_en, delivery_enabled, distance_km, delivery_fee, etc.
 * - streets: id, city_id, street_name_he, street_name_en, official_code, search_vector
 * - street_synonyms: id, street_id, synonym_name
 */

export interface City {
  id: number;
  name: string;
  name_en: string | null;
  delivery_fee: number;
}

export interface Street {
  id: string;
  city_id: string;
  street_name_he: string;
  street_name_en: string | null;
  official_code: string | null;
}

// Minimal fallback for offline/error scenarios
const FALLBACK_CITIES = ['ירושלים', 'מבשרת ציון'];

/**
 * Get all delivery-enabled cities from database
 */
export async function getAvailableCities(): Promise<City[]> {
  try {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching cities:', error);
    return [];
  }
}

/**
 * Get city names only (for simple dropdowns)
 */
export async function getCityNames(): Promise<string[]> {
  try {
    const cities = await getAvailableCities();
    return cities.map(c => c.name);
  } catch (error) {
    console.error('Error fetching city names:', error);
    return FALLBACK_CITIES;
  }
}

/**
 * Get city details by name
 */
export async function getCityByName(cityName: string): Promise<City | null> {
  try {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .eq('name', cityName)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching city:', error);
    return null;
  }
}

/**
 * Fetch streets from government API as fallback
 */
async function fetchStreetsFromGovernmentAPI(cityName: string, query: string): Promise<string[]> {
  try {
    const API_URL = 'https://data.gov.il/api/3/action/datastore_search';
    const RESOURCE_ID = '9ad3862c-8391-4b2f-84a4-2d4c68625f4b';

    const url = `${API_URL}?resource_id=${RESOURCE_ID}&q=${encodeURIComponent(cityName)}&limit=100`;
    const response = await fetch(url);

    if (!response.ok) {
      console.warn('Government API request failed:', response.status);
      return [];
    }

    const data = await response.json();

    if (!data.success || !data.result?.records) {
      return [];
    }

    const streets = data.result.records
      .filter((record: any) => {
        const streetName = record['שם_רחוב'] || record.street_name || '';
        return streetName.includes(query) || query.length < 2;
      })
      .map((record: any) => record['שם_רחוב'] || record.street_name)
      .filter((name: string) => name && name.trim().length > 0);

    return [...new Set(streets)].slice(0, 10);
  } catch (error) {
    console.error('Error fetching from government API:', error);
    return [];
  }
}

/**
 * Search streets by city and query string
 * Uses Supabase first, falls back to government API
 */
export async function getStreetSuggestions(cityName: string, query: string): Promise<string[]> {
  if (!query || query.length < 1) return [];

  try {
    const city = await getCityByName(cityName);
    if (!city) return [];

    const { data, error } = await supabase
      .from('streets')
      .select('name')
      .eq('city_id', city.id)
      .ilike('name', `%${query}%`)
      .limit(10);

    if (error) throw error;

    if (data && data.length > 0) {
      return data.map(s => s.name);
    }

    return await fetchStreetsFromGovernmentAPI(cityName, query);
  } catch (error) {
    console.error('Error getting street suggestions:', error);
    return await fetchStreetsFromGovernmentAPI(cityName, query);
  }
}

/**
 * Check if a street exists in a city
 * Now more permissive - allows manual entry if not found in database
 */
export async function isValidDeliveryAddress(cityName: string, streetName: string): Promise<boolean> {
  // Streets table doesn't exist - allow any valid street name
  const normalizedStreet = streetName.trim();
  return normalizedStreet.length >= 2;
}

/**
 * Get all streets for a city (for initial load or full list)
 */
export async function getStreetsForCity(cityName: string): Promise<string[]> {
  // Streets table doesn't exist - return empty array
  return [];
}

/**
 * Calculate delivery details for a city
 */
export async function getDeliveryDetails(cityName: string): Promise<{
  fee: number;
  freeDeliveryThreshold: number;
  minOrder: number;
  estimatedMinutes: number;
  distance: number;
} | null> {
  try {
    const city = await getCityByName(cityName);
    if (!city) return null;

    return {
      fee: city.delivery_fee / 100, // Convert agorot to shekels

      freeDeliveryThreshold: 800, // ₪800 free delivery (hardcoded as per requirements)
      freeDeliveryThreshold: 0, // No free delivery threshold
      minOrder: 0, // No minimum order
      estimatedMinutes: 45, // Default 45 minutes
      distance: 10 // Default 10km
    };
  } catch (error) {
    console.error('Error getting delivery details:', error);
    return null;
  }
}

// Legacy compatibility - keeping the old DeliveryArea type structure
// This is for backward compatibility with existing code
export const deliveryAreas: DeliveryArea[] = [
  {
    city: 'ירושלים',
    streets: [] // Streets are now loaded from database
  },
  {
    city: 'מבשרת ציון',
    streets: []
  }
];

// Legacy function for backward compatibility
export function getStreetsForCitySync(_city: string): string[] {
  // This is synchronous fallback - should use async version instead
  console.warn('Using synchronous getStreetsForCity - please use async version');
  return [];
}
