const qs = new URLSearchParams(location.search);
const workoutId = qs.get('id');

let allWorkouts = [];
let workout = null;

let mode = 'up'; // 'up' or 'down'
let running = false;
let t = 0;       // elapsed seconds (up)
let total = 300; // countdown total
let remaining = 300;
let tickHandle = null;

function fmt(seconds){
  const m = Math.floor(seconds/60);
  const s = seconds%60;
  return String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
}

function renderTime(){
  const el = document.getElementById('time');
  el.textContent = (mode==='up') ? fmt(t) : fmt(remaining);
}

function setMode(next){
  mode = next;
  running = false;
  clearInterval(tickHandle); tickHandle = null;
  document.getElementById('startPause').textContent = 'Start';

  document.getElementById('mUp').classList.toggle('active', mode==='up');
  document.getElementById('mDown').classList.toggle('active', mode==='down');
  document.getElementById('modeHelp').textContent = (mode==='up') ? 'For time (count up)' : 'Countdown';

  // presets for countdown
  const presets = document.getElementById('presets');
  if (mode==='down'){
    presets.style.display = '';
    presets.innerHTML = '';
    const choices = [
      {label:'30s', secs:30},
      {label:'1m', secs:60},
      {label:'2m', secs:120},
      {label:'5m', secs:300},
      {label:'10m', secs:600}
    ];
    for (const c of choices){
      const b = document.createElement('button');
      b.className = 'pill';
      b.type = 'button';
      b.textContent = c.label;
      b.addEventListener('click', ()=>{
        total = c.secs;
        remaining = c.secs;
        renderTime();
      });
      presets.appendChild(b);
    }
  } else {
    presets.style.display = 'none';
  }

  renderTime();
}

function start(){
  if (running) return;
  running = true;
  document.getElementById('startPause').textContent = 'Pause';

  tickHandle = setInterval(()=>{
    if (mode==='up'){
      t += 1;
    } else {
      if (remaining > 0){
        remaining -= 1;
      } else {
        pause();
        // Basic alert; iOS may require user interaction for sound.
        navigator.vibrate?.([200,100,200]);
      }
    }
    renderTime();
  }, 1000);
}

function pause(){
  running = false;
  document.getElementById('startPause').textContent = 'Start';
  clearInterval(tickHandle); tickHandle = null;
}

function reset(){
  pause();
  t = 0;
  remaining = total;
  renderTime();
}

function setCountdown(){
  const current = (mode==='down') ? remaining : total;
  const input = prompt('Set countdown in seconds (e.g., 300 for 5 minutes):', String(current));
  if (!input) return;
  const secs = Math.max(0, parseInt(input,10) || 0);
  total = secs;
  remaining = secs;
  renderTime();
}

async function load(){
  const res = await fetch('./workouts.json', {cache:'no-store'});
  allWorkouts = await res.json();
  workout = allWorkouts.find(w=>w.id===workoutId) || allWorkouts[0];

  document.title = workout.title;
  document.getElementById('title').textContent = workout.title;
  document.getElementById('meta').textContent = `Page ${workout.page} • ${workout.tags.join(' • ')}`;

  // Image per page
  const img = document.getElementById('pageImg');
  img.src = `assets/pages/page-${workout.page}.png`;
  img.alt = `${workout.title} (page ${workout.page})`;

  localStorage.setItem('lastWorkoutId', workout.id);

  renderTime();
}

document.getElementById('mUp').addEventListener('click', ()=>setMode('up'));
document.getElementById('mDown').addEventListener('click', ()=>setMode('down'));

document.getElementById('startPause').addEventListener('click', ()=>{
  if (running) pause(); else start();
});

document.getElementById('reset').addEventListener('click', reset);
document.getElementById('set').addEventListener('click', ()=>{
  if (mode==='down') setCountdown();
  else alert('Switch to Countdown to set a target time.');
});

setMode('up');
load();
