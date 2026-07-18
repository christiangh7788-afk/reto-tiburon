const MISSIONS=[
{category:'Venta diaria',title:'Vende 120% de tu presupuesto',target:120,unit:'%',reward:150,monthlyValue:1000},
{category:'Recargas',title:'Logra 200% del objetivo de recargas',target:200,unit:'%',reward:180,monthlyValue:1000},
{category:'Cañonetos',title:'Instala todos los cañonetos asignados',target:3,unit:'cañonetos',reward:120,monthlyValue:700},
{category:'Producto adoptado',title:'Vende 20 piezas del producto adoptado',target:20,unit:'piezas',reward:150,monthlyValue:900},
{category:'Cerveza',title:'Vende $2,000 de la cerveza especial',target:2000,unit:'MXN',reward:180,monthlyValue:1200},
{category:'Mayoreo',title:'Consigue una venta mayoreo de $1,500',target:1500,unit:'MXN',reward:160,monthlyValue:1100},
{category:'Reto semanal',title:'Venta semanal de cerveza > $10,000',target:10000,unit:'MXN',reward:300,monthlyValue:2500},
{category:'Servicios',title:'Alcanza 150% en pagos de servicios',target:150,unit:'%',reward:150,monthlyValue:900},
{category:'Ticket promedio',title:'Supera 110% del ticket promedio',target:110,unit:'%',reward:140,monthlyValue:900},
{category:'Producto foco',title:'Vende 30 piezas del SKU estrella',target:30,unit:'piezas',reward:160,monthlyValue:1000},
{category:'Gift Card',title:'Vende 5 Gift Cards en el día',target:5,unit:'tarjetas',reward:140,monthlyValue:700},
{category:'Venta diaria',title:'Rompe el presupuesto con 125%',target:125,unit:'%',reward:180,monthlyValue:1200},
{category:'Bebidas frías',title:'Genera $3,000 en bebidas frías',target:3000,unit:'MXN',reward:170,monthlyValue:1300},
{category:'Reto semanal',title:'Crece 8% contra la semana anterior',target:108,unit:'%',reward:300,monthlyValue:2200},
{category:'Remesas',title:'Realiza 5 operaciones de remesas',target:5,unit:'operaciones',reward:140,monthlyValue:800},
{category:'Venta cruzada',title:'Vende 25 productos complementarios',target:25,unit:'piezas',reward:150,monthlyValue:900},
{category:'Recargas',title:'Genera $3,500 en tiempo aire',target:3500,unit:'MXN',reward:180,monthlyValue:1300},
{category:'Producto adoptado',title:'Vende 25 piezas del producto adoptado',target:25,unit:'piezas',reward:170,monthlyValue:1100},
{category:'Cerveza',title:'Vende 15 combos cerveceros',target:15,unit:'combos',reward:180,monthlyValue:1200},
{category:'Venta diaria',title:'Alcanza 130% del presupuesto',target:130,unit:'%',reward:210,monthlyValue:1400},
{category:'Reto semanal',title:'Acumula 100 piezas del producto adoptado',target:100,unit:'piezas',reward:330,monthlyValue:2400},
{category:'Retiros',title:'Realiza 8 retiros de efectivo',target:8,unit:'operaciones',reward:150,monthlyValue:850},
{category:'Mayoreo',title:'Genera $5,000 de venta mayoreo',target:5000,unit:'MXN',reward:210,monthlyValue:1600},
{category:'Cañonetos',title:'Vende $1,500 desde tus cañonetos',target:1500,unit:'MXN',reward:180,monthlyValue:1100},
{category:'Servicios',title:'Realiza 15 operaciones financieras',target:15,unit:'operaciones',reward:180,monthlyValue:1000},
{category:'Cerveza',title:'Crece 20% en cerveza vs. semana anterior',target:120,unit:'%',reward:200,monthlyValue:1400},
{category:'Venta diaria',title:'Cierra con 128% del presupuesto',target:128,unit:'%',reward:200,monthlyValue:1400},
{category:'Reto semanal',title:'Supera $10,000 en categoría especial',target:10000,unit:'MXN',reward:350,monthlyValue:2500},
{category:'Producto foco',title:'Vende 40 piezas del producto foco',target:40,unit:'piezas',reward:210,monthlyValue:1500},
{category:'Gran final',title:'Cierra el mes con 135% del presupuesto',target:135,unit:'%',reward:500,monthlyValue:2500}
];
const COMPETITORS=[
{name:'Tienda Centro',points:2450},{name:'Tienda Norte',points:1980},{name:'Tienda Sur',points:1650},
{name:'Tienda Boca del Río',points:1430},{name:'Tienda Xalapa',points:1320},{name:'Tienda Córdoba',points:1190}
];
const STORAGE_KEY='reto-tiburon-v1-state';
const AUDIO_PREFS_KEY='reto-tiburon-v1-9-audio';
const AUDIO_TRACKS={casual:'assets/audio/music-funk-de-ventas.mp3',weekly:'assets/audio/music-funk-de-ventas.mp3'};
const SFX_PATHS={click:'assets/audio/click.wav',coin:'assets/audio/coin.wav',success:'assets/audio/success.wav',error:'assets/audio/error.wav',streak:'assets/audio/streak.wav',rank:'assets/audio/rank-up.wav'};
const $=id=>document.getElementById(id);
const format=n=>Number(n).toLocaleString('es-MX');
const state={storeName:'',storeCode:'',day:0,coins:0,streak:0,sales:0,completed:Array(30).fill(false),evidence:{},demo:false};
const audioPrefs={music:true,sfx:true,musicVolume:.35,sfxVolume:.75};
const RANKS=[
  {min:0,max:5,name:'Aprendiz Tiburón',icon:'⚓'},
  {min:6,max:10,name:'Marinero Tiburón',icon:'🛟'},
  {min:11,max:20,name:'Oficial Tiburón',icon:'★'},
  {min:21,max:29,name:'Comandante Tiburón',icon:'🏅'},
  {min:30,max:30,name:'Capitán Tiburón #1',icon:'👑'}
];
function missionCount(){return state.completed.filter(Boolean).length}
function sharkRank(count=missionCount()){return RANKS.find(rank=>count>=rank.min&&count<=rank.max)||RANKS[0]}

const sfxBank={}; let deferredInstallPrompt=null; let audioUnlocked=false; let toastTimer=null;
function targetText(m){return m.unit==='MXN'?`$${format(m.target)} MXN`:`${format(m.target)} ${m.unit}`}
function titleClass(text){return text.length>44?'vlong':text.length>30?'long':''}
function showStatus(message){const el=$('statusMessage');if(!el)return;el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3200)}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}
function load(){const raw=localStorage.getItem(STORAGE_KEY);if(!raw)return false;try{Object.assign(state,JSON.parse(raw));if(!Array.isArray(state.completed)||state.completed.length!==30)state.completed=Array(30).fill(false);return Boolean(state.storeName)}catch{return false}}
function loadAudioPrefs(){try{const raw=localStorage.getItem(AUDIO_PREFS_KEY);if(raw)Object.assign(audioPrefs,JSON.parse(raw))}catch{};audioPrefs.musicVolume=Math.max(0,Math.min(1,Number(audioPrefs.musicVolume)||0));audioPrefs.sfxVolume=Math.max(0,Math.min(1,Number(audioPrefs.sfxVolume)||0));Object.entries(SFX_PATHS).forEach(([name,path])=>{const a=new Audio(path);a.preload='auto';sfxBank[name]=a});updateAudioUI()}
function saveAudioPrefs(){localStorage.setItem(AUDIO_PREFS_KEY,JSON.stringify(audioPrefs))}
function desiredMusicKey(){const category=MISSIONS[state.day]?.category||'';return category==='Reto semanal'||category==='Gran final'?'weekly':'casual'}
function updateAudioUI(){const musicButton=$('musicToggle');const effectsButton=$('effectsToggle');if(musicButton){musicButton.classList.toggle('is-off',!audioPrefs.music);musicButton.setAttribute('aria-pressed',String(audioPrefs.music));musicButton.querySelector('b').textContent=audioPrefs.music?'Activada':'Silenciada'}if(effectsButton){effectsButton.classList.toggle('is-off',!audioPrefs.sfx);effectsButton.setAttribute('aria-pressed',String(audioPrefs.sfx));effectsButton.querySelector('b').textContent=audioPrefs.sfx?'Activados':'Silenciados'}if($('musicVolume')){$('musicVolume').value=String(audioPrefs.musicVolume);$('musicVolume').disabled=!audioPrefs.music}if($('effectsVolume')){$('effectsVolume').value=String(audioPrefs.sfxVolume);$('effectsVolume').disabled=!audioPrefs.sfx}const banner=$('audioUnlockBanner');if(banner&&!$('appShell').hidden)banner.hidden=audioUnlocked||!audioPrefs.music}
function syncMusicForMission(force=false){const player=$('backgroundMusic');if(!player)return;const key=desiredMusicKey();const path=AUDIO_TRACKS[key];const changed=player.dataset.track!==key;if(force||changed){player.pause();player.src=path;player.dataset.track=key;player.load()}player.volume=audioPrefs.musicVolume;if(audioUnlocked&&audioPrefs.music&&!document.hidden){player.play().catch(()=>{$('audioUnlockBanner').hidden=false})}}
function unlockAudio(){audioUnlocked=true;syncMusicForMission();updateAudioUI()}
function pauseMusic(){const p=$('backgroundMusic');if(p)p.pause()}
function playSfx(name,delay=0){if(!audioUnlocked||!audioPrefs.sfx||!sfxBank[name])return;window.setTimeout(()=>{try{const s=sfxBank[name].cloneNode(true);s.volume=audioPrefs.sfxVolume;s.play().catch(()=>{})}catch{}},delay)}
function setMusicEnabled(enabled){audioPrefs.music=enabled;saveAudioPrefs();if(enabled){unlockAudio()}else{pauseMusic()}updateAudioUI()}
function setEffectsEnabled(enabled){audioPrefs.sfx=enabled;saveAudioPrefs();updateAudioUI()}
function currentRank(points){const all=[...COMPETITORS.map(i=>({...i})),{name:state.storeName||'Mi tienda',points,me:true}].sort((a,b)=>b.points-a.points);return all.findIndex(i=>i.me)+1}
function initialState(demo){state.demo=demo;state.storeName=$('storeNameInput').value.trim()||'Tienda Demo';state.storeCode=$('storeCodeInput').value.trim()||'001';state.evidence={};if(demo){state.day=6;state.coins=1250;state.streak=6;state.sales=18900;state.completed=Array.from({length:30},(_,i)=>i<6)}else{state.day=0;state.coins=0;state.streak=0;state.sales=0;state.completed=Array(30).fill(false)}save();enterApp();unlockAudio()}
function enterApp(){$('loginScreen').hidden=true;$('loginScreen').style.display='none';$('appShell').hidden=false;$('appShell').style.display='block';$('drawerStore').textContent=state.storeName;$('drawerCode').textContent=`Sucursal ${state.storeCode}`;render();updateAudioUI()}
function openDrawer(open){$('drawer').classList.toggle('open',open);$('drawer').setAttribute('aria-hidden',String(!open))}
function rankingData(){return [...COMPETITORS,{name:state.storeName||'Mi tienda',points:state.coins,me:true}].sort((a,b)=>b.points-a.points)}
function renderRanking(){const top=rankingData().slice(0,3);$('rankingList').innerHTML='';top.forEach((item,index)=>{const row=document.createElement('div');row.className='ranking-row';const medal=index===0?'gold':index===1?'silver':'bronze';row.innerHTML=`<div class="medal ${medal}">${index+1}</div><div class="store">▣</div><div class="name"></div><div class="score"></div>`;row.querySelector('.name').textContent=item.name;row.querySelector('.score').textContent=`${format(item.points)} ◉`;if(item.me)row.style.outline='2px solid #ff6a00';$('rankingList').appendChild(row)})}
function renderFullRanking(){const wrap=$('rankingFullList');wrap.innerHTML='';rankingData().forEach((item,index)=>{const row=document.createElement('div');row.className='ranking-full-row';row.innerHTML=`<strong>${index+1}. ${item.name}</strong><small>${format(item.points)} netocoins</small>`;if(item.me)row.style.border='2px solid #ff6500';wrap.appendChild(row)})}
function render(){const m=MISSIONS[state.day];const next=MISSIONS[Math.min(29,state.day+1)];const pct=Math.min(100,Math.round(state.sales/30000*100));$('dayStat').textContent=`${state.day+1}/30`; $('coinsStat').textContent=format(state.coins); $('streakStat').textContent=`${state.streak} ${state.streak===1?'día':'días'}`;
$('missionKicker').textContent=`DÍA ${state.day+1} · ${m.category.toUpperCase()}`; const mt=$('missionTitle'); mt.textContent=m.title; mt.className=''; const mc=titleClass(m.title); if(mc) mt.classList.add(mc);
$('rewardValue').textContent=`+${m.reward}`; $('goalValue').textContent=`Meta: ${targetText(m)}`;
$('progressPercent').textContent=`${pct}%`; $('progressFill').style.width=`${pct}%`; $('fin').style.left=`${pct}%`; $('salesValue').textContent=`$${format(state.sales)}`;
const nt=$('nextTitle'); nt.textContent=state.day===29?'Premiación mensual':next.title; nt.className=''; const nc=titleClass(nt.textContent); if(nc) nt.classList.add(nc); $('nextGoal').textContent=state.day===29?'Ranking final de tiendas':`Meta: ${targetText(next)}`; $('nextReward').textContent=state.day===29?'🏆':next.reward;
const completed=state.completed[state.day]; $('ctaLabel').textContent=completed?'MISIÓN CUMPLIDA':'VALIDAR MISIÓN'; $('ctaLabel').classList.toggle('completed',completed); $('validateButton').disabled=completed;
$('profileStore').textContent=state.storeName; $('profileCode').textContent=state.storeCode; $('profileMissions').textContent=missionCount(); $('profileCoins').textContent=format(state.coins); $('profileRank').textContent=sharkRank().name;
renderRanking(); syncMusicForMission()}
function openValidation(){const m=MISSIONS[state.day];$('validationTitle').textContent=m.title;$('validationHelp').textContent=`Meta del día: ${targetText(m)}.`;$('resultUnit').textContent=m.unit;$('resultInput').value='';$('evidenceInput').value='';$('validationDialog').showModal();setTimeout(()=>$('resultInput').focus(),100)}
function showCompletion({level,earned,oldRank,newRank,finalMission}){
  $('completionLevel').textContent=`NIVEL ${level}`;
  $('completionReward').textContent=`+${earned}`;
  $('completionRank').textContent=newRank.name;
  $('completionRankIcon').textContent=newRank.icon;
  const promoted=oldRank.name!==newRank.name;
  $('promotionBanner').hidden=!promoted;
  if(promoted)$('promotionText').textContent=`Ahora eres ${newRank.name}`;
  if(finalMission){
    $('completionHeading').textContent='¡Misión mensual completada!';
    $('completionMessage').textContent='Has conquistado las 30 misiones. Ya eres el Capitán Tiburón #1.';
    $('continueCompletion').textContent='Ver resultado final';
    $('completionDialog').classList.add('final-level');
  }else{
    $('completionHeading').textContent='¡Bien hecho!';
    $('completionMessage').textContent='Cada misión te acerca a ser el Capitán Tiburón #1.';
    $('continueCompletion').textContent='Continuar';
    $('completionDialog').classList.remove('final-level');
  }
  $('completionDialog').showModal();
}
function validateMission(event){
  event.preventDefault();
  const m=MISSIONS[state.day];
  const completedDay=state.day;
  const result=Number($('resultInput').value);
  if(!Number.isFinite(result)||result<0){$('validationHelp').textContent='Captura un resultado válido.';playSfx('error');return}
  if(result<m.target){const missing=m.target-result;$('validationHelp').textContent=`Todavía faltan ${m.unit==='MXN'?'$'+format(missing):format(missing)+' '+m.unit}.`;playSfx('error');return}
  if(state.completed[completedDay]){$('validationDialog').close();return}
  const oldLeaderboardRank=currentRank(state.coins);
  const oldSharkRank=sharkRank();
  const bonus=Math.min(state.streak*10,100);
  const earned=m.reward+bonus;
  state.completed[completedDay]=true;
  state.coins+=earned;
  state.streak+=1;
  state.sales=Math.min(30000,state.sales+m.monthlyValue);
  state.evidence[completedDay]={result,evidence:$('evidenceInput').value.trim(),date:new Date().toISOString()};
  const newLeaderboardRank=currentRank(state.coins);
  const newSharkRank=sharkRank();
  const finalMission=missionCount()===30;
  $('validationDialog').close();
  playSfx('coin');
  playSfx('success',180);
  if(state.streak%3===0)playSfx('streak',900);
  if(newLeaderboardRank<oldLeaderboardRank||newSharkRank.name!==oldSharkRank.name)playSfx('rank',1350);
  if(completedDay<29)state.day=completedDay+1;
  save();
  render();
  showCompletion({level:completedDay+1,earned,oldRank:oldSharkRank,newRank:newSharkRank,finalMission});
}
function buildCalendar(){const wrap=$('missionCalendar');wrap.innerHTML='';MISSIONS.forEach((m,index)=>{const button=document.createElement('button');button.type='button';button.className='mission-day';if(state.completed[index])button.classList.add('done');if(index===state.day)button.classList.add('current');button.innerHTML=`<small>Día ${index+1} · ${m.category}</small><strong></strong><span>${m.reward} netocoins · Meta ${targetText(m)}</span>`;button.querySelector('strong').textContent=m.title;button.addEventListener('click',()=>{state.day=index;$('calendarDialog').close();render();save()});wrap.appendChild(button)})}

document.addEventListener('click',event=>{const button=event.target.closest('button');if(!button||button.disabled)return;unlockAudio();if(button.id!=='confirmValidation')playSfx('click')},{capture:true});
$('newGameButton').addEventListener('click',()=>initialState(false)); $('demoButton').addEventListener('click',()=>initialState(true)); $('menuButton').addEventListener('click',()=>openDrawer(true)); $('closeDrawer').addEventListener('click',()=>openDrawer(false)); $('notificationButton').addEventListener('click',()=>{$('notificationPanel').hidden=!$('notificationPanel').hidden}); $('calendarButton').addEventListener('click',()=>{openDrawer(false);buildCalendar();$('calendarDialog').showModal()}); $('closeCalendar').addEventListener('click',()=>$('calendarDialog').close()); $('profileButton').addEventListener('click',()=>{openDrawer(false);render();$('profileDialog').showModal()}); $('closeProfile').addEventListener('click',()=>$('profileDialog').close()); $('musicTestButton').addEventListener('click',()=>{openDrawer(false);window.location.href='musica-extra.html?v=1.9'}); $('audioUnlockBanner').addEventListener('click',()=>{unlockAudio();showStatus('Música y efectos activados.')});
$('musicToggle').addEventListener('click',()=>setMusicEnabled(!audioPrefs.music)); $('effectsToggle').addEventListener('click',()=>setEffectsEnabled(!audioPrefs.sfx)); $('musicVolume').addEventListener('input',e=>{audioPrefs.musicVolume=Number(e.target.value);$('backgroundMusic').volume=audioPrefs.musicVolume;saveAudioPrefs()}); $('effectsVolume').addEventListener('input',e=>{audioPrefs.sfxVolume=Number(e.target.value);saveAudioPrefs()});
$('resetButton').addEventListener('click',()=>{if(confirm('¿Reiniciar todo el progreso de esta sucursal?')){const demo=state.demo;state.day=demo?6:0;state.coins=demo?1250:0;state.streak=demo?6:0;state.sales=demo?18900:0;state.completed=demo?Array.from({length:30},(_,i)=>i<6):Array(30).fill(false);state.evidence={};save();openDrawer(false);render()}});
$('logoutButton').addEventListener('click',()=>{openDrawer(false);pauseMusic();$('appShell').hidden=true;$('appShell').style.display='none';$('loginScreen').hidden=false;$('loginScreen').style.display='grid'});
$('validateButton').addEventListener('click',openValidation); $('cancelValidation').addEventListener('click',()=>$('validationDialog').close()); $('validationForm').addEventListener('submit',validateMission); $('rankingToggle').addEventListener('click',()=>{renderFullRanking();$('rankingDialog').showModal()}); $('closeRanking').addEventListener('click',()=>$('rankingDialog').close()); $('nextMissionButton').addEventListener('click',()=>{if(state.day<29){state.day+=1;render();save()}});
document.querySelectorAll('[data-category]').forEach(button=>button.addEventListener('click',()=>{const category=button.dataset.category;let index=MISSIONS.findIndex((m,i)=>i>=state.day&&m.category===category); if(index<0) index=MISSIONS.findIndex(m=>m.category===category); if(index>=0){state.day=index;showStatus(`Mostrando el siguiente reto de ${category}.`);render();save()}}));
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferredInstallPrompt=event;$('installButton').hidden=false}); $('installButton').addEventListener('click',async()=>{if(!deferredInstallPrompt)return;deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice;deferredInstallPrompt=null;$('installButton').hidden=true});

$('continueCompletion').addEventListener('click',()=>$('completionDialog').close());
$('closeCompletion').addEventListener('click',()=>$('completionDialog').close());
document.addEventListener('visibilitychange',()=>{if(document.hidden){pauseMusic()}else if(audioUnlocked&&audioPrefs.music&&!$('appShell').hidden){syncMusicForMission()}});
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js?v=1.9').catch(()=>{}))}
loadAudioPrefs(); if(load())enterApp();
