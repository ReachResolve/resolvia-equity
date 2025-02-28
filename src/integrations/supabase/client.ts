
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://cllkqwxulrxhrbigegia.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsbGtxd3h1bHJ4aHJiaWdlZ2lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3Njg4MDcsImV4cCI6MjA1NjM0NDgwN30.ynHN2LAFLjt6GfLckWtIH50ovZP28ftpot6ADW_0JEk";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
