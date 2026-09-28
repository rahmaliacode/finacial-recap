# Arus — catatan keuangan pribadi

Aplikasi sederhana untuk mencatat transaksi melalui kalimat bahasa Indonesia, meninjau kategori otomatis, dan melihat rekap bulanan. Dibangun dengan Vite dan Supabase Auth/Postgres.

## Jalankan

```sh
npm install
npm run dev
```

Isi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_PUBLISHABLE_KEY` di `.env.local` atau environment Vercel. Skema ada di `supabase/migrations/20260928071600_create_personal_transactions.sql`.

Email masuk memakai Supabase OTP. Konfigurasikan URL situs dan redirect URL di Supabase Auth agar tautan email kembali ke domain deployment. Parser transaksi berjalan di browser tanpa layanan AI eksternal; kategori dapat diubah sebelum disimpan.
