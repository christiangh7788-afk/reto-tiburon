const CACHE='reto-tiburon-v1-9';
const ASSETS=[
  './','./index.html','./styles.css?v=1.9','./app.js?v=1.9','./manifest.webmanifest',
  './assets/icon.svg','./assets/tiburon.png?v=1.9','./assets/diseno-aprobado.png?v=1.9',
  './assets/audio/music-funk-de-ventas.mp3','./assets/audio/click.wav','./assets/audio/coin.wav','./assets/audio/success.wav',
  './assets/audio/error.wav','./assets/audio/streak.wav','./assets/audio/rank-up.wav',
  './musica-extra.html?v=1.9',
  './assets/audio-extra/opcion-4-fiesta-tropical.mp3','./assets/audio-extra/opcion-5-arcade-brillante.mp3','./assets/audio-extra/opcion-6-oceano-chill.mp3','./assets/audio-extra/opcion-7-funk-de-ventas.mp3','./assets/audio-extra/opcion-8-suspenso-de-mision.mp3','./assets/audio-extra/opcion-9-gran-campeon.mp3'
];
self.addEventListener('install',event=>{self.skipWaiting();event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;event.respondWith(fetch(event.request).then(response=>{if(response&&response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy))}return response}).catch(()=>caches.match(event.request,{ignoreSearch:true}).then(hit=>hit||caches.match('./index.html'))));});
