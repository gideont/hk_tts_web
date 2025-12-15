/* Default dark mode */
document.documentElement.setAttribute('data-theme','dark');

const synth = window.speechSynthesis;

const voiceSel = document.getElementById('voice');
const textEl = document.getElementById('text');
const reader = document.getElementById('reader');
const progress = document.getElementById('progress');
const playPauseBtn = document.getElementById('playPause');
const stopBtn = document.getElementById('stop');

const rate = document.getElementById('rate');
const pitch = document.getElementById('pitch');
const rateLabel = document.getElementById('rateLabel');
const pitchLabel = document.getElementById('pitchLabel');
const themeToggle = document.getElementById('themeToggle');

let chunks = [];
let index = 0;
let speaking = false;
let paused = false;

/* ---------- textarea auto expand ---------- */
function autoResize(){
  textEl.style.height = 'auto';
  textEl.style.height = textEl.scrollHeight + 'px';
}
textEl.addEventListener('input', autoResize);
autoResize();

/* ---------- voices ---------- */
function loadVoices(){
  const voices = synth.getVoices();
  if (!voices.length) return;

  voiceSel.innerHTML = '';

  voices.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v.name;
    opt.textContent = `${v.name} — ${v.lang}`;
    voiceSel.appendChild(opt);
  });

  // Auto-select Cantonese
  const cantonese = [...voiceSel.options].find(o =>
    /yue|粵|cantonese|zh-hk/i.test(o.text)
  );
  if (cantonese) voiceSel.value = cantonese.value;
}

/* critical: handle async loading */
document.addEventListener('DOMContentLoaded', loadVoices);
if ('onvoiceschanged' in synth) {
  synth.onvoiceschanged = loadVoices;
}

/* ---------- build paragraphs ---------- */
function buildChunks(){
  reader.innerHTML = '';
  chunks = textEl.value
    .split(/\n\s*\n/)
    .map(t => t.trim())
    .filter(Boolean)
    .map(t => {
      const span = document.createElement('span');
      span.className = 'chunk';
      span.textContent = t;
      reader.appendChild(span);
      return span;
    });

  reader.style.display = chunks.length ? 'block' : 'none';
  progress.disabled = !chunks.length;
}

/* ---------- highlight ---------- */
function highlight(i){
  chunks.forEach((c,idx) =>
    c.classList.toggle('active', idx === i)
  );
}

/* ---------- speaking ---------- */
function speakFrom(i){
  if (!chunks.length) return;

  synth.cancel();
  index = i;
  speaking = true;
  paused = false;
  playPauseBtn.textContent = '⏸ Pause';

  speakNext();
}

function speakNext(){
  if (!speaking || index >= chunks.length){
    speaking = false;
    paused = false;
    playPauseBtn.textContent = '▶ Speak';
    return;
  }

  highlight(index);
  progress.value = Math.floor(index / chunks.length * 100);

  const u = new SpeechSynthesisUtterance(chunks[index].textContent);

  const voice = synth.getVoices().find(v => v.name === voiceSel.value);
  if (voice) u.voice = voice;

  u.rate = +rate.value;
  u.pitch = +pitch.value;

  u.onend = () => {
    index++;
    speakNext();
  };

  synth.speak(u);
}

/* ---------- controls ---------- */
playPauseBtn.onclick = () => {
  if (!speaking){
    buildChunks();
    speakFrom(Math.floor(progress.value / 100 * chunks.length) || 0);
    return;
  }

  if (speaking && !paused){
    synth.pause();
    paused = true;
    playPauseBtn.textContent = '⏵ Resume';
    return;
  }

  if (paused){
    paused = false;
    synth.cancel();
    speakFrom(index); // restart paragraph with new rate/pitch
  }
};

stopBtn.onclick = () => {
  synth.cancel();
  speaking = false;
  paused = false;
  index = 0;
  progress.value = 0;
  chunks.forEach(c => c.classList.remove('active'));
  playPauseBtn.textContent = '▶ Speak';
};

progress.addEventListener('input', e => {
  if (!chunks.length) return;
  speakFrom(Math.floor(e.target.value / 100 * chunks.length));
});

/* ---------- sliders ---------- */
rate.oninput = () =>
  rateLabel.textContent = `${(+rate.value).toFixed(2)}×`;

pitch.oninput = () =>
  pitchLabel.textContent = `${(+pitch.value).toFixed(2)}`;

/* ---------- theme toggle ---------- */
themeToggle.onclick = () => {
  document.documentElement.setAttribute(
    'data-theme',
    document.documentElement.getAttribute('data-theme') === 'dark'
      ? 'light'
      : 'dark'
  );
};
