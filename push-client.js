// ChatSite: kujiandikisha kupokea arifa (push) na kuwatumia wengine arifa.
(function () {
  var KEY = 'BGzSTDdyZZGqEyKYxC2RQXqCYyIGt48gb1G1oY401-IbiN43bo92K3mWpeMk_1oonfY7FwgNb0vkhqm1Eccb_cM';
  var API = '/api/public/push';
  function b64(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); s += '==='.slice((s.length + 3) % 4); var r = atob(s), a = new Uint8Array(r.length); for (var i = 0; i < r.length; i++) a[i] = r.charCodeAt(i); return a; }
  function post(body) {
    return fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true
    }).then(function (r) {
      if (!r.ok) return null;
      return r.json().catch(function () { return null; });
    }).catch(function () { return null; });
  }

  window.csPushSubscribe = function (role, id) {
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !window.Notification) return Promise.resolve(false);
    var flag = 'cs-push4-' + role + '-' + id;
    var ask = Notification.permission === 'granted' ? Promise.resolve('granted') : Notification.requestPermission();
    return ask.then(function (p) {
      if (p !== 'granted') return false;
      return navigator.serviceWorker.register('./sw.js').then(function () { return navigator.serviceWorker.ready; }).then(function (reg) {
        return reg.pushManager.getSubscription().then(function (s) {
          return s || reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(KEY) });
        });
      }).then(function (sub) {
        var j = JSON.stringify(sub);
        // Tuma usajili kwa server kila mara ili urejeshe usajili ukipotea;
        // hifadhi alama ya local pekee baada ya server kuthibitisha.
        return post({ action: 'subscribe', role: role, id: id, sub: sub.toJSON() }).then(function (result) {
          if (!result || result.ok !== true) return false;
          localStorage.setItem(flag, j);
          return true;
        });
      });
    }).catch(function () { return false; });
  };

  window.csPushSend = function (to, room) {
    // subiri kidogo ujumbe uhifadhiwe kwanza
    setTimeout(function () { post({ action: 'send', to: to, room: room }); }, 1200);
  };

  // Kama ruhusa ilishatolewa, hakikisha usajili uko hai kila mara site ikifunguliwa.
  window.addEventListener('load', function () {
    if (!window.Notification || Notification.permission !== 'granted') return;
    var r = localStorage.getItem('chatsite_support_user_id');
    if (r) window.csPushSubscribe('user', r);
    if (sessionStorage.getItem('cs_admin') === '1' || localStorage.getItem('cs_admin_push') === '1') window.csPushSubscribe('agent', 'all');
  });
})();
