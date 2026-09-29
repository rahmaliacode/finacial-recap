const money = value => new Intl.NumberFormat('id-ID', {style:'currency',currency:'IDR',maximumFractionDigits:0}).format(value);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const validAmount = value => Number.isSafeInteger(value) && value > 0;
export function splitEvenly(total, count) {
  if (!validAmount(total) || !Number.isInteger(count) || count < 2 || count > 30 || total < count) throw new Error('Isi total dan minimal dua orang.');
  const base = Math.floor(total / count);
  return Array.from({length:count}, (_, index) => base + (index < total % count ? 1 : 0));
}
export function splitProportionally(total, subtotals) {
  if (!validAmount(total) || !Array.isArray(subtotals) || subtotals.length < 2 || subtotals.length > 30 || total < subtotals.length || !subtotals.every(validAmount)) throw new Error('Periksa total dan subtotal setiap orang.');
  const sum = subtotals.reduce((a,b) => a + BigInt(b), 0n);
  const pieces = subtotals.map((value,index) => {
    const product = BigInt(value) * BigInt(total);
    return {index,amount:Number(product / sum),remainder:product % sum};
  });
  let left = total - pieces.reduce((a,p) => a+p.amount,0);
  const ranked = [...pieces].sort((a,b) => a.remainder === b.remainder ? a.index-b.index : a.remainder > b.remainder ? -1 : 1);
  for (let i=0; i<left; i++) ranked[i].amount++;
  return pieces.map(p=>p.amount);
}
function parseOrders(input) {
  const lines=input.split('\n').map(line=>line.trim()).filter(Boolean);
  if (lines.length < 2 || lines.length > 60) throw new Error('Isi minimal dua pesanan, satu per baris.');
  const people=new Map();
  for(const line of lines){
    const parts=line.split('|');
    if(parts.length!==2)throw new Error('Gunakan format Nama | 30000 untuk setiap baris.');
    const name=parts[0].trim(),amount=Number(parts[1].trim().replace(/^rp\s*/i,'').replace(/[.\s]/g,''));
    if(!name || name.length>80 || !validAmount(amount))throw new Error('Nama dan harga pesanan harus diisi dengan benar.');
    const key=name.toLocaleLowerCase('id-ID');
    const previous=people.get(key);
    const subtotal=(previous?.baseAmount || 0)+amount;
    if(!Number.isSafeInteger(subtotal))throw new Error('Nominal terlalu besar.');
    people.set(key,{name:previous?.name || name,baseAmount:subtotal});
  }
  if(people.size<2 || people.size>30)throw new Error('Isi pesanan untuk 2–30 orang.');
  return [...people.values()];
}
export function createFeatures(db, notify, getView) {
  let goals = [], entries = [], bills = [];
  const root = () => document.querySelector('#dashboard');
  const showError = error => notify(error.message || 'Gagal menyimpan. Coba lagi.', true);
  async function load() {
    const results = await Promise.all([
      db.from('savings_goals').select('id,name,target_amount,created_at').order('created_at',{ascending:false}),
      db.from('savings_entries').select('id,goal_id,kind,amount,note,created_at').order('created_at',{ascending:false}),
      db.from('split_bills').select('id,title,total_amount,participants,created_at').order('created_at',{ascending:false})
    ]);
    const error = results.find(result => result.error)?.error;
    if (error) throw error;
    [goals,entries,bills] = results.map(result => result.data || []);
  }
  const balance = id => entries.filter(e => e.goal_id === id).reduce((sum,e) => sum + (e.kind === 'deposit' ? e.amount : -e.amount),0);
  function renderSavings() {
    root().innerHTML = `<div class="feature-grid"><section class="feature-card"><span class="eyebrow">TARGET BARU</span><h2>Buat tabungan</h2><form id="goal-form" class="feature-form"><label>Nama target<input name="name" maxlength="80" required placeholder="Contoh: Dana darurat"></label><label>Target (Rp)<input name="target" type="number" min="1" step="1" required placeholder="5000000"></label><button class="primary">Buat target</button></form></section><section class="feature-card"><span class="eyebrow">PROGRES</span><h2>Tabunganku</h2><p class="muted">Setoran di sini adalah catatan alokasi dana dan tidak mengubah laporan pemasukan/pengeluaran.</p><strong class="feature-total">${money(goals.reduce((sum,goal)=>sum+balance(goal.id),0))}</strong><span class="muted">Total dana di semua target</span></section></div><div class="goal-list">${goals.length ? goals.map(goal => {const saved=balance(goal.id),pct=Math.min(100,Math.max(0,saved/goal.target_amount*100));return `<section class="feature-card goal-card"><div class="feature-row"><div><span class="eyebrow">TARGET TABUNGAN</span><h2>${esc(goal.name)}</h2></div><button class="delete" data-remove-goal="${goal.id}" aria-label="Hapus target ${esc(goal.name)}">Hapus</button></div><div class="goal-amount"><strong>${money(saved)}</strong><span>dari ${money(goal.target_amount)}</span></div><div class="progress"><span style="width:${pct}%;background:#3a8890"></span></div><small>${Math.round(pct)}% tercapai</small><form class="feature-form entry-form" data-goal="${goal.id}"><label>Nominal (Rp)<input name="amount" type="number" min="1" step="1" required placeholder="100000"></label><label>Catatan<input name="note" maxlength="160" placeholder="Opsional"></label><div class="feature-actions"><button class="primary" name="kind" value="deposit">Tambah setoran</button><button class="secondary" name="kind" value="withdraw">Tarik dana</button></div></form><div class="entry-list">${entries.filter(e=>e.goal_id===goal.id).slice(0,10).map(e=>`<div class="entry-row"><span>${e.kind==='deposit'?'Setoran':'Penarikan'}${e.note?' · '+esc(e.note):''}<small>${new Date(e.created_at).toLocaleDateString('id-ID',{timeZone:'Asia/Jakarta'})}</small></span><strong class="${e.kind==='deposit'?'positive':'negative'}">${e.kind==='deposit'?'+':'−'}${money(e.amount)}</strong></div>`).join('') || '<p class="muted">Belum ada setoran.</p>'}</div></section>`;}).join('') : '<div class="feature-card feature-empty">Belum ada target. Buat target tabungan pertamamu di atas.</div>'}</div>`;
    document.querySelector('#goal-form').onsubmit=async event=>{event.preventDefault();const f=event.currentTarget;const target=Number(f.elements.target.value);if(!validAmount(target))return notify('Target harus lebih dari nol.',true);const {error}=await db.from('savings_goals').insert({name:f.elements.name.value.trim(),target_amount:target});if(error)return showError(error);notify('Target tabungan dibuat.');await refresh('savings');};
    document.querySelectorAll('.entry-form').forEach(form=>form.onsubmit=async event=>{event.preventDefault();const kind=event.submitter?.value || 'deposit',amount=Number(form.elements.amount.value),goalId=form.dataset.goal;if(!validAmount(amount))return notify('Nominal harus lebih dari nol.',true);if(kind==='withdraw'&&amount>balance(goalId))return notify('Penarikan melebihi dana yang tersedia.',true);const {error}=await db.from('savings_entries').insert({goal_id:goalId,kind,amount,note:form.elements.note.value.trim()});if(error)return showError(error);notify(kind==='deposit'?'Setoran tercatat.':'Penarikan tercatat.');await refresh('savings');});
    document.querySelectorAll('[data-remove-goal]').forEach(button=>button.onclick=async()=>{if(!confirm('Hapus target beserta semua riwayat setoran dan penarikannya?'))return;const {error}=await db.from('savings_goals').delete().eq('id',button.dataset.removeGoal);if(error)return showError(error);notify('Target dihapus.');await refresh('savings');});
  }
  function renderSplit() {
    root().innerHTML = `<div class="feature-grid"><section class="feature-card"><span class="eyebrow">TAGIHAN BARU</span><h2>Hitung split bill</h2><form id="bill-form" class="feature-form"><label>Nama tagihan<input name="title" maxlength="100" required placeholder="Contoh: Makan malam"></label><label>Total akhir struk termasuk pajak/biaya layanan (Rp)<input name="total" type="number" min="1" step="1" required placeholder="88000"></label><label>Cara membagi<select name="mode"><option value="equal">Sama rata</option><option value="orders">Sesuai pesanan</option></select></label><div id="equal-fields"><label>Nama orang, pisahkan dengan koma atau baris baru<textarea name="names" required placeholder="Rahmalia, Dini, Andi"></textarea></label></div><div id="orders-fields" hidden><label>Pesanan per orang, satu baris untuk tiap item<textarea name="orders" placeholder="Rahmalia | 30000&#10;Dini | 50000"></textarea></label><p class="muted">Format: Nama | harga sebelum pajak. Jika satu orang punya beberapa item, ulangi namanya di baris lain.</p></div><button class="primary">Hitung dan simpan</button></form></section><section class="feature-card"><span class="eyebrow">CARA KERJA</span><h2>Patungan lebih rapi</h2><p class="muted">Pilih sama rata bila semua orang membayar jumlah setara. Pilih sesuai pesanan bila harganya berbeda. Selisih antara total struk dan subtotal pesanan dibagi secara proporsional, termasuk pajak, biaya layanan, atau diskon.</p><p class="muted">Tandai orang yang sudah membayar. Split bill tersimpan terpisah dari transaksi bulanan.</p></section></div><div class="bill-list">${bills.length ? bills.map(bill=>{const people=Array.isArray(bill.participants)?bill.participants:[];const paid=people.filter(p=>p.paid).reduce((sum,p)=>sum+Number(p.amount),0);return `<section class="feature-card bill-card"><div class="feature-row"><div><span class="eyebrow">SPLIT BILL</span><h2>${esc(bill.title)}</h2><small>${new Date(bill.created_at).toLocaleDateString('id-ID',{timeZone:'Asia/Jakarta'})}</small></div><button class="delete" data-remove-bill="${bill.id}" aria-label="Hapus tagihan ${esc(bill.title)}">Hapus</button></div><div class="bill-summary"><strong>${money(bill.total_amount)}</strong><span>${people.length} orang · Terbayar ${money(paid)}</span></div><div class="bill-people">${people.map((p,index)=>`<label class="bill-person"><input type="checkbox" data-bill="${bill.id}" data-person="${index}" ${p.paid?'checked':''}><span>${esc(p.name)}${p.baseAmount?`<small>Pesanan ${money(Number(p.baseAmount))}</small>`:''}</span><strong>${money(Number(p.amount))}</strong></label>`).join('')}</div></section>`;}).join('') : '<div class="feature-card feature-empty">Belum ada tagihan. Buat split bill pertamamu di atas.</div>'}</div>`;
    const form=document.querySelector('#bill-form');
    form.elements.mode.onchange=()=>{const custom=form.elements.mode.value==='orders';document.querySelector('#equal-fields').hidden=custom;document.querySelector('#orders-fields').hidden=!custom;form.elements.names.required=!custom;form.elements.orders.required=custom;};
    form.onsubmit=async event=>{event.preventDefault();const f=event.currentTarget,total=Number(f.elements.total.value);let participants;try{if(f.elements.mode.value==='orders'){const orders=parseOrders(f.elements.orders.value);const amounts=splitProportionally(total,orders.map(o=>o.baseAmount));participants=orders.map((person,i)=>({...person,amount:amounts[i],paid:false}));}else{const names=f.elements.names.value.split(/[,\n]+/).map(n=>n.trim()).filter(Boolean);if(names.length<2||names.length>30||names.some(n=>n.length>80))throw new Error('Isi nama 2–30 orang.');const amounts=splitEvenly(total,names.length);participants=names.map((name,i)=>({name,amount:amounts[i],paid:false}));}}catch(error){return showError(error);}const {error}=await db.from('split_bills').insert({title:f.elements.title.value.trim(),total_amount:total,participants});if(error)return showError(error);notify('Split bill tersimpan.');await refresh('split');};
    document.querySelectorAll('[data-person]').forEach(input=>input.onchange=async()=>{const bill=bills.find(b=>b.id===input.dataset.bill);const participants=bill.participants.map((p,i)=>i===Number(input.dataset.person)?{...p,paid:input.checked}:p);input.disabled=true;const {error}=await db.from('split_bills').update({participants}).eq('id',bill.id);if(error){input.checked=!input.checked;input.disabled=false;return showError(error);}await refresh('split');});
    document.querySelectorAll('[data-remove-bill]').forEach(button=>button.onclick=async()=>{if(!confirm('Hapus split bill ini?'))return;const {error}=await db.from('split_bills').delete().eq('id',button.dataset.removeBill);if(error)return showError(error);notify('Split bill dihapus.');await refresh('split');});
  }
  async function refresh(view) {try {root().innerHTML='<div class="feature-card feature-empty">Memuat data…</div>';await load();if(getView()!==view)return;if(view==='savings')renderSavings();else renderSplit();}catch(error){root().innerHTML='<div class="feature-card feature-empty">Gagal memuat data. Buka menu ini lagi untuk mencoba ulang.</div>';showError(error);}}
  return {refresh};
}
