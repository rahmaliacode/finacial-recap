# Arus — catatan keuangan pribadi

Aplikasi sederhana untuk mencatat transaksi melalui kalimat bahasa Indonesia, meninjau kategori otomatis, dan melihat rekap bulanan. Versi tanpa login menyimpan transaksi di penyimpanan browser perangkat ini.

## Jalankan

```sh
npm install
npm run dev
```

Data tidak tersinkron ke perangkat lain. Gunakan tombol unduh cadangan secara rutin; file JSON hasilnya dapat dipulihkan lewat tombol di sebelahnya. Menghapus data browser juga menghapus catatan di perangkat ini.

Database Supabase dari versi awal tetap tersedia, tetapi tidak digunakan selama mode tanpa login. Skemanya ada di `supabase/migrations/20260928071600_create_personal_transactions.sql`. Parser transaksi berjalan di browser tanpa layanan AI eksternal; kategori dapat diubah sebelum disimpan.
