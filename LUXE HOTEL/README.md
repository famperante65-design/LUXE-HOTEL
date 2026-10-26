# Hotel Booking System

Simple student project: HTML + CSS + JavaScript with Supabase (database + login). No build step, so it runs as-is on GitHub Pages.

## Files
| Files | Purpose |
|---|---|
| `01_schema.sql` to `07_payment_accounts.sql` | Run in Supabase SQL Editor, in order (04 is optional sample rooms; 05 enables room photo uploads; 06 adds payment before booking; 07 adds the payment accounts admin can edit) |
| `supabase_client.js` | **Put your Supabase URL and anon key here** |
| `common.js` | Shared helpers, role check, menu, logout |
| `index.html` / `login.js`, `register.html` / `register.js`, `auth.css`, `auth_ui.js` | Luxury login and registration (flowing gold background) |
| `client_*.html/js` | Client: browse services, book, view own bookings |
| `staff_*.html/js`, `staff.css` | Staff: view/confirm/update bookings, verify payments, sales report (chrome violet + glass blue design) |
| `admin_*.html/js`, `admin.css`, `admin_ui.js` | Admin: users, services, reports, schedule, payment accounts (sidebar dashboard design) |
| `style.css` | Shared styling |

## 1. Supabase setup
1. Create a project at supabase.com.
2. **SQL Editor**: run `01_schema.sql`, then `02_auth_functions.sql`, then `03_rls_policies.sql`, then `05_storage.sql` (needed so the admin can upload room photos), then `06_payments.sql` (payment before booking), then `07_payment_accounts.sql` (payment accounts), then (optional) `04_sample_data.sql`.
3. **Authentication > Sign In / Providers > Email**: enabled. Turn **Confirm email** off while testing.
4. **Project Settings > API**: copy the **Project URL** and the **anon public** key into `supabase_client.js`.

The anon key is safe to commit because Row Level Security protects the data. **Never commit the `service_role` key.**

## 2. Create the first Admin
Register on the site, then run in the SQL Editor:
```sql
update profiles set role = 'admin' where email = 'your@email.com';
```
Log in with User Type **Admin**. Use **Manage Users** to promote other accounts to `staff` or `admin`.

## 3. Deploy on GitHub Pages
1. Create a new GitHub repository and upload all files in this folder (or `git init`, `git add .`, `git commit`, `git push`).
2. Repo **Settings > Pages > Build and deployment**: Source = **Deploy from a branch**, Branch = `main`, folder = `/ (root)`, then Save.
3. After a minute your site is live at `https://YOUR-USERNAME.github.io/YOUR-REPO/`.
4. In Supabase, go to **Authentication > URL Configuration** and set **Site URL** to that address. This is needed if you later turn email confirmation on.

## 4. Test
Register 3 accounts. Make one Admin (step 2), make another Staff from Manage Users, and keep one Client. As Admin add a room, as Client book it, and as Staff confirm it.

To run locally, open `index.html` (or use VS Code Live Server).

## Client page design
All client pages use one design: **Royal Burgundy** (`client-royal.css`). To change its colors, edit the variables at the top of that file. The login and register pages use the same burgundy and gold look (`auth.css`).

## Payment before booking
On the Enter Booking page the client fills in the booking details, presses **Continue to Payment**, and chooses **GCash**, **PayMaya** or **Bank Transfer** (BDO, BPI, Metrobank, UnionBank, Landbank). The page shows the hotel's account to send to; the client pays in their own app, then enters their sender name, sender number and the **reference number**. Only then is the booking saved (the database also refuses a booking without payment details).

After paying, the client sees a confirmation with the hotel hotline number. Change the number in the `HOTLINE` line at the top of `client_booking.js`.

Staff sees the payment in **Bookings**, checks the reference number against the hotel's GCash/PayMaya/bank record, and presses **Verify Pay** (or **Reject Pay**). A booking can only be **Confirmed** after its payment is Verified.

The admin sets the GCash, PayMaya and bank account name and number on the **Payment Accounts** page (add, edit, hide or delete accounts any time). Clients always see the current ones. This is a manual-payment flow: no money moves through this website. Real online checkout (automatic GCash/PayMaya payment) needs a payment provider such as PayMongo or Maya Business and a server to keep the secret key.

## Sidebar icons (Font Awesome)
The admin and staff sidebars use free Font Awesome icons loaded from your Font Awesome kit (the `FA_KIT` line near the top of `common.js`). In your Font Awesome account, add your site address (for example `YOUR-USERNAME.github.io`) to the kit's allowed domains, otherwise the icons will not show.
