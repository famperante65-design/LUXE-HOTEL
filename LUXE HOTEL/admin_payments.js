// PAYMENT ACCOUNTS PAGE (admin) - the account name/number clients "send payment to"
let editId = null;

async function loadAccounts() {
  const { data, error } = await db.from('payment_accounts').select('*').order('method').order('bank');
  if (error) return say(error.message + ' (Did you run 07_payment_accounts.sql?)', false);
  cache.accounts = data;
  const a = editId ? data.find(x => x.id === editId) : null;
  $('content').innerHTML = `<h2>Payment Accounts</h2>
    <p>These are the accounts clients see under "Send payment to" when they pay for a booking. Change them any time the account changes.</p>
    <div class="card form-card">
      <h3>${a ? 'Edit Account' : 'Add Account'}</h3>
      <label>Payment Method</label>
      <select id="paMethod" onchange="toggleBank()">${['GCash', 'PayMaya', 'Bank Transfer'].map(m => `<option ${a && a.method === m ? 'selected' : ''}>${m}</option>`).join('')}</select>
      <div id="paBankRow"><label>Bank Name</label><input id="paBank" placeholder="e.g. BDO" value="${esc(a?.bank || '')}"></div>
      <label>Account Name</label><input id="paName" value="${esc(a?.account_name || '')}" placeholder="Name on the account">
      <label>Account Number</label><input id="paNum" value="${esc(a?.account_number || '')}" placeholder="GCash/PayMaya number or bank account number">
      <label>Shown to clients?</label>
      <select id="paActive"><option value="1" ${!a || a.active ? 'selected' : ''}>Yes (active)</option><option value="0" ${a && !a.active ? 'selected' : ''}>No (hidden)</option></select>
      <button onclick="saveAccount()">${a ? 'SAVE CHANGES' : 'ADD ACCOUNT'}</button>
      ${a ? '<button class="ghost" onclick="cancelEdit()">CANCEL</button>' : ''}
    </div>
    <h3>All Accounts</h3>` + table(['Method', 'Bank', 'Account Name', 'Account Number', 'Shown', 'Actions'],
    data.map(x => `<tr><td>${x.method}</td><td>${esc(x.bank) || '-'}</td><td>${esc(x.account_name)}</td><td><b>${esc(x.account_number)}</b></td>
      <td><span class="badge ${x.active ? 'st-Available' : 'st-Cancelled'}">${x.active ? 'Yes' : 'No'}</span></td>
      <td><button class="small ghost" onclick="startEdit(${x.id})">Edit</button>
      <button class="small danger" onclick="deleteAccount(${x.id})">Delete</button></td></tr>`).join(''));
  toggleBank();
}
function toggleBank() { $('paBankRow').style.display = $('paMethod').value === 'Bank Transfer' ? '' : 'none'; }
function startEdit(id) { editId = id; loadAccounts(); window.scrollTo(0, 0); }
function cancelEdit() { editId = null; loadAccounts(); }

async function saveAccount() {
  const method = $('paMethod').value, bank = $('paBank').value.trim();
  const account_name = $('paName').value.trim(), account_number = $('paNum').value.trim();
  if (!account_name || !account_number) return say('Account name and account number are required.', false);
  if (method === 'Bank Transfer' && !bank) return say('Please enter the bank name.', false);
  const row = { method, bank: method === 'Bank Transfer' ? bank : null, account_name, account_number, active: $('paActive').value === '1' };
  const { error } = editId ? await db.from('payment_accounts').update(row).eq('id', editId) : await db.from('payment_accounts').insert(row);
  if (error) return say(error.message, false);
  const was = editId; editId = null;
  await loadAccounts(); say(was ? 'Account updated.' : 'Account added.');
}
async function deleteAccount(id) {
  if (!confirm('Delete this payment account?')) return;
  const { error } = await db.from('payment_accounts').delete().eq('id', id);
  if (error) return say(error.message, false);
  if (editId === id) editId = null;
  await loadAccounts(); say('Account deleted.');
}

// Start: check the role, then show the page
(async () => { if (await requireRole('admin')) loadAccounts(); })();
