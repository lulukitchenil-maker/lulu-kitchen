# Streets Import Guide

## Overview

The Lulu Chinese Kitchen website now has a complete delivery area management system with 11 settlements within a 15km radius. The system uses Supabase to store cities and streets data.

## Current Setup

### Delivery Cities (11 settlements)

1. **ירושלים (Jerusalem)** - 5km, Free delivery
2. **מבשרת ציון (Mevaseret Zion)** - 8km, ₪20 delivery fee
3. **אבו גוש (Abu Ghosh)** - 12km, ₪30 delivery fee
4. **מוצא עילית (Moza Illit)** - 10km, ₪25 delivery fee
5. **מוצא תחתית (Moza Tahit)** - 11km, ₪25 delivery fee
6. **מעלה החמישה (Ma'ale HaHamisha)** - 13km, ₪35 delivery fee
7. **קרית יערים (Kiryat Ye'arim)** - 9km, ₪25 delivery fee
8. **אורה (Ora)** - 14km, ₪40 delivery fee
9. **בית זית (Beit Zayit)** - 11km, ₪30 delivery fee
10. **עין ראפה (Ein Rafa)** - 13km, ₪35 delivery fee
11. **עין נקובא (Ein Nakuba)** - 12km, ₪30 delivery fee

### Sample Streets Data

Sample streets have been imported for all 11 cities:
- **Jerusalem**: 30 major streets
- **Other cities**: 10-15 streets each
- **Total**: ~135 sample streets

## Importing Full Streets Data

### Option 1: Use Israeli Government Data (Recommended)

The official Israeli streets database is available at: https://data.gov.il/dataset/321

**Steps:**
1. Download the CSV file from data.gov.il dataset 321
2. Save it to your project directory
3. Run the import script:
   ```bash
   node import-streets.mjs path/to/streets-data.csv
   ```

### Option 2: Generate Sample CSV

Create a sample CSV file to test the import process:

```bash
node import-streets.mjs --sample
```

This creates `sample-streets.csv` with example data you can edit.

### Option 3: Manual SQL Import

Use the provided SQL file:

```bash
# The file sample-streets-data.sql contains INSERT statements
# You can execute this via Supabase dashboard or command line
```

## CSV Format

Your CSV file should have these columns:

```csv
city_name_he,street_name_he,street_name_en,official_code
ירושלים,רחוב הרצל,Herzl Street,12345
ירושלים,רחוב יפו,Jaffa Street,12346
```

**Required columns:**
- `city_name_he` - Hebrew name of the city
- `street_name_he` - Hebrew name of the street

**Optional columns:**
- `street_name_en` - English name of the street
- `official_code` - Government database code

## Database Schema

### cities table
- `id` (uuid) - Primary key
- `name_he` (text) - Hebrew city name
- `name_en` (text) - English city name
- `delivery_enabled` (boolean) - Whether delivery is available
- `distance_km` (numeric) - Distance from restaurant
- `delivery_fee` (integer) - Fee in agorot (100 agorot = 1 shekel)
- `min_order_amount` (integer) - Minimum order in agorot
- `estimated_delivery_minutes` (integer) - Estimated delivery time

### streets table
- `id` (uuid) - Primary key
- `city_id` (uuid) - Foreign key to cities
- `street_name_he` (text) - Hebrew street name
- `street_name_en` (text) - English street name
- `official_code` (text) - Government code
- `search_vector` (tsvector) - For full-text search

### street_synonyms table
- `id` (uuid) - Primary key
- `street_id` (uuid) - Foreign key to streets
- `synonym_name` (text) - Alternative spelling

## Adding New Streets

### Via Supabase Dashboard

1. Go to your Supabase project
2. Navigate to Table Editor
3. Select the `streets` table
4. Click "Insert row"
5. Fill in:
   - Select city from dropdown
   - Enter Hebrew street name
   - (Optional) Enter English name
6. Click "Save"

### Via Import Script

1. Prepare a CSV file with new streets
2. Run: `node import-streets.mjs new-streets.csv`
3. The script will skip duplicates automatically

### Via SQL

```sql
INSERT INTO streets (city_id, street_name_he, street_name_en)
SELECT c.id, 'רחוב החדש', 'New Street'
FROM cities c
WHERE c.name_he = 'ירושלים';
```

## Search Features

The system includes:

- **Autocomplete**: As users type, relevant streets appear
- **Fuzzy Matching**: Using PostgreSQL trigram similarity
- **Hebrew Support**: Full Hebrew text search
- **Fast Performance**: Indexed searches for large datasets

## Expanding Delivery Areas

To add a new city:

1. Insert into cities table:
```sql
INSERT INTO cities (name_he, name_en, distance_km, delivery_fee, min_order_amount, estimated_delivery_minutes)
VALUES ('עיר חדשה', 'New City', 10.0, 2500, 55000, 45);
```

2. Import streets for the new city using the import script

3. The city will automatically appear in the order form dropdown

## Data Sources

### Official Israeli Data
- **data.gov.il** - Dataset 321: רשימת רחובות ישראל
- Updated regularly by Israeli government
- Contains all streets in Israel with official codes

### Alternative Sources
- **SimpleMaps** - Israeli cities database
- **OpenStreetMap** - Community-maintained street data
- **Israeli Central Bureau of Statistics**

## Notes

- Jerusalem alone has 500-1000+ streets
- Sample data provided has ~135 streets across 11 cities
- For production, import full government database
- Free delivery threshold: ₪800
- All delivery settlements are within 15km radius
- System designed to handle large street databases efficiently

## Troubleshooting

**Import fails with "city not found":**
- Check that city names match exactly (Hebrew spelling)
- Cities must exist in the cities table before importing streets

**Duplicates not skipped:**
- The script uses `ON CONFLICT (city_id, street_name_he) DO NOTHING`
- Duplicates are automatically skipped

**Search not working:**
- Check that search_vector is being updated (trigger should handle this)
- Try rebuilding search vectors:
```sql
UPDATE streets
SET search_vector = to_tsvector('simple', street_name_he);
```

## Support

For issues or questions:
- Check the Supabase logs for errors
- Verify database connections in `.env` file
- Review migration files in `supabase/migrations/`
