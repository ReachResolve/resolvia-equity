// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://cllkqwxulrxhrbigegia.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsbGtxd3h1bHJ4aHJiaWdlZ2lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3Njg4MDcsImV4cCI6MjA1NjM0NDgwN30.ynHN2LAFLjt6GfLckWtIH50ovZP28ftpot6ADW_0JEk";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);