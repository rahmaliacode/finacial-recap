const money = amount => new Intl.NumberFormat('id-ID', {style:'currency',currency:'IDR',maximumFractionDigits:0}).format(amount);
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const formatDay = date => new Intl.DateTimeFormat('id-ID', {day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(`${date}T00:00:00Z`));

export function calendarDays(month, rows) {
  const [year, number] = month.split('-').map(Number);
  const first = new Date(Date.UTC(year,number-1,1)).getUTCDay();
  const offset = (first+6)%7;
  const last = new Date(Date.UTC(year,number,0)).getUTCDate();
  const grouped = new Map();
  for (const row of rows) {
    if (!row.occurred_on?.startsWith(month)) continue;
    const day = Number(row.occurred_on.slice(8,10));
    if (!grouped.has(day)) grouped.set(day,{income:0,expense:0,rows:[]});
    const summary = grouped.get(day);
    summary[row.kind] += Number(row.amount);
    summary.rows.push(row);
  }
  return {offset,days:Array.from({length:last},(_,index)=>({day:index+1,...(grouped.get(index+1)||{income:0,expense:0,rows:[]})}))};
}

export function renderCalendar(root,month,rows,selected,onSelect) {
  const {offset,days} = calendarDays(month,rows);
  const chosen = days.find(item=>item.day===selected) || days[0];
  root.innerHTML = `<section class="feature-card calendar-panel"><div class="feature-row"><div><span class="eyebrow">ARUS KAS HARIAN</span><h2>Kalender transaksi</h2></div><span class="muted">Hijau pemasukan · Jingga pengeluaran</span></div><div class="calendar-grid">${['Sen','Sel','Rab','Kam','Jum','Sab','Min'].map(name=>`<span class="calendar-weekday">${name}</span>`).join('')}${Array.from({length:offset},()=>'<span class="calendar-blank" aria-hidden="true"></span>').join('')}${days.map(item=>`<button class="calendar-day ${item.day===chosen.day?'selected':''}" data-calendar-day="${item.day}" aria-label="${esc(formatDay(`${month}-${String(item.day).padStart(2,'0')}`))}, pemasukan ${money(item.income)}, pengeluaran ${money(item.expense)}" aria-pressed="${item.day===chosen.day}"><strong>${item.day}</strong>${item.income?`<span class="calendar-income">+${money(item.income)}</span>`:''}${item.expense?`<span class="calendar-expense">−${money(item.expense)}</span>`:''}</button>`).join('')}</div></section><section class="feature-card calendar-detail"><span class="eyebrow">RINCIAN HARIAN</span><h2>${esc(formatDay(`${month}-${String(chosen.day).padStart(2,'0')}`))}</h2><div class="calendar-totals"><span>Pemasukan <strong class="positive">${money(chosen.income)}</strong></span><span>Pengeluaran <strong class="negative">${money(chosen.expense)}</strong></span></div>${chosen.rows.length?chosen.rows.map(row=>`<div class="calendar-item"><span><strong>${esc(row.description)}</strong><small>${esc(row.category)}</small></span><strong class="${row.kind==='income'?'positive':'negative'}">${row.kind==='income'?'+':'−'}${money(row.amount)}</strong></div>`).join(''):'<p class="muted">Belum ada transaksi di tanggal ini.</p>'}</section>`;
  root.querySelectorAll('[data-calendar-day]').forEach(button=>button.onclick=()=>onSelect(Number(button.dataset.calendarDay)));
}
