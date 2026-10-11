// Usajili wa service worker kwa arifa za ujumbe pekee.
(function(){
  if('serviceWorker' in navigator){navigator.serviceWorker.register('./sw.js').catch(function(){});
    navigator.serviceWorker.addEventListener('message',function(e){if(e.data&&e.data.type==='cs-resubscribe'){try{Object.keys(localStorage).forEach(function(k){if(k.indexOf('cs-push4-')===0)localStorage.removeItem(k)});var r=localStorage.getItem('chatsite_support_user_id');if(r&&window.csPushSubscribe)window.csPushSubscribe('user',r)}catch(_){}}});}
})();
