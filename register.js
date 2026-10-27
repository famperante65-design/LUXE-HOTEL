// REGISTER: creates the Supabase Auth account. A database trigger creates the profile (role = client).
async function register() {
  const name = $('regName').value.trim(), email = $('regEmail').value.trim(), pass = $('regPass').value, phone = $('regPhone').value.trim();
  const m = $('authMsg'), show = (t, ok) => { m.textContent = t; m.className = 'msg ' + (ok ? 'ok' : 'err'); m.hidden = false; };
  if (!name || !email || !pass || !phone) return show('All fields are required.');
  if (!isEmail(email)) return show('Please enter a valid email.');
  if (pass.length < 6) return show('Password must be at least 6 characters.');
  if (!db) return show('Supabase is not set up. Paste your URL and anon key in supabase_client.js.');
  let error;
  try { ({ error } = await db.auth.signUp({ email, password: pass, options: { data: { full_name: name, phone, role: $('regType').value } } })); }
  catch (e) { error = e; }
  if (error) return show(error.message);
  show('Registered successfully! You can now go back and log in.', true);
}
