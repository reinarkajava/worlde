import { createClient } from '@supabase/supabase-js';

// ASENDA need väärtused oma Supabase seadetest leitud koodidega!
const supabaseUrl = 'https://dfdtssxmcahcytdwvnjf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmZHRzc3htY2FoY3l0ZHd2bmpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5NzY3NTgsImV4cCI6MjA4ODU1Mjc1OH0.LY0bofvug0poaBoOqHIO0iJo-Mn_vWmRzdCc7JPJg4g';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);