// ADMIN LAYOUT - turns the plain header into a sidebar dashboard (runs on every admin page).
// It only moves existing elements around, so every page keeps working the same.
(function () {
  const header = document.querySelector('header'), main = document.querySelector('main');
  if (!header || !main) return;
  const nav = document.getElementById('nav'), welcome = document.getElementById('welcome');
  const title = (document.title || '').split(' - ')[0];
  const isStaff = document.body.classList.contains('staff-page'), ROLE = isStaff ? 'Staff' : 'Admin';

  const side = document.createElement('aside'); side.className = 'side';
  side.innerHTML = `<div class="brand"><span class="logo">🏨</span><div><b>HOTEL BOOKING</b><small>${ROLE} Console</small></div></div><div class="side-label">MENU</div>`;
  side.appendChild(nav);
  const user = document.createElement('div'); user.className = 'side-user';
  user.innerHTML = '<span class="avatar" id="avatar">A</span><div><small>Signed in as</small></div>';
  user.querySelector('div').appendChild(welcome);
  side.appendChild(user);

  const work = document.createElement('div'); work.className = 'work';
  const top = document.createElement('div'); top.className = 'topbar';
  top.innerHTML = `<div><small>${ROLE} / ${title}</small><strong>${title}</strong></div><span class="today">${new Date().toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>`;
  work.appendChild(top); work.appendChild(main);

  const shell = document.createElement('div'); shell.className = 'shell';
  shell.appendChild(side); shell.appendChild(work);
  header.remove(); document.body.prepend(shell);

  // avatar letter + "Welcome, Name" -> "Name"
  new MutationObserver(() => {
    if (!welcome.textContent.startsWith('Welcome, ')) return;   // already changed (avoids an endless loop)
    const n = welcome.textContent.replace('Welcome, ', '').trim();
    welcome.textContent = n; document.getElementById('avatar').textContent = (n[0] || 'A').toUpperCase();
  }).observe(welcome, { childList: true });
})();
