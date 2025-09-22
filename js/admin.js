import { onSnapshot, query, where, orderBy, collection } 
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const $ = s=>document.querySelector(s);
const { auth, db, approveTopup, rejectTopup } = window.App.firebase;

auth.onAuthStateChanged(async user=>{
  if(!user){ location.href='index.html'; return; }
  $('#gate').classList.add('hidden');
  $('#app').classList.remove('hidden');
  $('#who').textContent = user.email || user.uid;

  const q = query(collection(db,'topups'), where('status','==','pending'), orderBy('createdAt','asc'));
  onSnapshot(q, snap=>{
    const list = $('#list'); list.innerHTML='';
    snap.forEach(doc=>{
      const d = doc.data();
      const li = document.createElement('li');
      li.className = 'p-3 rounded bg-white/5 border border-white/10';
      li.innerHTML = `
        <div class="flex items-center justify-between">
          <div>
            <div class="font-semibold">Rp ${Number(d.amount||0).toLocaleString('id-ID')}</div>
            <div class="text-xs text-slate-300">UID: ${d.uid}</div>
            <div class="text-xs text-slate-300">Ref: ${d.refCode || '-'}</div>
            ${d.note ? `<div class="text-xs text-slate-400">Catatan: ${d.note}</div>`:''}
          </div>
          <div class="flex gap-2">
            <button class="px-3 py-1 rounded bg-emerald-500/80 text-slate-900" data-act="ok" data-id="${doc.id}">Approve</button>
            <button class="px-3 py-1 rounded bg-rose-500/80 text-slate-900" data-act="no" data-id="${doc.id}">Tolak</button>
          </div>
        </div>`;
      list.appendChild(li);
    });
    if(!list.children.length) list.innerHTML='<li class="text-slate-400">Tidak ada pending.</li>';
  });

  $('#list').addEventListener('click', async (e)=>{
    const btn = e.target.closest('button[data-act]');
    if(!btn) return;
    const id = btn.dataset.id;
    if(btn.dataset.act==='ok'){
      if(confirm('Approve topup ini?')){
        try{ await approveTopup(id, auth.currentUser.uid); alert('Ok'); }catch(err){ alert(err.message); }
      }
    }else{
      const reason = prompt('Alasan tolak?','Tidak cocok bukti');
      try{ await rejectTopup(id, auth.currentUser.uid, reason||''); alert('Ditolak'); }catch(err){ alert(err.message); }
    }
  });

  $('#logout').onclick = ()=>auth.signOut();
});
