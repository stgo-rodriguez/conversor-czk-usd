const APP='czk-usd-camera-v1';
const LOCAL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
const OCR=[
'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js',
'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/worker.min.js',
'https://cdn.jsdelivr.net/npm/tesseract.js-core@5.1.0/tesseract-core-simd-lstm.js',
'https://cdn.jsdelivr.net/npm/tesseract.js-core@5.1.0/tesseract-core-simd-lstm.wasm',
'https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng@1.0.0/4.0.0_best_int/eng.traineddata.gz'
];
self.addEventListener('install',e=>e.waitUntil((async()=>{
  const c=await caches.open(APP);
  await c.addAll(LOCAL);
  await Promise.allSettled(OCR.map(async u=>{const r=await fetch(u,{mode:'cors'});if(r.ok)await c.put(u,r)}));
  self.skipWaiting();
})()));
self.addEventListener('activate',e=>e.waitUntil((async()=>{
  await Promise.all((await caches.keys()).filter(k=>k!==APP).map(k=>caches.delete(k)));
  await self.clients.claim();
})()));
self.addEventListener('fetch',e=>{
  e.respondWith((async()=>{
    const cached=await caches.match(e.request);
    if(cached)return cached;
    try{
      const r=await fetch(e.request);
      if(e.request.method==='GET'&&(new URL(e.request.url).origin===location.origin||OCR.includes(e.request.url))){
        const c=await caches.open(APP);c.put(e.request,r.clone());
      }
      return r;
    }catch(err){
      if(e.request.mode==='navigate')return caches.match('./index.html');
      throw err;
    }
  })());
});