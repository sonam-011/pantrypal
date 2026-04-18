import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://rbidgzvoabkptytcjatf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiaWRnenZvYWJrcHR5dGNqYXRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwOTM4NzYsImV4cCI6MjA5MTY2OTg3Nn0.KDxCI2IwBQb2o098wkbeQHH9TR9NNfI1chBQaZrFIN0'



export const supabase = createClient(supabaseUrl, supabaseKey)