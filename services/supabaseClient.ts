
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../constants';

// Fix: Cast SUPABASE_URL to string to allow comparison with the placeholder literal, avoiding the TypeScript 'no overlap' error.
if (!SUPABASE_URL || (SUPABASE_URL as string) === 'https://your-project-id.supabase.co') {
  console.warn('Supabase URL belum dikonfigurasi di constants.ts');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
