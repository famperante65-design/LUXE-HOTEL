// BROWSE SERVICES PAGE (client) - room cards, then "Room Details" opens the booking page
async function browseServices() {
  document.body.classList.add('rooms-page');
  const { data, error } = await db.from('services').select('*').eq('availability', 'Available').order('id');
  if (error) return say(error.message, false);
  $('content').innerHTML = `<div class="rooms-head"><h1>Our Rooms</h1><p>Choose a room, then fill out your booking details.</p></div>
    <div class="rooms-grid">` + (data.map(s => `
    <div class="room-card">
      ${s.image_url ? `<img src="${esc(s.image_url)}" alt="${esc(s.service_name)}">` : '<div class="room-img ph">🛏</div>'}
      <div class="room-body">
        <h3>${esc(s.service_name)}</h3>
        <p class="room-desc">${esc(s.description)}</p>
        <p class="room-meta">${peso(s.price)}/night · Up to ${s.capacity} guests</p>
        <button class="room-btn" onclick="location.href='client_booking.html?service=${s.id}'">Room Details</button>
      </div>
    </div>`).join('') || '<p>No rooms available yet.</p>') + '</div>';
}

(async () => { if (await requireRole('client')) browseServices(); })();
