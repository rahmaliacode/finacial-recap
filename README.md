# Arus — catatan keuangan pribadi

Catat pemasukan dan pengeluaran lewat kalimat bahasa Indonesia, lalu lihat laporan bulanan beserta rincian kategori. Buat target tabungan dengan setoran/penarikan, dan simpan split bill yang dibagi rata beserta status pembayaran tiap orang. Data disimpan per akun di Supabase; situs gratis di GitHub Pages.

## Jalankan

```sh
npm ci
npm run dev
```

Untuk daftar dan langsung masuk tanpa verifikasi email, atur Supabase Dashboard → Authentication → Sign In / Providers → Email → **Confirm Email: off**. Proyek saat ini: `lcvrfgvhoiucotzzbfks`. Pastikan Email provider dan pendaftaran pengguna aktif. Saat mode ini digunakan, pemilik alamat email tidak diverifikasi; jangan gunakan alamat orang lain. Tanpa akses email, reset kata sandi tidak tersedia.

Catatan lama dari versi browser dapat diimpor ketika pertama kali masuk di perangkat yang sama. JSON cadangan juga dapat diimpor melalui tombol unggah. Riwayat bulanan ada di menu Laporan bulanan. Parser kategori berjalan di browser tanpa layanan AI eksternal.

Tabungan dan split bill disimpan terpisah dari transaksi pemasukan/pengeluaran. Untuk menghitung split bill, masukkan jumlah akhir pada struk termasuk pajak. Bila pengeluaran pribadi perlu tampil pada laporan bulanan, catat juga melalui chat. Cadangan JSON saat ini hanya mencakup transaksi, bukan tabungan dan split bill.
