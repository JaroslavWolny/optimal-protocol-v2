import { createClient } from '@supabase/supabase-js';

// For immediate deployment stability, we are using the provided credentials directly.
// In a production enterprise environment, these should be kept in environment variables.
const supabaseUrl = "https://ucywcjpunougqrjfaqbf.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjeXdjanB1bm91Z3FyamZhcWJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0NzY5MTMsImV4cCI6MjA4MDA1MjkxM30.IpCbxkFMzmhwTvi2zDuDB8o4oT9A5Z7Tss5_82e_xYo";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
