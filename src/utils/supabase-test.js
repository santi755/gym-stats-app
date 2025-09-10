// Utility script to test Supabase configuration
// Run this in the browser console to verify your setup

import { 
  isSupabaseConfigured, 
  testSupabaseConnection, 
  supabase 
} from '../config/supabase.js'

export async function runSupabaseTests() {
  console.log('🧪 Testing Supabase Configuration...\n')
  
  // Test 1: Check if configuration is valid
  console.log('1️⃣ Checking configuration...')
  const isConfigured = isSupabaseConfigured()
  console.log(isConfigured ? '✅ Configuration looks good' : '❌ Configuration missing or invalid')
  
  if (!isConfigured) {
    console.log('⚠️ Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set correctly')
    return false
  }
  
  // Test 2: Test connection
  console.log('\n2️⃣ Testing connection...')
  const connectionTest = await testSupabaseConnection()
  console.log(connectionTest.success ? '✅ Connection successful' : `❌ Connection failed: ${connectionTest.message}`)
  
  // Test 3: Check auth status
  console.log('\n3️⃣ Checking authentication...')
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.log(`❌ Auth error: ${error.message}`)
  } else if (user) {
    console.log(`✅ User authenticated: ${user.email}`)
  } else {
    console.log('ℹ️ No user authenticated (this is normal for first-time setup)')
  }
  
  // Test 4: Check if tables exist (optional)
  console.log('\n4️⃣ Checking database tables...')
  try {
    const { data, error } = await supabase.from('gym_groups').select('count').limit(1)
    if (error && error.code === 'PGRST116') {
      console.log('⚠️ Database tables not found. Please run the SQL schema from supabase-schema.sql')
    } else if (error) {
      console.log(`❌ Database error: ${error.message}`)
    } else {
      console.log('✅ Database tables are accessible')
    }
  } catch (err) {
    console.log(`❌ Database test failed: ${err.message}`)
  }
  
  console.log('\n🎉 Supabase test completed!')
  return true
}

// Auto-run tests if this script is imported
if (typeof window !== 'undefined') {
  runSupabaseTests()
}
