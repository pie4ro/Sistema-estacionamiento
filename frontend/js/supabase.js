const SUPABASE_URL = "https://wmguxwalpztndjlsyvoz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZ3V4d2FscHp0bmRqbHN5dm96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2NjIwMDUsImV4cCI6MjA5NzIzODAwNX0.46qtK6XRESj0I5DX_eVrUaDOQEOA9lT-mQrEheqgcbY";

const supabaseClient = supabase.createClient(
    SUPABASE_URL, 
    SUPABASE_ANON_KEY
);