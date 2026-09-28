# Arus — catatan keuangan pribadi

Aplikasi sederhana untuk mencatat transaksi melalui kalimat bahasa Indonesia, meninjau kategori otomatis, dan melihat rekap bulanan. Dibangun dengan Vite dan Supabase Auth/Postgres.

## Jalankan

```sh
npm install
npm run dev
```

Isi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_PUBLISHABLE_KEY` di `.env.local` untuk pengembangan. Kunci publishable proyek ini sudah disediakan sebagai nilai bawaan aplikasi sehingga build GitHub Pages dapat berjalan tanpa secret tambahan. Skema ada di `supabase/migrations/20260928071600_create_personal_transactions.sql`.

Email masuk memakai Supabase OTP. Untuk GitHub Pages, atur Site URL dan Redirect URL Supabase Auth ke `https://rahmaliacode.github.io/finacial-recap/`. Parser transaksi berjalan di browser tanpa layanan AI eksternal; kategori dapat diubah sebelum disimpan.
