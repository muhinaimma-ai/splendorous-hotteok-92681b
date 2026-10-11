// ChatSite service worker: arifa za ujumbe hata site ikiwa imefungwa.
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });

self.addEventListener('push', function (e) {
  var d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { title: 'ChatSite', body: e.data && e.data.text() }; }
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
    var visible = list.some(function (c) { return c.visibilityState === 'visible'; });
    if (visible) return; // site iko wazi: arifa ya ndani tayari inaonyeshwa
    return self.registration.showNotification(d.title || 'ChatSite', {
      body: d.body || '',
      icon: '/__l5e/assets-v1/5edab5e7-8629-4b3b-a348-6bd6e1bafef0/icon-192.png',
      badge: '/__l5e/assets-v1/5edab5e7-8629-4b3b-a348-6bd6e1bafef0/icon-192.png',
      tag: d.tag || 'chatsite',
      renotify: true,
      vibrate: [150, 80, 150],
      data: { url: d.url || './index.html' }
    });
  }));
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var url = new URL((e.notification.data && e.notification.data.url) || './index.html', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].url.indexOf(self.registration.scope) === 0 && 'focus' in list[i]) {
        list[i].navigate(url).catch(function () {});
        return list[i].focus();
      }
    }
    return self.clients.openWindow(url);
  }));
});

self.addEventListener('pushsubscriptionchange', function () {
  self.clients.matchAll({ type: 'window' }).then(function (list) {
    list.forEach(function (c) { c.postMessage({ type: 'cs-resubscribe' }); });
  });
});
