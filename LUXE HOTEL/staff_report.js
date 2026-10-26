// SALES/HISTORY REPORT PAGE (staff)
async function report(isAdmin) {
  const { data: bk, error } = await db.from('bookings').select('*, services(service_name), profiles(full_name)').order('id', { ascending: false });
  if (error) return say(error.message, false);
  const count = st => bk.filter(b => b.status === st).length;
  const sales = bk.filter(b => ['Confirmed', 'Completed'].includes(b.status)).reduce((t, b) => t + Number(b.total_amount), 0);
  const SI = { 'Total Bookings': 'clipboard-list', Pending: 'hourglass-half', Confirmed: 'circle-check', Cancelled: 'circle-xmark', Completed: 'flag-checkered', 'Total Sales': 'peso-sign' };
  const stat = (l, v) => `<div class="card stat"><span class="si ic-${l.replace(' ', '')}"><i class="fa-solid fa-${SI[l] || 'circle'}"></i></span><div>${l}<b>${v}</b></div></div>`;
  let userStats = '';
  if (isAdmin) {
    const { data: us } = await db.from('profiles').select('role');
    const r = x => us.filter(u => u.role === x).length;
    userStats = stat('Total Users', us.length) + stat('Clients', r('client')) + stat('Staff', r('staff')) + stat('Admins', r('admin'));
  }
  $('content').innerHTML = `<h2>${isAdmin ? 'Reports' : 'Sales/History Report'}</h2><div class="stats">${userStats}
    ${stat('Total Bookings', bk.length)}${stat('Pending', count('Pending'))}${stat('Confirmed', count('Confirmed'))}${stat('Cancelled', count('Cancelled'))}${stat('Completed', count('Completed'))}${stat('Total Sales', peso(sales))}</div>
    <h3>Booking History</h3>` + table(['Booking ID', 'Client', 'Room', 'Amount', 'Status', 'Date'],
    bk.map(b => `<tr><td>${b.id}</td><td>${esc(b.profiles?.full_name)}</td><td>${esc(b.services?.service_name)}</td><td>${peso(b.total_amount)}</td><td><span class="badge st-${b.status}">${b.status}</span></td><td>${fdate(b.created_at)}</td></tr>`).join(''));
}

// Start: check the role, then show the page
(async () => { if (await requireRole('staff')) report(false); })();
