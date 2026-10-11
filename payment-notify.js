// ChatSite: arifa za juu zinazoonyesha watu waliopokea malipo
(function(){
  var ctx;
  function beep(){try{ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();if(ctx.state==='suspended')ctx.resume();
    [880,1320].forEach(function(f,k){var o=ctx.createOscillator(),g=ctx.createGain();o.frequency.value=f;o.connect(g);g.connect(ctx.destination);
      var t=ctx.currentTime+k*0.18;g.gain.setValueAtTime(0.2,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.25);o.start(t);o.stop(t+0.26)})}catch(_){}}
  document.addEventListener('pointerdown',function(){try{ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();ctx.resume()}catch(_){}},{once:true});
  var names=['Juma M.','Neema K.','Baraka S.','Asha R.','Daudi L.','Rehema J.','Hamisi O.','Zawadi P.','Elia N.','Mwanaidi H.','Godfrey T.','Fatuma A.','Joseph W.','Halima B.','Peter C.','Saida M.','Emmanuel K.','Upendo G.','Yusuf I.','Grace E.'];
  var places=['Dar es Salaam','Arusha','Mwanza','Dodoma','Mbeya','Tanga','Morogoro','Moshi','Zanzibar','Iringa','Kigoma','Mtwara'];
  var amounts=[15000,20000,25000,30000,35000,40000,50000,60000,75000,80000,100000,120000];
  var methods=['M-Pesa','Airtel Money','Tigo Pesa','HaloPesa'];
  function pick(a){return a[Math.floor(Math.random()*a.length)]}
  function show(){if(!window.csTop)return;
    var mins=1+Math.floor(Math.random()*9);
    window.csTop({icon:'💰',title:pick(names)+' amepokea malipo',body:'TZS '+pick(amounts).toLocaleString('en-US')+' • '+pick(places)+' • dakika '+mins+' zilizopita',ms:5000});
    beep()}
  setTimeout(show,6000);setInterval(show,90000);
})();
