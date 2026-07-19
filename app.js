
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
const state={storeName:'',storeCode:'',day:0,coins:0,streak:0,sales:0,completed:Array(30).fill(false),evidence:{},bonusPlayed:{},demo:false};
const RANKS=[
{min:0,max:5,name:'Aprendiz Tiburón',icon:'⚓'},
{min:6,max:10,name:'Marinero Tiburón',icon:'🛟'},
{min:11,max:20,name:'Oficial Tiburón',icon:'★'},
{min:21,max:29,name:'Comandante Tiburón',icon:'🏅'},
{min:30,max:30,name:'Capitán Tiburón #1',icon:'👑'}];
let audioUnlocked=false,pendingBonusLevel=0,lastCompletion=null;
const audioPrefs={music:true,sfx:true};
const sounds={};
const soundPaths={click:'assets/audio/click.wav',coin:'assets/audio/coin.wav',success:'assets/audio/success.wav',error:'assets/audio/error.wav',rank:'assets/audio/rank-up.wav'};
const mainImage=new Image(),completionImage=new Image();
mainImage.src='assets/main-template.png';completionImage.src='assets/completion-template.png';

function missionCount(){return state.completed.filter(Boolean).length}
function rankFor(count=missionCount()){return RANKS.find(r=>count>=r.min&&count<=r.max)||RANKS[0]}
function targetText(m){return m.unit==='MXN'?`$${fmt(m.target)} MXN`:`${fmt(m.target)} ${m.unit}`}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}
function load(){
 try{const raw=localStorage.getItem(STORAGE_KEY);if(!raw)return false;Object.assign(state,JSON.parse(raw));state.completed=Array.isArray(state.completed)&&state.completed.length===30?state.completed:Array(30).fill(false);state.evidence=state.evidence||{};state.bonusPlayed=state.bonusPlayed||{};state.day=Math.max(0,Math.min(29,Number(state.day)||0));state.coins=Math.max(0,Number(state.coins)||0);state.streak=Math.max(0,Number(state.streak)||0);state.sales=Math.max(0,Math.min(30000,Number(state.sales)||0));return Boolean(state.storeName)}catch{return false}
}
function initSounds(){Object.entries(soundPaths).forEach(([k,p])=>{const a=new Audio(p);a.preload='auto';sounds[k]=a})}
function sfx(name){if(!audioUnlocked||!audioPrefs.sfx||!sounds[name])return;const a=sounds[name].cloneNode(true);a.volume=.75;a.play().catch(()=>{})}
function unlockAudio(){audioUnlocked=true;const p=$('backgroundMusic');p.volume=.34;if(audioPrefs.music)p.play().catch(()=>{});$('audioUnlockBanner').hidden=true}
function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(t._timer);t._timer=setTimeout(()=>t.classList.remove('show'),2600)}
function enterApp(){$('loginScreen').hidden=true;$('appShell').hidden=false;$('drawerStore').textContent=state.storeName;$('drawerCode').textContent=`Sucursal ${state.storeCode}`;renderMain()}
function initialState(demo){state.storeName=$('storeNameInput').value.trim()||'Tienda Demo';state.storeCode=$('storeCodeInput').value.trim()||'001';state.demo=demo;state.evidence={};state.bonusPlayed={};if(demo){state.day=6;state.coins=1250;state.streak=6;state.sales=18900;state.completed=Array.from({length:30},(_,i)=>i<6)}else{state.day=0;state.coins=0;state.streak=0;state.sales=0;state.completed=Array(30).fill(false)}save();enterApp();unlockAudio()}

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
function drawMainDynamic(ctx){
 const m=MISSIONS[state.day],next=MISSIONS[Math.min(29,state.day+1)],pct=Math.min(100,Math.round(state.sales/30000*100));
 // Top cards
 text(ctx,'Día',150,195,22,'#08245d','left','700');text(ctx,`${state.day+1}/30`,150,222,44,'#0751bd');
 text(ctx,'netocoins',408,195,20,'#08245d','left','700');text(ctx,fmt(state.coins),408,222,44,'#f26a00');
 text(ctx,'Racha',690,195,22,'#08245d','left','700');text(ctx,`${state.streak} ${state.streak===1?'día':'días'}`,690,222,38,'#f26a00');
 // Mission
 let titleSize=m.title.length>42?39:m.title.length>30?45:52;
 wrap(ctx,m.title,82,391,405,titleSize*1.12,4,titleSize,'#fff','900');
 text(ctx,`+${m.reward}`,245,568,58,'#ff9800');
 text(ctx,'netocoins',245,628,31,'#fff','left','900');
 text(ctx,`Meta: ${targetText(m)}`,120,697,22,'#fff','left','800');
 // Progress
 text(ctx,`${pct}%`,844,788,44,'#0750bd','right','900');
 roundRect(ctx,75,846,750,30,15,'#dfe3eb');
 roundRect(ctx,75,846,750*pct/100,30,15,'#ff7800');
 ctx.save();ctx.fillStyle='#0750bd';ctx.beginPath();const fx=75+750*pct/100;ctx.moveTo(fx-18,876);ctx.quadraticCurveTo(fx+2,840,fx+10,833);ctx.lineTo(fx+26,876);ctx.closePath();ctx.fill();ctx.restore();
 text(ctx,`$${fmt(state.sales)}`,80,889,29,'#0750bd','left','900');
 // Next challenge
 text(ctx,'PRÓXIMO RETO',245,971,19,'#e55e09','left','900');
 wrap(ctx,state.day===29?'Premiación mensual':next.title,245,1002,370,34,3,30,'#08245d','900');
 text(ctx,state.day===29?'Ranking final de tiendas':`Meta: ${targetText(next)}`,245,1074,17,'#6a748d','left','700');
 text(ctx,state.day===29?'🏆':String(next.reward),725,1000,state.day===29?42:40,'#f36b00','center','900');
 if(state.day!==29)text(ctx,'netocoins',725,1045,15,'#65718b','center','700');
 // Ranking
 const data=[...COMPETITORS,{name:state.storeName||'Mi tienda',points:state.coins,me:true}].sort((a,b)=>b.points-a.points).slice(0,3);
 data.forEach((r,i)=>{const y=1178+i*64;text(ctx,r.name,220,y,24,'#fff','left','800');text(ctx,fmt(r.points),785,y,27,'#ff9800','right','900')});
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
 const message=data.finalMission?'¡Ya eres el Capitán Tiburón #1!':promoted?`¡Ascenso desbloqueado! ${data.newRank.name}`:'Cada misión te acerca a ser el Capitán Tiburón #1.';
 wrap(ctx,message,330,1020,370,45,3,31,promoted?'#ffbd00':'#fff','900');
 text(ctx,`${data.newRank.icon}  ${data.newRank.name}`,510,1176,31,'#fff','center','900');
 $('completionOverlay').hidden=false
}
function openValidation(){const m=MISSIONS[state.day];if(state.completed[state.day]){toast('Esta misión ya fue cumplida.');return}$('validationTitle').textContent=m.title;$('validationHelp').textContent=`Meta: ${targetText(m)}`;$('resultInput').value='';$('evidenceInput').value='';$('validationDialog').showModal();setTimeout(()=>$('resultInput').focus(),100)}
function validateMission(ev){
 ev.preventDefault();const m=MISSIONS[state.day],completedDay=state.day,result=Number($('resultInput').value);
 if(!Number.isFinite(result)||result<0){$('validationHelp').textContent='Captura un resultado válido.';sfx('error');return}
 if(result<m.target){const miss=m.target-result;$('validationHelp').textContent=`Todavía faltan ${m.unit==='MXN'?'$'+fmt(miss):fmt(miss)+' '+m.unit}.`;sfx('error');return}
 const oldRank=rankFor(),bonus=Math.min(state.streak*10,100),earned=m.reward+bonus;
 state.completed[completedDay]=true;state.coins+=earned;state.streak++;state.sales=Math.min(30000,state.sales+m.monthlyValue);state.evidence[completedDay]={result,evidence:$('evidenceInput').value.trim(),date:new Date().toISOString()};
 const newRank=rankFor(),finalMission=missionCount()===30;if(completedDay<29)state.day=completedDay+1;pendingBonusLevel=completedDay;save();renderMain();$('validationDialog').close();sfx('coin');setTimeout(()=>sfx('success'),160);if(oldRank.name!==newRank.name)setTimeout(()=>sfx('rank'),700);
 lastCompletion={level:completedDay+1,earned,oldRank,newRank,finalMission};renderCompletion(lastCompletion)
}
function openDrawer(open){$('drawer').classList.toggle('open',open);$('drawer').setAttribute('aria-hidden',String(!open))}
function rankingData(){return [...COMPETITORS,{name:state.storeName||'Mi tienda',points:state.coins,me:true}].sort((a,b)=>b.points-a.points)}
function renderRanking(){const list=$('rankingFullList');list.innerHTML='';rankingData().forEach((r,i)=>{const d=document.createElement('div');d.className='rank-item';d.innerHTML=`<span>${i+1}. ${r.name}</span><b>${fmt(r.points)} nc</b>`;list.appendChild(d)})}
function buildCalendar(){const list=$('missionCalendar');list.innerHTML='';MISSIONS.forEach((m,i)=>{const b=document.createElement('button');b.innerHTML=`<strong>Día ${i+1}: ${m.title}</strong><br><small>${m.reward} netocoins · ${targetText(m)}</small>`;b.onclick=()=>{state.day=i;save();renderMain();$('calendarDialog').close()};list.appendChild(b)})}
function pendingBonus(){for(let i=29;i>=0;i--)if(state.completed[i]&&!state.bonusPlayed[i])return i;return -1}
function launchBonus(index=pendingBonus()){if(index<0){toast('No hay retos de bonificación pendientes.');return}pendingBonusLevel=index;if(!window.RetoMatch3){toast('El Match-3 todavía no está disponible.');return}window.RetoMatch3.start({level:index+1,onFinish:()=>renderMain()})}

window.RetoTiburon={
 getRank:()=>rankFor().name,
 playSfx:sfx,
 toggleMusic(){audioPrefs.music=!audioPrefs.music;if(audioPrefs.music)unlockAudio();else $('backgroundMusic').pause();return audioPrefs.music},
 setMatch3Active(active){$('backgroundMusic').volume=active?.16:.34},
 addBonusCoins({level,reward,movesLeft,score}){const index=Math.max(0,Math.min(29,Number(level)-1));if(state.bonusPlayed[index])return{reward:0,rank:rankFor().name,alreadyPlayed:true};const r=Math.max(0,Math.round(Number(reward)||0));state.coins+=r;state.bonusPlayed[index]={won:true,reward:r,movesLeft,score,date:new Date().toISOString()};save();renderMain();sfx('coin');toast(`Ganaste ${r} netocoins en Match-3.`);return{reward:r,rank:rankFor().name}}
};

$('newGameButton').onclick=()=>initialState(false);$('demoButton').onclick=()=>initialState(true);
$('menuButton').onclick=()=>openDrawer(true);$('closeDrawer').onclick=()=>openDrawer(false);$('drawerShade').onclick=()=>openDrawer(false);
$('notificationButton').onclick=()=>{$('notificationPanel').hidden=!$('notificationPanel').hidden};
$('validateButton').onclick=openValidation;$('cancelValidation').onclick=()=>$('validationDialog').close();$('validationForm').onsubmit=validateMission;
$('rankingToggle').onclick=()=>{renderRanking();$('rankingDialog').showModal()};$('closeRanking').onclick=()=>$('rankingDialog').close();
$('calendarButton').onclick=()=>{openDrawer(false);buildCalendar();$('calendarDialog').showModal()};$('closeCalendar').onclick=()=>$('calendarDialog').close();
$('bonusGameDrawerButton').onclick=()=>{openDrawer(false);launchBonus()};
$('audioUnlockBanner').onclick=()=>{unlockAudio();toast('Música y efectos activados.')};
$('musicToggle').onclick=()=>{audioPrefs.music=!audioPrefs.music;if(audioPrefs.music)unlockAudio();else $('backgroundMusic').pause();$('musicToggle').querySelector('b').textContent=audioPrefs.music?'Activada':'Silenciada';localStorage.setItem(AUDIO_KEY,JSON.stringify(audioPrefs))};
$('effectsToggle').onclick=()=>{audioPrefs.sfx=!audioPrefs.sfx;$('effectsToggle').querySelector('b').textContent=audioPrefs.sfx?'Activados':'Silenciados';localStorage.setItem(AUDIO_KEY,JSON.stringify(audioPrefs))};
$('resetButton').onclick=()=>{if(confirm('¿Reiniciar todo el progreso?')){const demo=state.demo;state.day=demo?6:0;state.coins=demo?1250:0;state.streak=demo?6:0;state.sales=demo?18900:0;state.completed=demo?Array.from({length:30},(_,i)=>i<6):Array(30).fill(false);state.evidence={};state.bonusPlayed={};save();renderMain();openDrawer(false)}};
$('logoutButton').onclick=()=>{openDrawer(false);$('backgroundMusic').pause();$('appShell').hidden=true;$('loginScreen').hidden=false};
$('closeCompletion').onclick=()=>{$('completionOverlay').hidden=true};
$('continueCompletion').onclick=()=>{$('completionOverlay').hidden=true;$('bonusChoiceDialog').showModal()};
$('playBonusButton').onclick=()=>{$('bonusChoiceDialog').close();launchBonus(pendingBonusLevel)};
$('skipBonusButton').onclick=()=>{$('bonusChoiceDialog').close()};
document.querySelectorAll('[data-category]').forEach(b=>b.onclick=()=>{const cat=b.dataset.category;let i=MISSIONS.findIndex((m,n)=>n>=state.day&&m.category===cat);if(i<0)i=MISSIONS.findIndex(m=>m.category===cat);if(i>=0){state.day=i;save();renderMain();toast(`Mostrando ${cat}.`)}});

document.addEventListener('click',e=>{if(e.target.closest('button')){if(!audioUnlocked)unlockAudio();sfx('click')}},{capture:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden)$('backgroundMusic').pause();else if(audioUnlocked&&audioPrefs.music)$('backgroundMusic').play().catch(()=>{})});
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js?v=3.0').catch(()=>{}));

initSounds();
try{Object.assign(audioPrefs,JSON.parse(localStorage.getItem(AUDIO_KEY)||'{}'))}catch{}
mainImage.onload=renderMain;
const params=new URLSearchParams(location.search);
if(load())enterApp();else if(params.get('demo')==='1'){state.storeName='Tienda Demo';state.storeCode='001';state.demo=true;state.day=6;state.coins=1250;state.streak=6;state.sales=18900;state.completed=Array.from({length:30},(_,i)=>i<6);save();enterApp()}
