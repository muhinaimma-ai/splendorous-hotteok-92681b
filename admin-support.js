// ChatSite: Msaada halisi (mteja <-> Admin) + sehemu ya Admin (email & password)
(function(){
  var ROOT='https://chatsite-c1b34-default-rtdb.europe-west1.firebasedatabase.app/supportChats';
  function $(i){return document.getElementById(i)}
  function api(path,method,body){return fetch(ROOT+'/'+path+'.json',{method:method||'GET',cache:'no-store',headers:{'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined}).then(function(r){return r.ok?r.json():null}).catch(function(){return null})}
  function sha(t){return crypto.subtle.digest('SHA-256',new TextEncoder().encode(t)).then(function(b){return Array.from(new Uint8Array(b)).map(function(x){return x.toString(16).padStart(2,'0')}).join('')})}
  function clean(s,n){return String(s||'').trim().slice(0,n||800)}
  function notify(t,b){if(window.csNotify)window.csNotify(t,b)}

  // ---------- Upande wa mteja ----------
  var room=localStorage.getItem('chatsite_support_user_id');
  if(!room){room='u'+Date.now().toString(36)+Math.random().toString(36).slice(2,7);localStorage.setItem('chatsite_support_user_id',room)}
  var seen=JSON.parse(localStorage.getItem('cs_seen_agent')||'{}'),told=false;
  function bubble(box,who,text){var d=document.createElement('div');d.className='m '+who;d.textContent=text;var b=$(box);if(!b)return;
    if(window.addMsg){window.addMsg(box,who,text);return}b.appendChild(d);d.scrollIntoView({block:'end'})}
  function sendUser(text){
    var now=Date.now(),last={from:'user',text:text,time:now};
    api(room+'/msgs','POST',last);api(room+'/last','PUT',last);
    api('_index/'+room,'PATCH',{last:last,updatedAt:now,unreadForAgent:1,name:localStorage.getItem('cs_support_name')||('Mteja '+room.slice(-4))});
    if(window.csPushSubscribe)window.csPushSubscribe('user',room);if(window.csPushSend)window.csPushSend('agent',room);
  }
  var origSend=window.sendHelp;
  window.sendHelp=function(e){var input=$('hIn');var v=input?clean(input.value):'';
    if(typeof origSend==='function')origSend(e);else e.preventDefault();
    if(v)sendUser(v);
  };
  function pollUser(){api(room+'/msgs').then(function(m){if(!m)return;Object.keys(m).forEach(function(k){var x=m[k];
    if(x&&x.from==='agent'&&!seen[k]){seen[k]=1;localStorage.setItem('cs_seen_agent',JSON.stringify(seen));
      bubble('hMsgs','them',x.text);notify('💬 Umepokea ujumbe kutoka ChatSite',x.text)}})})}
  setInterval(pollUser,4000);setTimeout(pollUser,800);

  // ---------- Upande wa Admin ----------
  var css=document.createElement('style');css.textContent=
  '.adm-link{background:none;border:1px solid var(--mut);color:var(--mut);border-radius:999px;padding:6px 14px;font-size:11px;margin-top:10px;cursor:pointer}'+
  '#admOv .field{width:100%;margin-top:10px}#admOv .err{color:#f87171;font-size:12px;margin-top:8px;min-height:16px}'+
  '.adm-room{display:flex;justify-content:space-between;gap:8px;width:100%;text-align:left;padding:12px;margin-top:8px;border-radius:12px;background:var(--card2);border:1px solid transparent;color:var(--txt);cursor:pointer}'+
  '.adm-room.new{border-color:var(--g)}.adm-room small{color:var(--mut);display:block;margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:240px}'+
  '.adm-dot{background:var(--g);color:var(--bg);border-radius:999px;font-size:10px;padding:2px 8px;height:fit-content}'+
  '#admMsgs{display:flex;flex-direction:column;gap:10px}'+
  '.m{max-width:80%;padding:8px 12px;border-radius:14px;font-size:13px;width:fit-content;word-break:break-word}'+
  '.m.me{background:var(--g);color:#032013;align-self:flex-end;border-bottom-right-radius:6px;font-weight:600}'+
  '.m.them{background:#2563eb;color:#fff;align-self:flex-start;border-bottom-left-radius:6px}';
  document.head.appendChild(css);
  var ov=document.createElement('div');ov.className='ov';ov.id='admOv';ov.innerHTML=
  '<div class="sheet"><div class="sh"><div class="logo" style="width:36px;height:36px">🔐</div><div><b id="admTitle">Account</b><small id="admSub">Ingia kwenye account</small></div><button class="x" id="admX">×</button></div>'+
  '<div class="sb" id="admLogin"><p style="color:var(--mut);font-size:13px" id="admHint">Weka email na password.</p>'+
  '<input class="field" id="admEmail" type="email" placeholder="Email" autocomplete="username">'+
  '<input class="field" id="admPass" type="password" placeholder="Password" autocomplete="current-password">'+
  '<div class="err" id="admErr"></div><button class="cta" id="admGo">Ingia</button></div>'+
  '<div class="sb" id="admList" style="display:none"><div id="admRooms"></div><button class="adm-link" id="admOut">Toka (Logout)</button></div>'+
  '<div id="admChat" style="display:none;flex:1;flex-direction:column;min-height:0"><button class="adm-link" id="admBack" style="margin:8px 12px 0;width:fit-content">← Wateja wote</button>'+
  '<div class="sb"><div class="msgs" id="admMsgs"></div></div><form class="sf" id="admForm"><input id="admIn" placeholder="Jibu mteja..." autocomplete="off"><button class="send">➤</button></form></div></div>';
  document.body.appendChild(ov);
  var foot=document.querySelector('footer'),accBtn=null,outBtn=null;if(foot){accBtn=document.createElement('button');accBtn.className='adm-link';accBtn.onclick=openAdmin;outBtn=document.createElement('button');outBtn.className='adm-link';outBtn.style.marginLeft='8px';outBtn.textContent='🚪 Logout';outBtn.onclick=function(){$('admOut').onclick()};foot.appendChild(document.createElement('br'));foot.appendChild(accBtn);foot.appendChild(outBtn)}
  function syncBtn(){if(!accBtn)return;accBtn.textContent=authed?'💬 Jibu wateja':'👤 Account';outBtn.style.display=authed?'':'none'}

  var cfg=null,authed=localStorage.getItem('cs_admin')==='1',cur=null,agentSeen={},timer=null;
  function show(v){$('admLogin').style.display=v==='login'?'':'none';$('admList').style.display=v==='list'?'':'none';$('admChat').style.display=v==='chat'?'flex':'none'}
  function openAdmin(){ov.classList.add('on');document.body.style.overflow='hidden';if(authed){show('list');loadRooms()}else{show('login');
    $('admHint').textContent='Weka email na password.';$('admGo').textContent='Ingia'}}
  $('admX').onclick=function(){ov.classList.remove('on');document.body.style.overflow=''};
  $('admGo').onclick=function(){var em=clean($('admEmail').value,120).toLowerCase(),pw=$('admPass').value;
    if(!/^\S+@\S+\.\S+$/.test(em)){$('admErr').textContent='Weka email sahihi';return}
    if(pw.length<6){$('admErr').textContent='Password iwe na herufi 6 au zaidi';return}
    sha(em+'|'+pw+'|chatsite').then(function(h){
      if(h==='a7dd6019484d5f6fd77c6a18cacc251ef541b2b7afa4b6c4b814c7c6c39c4a30')ok();else{$('admErr').textContent='Email au password si sahihi. Huwezi kuingia.';$('admPass').value=''}})};
  function ok(){authed=true;localStorage.setItem('cs_admin','1');$('admErr').textContent='';$('admPass').value='';show('list');loadRooms();startAgent();syncBtn();
    localStorage.setItem('cs_admin_push','1');if(window.csPushSubscribe)window.csPushSubscribe('agent','all')}
  $('admOut').onclick=function(){authed=false;localStorage.removeItem('cs_admin');clearInterval(timer);show('login');syncBtn()};
  $('admBack').onclick=function(){cur=null;show('list');loadRooms()};
  function loadRooms(){api('_index').then(function(idx){var box=$('admRooms');box.innerHTML='';var keys=Object.keys(idx||{}).filter(function(k){return idx[k]&&idx[k].last})
    .sort(function(a,b){return (idx[b].updatedAt||0)-(idx[a].updatedAt||0)});
    if(!keys.length){box.innerHTML='<p style="color:var(--mut);font-size:13px">Bado hakuna ujumbe wa wateja.</p>';return}
    keys.forEach(function(k){var v=idx[k],btn=document.createElement('button');btn.className='adm-room'+(v.unreadForAgent>0?' new':'');
      var l=document.createElement('div'),n=document.createElement('b'),s=document.createElement('small');n.textContent=v.name||k;s.textContent=(v.last.from==='agent'?'Wewe: ':'')+v.last.text;l.appendChild(n);l.appendChild(s);btn.appendChild(l);
      if(v.unreadForAgent>0){var d=document.createElement('span');d.className='adm-dot';d.textContent='Mpya';btn.appendChild(d)}
      btn.onclick=function(){openRoom(k,v.name||k)};box.appendChild(btn)})})}
  function openRoom(k,name){cur=k;$('admTitle').textContent=name;show('chat');api('_index/'+k,'PATCH',{unreadForAgent:0});renderRoom()}
  function renderRoom(){if(!cur)return;api(cur+'/msgs').then(function(m){var box=$('admMsgs');box.innerHTML='';Object.keys(m||{}).forEach(function(i){var x=m[i];if(!x)return;
    var d=document.createElement('div');d.className='m '+(x.from==='agent'?'me':'them');d.textContent=x.text;box.appendChild(d)});box.lastChild&&box.lastChild.scrollIntoView({block:'end'})})}
  $('admForm').onsubmit=function(e){e.preventDefault();var v=clean($('admIn').value);if(!v||!cur)return;$('admIn').value='';var now=Date.now(),last={from:'agent',text:v,time:now};
    api(cur+'/msgs','POST',last).then(renderRoom);api(cur+'/last','PUT',last);api('_index/'+cur,'PATCH',{last:last,updatedAt:now,unreadForAgent:0});if(window.csPushSend)window.csPushSend('user',cur)};
  function startAgent(){clearInterval(timer);var first=true;timer=setInterval(tick,4000);tick();
    function tick(){api('_index').then(function(idx){Object.keys(idx||{}).forEach(function(k){var v=idx[k];if(!v||!v.last)return;var t=v.last.time||0;
      if(v.last.from==='user'&&t>(agentSeen[k]||0)){if(!first&&agentSeen[k]!==undefined||(!first&&agentSeen[k]===undefined))notify('🔔 Umepokea ujumbe mpya kutoka '+(v.name||'mteja'),v.last.text);agentSeen[k]=t}
      else if(agentSeen[k]===undefined)agentSeen[k]=t});first=false;
      if($('admList').style.display!=='none'&&ov.classList.contains('on'))loadRooms();if(cur)renderRoom()})}}
  syncBtn();if(authed)startAgent();
  if(location.hash==='#support-admin')setTimeout(openAdmin,500);
})();
