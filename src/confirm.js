export function confirmAction(message) {
  return new Promise(resolve => {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = `<div class="feature-card modal-card" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title"><h2 id="confirm-title">Konfirmasi hapus</h2><p class="confirm-message"></p><div class="feature-actions"><button type="button" class="secondary" data-cancel>Batal</button><button type="button" class="primary" data-accept>Hapus</button></div></div>`;
    backdrop.querySelector('.confirm-message').textContent = message;
    document.body.append(backdrop);
    const previous = document.activeElement;
    const close = choice => {
      document.removeEventListener('keydown', onKey);
      backdrop.remove();
      previous?.focus();
      resolve(choice);
    };
    const onKey = event => { if (event.key === 'Escape') close(false); };
    document.addEventListener('keydown', onKey);
    backdrop.querySelector('[data-cancel]').onclick = () => close(false);
    backdrop.querySelector('[data-accept]').onclick = () => close(true);
    backdrop.onclick = event => { if (event.target === backdrop) close(false); };
    backdrop.querySelector('[data-cancel]').focus();
  });
}

export async function deleteOwned(db, table, id) {
  const { data, error } = await db.from(table).delete().eq('id', id).select('id');
  if (error) throw error;
  if (!data?.length) throw new Error('Data tidak ditemukan atau akun tidak punya akses untuk menghapusnya.');
}
