export const CATEGORIES = {
  expense: ['Makanan & minuman', 'Transportasi', 'Belanja', 'Tagihan', 'Kesehatan', 'Hiburan', 'Pendidikan', 'Lainnya'],
  income: ['Gaji', 'Freelance', 'Usaha', 'Hadiah', 'Investasi', 'Lainnya'],
};

const hints = [
  ['Makanan & minuman', /makan|nasi|kopi|cafe|kafe|sarapan|siang|malam|jajan|snack|roti|resto|gofood|grabfood|minum|ayam|bakso|seblak/i],
  ['Transportasi', /ojek|bensin|parkir|tol|taksi|grab|gojek|kereta|bus|angkot|transport|motor/i],
  ['Belanja', /belanja|shopee|tokopedia|baju|sepatu|skincare|barang|supermarket|indomaret|alfamart/i],
  ['Tagihan', /listrik|air|wifi|internet|pulsa|paket data|sewa|kos|cicilan|tagihan|pdam/i],
  ['Kesehatan', /dokter|obat|rumah sakit|klinik|apotek|vitamin|bpjs/i],
  ['Hiburan', /nonton|bioskop|netflix|spotify|game|konser|liburan/i],
  ['Pendidikan', /buku|kursus|kelas|sekolah|kuliah|belajar/i],
];
const incomeHints = [
  ['Gaji', /gaji|salary|thr|bonus kantor/i], ['Freelance', /freelance|proyek|project|honor|fee klien/i],
  ['Usaha', /jualan|penjualan|usaha|customer|pelanggan/i], ['Hadiah', /hadiah|kado|dikasih|pemberian/i],
  ['Investasi', /dividen|bunga|investasi|reksadana/i],
];

export function localDate(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

export function parseTransaction(input, now = new Date()) {
  const text = input.trim();
  const match = text.match(/(?:rp\.?\s*)?(\d{1,3}(?:[.,]\d{3})+|\d+(?:[.,]\d+)?)\s*(juta|jt|ribu|rb|k)?\b/i);
  if (!match) return { error: 'Tulis nominalnya juga, misalnya “kopi 25 ribu”.' };
  const raw = match[1];
  const unit = (match[2] || '').toLowerCase();
  let amount;
  if (unit) amount = Math.round(Number(raw.replace(',', '.')) * (unit === 'juta' || unit === 'jt' ? 1_000_000 : 1_000));
  else amount = Number(raw.replace(/[.,]/g, ''));
  if (!Number.isSafeInteger(amount) || amount <= 0) return { error: 'Nominal tidak valid.' };
  const kind = /gaji|pemasukan|pendapatan|terima|dapat|dibayar|masuk|bonus|honor|fee|freelance|proyek|project|jualan|penjualan|dividen|hadiah|transfer dari|refund|cashback/i.test(text) ? 'income' : 'expense';
  const category = (kind === 'income' ? incomeHints : hints).find(([, re]) => re.test(text))?.[0] || 'Lainnya';
  let date = localDate(now);
  if (/kemarin/i.test(text)) date = localDate(new Date(now.getTime() - 86400000));
  const explicit = text.match(/\b(\d{1,2})[/-](\d{1,2})(?:[/-](\d{4}))?\b/);
  if (explicit) {
    const year = Number(explicit[3] || localDate(now).slice(0,4));
    const day = Number(explicit[1]), month = Number(explicit[2]);
    const d = new Date(Date.UTC(year, month - 1, day));
    if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month - 1 || d.getUTCDate() !== day) return { error: 'Tanggal tidak valid.' };
    date = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  }
  const description = text.replace(match[0], '').replace(/\b(hari ini|kemarin|tadi pagi|tadi siang|tadi malam|tanggal)\b/gi, '').replace(/\b\d{1,2}[/-]\d{1,2}(?:[/-]\d{4})?\b/g, '').replace(/\s+/g, ' ').trim() || (kind === 'income' ? 'Pemasukan' : 'Pengeluaran');
  return { amount, kind, category, description: description.slice(0,240), occurred_on: date };
}
