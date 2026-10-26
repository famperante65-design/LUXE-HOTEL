// MY BOOKINGS PAGE (client) - shows everything the client filled out in the booking form
async function myBookings() {
  const { data, error } = await db.from('bookings').select('*, services(service_name, room_type)').eq('client_id', me.id).order('id', { ascending: false });
  if (error) return say(error.message, false);
  $('content').innerHTML = '<h2>My Bookings</h2>' + table(
    ['Booking ID', 'Room/Service', 'Room Type', 'Check-in', 'Check-out', 'Nights', 'Guests', 'Contact Name', 'Contact Phone', 'Special Request', 'Total Amount', 'Payment', 'Payment Status', 'Status', 'Date Created'],
    data.map(b => {
      const nights = Math.round((new Date(b.check_out) - new Date(b.check_in)) / 86400000);
      return `<tr><td>${b.id}</td><td>${esc(b.services?.service_name)}</td><td>${esc(b.services?.room_type)}</td><td>${b.check_in}</td><td>${b.check_out}</td><td>${nights}</td><td>${b.guests}</td><td>${esc(b.contact_name)}</td><td>${esc(b.contact_phone)}</td><td style="white-space:normal;min-width:160px">${esc(b.special_request) || '-'}</td><td>${peso(b.total_amount)}</td><td>${esc(b.payment_method) || '-'}${b.payment_bank ? ' (' + esc(b.payment_bank) + ')' : ''}<br><small>Ref: ${esc(b.payment_reference) || '-'}</small></td><td><span class="badge pay-${(b.payment_status || 'Unpaid').replace(' ', '')}">${esc(b.payment_status || 'Unpaid')}</span></td><td><span class="badge st-${b.status}">${b.status}</span></td><td>${fdate(b.created_at)}</td></tr>`;
    }).join(''));
}

(async () => { if (await requireRole('client')) myBookings(); })();
