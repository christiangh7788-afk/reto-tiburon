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
{name:'Tienda Centro',points:2450},{name:'Tienda Norte',points:1980},{name:'Tienda Sur',points:1650},{name:'Tienda Boca del Río',points:1430},{name:'Tienda Xalapa',points:1320},{name:'Tienda Córdoba',points:1190}
];
const STORAGE_KEY='reto-tiburon-v1-state';
const $=id=>document.getElementById(id);
const format=n=>Number(n).toLocaleString('es-MX');
const state={storeName:'',storeCode:'',day:0,coins:0,streak:0,sales:0,completed:Array(30).fill(false),evidence:{},demo:false,showFullRanking:false};
let deferredInstallPrompt=null;
function targetText(m){return m.unit==='MXN'?`$${format(m.target)} MXN`:`${format(m.target)} ${m.unit}`}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}
function load(){const raw=localStorage.getItem(STORAGE_KEY);if(!raw)return false;try{Object.assign(state,JSON.parse(raw));if(!Array.isArray(state.completed)||state.completed.length!==30)state.completed=Array(30).fill(false);return Boolean(state.storeName)}catch{return false}}
function initialState(demo){state.demo=demo;state.storeName=$('storeNameInput').value.trim()||'Tienda Demo';state.storeCode=$('storeCodeInput').value.trim()||'001';state.showFullRanking=false;state.evidence={};if(demo){state.day=6;state.coins=1250;state.streak=6;state.sales=18900;state.completed=Array.from({length:30},(_,i)=>i<6)}else{state.day=0;state.coins=0;state.streak=0;state.sales=0;state.completed=Array(30).fill(false)}save();enterApp()}
function enterApp(){$('loginScreen').hidden=true;$('loginScreen').style.display='none';$('appShell').hidden=false;$('appShell').style.display='block';$('drawerStore').textContent=state.storeName;$('drawerCode').textContent=`Sucursal ${state.storeCode}`;render()}
function openDrawer(open){$('drawer').classList.toggle('open',open);$('drawer').setAttribute('aria-hidden',String(!open))}
function render(){const m=MISSIONS[state.day];const next=MISSIONS[Math.min(29,state.day+1)];const pct=Math.min(100,Math.round(state.sales/30000*100));const doneCount=state.completed.filter(Boolean).length;
$('dayStat').textContent=`${state.day+1}/30`;$('coinsStat').textContent=format(state.coins);$('streakStat').textContent=`${state.streak} ${state.streak===1?'día':'días'}`;
$('missionKicker').textContent=`Día ${state.day+1} · ${m.category}`;$('missionTitle').textContent=m.title;$('rewardValue').textContent=`+${m.reward}`;$('goalValue').textContent=`Meta: ${targetText(m)}`;
$('progressPercent').textContent=`${pct}%`;$('progressFill').style.width=`${pct}%`;$('fin').style.left=`${pct}%`;$('salesValue').textContent=`$${format(state.sales)}`;
$('nextTitle').textContent=state.day===29?'Premiación mensual':next.title;$('nextGoal').textContent=state.day===29?'Ranking final de tiendas':`Meta: ${targetText(next)}`;$('nextReward').textContent=state.day===29?'🏆':next.reward;
$('validateButton').disabled=state.completed[state.day];$('validateButton').innerHTML=state.completed[state.day]?'<span>✓</span> MISIÓN CUMPLIDA':'<span>✓</span> VALIDAR MISIÓN';
$('profileStore').textContent=state.storeName;$('profileCode').textContent=state.storeCode;$('profileMissions').textContent=doneCount;$('profileCoins').textContent=format(state.coins);renderRanking()}
function renderRanking(){const all=[...COMPETITORS,{name:state.storeName||'Mi tienda',points:state.coins,me:true}].sort((a,b)=>b.points-a.points);const shown=state.showFullRanking?all:all.slice(0,3);$('rankingList').innerHTML='';shown.forEach((item,index)=>{const row=document.createElement('div');row.className='rank-row';if(item.me)row.style.borderColor='#ff6500';const medalClass=index===0?'gold':index===1?'silver':'bronze';row.innerHTML=`<div class="medal ${medalClass}">${index+1}</div><div class="store-icon">▣</div><div class="rank-name"></div><div class="rank-score">${format(item.points)} ◉</div>`;row.querySelector('.rank-name').textContent=item.name;$('rankingList').appendChild(row)});$('rankingToggle').textContent=state.showFullRanking?'Ver top 3':'Ver ranking completo ›'}
function openValidation(){const m=MISSIONS[state.day];$('validationTitle').textContent=m.title;$('validationHelp').textContent=`Meta del día: ${targetText(m)}.`;$('resultUnit').textContent=m.unit;$('resultInput').value='';$('evidenceInput').value='';$('validationDialog').showModal();setTimeout(()=>$('resultInput').focus(),100)}
function validateMission(event){event.preventDefault();const m=MISSIONS[state.day];const result=Number($('resultInput').value);if(!Number.isFinite(result)||result<0){$('validationHelp').textContent='Captura un resultado válido.';return}if(result<m.target){const missing=m.target-result;$('validationHelp').textContent=`Todavía faltan ${m.unit==='MXN'?'$'+format(missing):format(missing)+' '+m.unit}.`;return}if(state.completed[state.day]){$('validationDialog').close();return}const bonus=Math.min(state.streak*10,100);const earned=m.reward+bonus;state.completed[state.day]=true;state.coins+=earned;state.streak+=1;state.sales=Math.min(30000,state.sales+m.monthlyValue);state.evidence[state.day]={result,evidence:$('evidenceInput').value.trim(),date:new Date().toISOString()};$('statusMessage').textContent=`¡Misión cumplida! Ganaste ${earned} netopesos. Bono de racha: ${bonus} NP.`;$('validationDialog').close();if(state.day<29)state.day+=1;save();render()}
function buildCalendar(){const wrap=$('missionCalendar');wrap.innerHTML='';MISSIONS.forEach((m,index)=>{const button=document.createElement('button');button.type='button';button.className='mission-day';if(state.completed[index])button.classList.add('done');if(index===state.day)button.classList.add('current');button.innerHTML=`<small>Día ${index+1} · ${m.category}</small><strong></strong><span>${m.reward} NP · Meta ${targetText(m)}</span>`;button.querySelector('strong').textContent=m.title;button.addEventListener('click',()=>{state.day=index;$('calendarDialog').close();render();save()});wrap.appendChild(button)})}
$('newGameButton').addEventListener('click',()=>initialState(false));$('demoButton').addEventListener('click',()=>initialState(true));$('menuButton').addEventListener('click',()=>openDrawer(true));$('closeDrawer').addEventListener('click',()=>openDrawer(false));
$('notificationButton').addEventListener('click',()=>{$('notificationPanel').hidden=!$('notificationPanel').hidden});$('calendarButton').addEventListener('click',()=>{openDrawer(false);buildCalendar();$('calendarDialog').showModal()});$('closeCalendar').addEventListener('click',()=>$('calendarDialog').close());
$('profileButton').addEventListener('click',()=>{openDrawer(false);render();$('profileDialog').showModal()});$('closeProfile').addEventListener('click',()=>$('profileDialog').close());
$('resetButton').addEventListener('click',()=>{if(confirm('¿Reiniciar todo el progreso de esta sucursal?')){const demo=state.demo;state.day=demo?6:0;state.coins=demo?1250:0;state.streak=demo?6:0;state.sales=demo?18900:0;state.completed=demo?Array.from({length:30},(_,i)=>i<6):Array(30).fill(false);state.evidence={};save();openDrawer(false);render()}});
$('logoutButton').addEventListener('click',()=>{openDrawer(false);$('appShell').hidden=true;$('appShell').style.display='none';$('loginScreen').hidden=false;$('loginScreen').style.display='grid'});$('validateButton').addEventListener('click',openValidation);$('cancelValidation').addEventListener('click',()=>$('validationDialog').close());$('validationForm').addEventListener('submit',validateMission);
$('rankingToggle').addEventListener('click',()=>{state.showFullRanking=!state.showFullRanking;renderRanking()});$('nextMissionButton').addEventListener('click',()=>{if(state.day<29){state.day++;render();save()}});
document.querySelectorAll('[data-category]').forEach(button=>button.addEventListener('click',()=>{const category=button.dataset.category;let index=MISSIONS.findIndex((m,i)=>i>=state.day&&m.category===category);if(index<0)index=MISSIONS.findIndex(m=>m.category===category);if(index>=0){state.day=index;$('statusMessage').textContent=`Mostrando el siguiente reto de ${category}.`;render();save()}}));
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferredInstallPrompt=event;$('installButton').hidden=false});$('installButton').addEventListener('click',async()=>{if(!deferredInstallPrompt)return;deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice;deferredInstallPrompt=null;$('installButton').hidden=true});
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}))}
if(load())enterApp();
