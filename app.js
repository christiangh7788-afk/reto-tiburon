
(()=>{
'use strict';
const STORAGE='reto-tiburon-visual-v5';
const $=id=>document.getElementById(id);
const data={storeName:'Tienda Demo',storeCode:'001',playerName:''};

function save(){localStorage.setItem(STORAGE,JSON.stringify(data))}
function load(){
  try{const raw=localStorage.getItem(STORAGE);if(raw)Object.assign(data,JSON.parse(raw))}catch{}
}
function show(id){['storeScreen','nameScreen','mainScreen'].forEach(x=>$(x).hidden=x!==id)}
function toast(message){const t=$('toast');t.textContent=message;t.classList.add('show');clearTimeout(t._timer);t._timer=setTimeout(()=>t.classList.remove('show'),2400)}
function updatePreview(){
  const value=$('playerName').value.slice(0,16);
  $('counter').textContent=`${value.length}/16`;
  $('previewName').textContent=value.trim()||'Tu nombre aparecerá aquí';
}
function goName(){
  data.storeName=$('storeName').value.trim()||'Tienda Demo';
  data.storeCode=$('storeCode').value.trim()||'001';
  save();
  $('playerName').value=data.playerName||'';
  updatePreview();
  show('nameScreen');
}
function goMain(){
  const name=$('playerName').value.trim();
  if(name.length<3){toast('Escribe un nombre de 3 a 16 caracteres.');$('playerName').focus();return}
  data.playerName=name;
  save();
  $('menuPlayer').textContent=name;
  $('menuStore').textContent=`${data.storeName} · Sucursal ${data.storeCode}`;
  show('mainScreen');
}
function openDialog(id){const d=$(id);if(!d.open)d.showModal()}

load();
$('storeName').value=data.storeName||'Tienda Demo';
$('storeCode').value=data.storeCode||'001';

$('startButton').onclick=goName;
$('demoButton').onclick=()=>{
  data.storeName='Tienda Demo';
  data.storeCode='001';
  data.playerName=data.playerName||'Tiburón Max';
  save();
  $('storeName').value=data.storeName;
  $('storeCode').value=data.storeCode;
  $('playerName').value=data.playerName;
  updatePreview();
  goMain();
};
$('playerName').oninput=updatePreview;
document.querySelectorAll('.suggestion').forEach(button=>{
  button.onclick=()=>{$('playerName').value=button.dataset.name;updatePreview()}
});
$('adventureButton').onclick=goMain;
$('backStoreButton').onclick=()=>show('storeScreen');

$('menuButton').onclick=()=>{
  $('menuPlayer').textContent=data.playerName||'Jugador';
  $('menuStore').textContent=`${data.storeName} · Sucursal ${data.storeCode}`;
  openDialog('menuDialog');
};
$('validateButton').onclick=()=>openDialog('scopeDialog');
$('changePlayer').onclick=()=>{$('menuDialog').close();$('playerName').value=data.playerName||'';updatePreview();show('nameScreen')};
$('changeStore').onclick=()=>{$('menuDialog').close();show('storeScreen')};
$('clearProgress').onclick=()=>{
  localStorage.removeItem(STORAGE);
  Object.assign(data,{storeName:'Tienda Demo',storeCode:'001',playerName:''});
  $('storeName').value='Tienda Demo';$('storeCode').value='001';$('playerName').value='';updatePreview();
  $('menuDialog').close();show('storeScreen');toast('Datos borrados.');
};
document.querySelectorAll('[data-close]').forEach(button=>button.onclick=()=>$(button.dataset.close).close());

if(data.playerName){
  $('playerName').value=data.playerName;
  updatePreview();
  $('menuPlayer').textContent=data.playerName;
  $('menuStore').textContent=`${data.storeName} · Sucursal ${data.storeCode}`;
}
if('serviceWorker' in navigator){
  addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js?v=50').catch(()=>{}));
}
})();
