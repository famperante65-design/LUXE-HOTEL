// LOGIN: SELECT USER TYPE -> VERIFY LOGIN -> DASHBOARD (or INVALID -> RETURN TO LOGIN)
const HOME = { client: 'client_services.html', staff: 'staff_bookings.html', admin: 'admin_users.html' };
function showInvalid(why) { $('invalidWhy').textContent = why || ''; $('loginBox').hidden = true; $('invalidBox').hidden = false; $('authMsg').hidden = true; }
function returnToLogin() { $('loginBox').hidden = false; $('invalidBox').hidden = true; }
async function login() {
  const type = $('loginType').value, email = $('loginEmail').value.trim(), pass = $('loginPass').value;
  const m = $('authMsg');
  if (!email || !pass) { m.textContent = 'Email and password are required.'; m.hidden = false; return; }
  if (!isEmail(email)) { m.textContent = 'Please enter a valid email.'; m.hidden = false; return; }
  if (!db) { m.textContent = 'Supabase is not set up. Paste your URL and anon key in supabase_client.js.'; m.hidden = false; return; }
  const { data, error } = await db.auth.signInWithPassword({ email, password: pass });
  if (error) {   // tell the user the real reason (wrong password, unconfirmed email, ...)
    const t = (error.message || '').toLowerCase();
    if (t.includes('not confirmed')) return showInvalid('Reason: this email is not confirmed yet. Confirm it from your inbox, or turn off "Confirm email" in Supabase (Authentication > Sign In / Providers > Email).');
    if (t.includes('rate limit') || t.includes('too many')) return showInvalid('Reason: too many attempts. Wait a few minutes and try again.');
    if (t.includes('invalid login')) return showInvalid('Reason: this email and password do not match an account in this Supabase project. Check the password, or register the account first.');
    return showInvalid('Reason: ' + error.message);
  }
  const { data: p, error: pe } = await db.from('profiles').select('*').eq('id', data.user.id).single();
  if (!p) { await db.auth.signOut(); return showInvalid('Reason: the password is correct but this account has no profile row' + (pe ? ' (' + pe.message + ')' : '') + '. Run 02_auth_functions.sql and 03_rls_policies.sql, then insert the profile (see README).'); }
  if (!p.active) { await db.auth.signOut(); return showInvalid('Reason: this account is deactivated.'); }
  if (p.role !== type) { await db.auth.signOut(); return showInvalid('Reason: this account is registered as "' + p.role + '", but you selected "' + type + '". Choose the "' + p.role + '" User Type, or ask an admin to change the role.'); }
  leaveTo(HOME[type]);
}
