// ENTER BOOKING PAGE (client)
// >>> Change this to your hotel's real hotline number (shown after the client pays) <<<
const HOTLINE = '(02) 8123 4567  /  0917 123 4567';

function bookForm(id) {
  const s = cache.services.find(x => x.id === id);
  cache.selected = s;
  $('content').innerHTML = `<p><a href="client_services.html">&larr; Back to rooms</a></p><div class="room-detail">
    <div class="card room-info">
      ${s.image_url ? `<img src="${esc(s.image_url)}" alt="${esc(s.service_name)}">` : '<div class="room-img ph">🛏</div>'}
      <h2>${esc(s.service_name)}</h2>
      <p>${esc(s.description)}</p>
      <p>Room Type: <b>${esc(s.room_type)}</b><br>Capacity: <b>${s.capacity} guests</b><br>Price: <b>${peso(s.price)}/night</b><br>Availability: <span class="badge">${esc(s.availability)}</span></p>
    </div>
    <div class="card">
      <h2>Enter Booking</h2>
      <label>Selected Room/Service</label><input value="${esc(s.service_name)}" disabled>
      <label>Check-in Date</label><input id="bIn" type="date" onchange="calcTotal()">
      <label>Check-out Date</label><input id="bOut" type="date" onchange="calcTotal()">
      <label>Number of Guests (max ${s.capacity})</label><input id="bGuests" type="number" min="1" value="1">
      <label>Contact Name</label><input id="bName" value="${esc(me.full_name)}">
      <label>Contact Phone</label><input id="bPhone" value="${esc(me.phone)}">
      <label>Special Request</label><textarea id="bReq" rows="2"></textarea>
      <p id="bTotal"><strong>Total: ${peso(0)}</strong></p>
      <button onclick="goPayment()">CONTINUE TO PAYMENT</button>
    </div></div>`;
}

// nights = check-out - check-in ; total = nights x price
function nightsBetween() {
  const a = $('bIn').value, b = $('bOut').value;
  return a && b ? Math.round((new Date(b) - new Date(a)) / 86400000) : 0;
}
function calcTotal() {
  const n = nightsBetween(), p = cache.selected.price;
  $('bTotal').innerHTML = n > 0 ? `Room Price: ${peso(p)}/night<br>Nights: ${n}<br><strong>Total: ${peso(n * p)}</strong>` : '<strong>Total: ' + peso(0) + '</strong>';
}

// STEP 1 -> validate the booking details, then go to the payment step
function goPayment() {
  const s = cache.selected, inD = $('bIn').value, outD = $('bOut').value;
  const guests = parseInt($('bGuests').value), name = $('bName').value.trim(), phone = $('bPhone').value.trim();
  const today = new Date().toISOString().slice(0, 10);
  if (!inD || !outD || !name || !phone) return say('Please fill in all required fields.', false);
  if (inD < today) return say('Check-in date cannot be before today.', false);
  if (outD <= inD) return say('Check-out must be after check-in.', false);
  if (!(guests > 0)) return say('Guests must be greater than 0.', false);
  if (guests > s.capacity) return say('This room holds up to ' + s.capacity + ' guests.', false);
  cache.draft = { inD, outD, guests, name, phone, req: $('bReq').value.trim(), nights: nightsBetween(), total: nightsBetween() * s.price };
  cache.method = null;
  say('', true); $('msg').hidden = true;
  paymentForm();
}

// STEP 2 -> payment (must be completed before the booking is saved)
const METHODS = [['GCash', '📱'], ['PayMaya', '💳'], ['Bank Transfer', '🏦']];
// the accounts the admin set on the Payment Accounts page
async function loadAccounts() {
  const { data } = await db.from('payment_accounts').select('*').eq('active', true).order('bank');
  cache.accounts = data || [];
}
function paymentForm() {
  const s = cache.selected, d = cache.draft;
  $('content').innerHTML = `<p><a href="#" onclick="bookForm(${s.id});return false">&larr; Back to booking details</a></p>
    <div class="room-detail">
      <div class="card room-info">
        <h2>Booking Summary</h2>
        <p><b>${esc(s.service_name)}</b> (${esc(s.room_type)})<br>
        Check-in: <b>${d.inD}</b><br>Check-out: <b>${d.outD}</b><br>Nights: <b>${d.nights}</b><br>Guests: <b>${d.guests}</b></p>
        <p id="bTotal"><strong>Amount to pay: ${peso(d.total)}</strong></p>
        <p class="pay-note">Pay the full amount first. Your booking is saved after you submit the payment details.</p>
      </div>
      <div class="card">
        <h2>Payment</h2>
        <label>Choose a payment method</label>
        <div class="pay-methods">${METHODS.map(([m, ic]) => `<button type="button" class="pay-opt" id="pm-${m.replace(' ', '')}" onclick="pickMethod('${m}')"><span>${ic}</span>${m}</button>`).join('')}</div>
        <div id="payBox"></div>
      </div></div>`;
}
function pickMethod(m) {
  cache.method = m;
  document.querySelectorAll('.pay-opt').forEach(b => b.classList.toggle('sel', b.id === 'pm-' + m.replace(' ', '')));
  const list = (cache.accounts || []).filter(x => x.method === m), isBank = m === 'Bank Transfer';
  if (!list.length) { $('payBox').innerHTML = '<p class="pay-note">This payment method is not available right now. Please choose another one.</p>'; cache.method = null; return; }
  $('payBox').innerHTML = `
    ${isBank ? `<label>Bank</label><select id="pBank" onchange="showBank()">${list.map(b => `<option>${esc(b.bank)}</option>`).join('')}</select>` : ''}
    <div class="pay-to"><small>Send payment to</small><br>
      <b id="payName">${esc(list[0].account_name)}</b><br>
      <span id="payNum" class="pay-num">${esc(list[0].account_number)}</span></div>
    <label>Your ${m === 'Bank Transfer' ? 'Account' : m} Name (sender)</label><input id="pPayer" value="${esc(me.full_name)}">
    <label>Your ${isBank ? 'Account Number' : 'Mobile Number'} (sender)</label><input id="pAcct" placeholder="${isBank ? 'e.g. 1234 5678 90' : 'e.g. 09171234567'}">
    <label>Reference Number (from your payment receipt)</label><input id="pRef" placeholder="e.g. 1234567890">
    <p class="pay-note">Amount: <b>${peso(cache.draft.total)}</b>. Staff will verify your payment.</p>
    <button onclick="payAndBook()">PAY &amp; BOOK ROOM</button>`;
}
function showBank() {
  const a = cache.accounts.find(b => b.method === 'Bank Transfer' && b.bank === $('pBank').value);
  $('payName').textContent = a ? a.account_name : ''; $('payNum').textContent = a ? a.account_number : '';
}

// STEP 3 -> the booking is saved ONLY together with its payment details
async function payAndBook() {
  const s = cache.selected, d = cache.draft, m = cache.method;
  if (!m) return say('Please choose a payment method first.', false);
  const payer = $('pPayer').value.trim(), acct = $('pAcct').value.trim(), ref = $('pRef').value.trim();
  const bank = m === 'Bank Transfer' ? $('pBank').value : null;
  if (!payer || !acct || !ref) return say('Please fill in your name, number and the reference number.', false);
  if (ref.length < 4) return say('Reference number looks too short.', false);
  const { error } = await db.from('bookings').insert({
    client_id: me.id, service_id: s.id, check_in: d.inD, check_out: d.outD, guests: d.guests,
    contact_name: d.name, contact_phone: d.phone, special_request: d.req,
    total_amount: d.total, status: 'Pending',
    payment_method: m, payment_bank: bank, payer_name: payer, payer_account: acct, payment_reference: ref,
    amount_paid: d.total, payment_status: 'For Verification', paid_at: new Date().toISOString()
  });
  if (error) return say(error.message, false);
  $('msg').hidden = true;
  $('content').innerHTML = `<div class="card form-card done">
    <p class="msg ok">Payment submitted and booking saved. Staff will verify your payment and confirm your booking.</p>
    <p class="hotline">If you have any more questions, you may contact our hotline:<br><span class="hotline-no">📞 ${esc(HOTLINE)}</span></p>
    <button onclick="location.href='client_bookings.html'">VIEW BOOKING</button></div>`;
  window.scrollTo(0, 0);
}

async function init() {
  const id = new URLSearchParams(location.search).get('service');
  const { data, error } = await db.from('services').select('*').eq('id', id).single();
  if (error || !data) return say('Room not found. Go back to Browse Services.', false);
  cache.services = [data]; await loadAccounts(); bookForm(data.id);
}
// Start: check the role, then show the page
(async () => { if (await requireRole('client')) init(); })();
