/* Rule-based review for the existing demonstration students, not real payment authorization. */
(function(root){
  'use strict';
  const rules={
    'Maria Garcia':[['habari','hujambo','mambo','shikamoo'],['nzuri','sijambo','poa','marahaba']],
    'Ahmed Hassan':[['acha','usi','hapana','sitisha'],['tafadhali','heshima']],
    'Ingrid Berg':[['karibu'],['asante','shukrani']],
    'Tom Baker':[['maji'],['chakula']],
    'Oliver Smith':[['asubuhi'],['jioni']],
    'Sarah Brown':[['moja'],['mbili'],['tatu']],
    'Yuki Tanaka':[['amani'],['heshima']],
    'Lucas Müller':[['kushoto'],['kulia']],
    'Chloé Martin':[['furaha'],['upendo']],
    'Raj Patel':[['bei'],['duka','dukani']],
    'Ana Silva':[['wimbo','nyimbo'],['ngoma']],
    'Liam Chen':[['mimi'],['wewe']],
    'Sofia Rossi':[['karibu'],['tafadhali']],
    'Emma Jansen':[['dada'],['kaka']],
    'Kwame Mensah':[['shukrani'],['karibu']],
    'Hana Kim':[['leo'],['kesho']]
  };
  function normalize(value){return String(value||'').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}\s]/gu,' ').replace(/\s+/g,' ').trim()}
  function create(name){
    const groups=rules[name]||rules['Maria Garcia'];
    let sent=0,lessons=0,approved=false,rejected=false;
    function submit(message){
      const text=normalize(message);if(!text)return false;sent++;
      const words=text.split(' ');
      const explanatory=/\b(?:maana|inamaanisha|means|mean|mfano|example|sentensi|sentence|sema|say|jibu|reply|itikia|hutumika|tunatumia|kwa mfano|ni)\b/.test(text)||String(message).includes('=');
      const relevant=groups.every(group=>group.some(term=>words.includes(term)));
      const taught=words.length>=6&&explanatory&&relevant;
      if(taught){lessons++;approved=true;rejected=false}
      else if(words.length>3){approved=false;rejected=true}
      return taught;
    }
    function review(){
      if(!lessons)return {eligible:false,reason:sent?'unmet':'missing',message:sent?'Mafunzo hayajajibu alichoomba mwanafunzi. Malipo hayajaidhinishwa.':'Tafadhali, hatujaona mafunzo yoyote uliyotoa.'};
      if(!approved||rejected)return {eligible:false,reason:'unmet',message:'Mwanafunzi hajaridhika na mafunzo uliyotoa. Malipo hayajaidhinishwa.'};
      return {eligible:true,reason:'approved',message:'Mafunzo ya mfano yamekidhi mada aliyoomba mwanafunzi.'};
    }
    return {submit,review};
  }
  root.ChatsiteLessonReview={create};
})(typeof window!=='undefined'?window:globalThis);