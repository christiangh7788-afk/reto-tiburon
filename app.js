
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
const COMPETITORS=[{name:'Tienda Centro',points:2450},{name:'Tienda Norte',points:1980},{name:'Tienda Sur',points:1650},{name:'Tienda Boca del Río',points:1430},{name:'Tienda Xalapa',points:1320}];
const STORAGE_KEY='reto-tiburon-v1-state';
const AUDIO_KEY='reto-tiburon-v3-audio';
const $=id=>document.getElementById(id);
const fmt=n=>Number(n).toLocaleString('es-MX');
const state={storeName:'',storeCode:'',playerName:'',day:0,coins:0,streak:0,sales:0,completed:Array(30).fill(false),evidence:{},bonusAccess:{},bonusPlayed:{},demo:false};
const RANKS=[
{min:0,max:5,name:'Aprendiz Tiburón',icon:'⚓'},
{min:6,max:10,name:'Marinero Tiburón',icon:'🛟'},
{min:11,max:20,name:'Oficial Tiburón',icon:'★'},
{min:21,max:29,name:'Comandante Tiburón',icon:'🏅'},
{min:30,max:30,name:'Capitán Tiburón #1',icon:'👑'}];
let audioUnlocked=false,pendingBonusLevel=0,lastCompletion=null,playerNameEditing=false;
const audioPrefs={music:true,sfx:true};
const sounds={};
const soundPaths={click:'assets/audio/click.wav',coin:'assets/audio/coin.wav',success:'assets/audio/success.wav',error:'assets/audio/error.wav',rank:'assets/audio/rank-up.wav'};
const mainImage=new Image(),completionImage=new Image();
mainImage.src='assets/principal-oficial.png';completionImage.src='assets/completion-template.png';

function missionCount(){return state.completed.filter(Boolean).length}
function rankFor(count=missionCount()){return RANKS.find(r=>count>=r.min&&count<=r.max)||RANKS[0]}
function targetText(m){return m.unit==='MXN'?`$${fmt(m.target)} MXN`:`${fmt(m.target)} ${m.unit}`}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}
function load(){
 try{
  let raw=localStorage.getItem(STORAGE_KEY);
  if(!raw){
   const visual=localStorage.getItem('reto-tiburon-visual-v5');
   if(visual){
    const old=JSON.parse(visual);
    state.storeName=String(old.storeName||'Tienda Demo');
    state.storeCode=String(old.storeCode||'001');
    state.playerName=String(old.playerName||'').trim();
    state.day=0;state.coins=0;state.streak=0;state.sales=0;
    state.completed=Array(30).fill(false);state.evidence={};state.bonusAccess={};state.bonusPlayed={};
    save();return true;
   }
   return false;
  }
  Object.assign(state,JSON.parse(raw));
  state.completed=Array.isArray(state.completed)&&state.completed.length===30?state.completed:Array(30).fill(false);
  state.evidence=state.evidence||{};state.bonusAccess=state.bonusAccess||{};state.bonusPlayed=state.bonusPlayed||{};
  state.playerName=String(state.playerName||'').trim();
  state.day=Math.max(0,Math.min(29,Number(state.day)||0));
  state.coins=Math.max(0,Number(state.coins)||0);
  state.streak=Math.max(0,Number(state.streak)||0);
  state.sales=Math.max(0,Math.min(30000,Number(state.sales)||0));
  return Boolean(state.storeName)
 }catch{return false}
}
function initSounds(){Object.entries(soundPaths).forEach(([k,p])=>{const a=new Audio(p);a.preload='auto';sounds[k]=a})}
function sfx(name){if(!audioUnlocked||!audioPrefs.sfx||!sounds[name])return;const a=sounds[name].cloneNode(true);a.volume=.75;a.play().catch(()=>{})}
function unlockAudio(){audioUnlocked=true;const p=$('backgroundMusic');p.volume=.34;if(audioPrefs.music)p.play().catch(()=>{});$('audioUnlockBanner').hidden=true}
function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(t._timer);t._timer=setTimeout(()=>t.classList.remove('show'),2600)}
function enterApp(){$('storeScreen').hidden=true;$('nameScreen').hidden=true;$('mainScreen').hidden=false;$('drawerPlayer').textContent=state.playerName||'Jugador';$('drawerRank').textContent=rankFor().name;$('drawerStore').textContent=state.storeName;$('drawerCode').textContent=`Sucursal ${state.storeCode}`;renderMain()}
function initialState(demo){
 state.storeName=$('storeName').value.trim()||'Tienda Demo';
 state.storeCode=$('storeCode').value.trim()||'001';
 state.demo=demo;state.evidence={};state.bonusAccess={};state.bonusPlayed={};
 if(demo){
  state.playerName=state.playerName||'Tiburón Max';
  state.day=6;state.coins=1250;state.streak=6;state.sales=18900;
  state.completed=Array.from({length:30},(_,i)=>i<6);
  save();enterApp();unlockAudio();return;
 }
 state.playerName='';state.day=0;state.coins=0;state.streak=0;state.sales=0;
 state.completed=Array(30).fill(false);save();showPlayerNameScreen(false);unlockAudio()
}

function playerNameValue(){return $('playerName').value.trim().replace(/\s+/g,' ')}
function updatePlayerNamePreview(){
 const value=playerNameValue();
 $('counter').textContent=`${$('playerName').value.length}/16`;
 $('previewName').textContent=value||'Tu nombre aparecerá aquí';
 $('playerPreviewInitial').textContent=value?value.charAt(0).toUpperCase():'?';
 $('playerNameError').textContent='';
 document.querySelectorAll('[data-player-name]').forEach(button=>button.classList.toggle('active',button.dataset.playerName===value));
}
function showPlayerNameScreen(editing=false){
 playerNameEditing=editing;
 $('storeScreen').hidden=true;
 $('mainScreen').hidden=true;
 $('nameScreen').hidden=false;
 $('playerName').value=state.playerName||'';
 $('adventureButton').setAttribute('aria-label',editing?'Guardar nuevo nombre':'Comenzar aventura');
 updatePlayerNamePreview();
 setTimeout(()=>$('playerName').focus(),120);
}
function confirmPlayerName(){
 const value=playerNameValue();
 if(value.length<3||value.length>16){$('playerNameError').textContent='Usa un nombre de entre 3 y 16 caracteres.';sfx('error');return}
 state.playerName=value;save();$('nameScreen').hidden=true;enterApp();sfx('success');toast(`¡Bienvenido a la aventura, ${value}!`)
}


const EVIDENCE_DB_NAME='reto-tiburon-evidence-v1';
const EVIDENCE_STORE='photos';
const photoPreviewUrls={mission:'',bonus:''};

function openEvidenceDB(){
 return new Promise((resolve,reject)=>{
  const request=indexedDB.open(EVIDENCE_DB_NAME,1);
  request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains(EVIDENCE_STORE))db.createObjectStore(EVIDENCE_STORE,{keyPath:'key'})};
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(request.error);
 });
}
async function compressEvidencePhoto(file){
 if(!file)return null;
 let bitmap;
 try{
  if('createImageBitmap'in window)bitmap=await createImageBitmap(file);
  else{
   bitmap=await new Promise((resolve,reject)=>{
    const img=new Image(),url=URL.createObjectURL(file);
    img.onload=()=>{URL.revokeObjectURL(url);resolve(img)};
    img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('No se pudo leer la imagen.'))};
    img.src=url;
   });
  }
  const maxSide=1280;
  const scale=Math.min(1,maxSide/Math.max(bitmap.width,bitmap.height));
  const canvas=document.createElement('canvas');
  canvas.width=Math.max(1,Math.round(bitmap.width*scale));
  canvas.height=Math.max(1,Math.round(bitmap.height*scale));
  const ctx=canvas.getContext('2d',{alpha:false});
  ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
  if(bitmap.close)bitmap.close();
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.78));
  if(!blob)throw new Error('No se pudo comprimir la fotografía.');
  return blob;
 }catch(error){
  if(file.size>8*1024*1024)throw new Error('La fotografía es demasiado grande. Intenta tomarla nuevamente.');
  return file;
 }
}
async function storeEvidencePhoto({key,file,kind,index,title}){
 const blob=await compressEvidencePhoto(file);
 const db=await openEvidenceDB();
 await new Promise((resolve,reject)=>{
  const tx=db.transaction(EVIDENCE_STORE,'readwrite');
  tx.objectStore(EVIDENCE_STORE).put({
   key,blob,kind,index,title,
   originalName:file.name||'evidencia.jpg',
   mimeType:blob.type||file.type||'image/jpeg',
   size:blob.size,
   createdAt:new Date().toISOString()
  });
  tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
 });
 db.close();
 let photoUrl='';
 if(typeof window.RetoEvidenceUploader==='function'){
  try{
   const response=await window.RetoEvidenceUploader({key,blob,kind,index,title,fileName:file.name||'evidencia.jpg'});
   photoUrl=typeof response==='string'?response:String(response?.url||'');
  }catch(error){console.warn('La evidencia quedó local; la carga remota falló.',error)}
 }
 return {
  localKey:key,
  photoUrl,
  syncStatus:photoUrl?'uploaded':'local',
  fileName:file.name||'evidencia.jpg',
  mimeType:blob.type||file.type||'image/jpeg',
  size:blob.size
 };
}
async function getStoredEvidencePhoto(key){
 const db=await openEvidenceDB();
 const result=await new Promise((resolve,reject)=>{
  const tx=db.transaction(EVIDENCE_STORE,'readonly');
  const request=tx.objectStore(EVIDENCE_STORE).get(key);
  request.onsuccess=()=>resolve(request.result||null);
  request.onerror=()=>reject(request.error);
 });
 db.close();return result;
}
async function clearStoredEvidencePhotos(){
 try{
  const db=await openEvidenceDB();
  await new Promise((resolve,reject)=>{
   const tx=db.transaction(EVIDENCE_STORE,'readwrite');
   tx.objectStore(EVIDENCE_STORE).clear();
   tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);
  });
  db.close();
 }catch(error){console.warn('No se pudieron borrar las evidencias locales.',error)}
}
function resetPhotoControl(kind){
 const input=$(kind==='mission'?'missionEvidencePhoto':'bonusEvidencePhoto');
 const preview=$(kind==='mission'?'missionEvidencePreview':'bonusEvidencePreview');
 const wrap=$(kind==='mission'?'missionEvidencePreviewWrap':'bonusEvidencePreviewWrap');
 const status=$(kind==='mission'?'missionEvidenceStatus':'bonusEvidenceStatus');
 if(photoPreviewUrls[kind]){URL.revokeObjectURL(photoPreviewUrls[kind]);photoPreviewUrls[kind]=''}
 input.value='';preview.removeAttribute('src');wrap.hidden=true;status.classList.remove('ready');
 status.textContent=kind==='mission'?'Debes agregar una fotografía para continuar.':'La fotografía es necesaria para abrir el reto de bonificación.';
}
function showPhotoPreview(kind,file){
 const preview=$(kind==='mission'?'missionEvidencePreview':'bonusEvidencePreview');
 const wrap=$(kind==='mission'?'missionEvidencePreviewWrap':'bonusEvidencePreviewWrap');
 const status=$(kind==='mission'?'missionEvidenceStatus':'bonusEvidenceStatus');
 if(photoPreviewUrls[kind])URL.revokeObjectURL(photoPreviewUrls[kind]);
 photoPreviewUrls[kind]=URL.createObjectURL(file);
 preview.src=photoPreviewUrls[kind];wrap.hidden=false;status.classList.add('ready');
 status.textContent='Fotografía lista para guardar.';
}
function bindPhotoControl(kind){
 const input=$(kind==='mission'?'missionEvidencePhoto':'bonusEvidencePhoto');
 const remove=$(kind==='mission'?'removeMissionEvidence':'removeBonusEvidence');
 input.addEventListener('change',()=>{
  const file=input.files?.[0];
  if(file&&!file.type.startsWith('image/')){resetPhotoControl(kind);toast('Selecciona una imagen válida.');sfx('error');return}
  if(file)showPhotoPreview(kind,file);else resetPhotoControl(kind);
 });
 remove.addEventListener('click',()=>resetPhotoControl(kind));
}

function text(ctx,text,x,y,size,color='#fff',align='left',weight='900'){
 ctx.save();ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline='top';ctx.font=`${weight} ${size}px Arial`;ctx.fillText(text,x,y);ctx.restore()
}
function wrap(ctx,value,x,y,maxWidth,lineHeight,maxLines,size,color='#fff',weight='900'){
 const words=String(value).split(/\s+/);let line='',lines=[];
 ctx.save();ctx.font=`${weight} ${size}px Arial`;
 for(const word of words){const test=line?line+' '+word:word;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word}else line=test}
 if(line)lines.push(line);if(lines.length>maxLines){lines=lines.slice(0,maxLines);let last=lines[maxLines-1];while(ctx.measureText(last+'…').width>maxWidth&&last.length>1)last=last.slice(0,-1);lines[maxLines-1]=last+'…'}
 lines.forEach((l,i)=>text(ctx,l,x,y+i*lineHeight,size,color,'left',weight));ctx.restore()
}
function roundRect(ctx,x,y,w,h,r,fill,stroke=null,width=1){
 ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke()}
}

function drawCoin(ctx,cx,cy,r){
 const g=ctx.createRadialGradient(cx-r*.35,cy-r*.4,r*.08,cx,cy,r);
 g.addColorStop(0,'#fff6a2');g.addColorStop(.32,'#ffd33c');g.addColorStop(.72,'#f2a100');g.addColorStop(1,'#b96600');
 ctx.save();ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();ctx.lineWidth=Math.max(3,r*.08);ctx.strokeStyle='#fff1a0';ctx.stroke();
 ctx.beginPath();ctx.arc(cx,cy,r*.78,0,Math.PI*2);ctx.lineWidth=Math.max(2,r*.04);ctx.strokeStyle='#d77e00';ctx.stroke();
 text(ctx,'n.',cx,cy-r*.46,r*.95,'#a75d00','center','900');ctx.restore()
}
function drawCalendarIcon(ctx,cx,cy,r){
 ctx.save();ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fillStyle='#0756bf';ctx.fill();
 roundRect(ctx,cx-r*.48,cy-r*.36,r*.96,r*.78,r*.1,'#fff');
 ctx.fillStyle='#0756bf';ctx.fillRect(cx-r*.48,cy-r*.18,r*.96,r*.16);
 ctx.strokeStyle='#0756bf';ctx.lineWidth=3;
 for(let i=-1;i<=1;i++)for(let j=0;j<2;j++){ctx.beginPath();ctx.arc(cx+i*r*.25,cy+j*r*.24+r*.02,r*.055,0,Math.PI*2);ctx.fillStyle='#0756bf';ctx.fill()}
 ctx.restore()
}
function drawFlameIcon(ctx,cx,cy,r){
 ctx.save();ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fillStyle='#ff7600';ctx.fill();
 ctx.beginPath();ctx.moveTo(cx,cy-r*.48);ctx.bezierCurveTo(cx+r*.25,cy-r*.18,cx+r*.42,cy+r*.06,cx+r*.3,cy+r*.34);ctx.bezierCurveTo(cx+r*.16,cy+r*.62,cx-r*.28,cy+r*.55,cx-r*.36,cy+r*.2);ctx.bezierCurveTo(cx-r*.42,cy-r*.04,cx-r*.12,cy-r*.16,cx-r*.08,cy-r*.42);ctx.bezierCurveTo(cx-r*.02,cy-r*.28,cx+r*.04,cy-r*.18,cx,cy-r*.48);ctx.closePath();ctx.fillStyle='#fff';ctx.fill();
 ctx.restore()
}
function drawStoreIcon(ctx,cx,cy,r){
 ctx.save();ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();
 ctx.strokeStyle='#0b438f';ctx.lineWidth=4;ctx.strokeRect(cx-r*.45,cy-r*.05,r*.9,r*.55);
 ctx.fillStyle='#0b438f';ctx.fillRect(cx-r*.52,cy-r*.28,r*1.04,r*.22);
 ctx.fillStyle='#fff';for(let i=0;i<4;i++)ctx.fillRect(cx-r*.43+i*r*.25,cy-r*.27,r*.11,r*.2);
 ctx.strokeStyle='#0b438f';ctx.strokeRect(cx-r*.2,cy+r*.12,r*.28,r*.38);ctx.restore()
}
function drawTargetIcon(ctx,cx,cy,r){
 ctx.save();ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();ctx.lineWidth=7;ctx.strokeStyle='#f28b00';ctx.stroke();
 [0.72,0.45,0.18].forEach((s,i)=>{ctx.beginPath();ctx.arc(cx,cy,r*s,0,Math.PI*2);ctx.fillStyle=i%2===0?'#f36c00':'#fff';ctx.fill()});
 ctx.strokeStyle='#633000';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(cx+r*.05,cy-r*.05);ctx.lineTo(cx+r*.2,cy-r*1.05);ctx.stroke();
 ctx.fillStyle='#ff6a00';ctx.beginPath();ctx.moveTo(cx+r*.18,cy-r*1.03);ctx.lineTo(cx+r*.65,cy-r*.88);ctx.lineTo(cx+r*.2,cy-r*.72);ctx.closePath();ctx.fill();ctx.restore()
}
function drawMainDynamic(ctx){
 const m=MISSIONS[state.day],next=MISSIONS[Math.min(29,state.day+1)],pct=Math.min(100,Math.round(state.sales/30000*100));

 // Tarjetas superiores: se redibujan completas para no conservar textos antiguos.
 roundRect(ctx,50,180,255,105,24,'#fbfbfb');drawCalendarIcon(ctx,100,232,34);
 text(ctx,'Día',150,194,22,'#08245d','left','700');text(ctx,`${state.day+1}/30`,150,222,42,'#0751bd');
 roundRect(ctx,315,180,275,105,24,'#fbfbfb');drawCoin(ctx,365,232,34);
 text(ctx,'netocoins',410,194,19,'#08245d','left','700');text(ctx,fmt(state.coins),410,221,41,'#f26a00');
 roundRect(ctx,600,180,250,105,24,'#fbfbfb');drawFlameIcon(ctx,650,232,34);
 text(ctx,'Racha',695,194,22,'#08245d','left','700');text(ctx,`${state.streak} ${state.streak===1?'día':'días'}`,695,222,35,'#f26a00');

 // Misión: fondos opacos completos para que no exista ningún texto sobrepuesto.
 roundRect(ctx,75,380,395,165,14,'#103b8b');
 let titleSize=m.title.length>43?38:m.title.length>32?43:49;
 wrap(ctx,m.title,88,397,365,titleSize*1.1,4,titleSize,'#fff','900');

 ctx.save();ctx.setLineDash([8,6]);roundRect(ctx,90,545,390,128,18,'#06265f','#35b9ff',3);ctx.restore();
 drawCoin(ctx,155,609,48);
 text(ctx,`+${m.reward}`,235,564,55,'#ff9800');
 text(ctx,'netocoins',235,625,29,'#fff','left','900');

 roundRect(ctx,95,682,380,48,24,'#0b58c2');
 text(ctx,'◎',117,688,30,'#ff8b00','left','900');
 text(ctx,`Meta: ${targetText(m)}`,150,692,21,'#fff','left','800');

 // Avance del mes: tarjeta completa redibujada.
 roundRect(ctx,50,775,800,150,26,'#fbfbfb');
 text(ctx,'AVANCE DEL MES',80,794,27,'#0a3d95','left','900');
 text(ctx,`${pct}%`,820,790,42,'#0750bd','right','900');
 roundRect(ctx,75,846,750,31,16,'#dfe3eb');
 roundRect(ctx,75,846,750*pct/100,31,16,'#ff7800');
 const fx=75+750*pct/100;
 ctx.save();ctx.fillStyle='#0750bd';ctx.beginPath();ctx.moveTo(fx-18,878);ctx.quadraticCurveTo(fx+2,838,fx+11,832);ctx.lineTo(fx+27,878);ctx.closePath();ctx.fill();ctx.restore();
 text(ctx,`$${fmt(state.sales)}`,80,887,29,'#0750bd','left','900');
 text(ctx,'Meta del mes: $30,000',820,891,20,'#66738f','right','700');

 // Próximo reto: tarjeta completa, sin conservar textos/recompensas de la imagen.
 roundRect(ctx,50,940,800,155,26,'#fff7ed');
 drawTargetIcon(ctx,150,1019,53);
 text(ctx,'PRÓXIMO RETO',245,965,19,'#e55e09','left','900');
 wrap(ctx,state.day===29?'Premiación mensual':next.title,245,995,370,32,3,29,'#08245d','900');
 text(ctx,state.day===29?'Ranking final de tiendas':`Meta: ${targetText(next)}`,245,1067,17,'#6a748d','left','700');
 roundRect(ctx,635,958,155,118,16,'#fff','#ead9c7',2);
 text(ctx,'Recompensa',712,971,17,'#65718b','center','700');
 if(state.day===29){
   text(ctx,'🏆',712,1004,42,'#f36b00','center','900');
 }else{
   drawCoin(ctx,675,1026,30);
   text(ctx,String(next.reward),742,1001,37,'#f36b00','center','900');
   text(ctx,'netocoins',742,1043,14,'#65718b','center','700');
 }
 text(ctx,'›',818,992,54,'#f36b00','center','700');

 // Ranking: panel y filas completos, evitando duplicados debajo.
 roundRect(ctx,50,1110,800,250,27,'#08296e','#1478df',2);
 text(ctx,'🏆',82,1128,25,'#ff8a00','left','900');
 text(ctx,'RANKING DE TIENDAS',120,1127,28,'#fff','left','900');
 roundRect(ctx,620,1123,195,38,20,'#0b4aa8','#1478df',1);
 text(ctx,'Ver ranking completo  ›',718,1133,16,'#fff','center','800');

 const data=[...COMPETITORS,{name:state.storeName||'Mi tienda',points:state.coins,me:true}].sort((a,b)=>b.points-a.points).slice(0,3);
 data.forEach((r,i)=>{
   const y=1170+i*63;
   roundRect(ctx,70,y,760,51,25,'#123a79','#31588f',1);
   const medalColors=[['#fff7a8','#ffc928'],['#fff','#cbd1dc'],['#ffd49a','#d9822f']][i];
   const mg=ctx.createLinearGradient(0,y,0,y+50);mg.addColorStop(0,medalColors[0]);mg.addColorStop(1,medalColors[1]);
   ctx.beginPath();ctx.arc(105,y+25,20,0,Math.PI*2);ctx.fillStyle=mg;ctx.fill();
   text(ctx,String(i+1),105,y+11,23,'#4b3a10','center','900');
   drawStoreIcon(ctx,175,y+25,20);
   text(ctx,r.name,215,y+12,23,'#fff','left','800');
   text(ctx,fmt(r.points),760,y+11,25,'#ff9800','right','900');
   drawCoin(ctx,795,y+25,14);
 });
}

function renderMain(){
 if(!mainImage.complete){mainImage.onload=renderMain;return}
 const c=$('mainCanvas'),ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);ctx.drawImage(mainImage,0,0,c.width,c.height);drawMainDynamic(ctx)
}
function renderCompletion(data){
 if(!completionImage.complete){completionImage.onload=()=>renderCompletion(data);return}
 const c=$('completionCanvas'),ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);ctx.drawImage(completionImage,0,0,c.width,c.height);
 text(ctx,`NIVEL ${data.level}`,512,207,64,'#fff','center','900');
 text(ctx,`+${data.earned}`,520,855,79,'#ffbd00','center','900');text(ctx,'netocoins',520,938,43,'#fff','center','900');
 const promoted=data.oldRank.name!==data.newRank.name;
 const hero=state.playerName||'Tiburón';const message=data.finalMission?`¡${hero}, ya eres el Capitán Tiburón #1!`:promoted?`¡${hero}, ascenso desbloqueado! ${data.newRank.name}`:`¡Sigue así, ${hero}! Cada misión te acerca a ser el Capitán Tiburón #1.`;
 wrap(ctx,message,330,1020,370,45,3,31,promoted?'#ffbd00':'#fff','900');
 text(ctx,`${data.newRank.icon}  ${data.newRank.name}`,510,1176,31,'#fff','center','900');
 $('completionOverlay').hidden=false
}
function openValidation(){
 const m=MISSIONS[state.day];
 if(state.completed[state.day]){toast('Esta misión ya fue cumplida.');return}
 $('validationTitle').textContent=m.title;
 $('validationHelp').textContent=`Meta: ${targetText(m)}`;
 $('resultInput').value='';
 resetPhotoControl('mission');
 $('validationDialog').showModal();
 setTimeout(()=>$('resultInput').focus(),100)
}
async function validateMission(ev){
 ev.preventDefault();
 const m=MISSIONS[state.day],completedDay=state.day,result=Number($('resultInput').value);
 const photoFile=$('missionEvidencePhoto').files?.[0];
 if(!Number.isFinite(result)||result<0){$('validationHelp').textContent='Captura un resultado válido.';sfx('error');return}
 if(result<m.target){const miss=m.target-result;$('validationHelp').textContent=`Todavía faltan ${m.unit==='MXN'?'$'+fmt(miss):fmt(miss)+' '+m.unit}.`;sfx('error');return}
 if(!photoFile){$('missionEvidenceStatus').textContent='La evidencia fotográfica es obligatoria para completar la misión.';$('missionEvidenceStatus').classList.remove('ready');sfx('error');return}

 const submit=$('validationSubmitButton');
 submit.disabled=true;submit.textContent='Guardando evidencia…';
 try{
  const photo=await storeEvidencePhoto({
   key:`mission-${completedDay+1}`,
   file:photoFile,kind:'mission',index:completedDay+1,title:m.title
  });
  const oldRank=rankFor(),bonus=Math.min(state.streak*10,100),earned=m.reward+bonus;
  state.completed[completedDay]=true;state.coins+=earned;state.streak++;
  state.sales=Math.min(30000,state.sales+m.monthlyValue);
  state.evidence[completedDay]={
   result,
   date:new Date().toISOString(),
   missionTitle:m.title,
   photo,
   photoUrl:photo.photoUrl||''
  };
  const newRank=rankFor(),finalMission=missionCount()===30;
  if(completedDay<29)state.day=completedDay+1;
  pendingBonusLevel=completedDay;save();$('drawerRank').textContent=newRank.name;renderMain();
  $('validationDialog').close();resetPhotoControl('mission');
  sfx('coin');setTimeout(()=>sfx('success'),160);if(oldRank.name!==newRank.name)setTimeout(()=>sfx('rank'),700);
  lastCompletion={level:completedDay+1,earned,oldRank,newRank,finalMission};renderCompletion(lastCompletion)
 }catch(error){
  console.error(error);$('missionEvidenceStatus').textContent=error.message||'No se pudo guardar la fotografía.';$('missionEvidenceStatus').classList.remove('ready');sfx('error');
 }finally{
  submit.disabled=false;submit.textContent='Comprobar misión';
 }
}
function openDrawer(open){$('drawer').classList.toggle('open',open);$('drawer').setAttribute('aria-hidden',String(!open))}
function rankingData(){return [...COMPETITORS,{name:state.storeName||'Mi tienda',points:state.coins,me:true}].sort((a,b)=>b.points-a.points)}
function renderRanking(){const list=$('rankingFullList');list.innerHTML='';rankingData().forEach((r,i)=>{const d=document.createElement('div');d.className='rank-item';d.innerHTML=`<span>${i+1}. ${r.name}</span><b>${fmt(r.points)} nc</b>`;list.appendChild(d)})}
function buildCalendar(){const list=$('missionCalendar');list.innerHTML='';MISSIONS.forEach((m,i)=>{const b=document.createElement('button');b.innerHTML=`<strong>Día ${i+1}: ${m.title}</strong><br><small>${m.reward} netocoins · ${targetText(m)}</small>`;b.onclick=()=>{state.day=i;save();renderMain();$('calendarDialog').close()};list.appendChild(b)})}
function pendingBonus(){for(let i=29;i>=0;i--)if(state.completed[i]&&!state.bonusPlayed[i])return i;return -1}
function launchBonus(index=pendingBonus()){
 if(index<0){toast('No hay retos de bonificación pendientes.');return}
 pendingBonusLevel=index;
 if(!window.RetoMatch3){toast('El Match-3 todavía no está disponible.');return}
 window.RetoMatch3.start({level:index+1,onFinish:()=>renderMain()})
}
function requestBonusAccess(index=pendingBonus()){
 if(index<0){toast('No hay retos de bonificación pendientes.');return}
 pendingBonusLevel=index;
 const access=state.bonusAccess?.[index];
 if(access?.photo?.localKey||access?.photoUrl){launchBonus(index);return}
 resetPhotoControl('bonus');
 $('bonusMissionHelp').textContent=`Mini misión del día ${index+1}: reconoce a un colaborador con una distinción neto y registra la fotografía.`;
 $('bonusMissionDialog').showModal();
}
async function validateBonusMission(ev){
 ev.preventDefault();
 const index=pendingBonusLevel;
 const file=$('bonusEvidencePhoto').files?.[0];
 if(index<0){$('bonusMissionDialog').close();toast('No hay bonificaciones pendientes.');return}
 if(!file){$('bonusEvidenceStatus').textContent='Debes tomar una fotografía para desbloquear el Match‑3.';$('bonusEvidenceStatus').classList.remove('ready');sfx('error');return}
 const submit=$('bonusMissionSubmitButton');
 submit.disabled=true;submit.textContent='Guardando evidencia…';
 try{
  const title='Entrega una distinción neto';
  const photo=await storeEvidencePhoto({
   key:`bonus-access-${index+1}`,
   file,kind:'bonus-access',index:index+1,title
  });
  state.bonusAccess[index]={
   title,
   completedAt:new Date().toISOString(),
   photo,
   photoUrl:photo.photoUrl||''
  };
  save();$('bonusMissionDialog').close();resetPhotoControl('bonus');
  toast('Mini misión validada. ¡Match‑3 desbloqueado!');
  sfx('success');launchBonus(index);
 }catch(error){
  console.error(error);$('bonusEvidenceStatus').textContent=error.message||'No se pudo guardar la fotografía.';$('bonusEvidenceStatus').classList.remove('ready');sfx('error');
 }finally{
  submit.disabled=false;submit.textContent='Validar evidencia y jugar';
 }
}

window.RetoTiburon={
 getRank:()=>rankFor().name,
 getPlayerName:()=>state.playerName||'Jugador',
 playSfx:sfx,
 toggleMusic(){audioPrefs.music=!audioPrefs.music;if(audioPrefs.music)unlockAudio();else $('backgroundMusic').pause();return audioPrefs.music},
 setMatch3Active(active){$('backgroundMusic').volume=active?.16:.34},
 addBonusCoins({level,reward,movesLeft,score}){const index=Math.max(0,Math.min(29,Number(level)-1));if(state.bonusPlayed[index])return{reward:0,rank:rankFor().name,alreadyPlayed:true};const r=Math.max(0,Math.round(Number(reward)||0));state.coins+=r;state.bonusPlayed[index]={won:true,reward:r,movesLeft,score,date:new Date().toISOString()};save();renderMain();sfx('coin');toast(`Ganaste ${r} netocoins en Match-3.`);return{reward:r,rank:rankFor().name}},
 getEvidencePhoto:getStoredEvidencePhoto,
 getEvidenceQueue:()=>({missions:state.evidence,bonusAccess:state.bonusAccess}),
 setEvidencePhotoUrl({kind,index,url}){
  const clean=String(url||'').trim();if(!clean)return false;
  if(kind==='mission'&&state.evidence[index]){state.evidence[index].photoUrl=clean;if(state.evidence[index].photo){state.evidence[index].photo.photoUrl=clean;state.evidence[index].photo.syncStatus='uploaded'}}
  else if(kind==='bonus-access'&&state.bonusAccess[index]){state.bonusAccess[index].photoUrl=clean;if(state.bonusAccess[index].photo){state.bonusAccess[index].photo.photoUrl=clean;state.bonusAccess[index].photo.syncStatus='uploaded'}}
  else return false;
  save();return true
 }
};

$('startButton').onclick=()=>initialState(false);$('demoButton').onclick=()=>initialState(true);
$('playerName').addEventListener('input',updatePlayerNamePreview);
document.querySelectorAll('[data-player-name]').forEach(button=>button.onclick=()=>{$('playerName').value=button.dataset.playerName;updatePlayerNamePreview()});
$('adventureButton').onclick=confirmPlayerName;
$('backStoreButton').onclick=()=>{if(playerNameEditing||state.playerName){$('nameScreen').hidden=true;enterApp()}else{$('nameScreen').hidden=true;$('storeScreen').hidden=false}};
$('menuButton').onclick=()=>openDrawer(true);$('changePlayerNameButton').onclick=()=>{openDrawer(false);showPlayerNameScreen(true)};$('closeDrawer').onclick=()=>openDrawer(false);$('drawerShade').onclick=()=>openDrawer(false);
$('notificationButton').onclick=()=>{$('notificationPanel').hidden=!$('notificationPanel').hidden};
$('validateButton').onclick=openValidation;$('cancelValidation').onclick=()=>{$('validationDialog').close();resetPhotoControl('mission')};$('validationForm').onsubmit=validateMission;
$('rankingToggle').onclick=()=>{renderRanking();$('rankingDialog').showModal()};$('closeRanking').onclick=()=>$('rankingDialog').close();
$('calendarButton').onclick=()=>{openDrawer(false);buildCalendar();$('calendarDialog').showModal()};$('closeCalendar').onclick=()=>$('calendarDialog').close();
$('bonusGameDrawerButton').onclick=()=>{openDrawer(false);requestBonusAccess()};
$('audioUnlockBanner').onclick=()=>{unlockAudio();toast('Música y efectos activados.')};
$('musicToggle').onclick=()=>{audioPrefs.music=!audioPrefs.music;if(audioPrefs.music)unlockAudio();else $('backgroundMusic').pause();$('musicToggle').querySelector('b').textContent=audioPrefs.music?'Activada':'Silenciada';localStorage.setItem(AUDIO_KEY,JSON.stringify(audioPrefs))};
$('effectsToggle').onclick=()=>{audioPrefs.sfx=!audioPrefs.sfx;$('effectsToggle').querySelector('b').textContent=audioPrefs.sfx?'Activados':'Silenciados';localStorage.setItem(AUDIO_KEY,JSON.stringify(audioPrefs))};
$('resetButton').onclick=()=>{if(confirm('¿Reiniciar todo el progreso?')){const demo=state.demo;state.day=demo?6:0;state.coins=demo?1250:0;state.streak=demo?6:0;state.sales=demo?18900:0;state.completed=demo?Array.from({length:30},(_,i)=>i<6):Array(30).fill(false);state.evidence={};state.bonusAccess={};state.bonusPlayed={};clearStoredEvidencePhotos();save();renderMain();openDrawer(false)}};
$('logoutButton').onclick=()=>{openDrawer(false);$('backgroundMusic').pause();$('mainScreen').hidden=true;$('nameScreen').hidden=true;$('storeScreen').hidden=false};
$('closeCompletion').onclick=()=>{$('completionOverlay').hidden=true};
$('continueCompletion').onclick=()=>{$('completionOverlay').hidden=true;$('bonusChoiceDialog').showModal()};
$('playBonusButton').onclick=()=>{$('bonusChoiceDialog').close();requestBonusAccess(pendingBonusLevel)};
$('skipBonusButton').onclick=()=>{$('bonusChoiceDialog').close()};
$('cancelBonusMission').onclick=()=>{$('bonusMissionDialog').close();resetPhotoControl('bonus')};
$('bonusMissionForm').onsubmit=validateBonusMission;
document.querySelectorAll('[data-category]').forEach(b=>b.onclick=()=>{const cat=b.dataset.category;let i=MISSIONS.findIndex((m,n)=>n>=state.day&&m.category===cat);if(i<0)i=MISSIONS.findIndex(m=>m.category===cat);if(i>=0){state.day=i;save();renderMain();toast(`Mostrando ${cat}.`)}});

document.addEventListener('click',e=>{if(e.target.closest('button')){if(!audioUnlocked)unlockAudio();sfx('click')}},{capture:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden)$('backgroundMusic').pause();else if(audioUnlocked&&audioPrefs.music)$('backgroundMusic').play().catch(()=>{})});
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js?v=60').catch(()=>{}));

bindPhotoControl('mission');bindPhotoControl('bonus');
initSounds();
try{Object.assign(audioPrefs,JSON.parse(localStorage.getItem(AUDIO_KEY)||'{}'))}catch{}
mainImage.onload=renderMain;
const params=new URLSearchParams(location.search);
const loaded=load();
$('storeName').value=state.storeName||'Tienda Demo';
$('storeCode').value=state.storeCode||'001';
if(params.get('debug')==='name'){
 state.storeName='Tienda Demo';state.storeCode='001';state.playerName='Capitán Azul';showPlayerNameScreen(false)
}else if(params.get('debug')==='main'){
 state.storeName='Tienda Demo';state.storeCode='001';state.playerName='Capitán Azul';
 state.day=6;state.coins=1250;state.streak=6;state.sales=18900;state.completed=Array.from({length:30},(_,i)=>i<6);enterApp()
}else if(loaded){if(state.playerName)enterApp();else showPlayerNameScreen(false)}else if(params.get('demo')==='1'){state.storeName='Tienda Demo';state.storeCode='001';state.playerName='';state.demo=true;state.day=6;state.coins=1250;state.streak=6;state.sales=18900;state.completed=Array.from({length:30},(_,i)=>i<6);save();showPlayerNameScreen(false)}
