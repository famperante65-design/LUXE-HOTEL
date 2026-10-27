// MANAGE SCHEDULE PAGE (admin)
async function manageSchedule(editId = null) {
  const [{ data: sc, error }, { data: sv }] = await Promise.all([
    db.from('schedules').select('*, services(service_name)').order('available_date'),
    db.from('services').select('id, service_name').order('service_name')]);
  if (error) return say(error.message, false);
  const s = sc.find(x => x.id === editId) || {};
  $('content').innerHTML = `<h2>Manage Schedule</h2><div class="card form-card"><h3>${s.id ? 'Edit' : 'Add'} Schedule</h3>
    <label>Room/Service</label><select id="cSvc">${sv.map(x => `<option value="${x.id}" ${x.id === s.service_id ? 'selected' : ''}>${esc(x.service_name)}</option>`).join('')}</select>
    <label>Available Date</label><input id="cDate" type="date" value="${s.available_date || ''}">
    <label>Start Time</label><input id="cStart" type="time" value="${s.start_time?.slice(0, 5) || '14:00'}">
    <label>End Time</label><input id="cEnd" type="time" value="${s.end_time?.slice(0, 5) || '12:00'}">
    <label>Status</label><select id="cStatus"><option ${s.status === 'Unavailable' ? '' : 'selected'}>Available</option><option ${s.status === 'Unavailable' ? 'selected' : ''}>Unavailable</option></select>
    <button onclick="saveSchedule(${s.id || 'null'})">${s.id ? 'Save Changes' : 'Add Schedule'}</button></div>` + table(
    ['Room/Service', 'Date', 'Start', 'End', 'Status', 'Actions'],
    sc.map(x => `<tr><td>${esc(x.services?.service_name)}</td><td>${x.available_date}</td><td>${(x.start_time || '').slice(0, 5)}</td><td>${(x.end_time || '').slice(0, 5)}</td><td><span class="badge st-${x.status}">${x.status}</span></td>
      <td><button class="small ghost" onclick="manageSchedule(${x.id})">Edit</button><button class="small danger" onclick="deleteSchedule(${x.id})">Delete</button></td></tr>`).join(''));
}
async function saveSchedule(id) {
  if (!$('cSvc').value || !$('cDate').value) return say('Room and date are required.', false);
  const row = { service_id: Number($('cSvc').value), available_date: $('cDate').value, start_time: $('cStart').value || null, end_time: $('cEnd').value || null, status: $('cStatus').value };
  const { error } = id ? await db.from('schedules').update(row).eq('id', id) : await db.from('schedules').insert(row);
  if (error) return say(error.message, false);
  await manageSchedule(); say('Schedule saved.');
}
async function deleteSchedule(id) {
  if (!confirm('Remove this schedule?')) return;
  const { error } = await db.from('schedules').delete().eq('id', id);
  if (error) return say(error.message, false);
  await manageSchedule(); say('Schedule removed.');
}

// Start: check the role, then show the page
(async () => { if (await requireRole('admin')) manageSchedule(); })();
