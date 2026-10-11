// ChatSite: arifa za juu (umepokea ujumbe)
(function(){
  var s=document.createElement('style');s.textContent=
  '.cs-top{position:fixed;top:10px;left:50%;transform:translate(-50%,-140%);width:calc(100% - 24px);max-width:452px;z-index:90;display:flex;gap:10px;align-items:flex-start;padding:12px 14px;background:var(--card2);border:1px solid var(--g);border-radius:16px;color:var(--txt);box-shadow:0 10px 30px rgba(0,0,0,.4);transition:transform .35s ease;cursor:pointer}'+
  '.cs-top.on{transform:translate(-50%,0)}.cs-top b{display:block;font-size:13px}.cs-top small{display:block;color:var(--mut);font-size:12px;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:340px}.cs-top i{font-style:normal;font-size:22px}';
  document.head.appendChild(s);
  var el=document.createElement('div');el.className='cs-top';el.setAttribute('role','status');el.setAttribute('aria-live','polite');document.body.appendChild(el);
  var q=[],busy=false;
  function next(){if(busy||!q.length)return;busy=true;var n=q.shift();el.innerHTML='';
    var i=document.createElement('i');i.textContent=n.icon||'🔔';var d=document.createElement('div'),b=document.createElement('b'),m=document.createElement('small');
    b.textContent=n.title;m.textContent=n.body||'';d.appendChild(b);d.appendChild(m);el.appendChild(i);el.appendChild(d);
    el.onclick=function(){el.classList.remove('on');if(n.onClick)n.onClick()};
    requestAnimationFrame(function(){el.classList.add('on')});
    setTimeout(function(){el.classList.remove('on');setTimeout(function(){busy=false;next()},400)},n.ms||4500)}
  window.csTop=function(n){q.push(n);next()};
  window.csNotify=function(title,body){
    window.csTop({title:title,body:body,icon:'💬',onClick:function(){if(window.openHelp&&title.indexOf('ChatSite')>-1)window.openHelp()}});
    try{if(navigator.vibrate)navigator.vibrate(150)}catch(_){}
    if(document.hidden&&window.Notification&&Notification.permission==='granted'){try{new Notification(title,{body:body,icon:'../favicon.ico'})}catch(_){}}
  };
})();
