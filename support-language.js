/* Chatsite support language v29. Local intent handling; no secrets or model claims. */
(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ChatsiteSupportLanguage = api;
})(typeof window !== 'undefined' ? window : globalThis, function() {
  'use strict';
  const rooms = new Map();
  const helpTopics = [
    {id:'registration', title:'Msaada wa kujisajili', text:'Jinsi ya kujisajili:\n1. Bonyeza neno "Jisajili" juu kulia (au "Fungua account").\n2. Itakupeleka moja kwa moja kwenye ukurasa wa kujisajili.\n3. Weka email yako yoyote.\n4. Weka namba ya kupokea miamala yako.\n5. Weka jina la mtandao wako (mfano: Aisha Juma).\n6. Weka username rahisi (mfano: juma09).\n7. Weka nenosiri imara, refu na la kipekee; usilishiriki na mtu.\n8. Chagua nchi yako — kama upo Tanzania acha hivyo.\n9. Bonyeza SIGN UP.\nKiingilio ni TZS 14,500 mara moja tu. 💯'},
    {id:'chat', title:'Msaada wa kuchat', text:'Kama unataka kuchat ama kufunza watu bila limite unatakiwa kulipia ili account yako iwe premium. Kwa hiyo hakikisha unakuwa na account; ni muhimu sana. Tambua uwepo wako ni muhimu kwetu. Fungua account mapema uanze.'},
    {id:'withdrawal', title:'Msaada wa kutoa pesa', text:'Ili kutoa pesa zako, hata zile unazotengeneza kwa account ya free, bado unaweza kutoa. Ila zingatia kitu kimoja: hakikisha mfumo unatambua namba yako ya kupokea malipo. Hivyo jisajili ili uweke namba ya kupokea miamala yako. Asante.'},
    {id:'payment', title:'Msaada wa kulipia', text:'Fungua sehemu ya usajili kisha jisajili. Ukimaliza bonyeza SIGN UP. Utaona sehemu ya kuweka namba; weka namba, thibitisha, subiri uweke PIN yako ya siri kwenye ombi la malipo la mtandao wako, si kwenye chat. Hakikisha namba inakuwa kwenye simu.'},
    {id:'activation', title:'Msaada umeshajisajili na kulipia account haijafunguka', text:'Kama umelipia na account haijafunguka, jaribu ku login kisha weka username na password ambazo uliweka kwenye usajili. Kama inakataa, angalia: je, muamala wa malipo umefanyika kwenye account yako ya MTANDAO au pesa bado zipo? Kama pesa imetoka, basi tuma ujumbe wa kawaida (SMS) 0614456925 kama WhatsApp hujibiwi.'},
    {id:'teaching', title:'Msaada Jinsi ya kufunza na kulipwa', text:'Jinsi ya kufunza na kulipwa\n\nKwenye account yako utaona watu kwenye visanduku. Chagua mtu aliye online ili kuanza mazungumzo. Ukiwa kwa mara ya kwanza utakuwa na nafasi nne za bure. Baada ya hapo utatakiwa kuwa na account ya pro unlimited ili kuwa na uhuru wa mazungumzo hadi mwisho.'}
  ];
  function selectTopic(id, room) {
    const topic = helpTopics.find(topic => topic.id === id);
    if (!topic) return {intent:'unknown', text:null};
    rooms.set(room, {topic:topic.title});
    return {intent:'help_topic', text:topic.text, topicId:topic.id};
  }
  function normalize(value) {
    return String(value || '').normalize('NFKC').toLowerCase()
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/\bnime\s+elewa\b/g, 'nimeelewa')
      .replace(/\b(ni(?:me(?:sha)?|sha)|nme)\s+(lip(?:a|ia)|tuma)\b/g, '$1$2')
      .replace(/\bni\s+saidie\b|\bnisaidiye\b/g, 'nisaidie')
      .replace(/\bna\s+omba\b/g, 'naomba')
      .replace(/\basanteh?\b|\bahsante\b|\basanteni\b/g, 'asante')
      .replace(/\bshukurani\b/g, 'shukrani')
      .replace(/\bsaizi\b|\bsai?zi\b|\bsahivi\b|\bsaa hii\b/g, 'sasa')
      .replace(/\binakuwaje\b|\binakuaje\b/g, 'inakuaje')
      .replace(/\bnashkuru\b|\bnashukuruu+\b/g, 'nashukuru')
      .replace(/\b(na|nina|naku|tuna|ninaku)\s+shukuru\b/g, '$1shukuru')
      .replace(/\bhaina\s+shida\b|\bhamna\s+shida\b|\bhakuna\s+shida\b/g, 'poa')
      .replace(/\bacc?ount\b|\baccounti\b/g, 'akaunti')
      .replace(/[^\p{L}\p{N}\s?]/gu, ' ').replace(/\s+/g, ' ').trim();
  }
  const courtesy = /^(?:(?:sawa|ok|okay|haya|basi|poa|safi|nimeelewa|nimekuelewa|nimekupata|nimuelewa|nimefahamu|nimepata|imeeleweka|naelewa|nimeelewa sasa|sasa nimeelewa|aah|ah|aha|naam|ndiyo|ndio|yes|asante(?: sana| mno| tena)?|shukrani(?: sana)?|nashukuru(?: sana)?|ninashukuru(?: sana)?|tunashukuru(?: sana)?|ninakushukuru(?: sana)?|nimekushukuru(?: sana)?|thankful|grateful|nakushukuru(?: sana)?|thanks|thank you|thx|kwa (?:msaada(?: wako)?|maelekezo|kunisaidia|ufafanuzi|jibu|kila kitu)|nimefurahi|umenisaidia|umenielewesha|umesaidia|msaada wako|wako|pia|na|mkuu|boss|rafiki|dada|kaka|support|customer service|sana|tena|nipo pamoja|ubarikiwe|mungu akubariki|barikiwa)\s*)+$/;
  const question = /\?|\b(?:je|vipi|nini|gani|wapi|lini|kwa nini|kwanini|mbona|ngapi|namna|jinsi|nawezaje|naweza|nifanye|naomba|nahitaji|nisaidie|nieleze|nionyeshe|nashindwa|imeshindikana|haifanyi|haifunguki|sielewi|sijaelewa|sijakuelewa|sifahamu|how|what|where|why|when)\b/;
  function courtesyOnly(text) {
    const q = normalize(text);
    return !!q && !question.test(q) && courtesy.test(q);
  }
  function isAbusive(text) {
    const q = normalize(text);
    const profanity = /\b(?:mjinga|wajinga|mpumbavu|wapumbavu|upumbavu|mshenzi|washenzi|mavi|kumamako|kumamake|kuma|matako|malaya|fuck(?:ing|er|ers|ed)?|shit|bullshit|bitch(?:es)?|asshole(?:s)?|motherfucker(?:s)?)\b/;
    const insult = /\b(?:wewe|nyinyi|ninyi|you|you are|you re)\s+(?:(?:ni|are|a|an|wote)\s+)*(?:mbwa|nguruwe|stupid|idiot|idiots|fool|fools|useless)\b/;
    const threat = /\b(?:nitakuua|nitawaua|nitakupiga|nitawapiga|nakuua|nakupiga)\b|\b(?:i will|i ll|i am going to)\s+(?:kill|hurt|beat)\s+you\b/;
    return profanity.test(q) || insult.test(q) || threat.test(q);
  }
  function stripCourtesy(q) {
    return q.replace(/^(?:(?:asante(?: sana)?|nashukuru|shukrani|nimeelewa|sawa|ok|okay|habari|mambo|hello|hi|tafadhali|lakini|ila|na)\s+)+/, '')
      .replace(/\s+(?:asante(?: sana)?|shukrani|tafadhali)$/, '').trim();
  }
  function helpMenu(intent, welcome) {
    return {intent, text:(welcome ? welcome+'\n\n' : '')+'Tafadhali bonyeza kisanduku cha msaada unaotaka.', helpTopics:helpTopics.map(({id,title}) => ({id,title}))};
  }
  function greetingAnswer(raw) {
    // Match only complete greetings, so a greeting cannot hide a real question.
    const phrase = '(?:habari(?: yako| zenu| za (?:leo|sasa|asubuhi|mchana|jioni|usiku|kazi|nyumbani|muda huu))?|mambo(?: vipi)?|vipi|inakuaje|(?:upo|uko|u|mko|mupo) (?:poa|sawa|salama|mzima)|hujambo|hamjambo|jambo|salama|shikamoo|salamu|hello|hi|hey|good (?:morning|afternoon|evening)|salaam|salam|salaam? ale[iy]kum|as{1,2}ala{1,2}mu? ala[iy]kum)';
    const address = '(?:boss(?: wangu)?|bos|bosi(?: wangu)?|mkuu|ndugu|rafiki(?: yangu)?|dada|kaka|support|customer service|msaidizi)';
    const greeting = new RegExp('^(?:'+phrase+'(?: '+address+')*(?:\\s*\\?*\\s*|$))+$');
    if (!greeting.test(raw)) return null;
    if (/^shikamoo\b/.test(raw)) return 'Marahaba!';
    if (/^(?:salaam? ale[iy]kum|as{1,2}ala{1,2}mu? ala[iy]kum)/.test(raw)) return 'Wa aleikum salaam!';
    if (/^mambo\b/.test(raw)) return 'Poa!';
    if (/^(?:hujambo|hamjambo)\b/.test(raw)) return 'Sijambo!';
    if (/^(?:habari|vipi|inakuaje|upo|uko|u |mko|mupo)/.test(raw)) return 'Nzuri kabisa, nipo poa! Wewe unaendeleaje?';
    return 'Salamu! Karibu sana.';
  }
  function respond(text, room, kb, greeting) {
    const raw = normalize(text), state = rooms.get(room) || {};
    if (!raw) return {intent:'empty', text:null};
    if (isAbusive(text)) return {intent:'abusive', text:null};
    if (courtesyOnly(text)) return {intent:'acknowledgement', text:'karibu tena tupo kukusaidia'};
    const q = stripCourtesy(raw);
    if (/^(?:kwaheri|baadaye|tutaonana|bye|goodbye|usiku mwema|lala salama)(?: tena| mkuu| sana)?$/.test(q))
      return {intent:'farewell', text:'Kwaheri, karibu tena!'};
    if (/^(?:hapana|no|siyo|sio|si hivyo|sivyo|sio hivyo|hujanielewa|hujanipata|sielewi|sijaelewa|sijakuelewa|sifahamu)$/.test(q))
      return {intent:'clarification', text:state.topic ? 'Samahani, tuelewane vizuri. Ni sehemu gani kuhusu '+state.topic+' unataka nifafanue?' : 'Samahani, ni sehemu gani hujaelewa? Niambie nikufafanulie.'};
    const greetingText = greetingAnswer(raw) || (typeof greeting === 'function' ? greeting(raw) : null);
    if (greetingText) return helpMenu('greeting', greetingText+' Karibu sehemu ya msaada.');
    if (/(?:lip|malipo|muamala)/.test(q) && /(?:haija\s*fung|haifung|haijafung|haija\s*funguka)/.test(q)) return selectTopic('activation', room);
    const payment = /\b(?:ni(?:me(?:sha)?|sha)|nme)lip(?:a|ia)\b|\b(?:nimetuma|nimeshatuma|nishatuma)\b.*\b(?:pesa|hela|fedha|malipo|muamala)\b|\b(?:tayari|nimeshamaliza|nimemaliza)\b.*\b(?:kulipa|kulipia|malipo)\b|\b(?:malipo|muamala)\b.*\b(?:nimefanya|nimemaliza|nimeshafanya)\b/;
    if (payment.test(q)) {
      rooms.set(room, {topic:'malipo', awaitingWhatsApp:true});
      return {intent:'payment_report', text:'Tuma namba yako ya WhatsApp hapa.'};
    }
    if (state.awaitingWhatsApp && /^(?:\+?\d[\d\s]{7,15})$/.test(String(text || '').trim())) {
      rooms.set(room, {topic:'malipo', awaitingWhatsApp:false});
      return {intent:'contact_received', text:'Asante kwa kutuma namba yako.'};
    }
    const help = /\b(?:msaada|help|assistance|nisaidie|nisaidieni|unisaidie|mnisaidie|nisadie|nisaidi|nisaidiwe|saidia|kusaidia|kunisaidia|tusaidie|naelekezwa|nielekeze|mniongoze|niongoze|nielezeni|nifafanulie|maelekezo|maelekezoje)\b/;
    if (help.test(q) && !/\b(?:sitaki|sihitaji|usi(?:ni)?saidie|no help|don t need help)\b/.test(q)) {
      const prefix=raw.match(/^(?:habari(?: yako| zenu)?|mambo(?: vipi)?|hujambo|hamjambo|shikamoo|hello|hi|hey)\b/);
      const welcome=prefix ? greetingAnswer(prefix[0])+' Karibu sehemu ya msaada.' : null;
      return helpMenu('help_request', welcome);
    }
    if (/\b(?:jinsi|namna)\b.*\b(?:kufunza|kufundisha|kulipwa)\b|\b(?:kufunza|kufundisha)\b.*\b(?:kulipwa|nalipwa|kipato)\b/.test(q)) return selectTopic('teaching', room);
    const answers = [];
    function add(topic, answer) { answers.push(answer); state.topic = topic; }
    if (/\b(?:utapeli|tapeli|matapeli|scam|fake|feki|uongo|siongo|halali|ukweli|kweli|kuamini|kuaminika|naamini|salama|uhakika|legit|real)\b/.test(q))
      add('usalama wa tovuti', 'Naelewa unataka kuwa na uhakika. Siwezi kuthibitisha kuwa huduma hii si utapeli bila ushahidi unaoweza kuhakikiwa. Kabla ya kulipa, hakiki taarifa za mmiliki, masharti na mpokeaji wa malipo. Usitume PIN, OTP au nenosiri. Una shaka kuhusu jambo gani hasa?');
    if (!answers.length && /\b(?:fungua|kufungua)\s+(?:akaunti)|\banza sasa\b/.test(q))
      add('usajili', 'Unaweza kufungua akaunti. Bonyeza “Anza sasa”, soma masharti na hakiki taarifa kabla ya kulipa.');
    if (/\b(?:imetokea|imetoka|ilitoka|ilianzia|imeanzia|asili|makao|ilianzishwa|imeanzishwa|mmiliki|kampuni|marekani|america|usa)\b/.test(q) || /\b(?:site|tovuti|chatsite|kampuni)\b.*\b(?:nchi|wapi|nani)\b|\b(?:nchi|wapi|nani)\b.*\b(?:site|tovuti|chatsite|kampuni)\b/.test(q))
      add('asili ya tovuti', 'Karibu, mpendwa! Kwa taarifa rasmi kuhusu mmiliki wa Chatsite Online na nchi ilikoanzishwa, tafadhali wasiliana na huduma kwa wateja. Nipo hapa kukusaidia kuelewa huduma na hatua za kutumia akaunti yako.');
    if (/\b(?:otp|pin|nenosiri|password|nywila)\b/.test(q))
      add('nenosiri', /\b(?:sahau|nimesahau|imesahaulika|forgot)\b/.test(q) ? 'Kama umesahau nenosiri, tumia chaguo la kulirejesha ikiwa lipo kwenye ukurasa wa kuingia, au omba msaada wa huduma kwa wateja. Usitume nenosiri, PIN au OTP kwenye chat.' : 'Tumia nenosiri imara lisilotumika kwenye akaunti nyingine. Usitume nenosiri, PIN au OTP kwenye chat; huduma kwa wateja haihitaji taarifa hizo.');
    if (/\b(?:malipo|muamala)\b.*\b(?:haija|hayaja|haion|hayao|tatizo|shida|pending)\w*/.test(q))
      add('tatizo la malipo', 'Pole kwa tatizo la malipo. Eleza muda wa muamala na ujumbe wa hitilafu unaoonekana ili huduma kwa wateja ikague. Usilipe tena kabla ya kupata ufafanuzi, na ficha PIN, OTP na taarifa binafsi kwenye picha ya risiti.');
    if (/\b(?:haifunguki|haifanyi|imegoma|imeshindikana|nashindwa|siwezi|hitilafu|error|tatizo|shida)\b/.test(q) && !answers.length)
      add('tatizo la huduma', 'Pole kwa tatizo hilo. Ni sehemu gani inakataa kufanya kazi, na inaonyesha ujumbe gani? Usitume nenosiri, PIN au OTP.');
    if (/\b(?:bei|kiingilio|kiingilo|ada|gharama|shilingi|kulipia|kujiunga|14500)\b|\b(?:pesa|hela|fedha)\b.*\bngapi\b|\b(?:bure|free)\b/.test(q))
      add('bei ya usajili', 'Ada ya kujisajili iliyoonyeshwa kwenye tovuti ni TZS 14,500, mara moja. Soma masharti ya huduma na hakiki mpokeaji kabla ya kulipa; kulipa ada si uthibitisho wa kupata kipato.');
    if (/\b(?:kutoa|toa|natoa|nitoe|nitatoa|nikitoa|withdraw|withdrawal)\b|\bkima\b|kiwango cha chini/.test(q))
      add('kutoa pesa', 'Bonyeza “Toa pesa”, kisha fuata utaratibu unaoonyeshwa kwenye tovuti. Kiwango cha chini kilichoelezwa ni TZS 5,000. Kama ombi linakwama, eleza ujumbe unaoonekana ili huduma kwa wateja ikague; siwezi kuthibitisha muda wa malipo.');
    if (!answers.length && /\b(?:endelea|fafanua|eleza zaidi|maelezo zaidi|halafu|kisha|kwa mfano)\b/.test(q) && state.topic) {
      return {intent:'followup', text:'Unataka maelezo zaidi kuhusu '+state.topic+'. Ni hatua au sehemu gani hasa unayotaka kuelewa?'};
    }
    if (!answers.length && typeof kb === 'function') {
      const known = kb(q);
      if (known) add(/sajili|akaunti|jiunga|fungua/.test(q) ? 'usajili' : /kipato|pesa|hela|fedha|kulipwa/.test(q) ? 'kipato' : 'huduma ya tovuti', known);
    }
    if (answers.length) { rooms.set(room, state); return {intent:'question', text:answers.join('\n\n')}; }
    return {intent:'unknown', text:null};
  }
  return {normalize, courtesyOnly, isAbusive, respond, helpTopics, selectTopic};
});
