const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  console.log("Fetching entries...");
  const { data, error } = await supabase.from('journal_entries').select('*');
  console.log("Fetch Error:", error);
  console.log("Fetch Data:", data);

  console.log("Inserting entry...");
  const { data: iData, error: iError } = await supabase.from('journal_entries').upsert({
    id: 'test-id-123',
    date: '2026-03-09',
    entry_data: { test: true }
  }).select();
  console.log("Insert Error:", iError);
}
test();
