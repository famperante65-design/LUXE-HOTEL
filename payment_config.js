// ============================================================
// HOTEL PAYMENT ACCOUNTS  >>> EDIT THESE WITH YOUR REAL ACCOUNT DETAILS <<<
// Clients see these numbers on the payment step, send the money with their own
// GCash / PayMaya / bank app, then type the reference number from the receipt.
// (These are public details, the same as printing your account number on a bill.)
// ============================================================
const PAYMENT_ACCOUNTS = {
  'GCash':   { name: 'Your Hotel Name',  number: '0917 000 0000' },
  'PayMaya': { name: 'Your Hotel Name',  number: '0918 000 0000' },
  'Bank Transfer': {
    name: 'Your Hotel Name',
    banks: [
      { bank: 'BDO',        number: '0000 0000 0000' },
      { bank: 'BPI',        number: '0000 0000 00' },
      { bank: 'Metrobank',  number: '0000 0000 0000' },
      { bank: 'UnionBank',  number: '0000 0000 0000' },
      { bank: 'Landbank',   number: '0000 0000 00' }
    ]
  }
};
