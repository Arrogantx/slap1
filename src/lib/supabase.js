import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://foaxtmezoweywpwftvlq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvYXh0bWV6b3dleXdwd2Z0dmxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0MjE3MzQsImV4cCI6MjA1NTk5NzczNH0.oy8zw-qps9Ok_jY5K0DxhGb1SGHgnBjWApZKfA6GFHI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)