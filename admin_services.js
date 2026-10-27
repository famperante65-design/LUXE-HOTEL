// MANAGE SERVICES PAGE (admin) - rooms with photo upload (Supabase Storage bucket "room-images")
const BUCKET = 'room-images';
const MAX_IMG = 5 * 1024 * 1024;                       // 5 MB
const IMG_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
let pendingFile = null;      // image the admin just picked (not uploaded yet)
let removeImage = false;     // admin clicked "Remove image"

// Path of a file inside our bucket, taken from its public URL (null if the image is not stored there)
const storagePath = url => { const m = (url || '').match(/\/storage\/v1\/object\/public\/room-images\/(.+?)(?:\?.*)?$/); return m ? decodeURIComponent(m[1]) : null; };
const dropOldImage = url => { const p = storagePath(url); return p ? db.storage.from(BUCKET).remove([p]) : null; };

async function manageServices(editId = null) {
  pendingFile = null; removeImage = false;
  const { data, error } = await db.from('services').select('*').order('id');
  if (error) return say(error.message, false);
  cache.services = data;
  const s = data.find(x => x.id === editId) || {};
  $('content').innerHTML = `<h2>Manage Services</h2><div class="card form-card"><h3>${s.id ? 'Edit' : 'Add'} Service</h3>
    <label>Service/Room Name</label><input id="sName" value="${esc(s.service_name)}">
    <label>Description</label><textarea id="sDesc" rows="2">${esc(s.description)}</textarea>
    <label>Room Type</label><input id="sType" value="${esc(s.room_type)}">
    <label>Price per night</label><input id="sPrice" value="${s.price ?? ''}">
    <label>Capacity</label><input id="sCap" type="number" min="1" value="${s.capacity ?? 1}">
    <label>Availability</label><select id="sAvail"><option ${s.availability === 'Unavailable' ? '' : 'selected'}>Available</option><option ${s.availability === 'Unavailable' ? 'selected' : ''}>Unavailable</option></select>
    <label>Room Image</label>
    <div class="drop" id="drop" tabindex="0" role="button" aria-label="Choose a room image">
      <img id="imgPrev" alt="Room preview" ${s.image_url ? `src="${esc(s.image_url)}"` : 'hidden'}>
      <div class="drop-text"><strong id="dropTitle">${s.image_url ? 'Click to replace the image' : 'Click to choose an image'}</strong><span>or drag and drop it here &middot; JPG, PNG, WEBP or GIF &middot; max 5 MB</span></div>
    </div>
    <input type="file" id="sFile" accept="image/jpeg,image/png,image/webp,image/gif" hidden>
    <button type="button" class="small ghost" id="rmImg" ${s.image_url ? '' : 'hidden'}>Remove image</button>
    <div><button id="saveBtn" onclick="saveService(${s.id || 'null'})">${s.id ? 'Save Changes' : 'Add Service'}</button>${s.id ? '<button class="ghost" onclick="manageServices()">Cancel</button>' : ''}</div></div>` + table(
    ['Image', 'Name', 'Type', 'Price', 'Capacity', 'Availability', 'Actions'],
    data.map(x => `<tr><td>${x.image_url ? `<img class="thumb" src="${esc(x.image_url)}" alt="">` : '<span class="thumb ph"></span>'}</td><td>${esc(x.service_name)}</td><td>${esc(x.room_type)}</td><td>${peso(x.price)}</td><td>${x.capacity}</td><td><span class="badge st-${x.availability}">${x.availability}</span></td>
      <td><button class="small ghost" onclick="manageServices(${x.id})">Edit</button><button class="small danger" onclick="deleteService(${x.id})">Delete</button></td></tr>`).join(''));
  wireImagePicker();
}

// Click / keyboard / drag-and-drop picking + live preview
function wireImagePicker() {
  const drop = $('drop'), file = $('sFile'), prev = $('imgPrev'), rm = $('rmImg');
  const pick = f => {
    if (!f) return;
    if (!IMG_TYPES[f.type]) return say('Please choose a JPG, PNG, WEBP or GIF image.', false);
    if (f.size > MAX_IMG) return say('That image is larger than 5 MB. Please choose a smaller one.', false);
    pendingFile = f; removeImage = false;
    prev.src = URL.createObjectURL(f); prev.hidden = false; rm.hidden = false;
    $('dropTitle').textContent = 'Selected: ' + f.name;
  };
  drop.onclick = () => file.click();
  drop.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); file.click(); } };
  drop.ondragover = e => { e.preventDefault(); drop.classList.add('over'); };
  drop.ondragleave = () => drop.classList.remove('over');
  drop.ondrop = e => { e.preventDefault(); drop.classList.remove('over'); pick(e.dataTransfer.files[0]); };
  file.onchange = () => pick(file.files[0]);
  rm.onclick = () => {
    pendingFile = null; removeImage = true; file.value = '';
    prev.hidden = true; prev.removeAttribute('src'); rm.hidden = true;
    $('dropTitle').textContent = 'Click to choose an image';
  };
}

async function saveService(id) {
  const rawPrice = $('sPrice').value.replace(/[₱,\s]/g, ''), price = Number(rawPrice), cap = parseInt($('sCap').value), name = $('sName').value.trim();
  if (!name) return say('Name is required.', false);
  if (rawPrice === '' || isNaN(price) || price < 0) return say('Price must be a valid number.', false);
  if (!(cap > 0)) return say('Capacity must be at least 1.', false);

  const btn = $('saveBtn'), label = btn.textContent;
  btn.disabled = true; btn.textContent = pendingFile ? 'Uploading image...' : 'Saving...';
  const reset = () => { btn.disabled = false; btn.textContent = label; };

  const old = id ? (cache.services.find(x => x.id === id) || {}).image_url || null : null;
  let image_url = removeImage ? null : old;
  let uploadedPath = null;

  // 1) upload the new picture (if one was chosen)
  if (pendingFile) {
    uploadedPath = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${IMG_TYPES[pendingFile.type]}`;
    const { error: upErr } = await db.storage.from(BUCKET).upload(uploadedPath, pendingFile, { cacheControl: '3600', upsert: false, contentType: pendingFile.type });
    if (upErr) { reset(); return say('Image upload failed: ' + upErr.message + ' (Did you run 05_storage.sql in Supabase?)', false); }
    image_url = db.storage.from(BUCKET).getPublicUrl(uploadedPath).data.publicUrl;
  }

  // 2) save the room
  const row = { service_name: name, description: $('sDesc').value.trim(), room_type: $('sType').value.trim(), price, capacity: cap, availability: $('sAvail').value, image_url };
  const { error } = id ? await db.from('services').update(row).eq('id', id) : await db.from('services').insert(row);
  if (error) {
    if (uploadedPath) await db.storage.from(BUCKET).remove([uploadedPath]);   // do not leave an unused file behind
    reset(); return say(error.message, false);
  }

  // 3) clean up the previous picture if it was replaced or removed
  if (old && old !== image_url) await dropOldImage(old);
  await manageServices(); say('Service saved.');
}

async function deleteService(id) {
  if (!confirm('Delete this service?')) return;
  const old = (cache.services.find(x => x.id === id) || {}).image_url;
  const { error } = await db.from('services').delete().eq('id', id);
  if (error) return say('Cannot delete: it may have bookings. Set it to Unavailable instead.', false);
  if (old) await dropOldImage(old);
  await manageServices(); say('Service deleted.');
}

// Start: check the role, then show the page
(async () => { if (await requireRole('admin')) manageServices(); })();
