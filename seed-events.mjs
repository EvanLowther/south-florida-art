import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://tljdveakivsljwbpwmcw.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY environment variable is required.');
  console.error('');
  console.error('Get it from your Supabase dashboard:');
  console.error('  Project Settings → API → service_role key');
  console.error('');
  console.error('Then run:');
  console.error('  SUPABASE_SERVICE_ROLE_KEY=eyJ... node seed-events.mjs');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const images = [
  { file: 'src/assets/images/SpringShowcase1.jpg', name: 'miami-beach-spring-showcase.jpg' },
  { file: 'src/assets/images/WinterShowcase1.jpg', name: 'miami-beach-holiday-showcase.jpg' },
  { file: 'src/assets/images/BOB1.jpg', name: 'fiu-battle-of-the-bands.jpg' },
  { file: 'src/assets/images/makerfair.jpg', name: 'maker-faire-miami.jpg' },
  { file: 'src/assets/images/YMF1.jpeg', name: 'miami-beach-youth-music-festival.jpg' },
  { file: 'src/assets/images/south-dade.jpg', name: 'south-dade-youth-music-festival.jpg' },
  { file: 'src/assets/images/miami-gardens.jpg', name: 'miami-gardens-youth-music-festival.jpg' },
];

async function uploadAll() {
  const root = resolve(__dirname);

  for (const img of images) {
    const filePath = resolve(root, img.file);
    let fileBuffer;
    try {
      fileBuffer = readFileSync(filePath);
    } catch {
      console.error(`  File not found: ${filePath}`);
      continue;
    }

    const contentType = img.file.endsWith('.jpeg') ? 'image/jpeg' : 'image/jpeg';

    console.log(`Uploading ${img.name}...`);

    const { error } = await supabase.storage
      .from('event-images')
      .upload(img.name, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error(`  Error uploading ${img.name}:`, error.message);
    } else {
      console.log(`  ✓ Uploaded successfully`);
    }
  }

  console.log('');
  console.log('Done! Check the admin panel to verify.');
}

uploadAll().catch(console.error);
