// BOOKINGS PAGE (staff)
async function staffBookings() {
  const { data, error } = await db.from('bookings').select('*, services(service_name), profiles(full_name)').order('id', { ascending: false });
  if (error) return say(error.message, false);
  cache.bookings = data;
  $('content').innerHTML = '<h2>Bookings</h2>' + table(
    ['Booking ID', 'Client', 'Room/Service', 'Check-in', 'Check-out', 'Guests', 'Total', 'Payment', 'Status', 'Actions'],
    data.map(b => `<tr><td>${b.id}</td><td>${esc(b.profiles?.full_name)}</td><td>${esc(b.services?.service_name)}</td><td>${b.check_in}</td><td>${b.check_out}</td><td>${b.guests}</td><td>${peso(b.total_amount)}</td><td>${esc(b.payment_method) || '-'}<br><span class="badge pay-${(b.payment_status || 'Unpaid').replace(' ', '')}">${esc(b.payment_status || 'Unpaid')}</span></td><td><span class="badge st-${b.status}">${b.status}</span></td>
      <td class="acts"><button class="dots" title="Actions" aria-label="Actions for booking ${b.id}" onclick="openMenu(event, ${b.id})"><b></b><b></b><b></b></button></td></tr>`).join(''));
}

// 3-DOT ACTION MENU: one floating menu, placed next to the clicked button
const ACTIONS = [
  ['View', 'fa-eye', id => viewBooking(id), ''],
  ['Reject Payment', 'fa-circle-xmark', id => setPayment(id, 'Rejected'), 'bad'],
  ['Verify Payment', 'fa-circle-check', id => setPayment(id, 'Verified'), 'good'],
  ['Update Check-in / Check-out', 'fa-calendar-days', id => updateBooking(id), ''],
  ['Confirm Booking', 'fa-thumbs-up', id => setStatus(id, 'Confirmed'), ''],
  ['Complete', 'fa-flag-checkered', id => setStatus(id, 'Completed'), 'good'],
  ['Cancel Booking', 'fa-ban', id => setStatus(id, 'Cancelled'), 'bad']
];
function closeMenu() { const m = $('actMenu'); if (m) m.remove(); }
function openMenu(ev, id) {
  ev.stopPropagation();
  const had = $('actMenu') && $('actMenu').dataset.id == id;
  closeMenu(); if (had) return;                       // clicking the same dots again closes it
  const m = document.createElement('div'); m.id = 'actMenu'; m.className = 'act-menu'; m.dataset.id = id; m.setAttribute('role', 'menu');
  m.innerHTML = ACTIONS.map(([label, icon, , tone], i) => `<button type="button" role="menuitem" class="mi ${tone}" data-i="${i}"><i class="fa-solid ${icon}"></i>${label}</button>`).join('');
  m.onclick = e => { const bt = e.target.closest('.mi'); if (!bt) return; closeMenu(); ACTIONS[bt.dataset.i][2](id); };
  document.body.appendChild(m); menuOpenedAt = Date.now();
  const r = ev.currentTarget.getBoundingClientRect(), h = m.offsetHeight, w = m.offsetWidth;
  m.style.left = Math.max(8, Math.min(r.right - w, innerWidth - w - 8)) + 'px';
  m.style.top = (r.bottom + h + 8 > innerHeight ? Math.max(8, r.top - h - 6) : r.bottom + 6) + 'px';
}
document.addEventListener('click', closeMenu);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
let menuOpenedAt = 0;   // ignore the tiny scroll a click can cause right after opening
window.addEventListener('scroll', e => { if (Date.now() - menuOpenedAt > 400 && !(e.target.closest && e.target.closest('#actMenu'))) closeMenu(); }, true);
window.addEventListener('resize', closeMenu);

function viewBooking(id) {
  const b = cache.bookings.find(x => x.id === id);
  alert(`Booking #${b.id}\nClient: ${b.profiles?.full_name}\nRoom: ${b.services?.service_name}\n${b.check_in} to ${b.check_out}\nGuests: ${b.guests}\nContact: ${b.contact_name} (${b.contact_phone})\nRequest: ${b.special_request || '-'}\nTotal: ${peso(b.total_amount)}\nPayment: ${b.payment_method || '-'}${b.payment_bank ? ' (' + b.payment_bank + ')' : ''} - ${b.payment_status || 'Unpaid'}\nSender: ${b.payer_name || '-'} / ${b.payer_account || '-'}\nReference: ${b.payment_reference || '-'}\nStatus: ${b.status}`);
}
async function setStatus(id, status) {
  const b = cache.bookings.find(x => x.id === id);
  if (status === 'Confirmed' && b.payment_status !== 'Verified') return say('Verify the payment first (Verify Pay) before confirming this booking.', false);
  const { error } = await db.from('bookings').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) return say(error.message, false);
  await staffBookings(); say('Booking #' + id + ' is now ' + status + '.');
}
async function setPayment(id, payment_status) {
  const { error } = await db.from('bookings').update({ payment_status, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) return say(error.message, false);
  await staffBookings(); say('Payment for booking #' + id + ' is now ' + payment_status + '.');
}
async function updateCheckout(id) {   // change only the check-out date; the total is recalculated (nights x price)
  const b = cache.bookings.find(x => x.id === id);
  if (['Cancelled', 'Completed'].includes(b.status)) return say('A ' + b.status.toLowerCase() + ' booking cannot be changed.', false);
  const outD = prompt('Current check-in: ' + b.check_in + '\nNew check-out date (YYYY-MM-DD):', b.check_out); if (outD === null) return;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(outD.trim()) || isNaN(new Date(outD.trim()))) return say('Please use the date format YYYY-MM-DD.', false);
  if (outD.trim() <= b.check_in) return say('Check-out must be after the check-in date (' + b.check_in + ').', false);
  const { data: s } = await db.from('services').select('price').eq('id', b.service_id).single();
  const nights = Math.round((new Date(outD.trim()) - new Date(b.check_in)) / 86400000);
  const { error } = await db.from('bookings').update({ check_out: outD.trim(), total_amount: nights * s.price, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) return say(error.message, false);
  await staffBookings(); say('Check-out for booking #' + id + ' is now ' + outD.trim() + ' (' + nights + ' night' + (nights > 1 ? 's' : '') + ', total ' + peso(nights * s.price) + ').');
}
async function updateBooking(id) {   // simple update using prompts
  const b = cache.bookings.find(x => x.id === id);
  const inD = prompt('Check-in (YYYY-MM-DD):', b.check_in); if (inD === null) return;
  const outD = prompt('Check-out (YYYY-MM-DD):', b.check_out); if (outD === null) return;
  const guests = parseInt(prompt('Guests:', b.guests));
  if (!inD || !outD || outD <= inD || !(guests > 0)) return say('Invalid dates or guests.', false);
  const { data: s } = await db.from('services').select('price').eq('id', b.service_id).single();
  const nights = Math.round((new Date(outD) - new Date(inD)) / 86400000);
  const { error } = await db.from('bookings').update({ check_in: inD, check_out: outD, guests, total_amount: nights * s.price, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) return say(error.message, false);
  await staffBookings(); say('Booking updated.');
}

// Start: check the role, then show the page
(async () => { if (await requireRole('staff')) staffBookings(); })();
