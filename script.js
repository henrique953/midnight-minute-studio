
'use strict';

const $ = id => document.getElementById(id);
const canvas = $('canvas');
const ctx = canvas.getContext('2d');

const pilot = [
  'At exactly midnight, Emma entered her apartment elevator.',
  'She pressed twelve. But the elevator stopped at thirteen.',
  'The strange part? Her building only had twelve floors.',
  'The doors opened to a hallway filled with old photographs.',
  'Every photograph showed Emma, including one taken tomorrow.',
  'At the end of the hallway, she found a note: Do not take the elevator down.',
  'Suddenly her phone rang. The caller ID said: Emma.',
  'Her own voice whispered: I am still inside the elevator.',
  'Emma turned around and saw herself waving as the doors closed.',
  'Who was the real Emma?'
];

const storyTemplates = [
  {
    hook: 'At midnight, a strange message appeared on her phone.',
    turn: 'The sender was her own number, dated tomorrow.',
    end: 'Then the screen lit up: Do not open the door.'
  },
  {
    hook: 'Every night, the hallway clock stopped at exactly 12:13.',
    turn: 'One evening, every photo on the wall changed.',
    end: 'The last photo showed someone standing behind her.'
  },
  {
    hook: 'He found a key hidden inside an old library book.',
    turn: 'It opened a door that was not there yesterday.',
    end: 'Inside was a letter signed with his name, fifty years ago.'
  }
];

function setStatus(message) {
  $('status').textContent = message;
}

function buildStory(idea) {
  const seed = [...idea].reduce((a, c) => a + c.charCodeAt(0), 0);
  const t = storyTemplates[seed % storyTemplates.length];
  const topic = idea.trim().replace(/[.!?]+$/, '') || 'The Midnight Mystery';

  return [
    `This is the story of ${topic.toLowerCase()}.`,
    t.hook,
    'At first, everything seemed completely normal.',
    'But something impossible was about to happen.',
    t.turn,
    'There was a note with just three words: LOOK BEHIND YOU.',
    'She tried to leave, but the lights went out.',
    t.end,
    'And that was only the beginning.',
    'What would you have done?'
  ].join('\n');
}

$('sample').onclick = () => {
  $('idea').value = "The Elevator Had a Floor That Didn't Exist";
  $('script').value = pilot.join('\n');
  setStatus('Episódio piloto carregado.');
};

$('generate').onclick = () => {
  $('script').value = buildStory($('idea').value);
  setStatus('Roteiro criado. Revise antes de exportar.');
};

function loadVoices() {
  if (!('speechSynthesis' in window)) return;

  const voices = speechSynthesis.getVoices()
    .filter(v => v.lang.toLowerCase().startsWith('en'));

  window.englishVoices = voices;
  $('voice').innerHTML = '<option value="">Voz padrão em inglês</option>';

  voices.forEach((voice, i) => {
    const option = document.createElement('option');
    option.value = String(i);
    option.textContent = `${voice.name} (${voice.lang})`;
    $('voice').appendChild(option);
  });
}

if ('speechSynthesis' in window) {
  loadVoices();
  speechSynthesis.onvoiceschanged = loadVoices;
}

$('preview').onclick = () => {
  if (!('speechSynthesis' in window)) {
    setStatus('Narração indisponível neste navegador.');
    return;
  }

  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(
    $('script').value.replace(/\n/g, ' ')
  );

  utterance.lang = 'en-US';
  utterance.rate = 0.92;
  utterance.pitch = 0.85;

  const selected = window.englishVoices?.[Number($('voice').value)];
  if (selected) utterance.voice = selected;

  speechSynthesis.speak(utterance);
  setStatus('Prévia da voz. Ela não entra no vídeo exportado.');
};

function wrap(text, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';

  for (const word of words) {
    const trial = line ? line + ' ' + word : word;

    if (ctx.measureText(trial).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = trial;
    }
  }

  if (line) lines.push(line);
  return lines;
}

function draw(scene, progress, lines, total) {
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  ctx.save();
  ctx.translate(w / 2, h / 2);

  const zoom = 1 + progress * 0.08;
  ctx.scale(zoom, zoom);
  ctx.translate(-w / 2, -h / 2);

  ctx.fillStyle = '#120e2c';
  ctx.fillRect(0, 0, w, h);

  const glow = ctx.createRadialGradient(
    w / 2, 440, 20, w / 2, 440, 700
  );

  glow.addColorStop(0, '#5e398b');
  glow.addColorStop(1, '#0b0918');

  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  for (let i = 0; i < 6; i++) {
    const inset = i * 65;
    const top = i * 100;

    ctx.strokeStyle = `rgba(205,174,255,${0.1 + i * 0.07})`;
    ctx.lineWidth = 4;

    ctx.strokeRect(
      inset,
      top,
      w - 2 * inset,
      h - top * 1.5
    );
  }

  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.lineTo(w / 2, 670);
  ctx.lineTo(w, h);
  ctx.fillStyle = '#1e1532';
  ctx.fill();

  ctx.shadowBlur = 35;
  ctx.shadowColor = '#aa78ff';
  ctx.fillStyle = '#d6c0ff';
  ctx.font = 'bold 54px Georgia';
  ctx.textAlign = 'center';

  ctx.fillText(
    scene === 0 ? '12 → 13' : scene === total - 1 ? '?' : '13',
    w / 2,
    360
  );

  ctx.shadowBlur = 0;

  for (let i = 0; i < 22; i++) {
    const x = (i * 139 + scene * 79) % w;
    const y = (i * 191 + Math.sin(progress * 5 + i) * 18) % h;

    ctx.fillStyle = `rgba(222,196,255,${0.12 + (i % 4) * 0.08})`;
    ctx.beginPath();
    ctx.arc(x, y, 2 + i % 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  const shade = ctx.createLinearGradient(0, 0, 0, h);
  shade.addColorStop(0, '#08071388');
  shade.addColorStop(0.65, '#08071300');
  shade.addColorStop(1, '#080713ee');

  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, w, h);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#d6c2ff';
  ctx.font = 'bold 35px Georgia';
  ctx.fillText('MIDNIGHT MINUTE', w / 2, 95);

  ctx.fillStyle = '#e9e4f8';
  ctx.font = 'bold 43px system-ui';
  ctx.shadowColor = '#000';
  ctx.shadowBlur = 12;

  const caption = wrap(lines[scene] || '', w - 95);
  let y = h - 300 - caption.length * 25;

  caption.forEach(line => {
    ctx.fillText(line, w / 2, y);
    y += 56;
  });

  ctx.shadowBlur = 0;
  ctx.fillStyle = '#b28bff';

  ctx.fillRect(
    w / 2 - 110,
    h - 90,
    220 * (scene + progress) / total,
    5
  );

  ctx.fillStyle = '#ffffff88';
  ctx.font = '25px system-ui';
  ctx.fillText('ONE MINUTE. ONE MYSTERY.', w / 2, h - 35);
}

// Gravador corrigido para Android
let active = false;
let recorder = null;
let renderTimer = null;
let audioCtx = null;
let recordedFrames = 0;
let stopRecording = null;

$('stop').onclick = () => {
  if (stopRecording) stopRecording();
};

$('render').onclick = async () => {
  if (active) return;

  const lines = $('script').value
    .split(/\n+/)
    .map(s => s.trim())
    .filter(Boolean);

  if (!lines.length) {
    setStatus('Escreva pelo menos uma frase.');
    return;
  }

  if (!canvas.captureStream || !window.MediaRecorder) {
    setStatus('Navegador sem suporte. Use o Chrome atualizado.');
    return;
  }

  const sec = Math.min(
    12,
    Math.max(3, Number($('duration').value) || 5)
  );

  const duration = lines.length * sec;

  active = true;
  $('render').disabled = true;
  $('stop').disabled = false;
  $('download').hidden = true;

  let stream = null;
  let oscillator = null;

  try {
    draw(0, 0, lines, lines.length);

    // Primeiro testa se o Android aceita captura manual.
    stream = canvas.captureStream(0);
    let videoTrack = stream.getVideoTracks()[0];

    let manualFrames = Boolean(
      videoTrack && typeof videoTrack.requestFrame === 'function'
    );

    // Fallback: captura automática a 30 FPS.
    if (!manualFrames) {
      stream.getTracks().forEach(track => track.stop());
      stream = canvas.captureStream(30);
      videoTrack = stream.getVideoTracks()[0];
    }

    audioCtx = new (
      window.AudioContext || window.webkitAudioContext
    )();

    await audioCtx.resume();

    const destination = audioCtx.createMediaStreamDestination();
    oscillator = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = 72;
    gain.gain.value = 0.025;

    oscillator.connect(gain);
    gain.connect(destination);
    oscillator.start();

    destination.stream.getAudioTracks().forEach(track => {
      stream.addTrack(track);
    });

    const formats = [
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=vp9,opus',
      'video/webm'
    ];

    const mime = formats.find(type =>
      MediaRecorder.isTypeSupported(type)
    );

    recorder = new MediaRecorder(
      stream,
      mime
        ? { mimeType: mime, videoBitsPerSecond: 2200000 }
        : undefined
    );

    const chunks = [];

    recorder.ondataavailable = event => {
      if (event.data.size > 0) chunks.push(event.data);
    };

    function cleanup() {
      if (renderTimer !== null) {
        clearInterval(renderTimer);
        renderTimer = null;
      }

      if (oscillator) {
        try { oscillator.stop(); } catch (e) {}
      }

      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      if (audioCtx) {
        audioCtx.close().catch(() => {});
        audioCtx = null;
      }

      active = false;
      stopRecording = null;
      $('render').disabled = false;
      $('stop').disabled = true;
    }

    recorder.onstop = () => {
      const blob = new Blob(chunks, {
        type: recorder.mimeType || 'video/webm'
      });

      if (!blob.size) {
        setStatus('A gravação saiu vazia. Tente novamente.');
        cleanup();
        return;
      }

      const url = URL.createObjectURL(blob);
      const download = $('download');

      if (download.dataset.url) {
        URL.revokeObjectURL(download.dataset.url);
      }

      download.href = url;
      download.dataset.url = url;
      download.hidden = false;

      setStatus(
        `Vídeo pronto! ${(blob.size / 1048576).toFixed(1)} MB. ` +
        `${recordedFrames} quadros solicitados.`
      );

      cleanup();
    };

    recorder.onerror = () => {
      setStatus('Erro durante a gravação do vídeo.');
      cleanup();
    };

    recorder.start(1000);

    recordedFrames = 0;
    const start = performance.now();
    let lastSecond = -1;

    stopRecording = () => {
      if (recorder && recorder.state === 'recording') {
        recorder.stop();
      }
    };

    function frame() {
      if (!active || recorder.state !== 'recording') return;

      const elapsed = Math.min(
        duration,
        (performance.now() - start) / 1000
      );

      const scene = Math.min(
        lines.length - 1,
        Math.floor(elapsed / sec)
      );

      const progress = Math.min(
        1,
        (elapsed - scene * sec) / sec
      );

      draw(scene, progress, lines, lines.length);

      if (manualFrames) {
        try {
          videoTrack.requestFrame();
          recordedFrames++;
        } catch (error) {
          console.warn('Falha na captura manual:', error);
        }
      } else {
        recordedFrames++;
      }

      if (Math.floor(elapsed) !== lastSecond) {
        lastSecond = Math.floor(elapsed);

        setStatus(
          `Gravando cena ${scene + 1}/${lines.length} • ` +
          `${elapsed.toFixed(1)}s / ${duration}s`
        );
      }

      if (elapsed >= duration) {
        stopRecording();
      }
    }

    // Captura aproximadamente 10 quadros por segundo.
    renderTimer = setInterval(frame, 100);
    frame();

  } catch (error) {
    if (renderTimer !== null) {
      clearInterval(renderTimer);
      renderTimer = null;
    }

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    if (oscillator) {
      try { oscillator.stop(); } catch (e) {}
    }

    if (audioCtx) {
      audioCtx.close().catch(() => {});
      audioCtx = null;
    }

    active = false;
    stopRecording = null;
    $('render').disabled = false;
    $('stop').disabled = true;

    setStatus('Erro: ' + error.message);
  }
};

$('sample').click();
draw(0, 0, pilot, pilot.length);

// Instalação PWA
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

let installPrompt = null;
const installBtn = $('installApp');
const networkState = $('networkState');

function updateNetwork() {
  networkState.textContent = navigator.onLine
    ? 'Online • app disponível offline após o primeiro acesso'
    : 'Offline • recursos locais disponíveis';
}

window.addEventListener('online', updateNetwork);
window.addEventListener('offline', updateNetwork);
updateNetwork();

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  installPrompt = event;
  installBtn.hidden = false;
});

installBtn.addEventListener('click', async () => {
  if (!installPrompt) return;

  installPrompt.prompt();
  await installPrompt.userChoice;

  installPrompt = null;
  installBtn.hidden = true;
});

window.addEventListener('appinstalled', () => {
  installBtn.hidden = true;
  networkState.textContent = 'Aplicativo instalado';
});
