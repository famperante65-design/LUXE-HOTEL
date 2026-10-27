// ============================================================
// SUPABASE CONNECTION
// >>> PASTE YOUR OWN VALUES BELOW (Supabase > Project Settings > API) <<<
// Use ONLY the anon/public key here. Never put the service_role key in this file.
// ============================================================
const SUPABASE_URL = "https://iktcmyytfokcyrqwvpcm.supabase.co";          // example: https://abcdefgh.supabase.co
const SUPABASE_ANON_KEY = "sb_publishable_Q_5aLA5Hki78w8K427dbHQ_PKw7kwvG"; // the long "anon public" key

// True only after you replaced both placeholders above
const SUPABASE_READY = SUPABASE_URL.startsWith("https://") && !SUPABASE_ANON_KEY.startsWith("YOUR_");
const db = SUPABASE_READY ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// Show a red warning on every page until the keys are pasted
if (!SUPABASE_READY) {
  window.addEventListener("DOMContentLoaded", () => {
    const bar = document.createElement("div");
    bar.style.cssText = "background:#b91c1c;color:#fff;padding:10px;text-align:center;position:sticky;top:0;z-index:9";
    bar.textContent = "Supabase is not set up yet. Open supabase_client.js and paste your Project URL and anon key.";
    document.body.prepend(bar);
  });
}
