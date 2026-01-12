async function loadWorkouts() {
  const res = await fetch('./workouts.json', {cache:'no-store'});
  return await res.json();
}

function uniq(arr){ return [...new Set(arr)].sort((a,b)=>a.localeCompare(b)); }

function render(workouts){
  const list = document.getElementById('list');
  list.innerHTML = '';
  for (const w of workouts){
    const a = document.createElement('a');
    a.className = 'item';
    a.href = `workout.html?id=${encodeURIComponent(w.id)}`;
    a.innerHTML = `
      <div>
        <div class="title">${w.title}</div>
        <div class="meta">Page ${w.page} • ${w.tags.join(' • ')}</div>
      </div>
      <div class="badges">
        ${w.tags.map(t=>`<span class="badge">${t}</span>`).join('')}
      </div>
    `;
    list.appendChild(a);
  }
}

function applyFilter(all){
  const q = document.getElementById('q').value.trim().toLowerCase();
  const tag = document.getElementById('tag').value;
  const filtered = all.filter(w=>{
    const hay = (w.title + ' ' + w.tags.join(' ')).toLowerCase();
    const okQ = q ? hay.includes(q) : true;
    const okT = tag ? w.tags.includes(tag) : true;
    return okQ && okT;
  });
  render(filtered);
}

(async ()=>{
  const all = await loadWorkouts();

  // Tag dropdown
  const tagSel = document.getElementById('tag');
  const tags = uniq(all.flatMap(w=>w.tags));
  for (const t of tags){
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t;
    tagSel.appendChild(opt);
  }

  document.getElementById('q').addEventListener('input', ()=>applyFilter(all));
  tagSel.addEventListener('change', ()=>applyFilter(all));

  render(all);

  // Remember last opened workout (optional)
  const last = localStorage.getItem('lastWorkoutId');
  if (last && location.hash !== '#noredirect') {
    // Do nothing automatically; leaving this as a simple breadcrumb.
  }
})();
