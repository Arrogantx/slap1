import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ksmvmvwokwuycwpxqraq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzbXZtdndva3d1eWN3cHhxcmFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkwNDI2MTEsImV4cCI6MjA1NDYxODYxMX0.1gQiVzaR9KAyM_dYzwrrcc4AfvYZILNxI8Wt32ut2M4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)