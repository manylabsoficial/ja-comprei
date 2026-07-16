import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wnpskvbjkueczoshtiox.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InducHNrdmJqa3VlY3pvc2h0aW94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NjczODYsImV4cCI6MjA4MzU0MzM4Nn0.TAccUdTdvEpGo7x6PSnL0dl_D3dRT50CpvYLNcvEnZ4'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function test() {
    console.log('Testing connection...')
    // Try to get some public metadata or just sign in with a fake user to see the exact error
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123'
    })

    if (error) {
        console.error('Error fetching:', error)
    } else {
        console.log('Success:', data)
    }
}

test()
