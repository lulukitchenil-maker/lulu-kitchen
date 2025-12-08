import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function uploadImages() {
  const imagesDir = './menu-images'; // תיקייה מקומית עם תמונות
  const files = readdirSync(imagesDir);

  console.log(`Found ${files.length} images to upload...`);

  for (const file of files) {
    try {
      const filePath = join(imagesDir, file);
      const fileData = readFileSync(filePath);
      const contentType = file.endsWith('.png') ? 'image/png' : 'image/jpeg';

      const { data, error } = await supabase.storage
        .from('menu-images')
        .upload(file, fileData, {
          contentType,
          upsert: true
        });

      if (error) {
        console.error(`❌ Failed to upload ${file}:`, error.message);
      } else {
        const publicUrl = supabase.storage
          .from('menu-images')
          .getPublicUrl(file).data.publicUrl;

        console.log(`✅ Uploaded: ${file}`);
        console.log(`   URL: ${publicUrl}`);
      }
    } catch (err) {
      console.error(`❌ Error with ${file}:`, err.message);
    }
  }

  console.log('\n✅ Upload complete!');
}

uploadImages();
