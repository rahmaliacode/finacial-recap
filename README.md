# Arus — catatan keuangan pribadi

Catat pemasukan dan pengeluaran lewat kalimat bahasa Indonesia, lalu lihat laporan bulanan beserta rincian kategori. Buat target tabungan dengan setoran/penarikan, dan simpan split bill yang dibagi rata beserta status pembayaran tiap orang. Data disimpan per akun di Supabase; situs gratis di GitHub Pages.

## Jalankan

```sh
npm ci
npm run dev
```

Untuk daftar dan langsung masuk tanpa verifikasi email, atur Supabase Dashboard → Authentication → Sign In / Providers → Email → **Confirm Email: off**. Proyek saat ini: `lcvrfgvhoiucotzzbfks`. Pastikan Email provider dan pendaftaran pengguna aktif. Saat mode ini digunakan, pemilik alamat email tidak diverifikasi; jangan gunakan alamat orang lain. Tanpa akses email, reset kata sandi tidak tersedia.

Catatan lama dari versi browser dapat diimpor ketika pertama kali masuk di perangkat yang sama. JSON cadangan juga dapat diimpor melalui tombol unggah. Riwayat bulanan ada di menu Laporan bulanan. Parser kategori berjalan di browser tanpa layanan AI eksternal.

Tabungan dan split bill disimpan terpisah dari transaksi pemasukan/pengeluaran. Split bill mendukung pembagian sama rata atau sesuai harga pesanan tiap orang. Pada mode pesanan, tulis `Nama | harga` per item dan masukkan total akhir struk termasuk pajak. Selisih biaya layanan, pajak, atau diskon dibagi proporsional hingga jumlah bagian tepat sesuai total. Bagian sendiri dapat dicatat sekali sebagai pengeluaran. Setoran tabungan dapat ditautkan pada transaksi yang sudah ada.

Menu Anggaran menyimpan batas pengeluaran per kategori dan bulan. Menu Jadwal mencatat pemasukan atau tagihan bulanan dengan tanggal jatuh tempo; pengguna menekan **Catat transaksi** sesudah pembayaran terjadi. Tanggal 29–31 menyesuaikan hari terakhir bulan yang pendek. Laporan menampilkan perbandingan bulan sebelumnya. Transaksi bisa diubah dari riwayat.

Tombol cadangan mengunduh format JSON versi 2 yang mencakup transaksi, tabungan, split bill, anggaran, dan jadwal. Impor menerima format lama versi 1 khusus transaksi, serta versi 2. Impor menambahkan catatan dan melewati ID yang sudah ada; lakukan pada akun yang sama untuk menjaga tautan antarcatatan.
