// SHARED HELPERS - loaded by every dashboard page
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const peso = n => '₱' + Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 });
const isEmail = e => /^\S+@\S+\.\S+$/.test(e);
const fdate = d => d ? new Date(d).toLocaleDateString() : '';
let me = null;   // logged-in profile
let cache = {};  // rows kept for edit/view buttons

function say(text, ok = true) {
  const m = $('msg'); m.textContent = text; m.className = 'msg ' + (ok ? 'ok' : 'err'); m.hidden = false;
  setTimeout(() => m.hidden = true, 5000);
}
const table = (heads, rows) => `<div class="table-wrap card"><table><tr>${heads.map(h => `<th>${h}</th>`).join('')}</tr>${rows || `<tr><td colspan="${heads.length}">Nothing here yet.</td></tr>`}</table></div>`;

// Menu links for each role
const MENUS = {
  client: [['Browse Services', 'client_services.html'], ['My Bookings', 'client_bookings.html']],
  staff:  [['View Bookings', 'staff_bookings.html'], ['Sales/History Report', 'staff_report.html']],
  admin:  [['Manage Users', 'admin_users.html'], ['Manage Services', 'admin_services.html'], ['Manage Reports', 'admin_reports.html'], ['Manage Schedule', 'admin_schedule.html'], ['Payment Accounts', 'admin_payments.html']]
};

// SIDEBAR ICONS - free Font Awesome icons, loaded from your Font Awesome kit
const FA_KIT = 'https://kit.fontawesome.com/11f15d2429.js';
const ADMIN_ICONS = {
  'admin_users.html':    'fa-solid fa-users-gear',
  'admin_services.html': 'fa-solid fa-bed',
  'admin_reports.html':  'fa-solid fa-file-lines',
  'admin_schedule.html': 'fa-solid fa-calendar-days',
  'admin_payments.html': 'fa-solid fa-credit-card',
  'staff_bookings.html': 'fa-solid fa-book-open',
  'staff_report.html':   'fa-solid fa-chart-line',
  logout:                'fa-solid fa-right-from-bracket'
};
if (document.body.classList.contains('admin-page')) {   // admin + staff pages only
  const s = document.createElement('script'); s.src = FA_KIT; s.crossOrigin = 'anonymous'; document.head.appendChild(s);
}

// Call at the top of every dashboard page. Sends you back to login if the role is wrong.
async function requireRole(role) {
  const { data: { session } } = await db.auth.getSession();
  if (!session) { location.href = 'index.html'; return false; }
  const { data: p } = await db.from('profiles').select('*').eq('id', session.user.id).single();
  if (!p || !p.active || p.role !== role) { await db.auth.signOut(); location.href = 'index.html'; return false; }
  me = p;
  $('welcome').textContent = 'Welcome, ' + (p.full_name || p.role);
  const here = location.pathname.split('/').pop();
  const icon = u => document.body.classList.contains('admin-page') ? `<i class="${ADMIN_ICONS[u] || 'fa-solid fa-circle'}"></i>` : '';
  $('nav').innerHTML = MENUS[role].map(([l, u]) => `<a href="${u}" class="${u === here ? 'active' : ''}">${icon(u)}${l}</a>`).join('') + `<a href="#" class="ghost" onclick="logout()">${icon('logout')}Logout</a>`;
  return true;
}
async function logout() { await db.auth.signOut(); location.href = 'index.html'; }
