'use strict';
const $=id=>document.getElementById(id), canvas=$('canvas'),ctx=canvas.getContext('2d');
const pilot=[
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
const storyTemplates=[
{hook:'At midnight, a strange message appeared on her phone.',turn:'The sender was her own number, dated tomorrow.',end:'Then the screen lit up: Do not open the door.'},
{hook:'Every night, the hallway clock stopped at exactly 12:13.',turn:'One evening, every photo on the wall changed.',end:'The last photo showed someone standing behind her.'},
{hook:'He found a key hidden inside an old library book.',turn:'It opened a door that was not there yesterday.',end:'Inside was a letter signed with his name, fifty years ago.'}
];
function buildStory(idea){let seed=[...idea].reduce((a,c)=>a+c.charCodeAt(0),0),t=storyTemplates[seed%storyTemplates.length];let topic=idea.trim().replace(/[.!?]+$/,'')||'The Midnight Mystery';return [`This is the story of ${topic.toLowerCase()}.`,t.hook,'At first, everything seemed completely normal.','But something impossible was about to happen.',t.turn,'There was a note with just three words: LOOK BEHIND YOU.','She tried to leave, but the lights went out.',t.end,'And that was only the beginning.','What would you have done?'].join('\n')}
$('sample').onclick=()=>{$('idea').value='The Elevator Had a Floor That Didn\'t Exist';$('script').value=pilot.join('\n');setStatus('Episódio piloto carregado.')};
$('generate').onclick=()=>{$('script').value=buildStory($('idea').value);setStatus('Roteiro original criado. Revise antes de exportar.')};
function setStatus(s){$('status').textContent=s}
function voices(){let all=speechSynthesis.getVoices().filter(v=>v.lang.toLowerCase().startsWith('en'));$('voice').innerHTML='<option value="">Voz padrão em inglês</option>'+all.map((v,i)=>`<option value="${i}">${v.name.replace(/</g,'&lt;')} (${v.lang})</option>`).join('');window.englishVoices=all}
if('speechSynthesis'in window){voices();speechSynthesis.onvoiceschanged=voices}
$('preview').onclick=()=>{if(!('speechSynthesis'in window)){setStatus('Narração indisponível neste navegador.');return}speechSynthesis.cancel();let u=new SpeechSynthesisUtterance($('script').value.replace(/\n/g,' '));u.lang='en-US';u.rate=.92;u.pitch=.85;let v=window.englishVoices?.[Number($('voice').value)];if(v)u.voice=v;speechSynthesis.speak(u);setStatus('Prévia da narração (não incluída no arquivo exportado).')};
function wrap(text,maxWidth){let words=text.split(/\s+/),lines=[],line='';for(let word of words){let trial=line?line+' '+word:word;if(ctx.measureText(trial).width>maxWidth&&line){lines.push(line);line=word}else line=trial}if(line)lines.push(line);return lines}
function draw(scene,progress,lines,total){let w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);let bg=ctx.createLinearGradient(0,0,w,h);bg.addColorStop(0,'#070a19');bg.addColorStop(.5,'#29184e');bg.addColorStop(1,'#070714');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);ctx.save();ctx.translate(w/2,h/2);let z=1+progress*.08;ctx.scale(z,z);ctx.translate(-w/2,-h/2);
// Procedural cinematic corridor, drawn locally without stock images.
ctx.fillStyle='#120e2c';ctx.fillRect(0,0,w,h);let glow=ctx.createRadialGradient(w/2,440,20,w/2,440,700);glow.addColorStop(0,'#5e398b');glow.addColorStop(1,'#0b0918');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
for(let i=0;i<6;i++){let inset=i*65,top=i*100;ctx.strokeStyle=`rgba(205,174,255,${.10+i*.07})`;ctx.lineWidth=4;ctx.strokeRect(inset,top,w-2*inset,h-top*1.5);}
ctx.beginPath();ctx.moveTo(0,h);ctx.lineTo(w/2,670);ctx.lineTo(w,h);ctx.fillStyle='#1e1532';ctx.fill();
ctx.shadowBlur=35;ctx.shadowColor='#aa78ff';ctx.fillStyle='#d6c0ff';ctx.font='bold 54px Georgia';ctx.textAlign='center';ctx.fillText(scene===0?'12 → 13':scene===total-1?'?':'13',w/2,360);ctx.shadowBlur=0;
for(let i=0;i<22;i++){let x=((i*139+scene*79)%w),y=((i*191+Math.sin(progress*5+i)*18)%h);ctx.fillStyle=`rgba(222,196,255,${.12+(i%4)*.08})`;ctx.beginPath();ctx.arc(x,y,2+i%3,0,Math.PI*2);ctx.fill()}ctx.restore();
let shade=ctx.createLinearGradient(0,0,0,h);shade.addColorStop(0,'#08071388');shade.addColorStop(.65,'#08071300');shade.addColorStop(1,'#080713ee');ctx.fillStyle=shade;ctx.fillRect(0,0,w,h);
ctx.textAlign='center';ctx.fillStyle='#d6c2ff';ctx.font='bold 35px Georgia';ctx.fillText('MIDNIGHT MINUTE',w/2,95);ctx.fillStyle='#e9e4f8';ctx.font='bold 43px system-ui';ctx.shadowColor='#000';ctx.shadowBlur=12;let caption=wrap(lines[scene],w-95),y=h-300-caption.length*25;caption.forEach(line=>{ctx.fillText(line,w/2,y);y+=56});ctx.shadowBlur=0;ctx.fillStyle='#b28bff';ctx.fillRect(w/2-110,h-90,220*(scene+progress)/total,5);ctx.fillStyle='#ffffff88';ctx.font='25px system-ui';ctx.fillText('ONE MINUTE. ONE MYSTERY.',w/2,h-35)}
let active=false,recorder,raf,audioCtx;
$('stop').onclick=()=>{if(active&&recorder?.state==='recording')recorder.stop()};
$('render').onclick=async()=>{if(active)return;let lines=$('script').value.split(/\n+/).map(s=>s.trim()).filter(Boolean);if(!lines.length){setStatus('Escreva pelo menos uma frase.');return}if(!canvas.captureStream||!window.MediaRecorder){setStatus('Este navegador não suporta gravação do canvas. Experimente Chrome no Android.');return}let sec=Math.min(12,Math.max(3,Number($('duration').value)||5)),duration=lines.length*sec;active=true;$('render').disabled=true;$('stop').disabled=false;$('download').hidden=true;
try{let stream=canvas.captureStream(30);audioCtx=new (window.AudioContext||window.webkitAudioContext)();await audioCtx.resume();let dest=audioCtx.createMediaStreamDestination(),osc=audioCtx.createOscillator(),gain=audioCtx.createGain();osc.type='sine';osc.frequency.value=72;gain.gain.value=.025;osc.connect(gain).connect(dest);osc.start();dest.stream.getAudioTracks().forEach(t=>stream.addTrack(t));let mime=['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'].find(t=>MediaRecorder.isTypeSupported(t));recorder=new MediaRecorder(stream,mime?{mimeType:mime,videoBitsPerSecond:2200000}:undefined);let chunks=[];recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};recorder.onstop=()=>{let blob=new Blob(chunks,{type:mime||'video/webm'}),url=URL.createObjectURL(blob);if($('download').dataset.url)URL.revokeObjectURL($('download').dataset.url);$('download').href=url;$('download').dataset.url=url;$('download').hidden=false;setStatus(`Vídeo pronto: ${(blob.size/1024/1024).toFixed(1)} MB. Baixe em WebM. Duração planejada: ${duration}s.`);active=false;$('render').disabled=false;$('stop').disabled=true;osc.stop();audioCtx.close();stream.getTracks().forEach(t=>t.stop())};recorder.start(500);let start=performance.now();function frame(now){if(!active)return;let elapsed=(now-start)/1000,scene=Math.min(lines.length-1,Math.floor(elapsed/sec)),p=Math.min(1,(elapsed-scene*sec)/sec);draw(scene,p,lines,lines.length);setStatus(`Renderizando cena ${scene+1}/${lines.length} • ${Math.min(duration,elapsed).toFixed(1)}s / ${duration}s`);if(elapsed>=duration){recorder.stop();return}raf=requestAnimationFrame(frame)}raf=requestAnimationFrame(frame)}catch(e){active=false;$('render').disabled=false;$('stop').disabled=true;setStatus('Erro: '+e.message)}};
$('sample').click();draw(0,0,pilot,pilot.length);
if('serviceWorker'in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('./sw.js').catch(()=>{});

let installPrompt=null;const installBtn=document.getElementById('installApp');const networkState=document.getElementById('networkState');function updateNetwork(){networkState.textContent=navigator.onLine?'Online • app disponível offline após o primeiro acesso':'Offline • recursos locais disponíveis'}window.addEventListener('online',updateNetwork);window.addEventListener('offline',updateNetwork);updateNetwork();window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;installBtn.hidden=false});installBtn.addEventListener('click',async()=>{if(!installPrompt)return;installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;installBtn.hidden=true});window.addEventListener('appinstalled',()=>{installBtn.hidden=true;networkState.textContent='Aplicativo instalado'});
