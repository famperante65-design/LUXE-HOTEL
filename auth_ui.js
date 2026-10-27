// SHARED LOGIN/REGISTER UI HELPERS (segmented user-type picker, Enter key, page transition)
document.querySelectorAll('.seg').forEach(seg => {
  const target = document.getElementById(seg.dataset.target);
  seg.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    target.value = b.dataset.v;
    seg.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
  }));
});
// Show / hide password (eye button inside the password field)
document.querySelectorAll('.pw .eye').forEach(btn => {
  const inp = btn.parentElement.querySelector('input');
  btn.addEventListener('click', () => {
    const show = inp.type === 'password';
    inp.type = show ? 'text' : 'password';
    btn.classList.toggle('on', show);
    btn.setAttribute('aria-pressed', show);
    btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    inp.focus(); const n = inp.value.length; try { inp.setSelectionRange(n, n); } catch (e) {}
  });
});
// Press Enter inside any field to submit
document.querySelectorAll('.panel input').forEach(inp => inp.addEventListener('keydown', e => {
  if (e.key === 'Enter') { const go = document.querySelector('.panel .actions .gold, .panel #invalidBox .gold'); if (go && !go.closest('[hidden]')) go.click(); }
}));
// Smooth "flow out" before opening another page
function leaveTo(url) {
  document.body.classList.add('leaving');
  setTimeout(() => { location.href = url; }, 520);
}
