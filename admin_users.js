// MANAGE USERS PAGE (admin)
async function manageUsers() {
  const { data, error } = await db.from('profiles').select('*').order('created_at');
  if (error) return say(error.message, false);
  cache.users = data;
  $('content').innerHTML = '<h2>Manage Users</h2><p>New users sign up with Register; here you edit them and assign roles.</p>' + table(
    ['ID', 'Full Name', 'Email', 'Phone', 'Role', 'Active', 'Created', 'Actions'],
    data.map(u => `<tr><td>${u.id.slice(0, 8)}</td><td>${esc(u.full_name)}</td><td>${esc(u.email)}</td><td>${esc(u.phone)}</td><td><span class="badge role-${u.role}">${u.role}</span></td><td><span class="badge ${u.active ? 'st-Available' : 'st-Cancelled'}">${u.active ? 'Yes' : 'No'}</span></td><td>${fdate(u.created_at)}</td>
      <td><button class="small ghost" onclick="editUser('${u.id}')">Edit</button>
      <button class="small ${u.active ? 'danger' : 'ok'}" onclick="toggleUser('${u.id}')">${u.active ? 'Deactivate' : 'Activate'}</button></td></tr>`).join(''));
}
async function editUser(id) {
  const u = cache.users.find(x => x.id === id);
  const name = prompt('Full name:', u.full_name); if (name === null) return;
  const phone = prompt('Phone:', u.phone); if (phone === null) return;
  const role = prompt('Role (client / staff / admin):', u.role); if (role === null) return;
  if (!['client', 'staff', 'admin'].includes(role.trim())) return say('Role must be client, staff or admin.', false);
  const { error } = await db.from('profiles').update({ full_name: name.trim(), phone: phone.trim(), role: role.trim() }).eq('id', id);
  if (error) return say(error.message, false);
  await manageUsers(); say('User updated.');
}
async function toggleUser(id) {
  const u = cache.users.find(x => x.id === id);
  if (id === me.id) return say('You cannot deactivate your own account.', false);
  const { error } = await db.from('profiles').update({ active: !u.active }).eq('id', id);
  if (error) return say(error.message, false);
  await manageUsers(); say('User ' + (u.active ? 'deactivated.' : 'activated.'));
}

// Start: check the role, then show the page
(async () => { if (await requireRole('admin')) manageUsers(); })();
