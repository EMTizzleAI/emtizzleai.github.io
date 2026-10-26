/* Smart Greetings secure member release.
   Older public PWA versions cached the full app; remove those caches on upgrade.
   Never cache the account portal, purchase state, tokens, or paid app code. */
self.addEventListener('install',event=>{event.waitUntil(self.skipWaiting());});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const names=await caches.keys();
    await Promise.all(names.filter(name=>name.startsWith('smart-greetings-')).map(name=>caches.delete(name)));
    await self.clients.claim();
  })());
});
// No fetch handler: member pages and app authorization always use the network.
