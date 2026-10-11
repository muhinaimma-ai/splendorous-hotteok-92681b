/* Student-specific greeting and lesson dialogue for the standalone Chatsite page. */
(function(root){
  'use strict';
  const topics={
    'Maria Garcia':'salamu za kwenu na jinsi ya kuziitikia',
    'Ahmed Hassan':'maneno ya kumkataza mtu kwa heshima',
    'Ingrid Berg':'ukaribisho na shukrani',
    'Tom Baker':'kuomba maji na chakula',
    'Oliver Smith':'salamu za asubuhi na jioni',
    'Sarah Brown':'kuhesabu moja, mbili na tatu',
    'Yuki Tanaka':'maneno ya amani na heshima',
    'Lucas Müller':'kuuliza njia, kushoto na kulia',
    'Chloé Martin':'maneno ya furaha na upendo',
    'Raj Patel':'kuuliza bei dukani',
    'Ana Silva':'maneno ya nyimbo na ngoma',
    'Liam Chen':'kutumia mimi na wewe kwenye sentensi',
    'Sofia Rossi':'kukaribisha rafiki na kuomba kwa upole',
    'Emma Jansen':'majina ya ndugu katika familia',
    'Kwame Mensah':'kutamka shukrani na karibu',
    'Hana Kim':'kutumia leo na kesho kwenye sentensi'
  };
  function normalize(value){return String(value||'').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}\s]/gu,' ').replace(/\s+/g,' ').trim()}
  function greeting(value){
    const v=normalize(value);
    if(/\b(?:ass?ala+mu? ala[iy]kum|salaam? ale[iy]kum)\b/.test(v))return 'Wa aleikum salaam! Habari yako, mwalimu?';
    if(/\bshikamoo\b/.test(v))return 'Marahaba! Habari yako, mwalimu?';
    if(/\bmarahaba\b/.test(v))return 'Asante, mwalimu! Habari yako?';
    if(/\bhamjambo\b/.test(v))return 'Hatujambo! Nanyi hamjambo?';
    if(/\bhujambo\b/.test(v))return 'Sijambo! Na wewe hujambo?';
    if(/\b(?:mambo|vipi)\b/.test(v))return 'Poa! Mambo vipi kwako, mwalimu?';
    if(/\bhabari\b/.test(v))return 'Nzuri, mwalimu! Habari yako pia?';
    if(/\bgood morning\b/.test(v))return 'Good morning! Habari za asubuhi, mwalimu?';
    if(/\bgood afternoon\b/.test(v))return 'Good afternoon! Habari za mchana, mwalimu?';
    if(/\bgood evening\b/.test(v))return 'Good evening! Habari za jioni, mwalimu?';
    if(/\b(?:hello|hi|hey|hola|bonjour|hallo|ciao|hoi|namaste|konnichiwa|annyeong|g day)\b/.test(v))return 'Hello, mwalimu! Habari yako?';
    if(/\b(?:salama|salam|salaam|salamu|jambo)\b/.test(v))return 'Salama, mwalimu! Habari yako pia?';
    return null;
  }
  function create(name,style){
    const topic=topics[name]||'salamu za kwenu na jinsi ya kuziitikia';
    style=style||['','Sawa, mwalimu. Asante! Nitaendelea kufanya mazoezi.',''];
    let awaitingGreetingReply=false,lessonStarted=false,turn=0;
    const review=root.ChatsiteLessonReview.create(name);
    function request(){lessonStarted=true;return 'Naomba unifundishe '+topic+'. Niandikie maneno na mifano yake; mimi nitayashika.'}
    return {submit:review.submit,review:review.review,respond:function(message){
      const result=review.review();
      if(result.eligible){lessonStarted=true;awaitingGreetingReply=false;return 'Asante, mwalimu! Umenifundisha '+topic+' kwa mifano. Nimeelewa.'}
      if(awaitingGreetingReply){awaitingGreetingReply=false;return request()}
      const salamu=greeting(message);
      if(salamu&&normalize(message).split(' ').length<=5){awaitingGreetingReply=true;return salamu}
      if(!lessonStarted)return request();
      turn++;
      return 'Bado hujanifundisha nilichoomba: '+topic+'. Tafadhali nipe maana na mifano ya maneno hayo.';
    }};
  }
  root.ChatsiteStudentDialogue={create,greeting,topics};
})(typeof window!=='undefined'?window:globalThis);
