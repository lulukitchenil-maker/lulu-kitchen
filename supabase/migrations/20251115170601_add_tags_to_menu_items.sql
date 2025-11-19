/*
  # Add tags field to menu_items table

  ## Changes
  1. Add `tags` column to menu_items table
     - JSONB array format: [{"text_he": "חסכוני", "text_en": "Budget", "color": "yellow"}]
     - Allows multiple custom tags per item
     - Each tag has Hebrew text, English text, and color
     - Color options: "green", "yellow", "red", "blue", "purple", "orange"
  
  ## Tag Structure
  - text_he: Hebrew label (e.g., "חסכוני ומיוחד")
  - text_en: English label (e.g., "Budget Special")
  - color: Badge color (green/yellow/red/blue/purple/orange)
  - position: Optional position ("top-left", "top-right", "bottom-left", "bottom-right")
*/

-- Add tags column to menu_items table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'menu_items' AND column_name = 'tags'
  ) THEN
    ALTER TABLE menu_items 
    ADD COLUMN tags JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Add comment explaining the structure
COMMENT ON COLUMN menu_items.tags IS 'Array of tag objects with structure: [{"text_he": "חסכוני", "text_en": "Budget", "color": "yellow", "position": "top-left"}]';
