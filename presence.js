(function(root){
  'use strict';
  // Example profile activity, not a measurement of connected visitors.
  const hourly=[22,18,14,12,16,24,45,80,110,135,150,160,160,160,160,155,150,140,120,100,75,55,38,24,22];
  const intervalMs=2000;
  function hash(value){value=Math.imul(value^(value>>>16),2246822507);value=Math.imul(value^(value>>>13),3266489909);return (value^(value>>>16))>>>0;}
  function target(timestamp,total){
    const local=new Date(timestamp+3*60*60*1000);
    const hour=local.getUTCHours()+local.getUTCMinutes()/60+local.getUTCSeconds()/3600;
    const h=Math.floor(hour),fraction=hour-h;
    const base=hourly[h]+(hourly[h+1]-hourly[h])*fraction;
    const slot=Math.floor(timestamp/intervalMs);
    const variation=0.70+(hash(slot)/4294967296)*0.45;
    const cap=hour>=23||hour<6?34:180;
    return Math.max(0,Math.min(total,cap,Math.max(1,Math.round(base*variation))));
  }
  function apply(profiles,timestamp,pinnedIndex){
    if(!profiles.length)return 0;
    const count=target(timestamp,profiles.length);
    const slot=Math.floor(timestamp/intervalMs);
    const ranked=profiles.map((_,index)=>({index,rank:hash(Math.imul(index+1,2654435761)^hash(slot))})).sort((a,b)=>a.rank-b.rank);
    if(Number.isInteger(pinnedIndex)&&pinnedIndex>=0&&pinnedIndex<profiles.length){
      const position=ranked.findIndex(item=>item.index===pinnedIndex);
      ranked.unshift(ranked.splice(position,1)[0]);
    }
    profiles.forEach(profile=>{profile[4]=0});
    ranked.slice(0,count).forEach(item=>{profiles[item.index][4]=1});
    const trainingCount=Math.min(profiles.length-count-1,Math.max(1,Math.round(count*0.15)));
    ranked.slice(count,count+Math.max(0,trainingCount)).forEach(item=>{profiles[item.index][4]=2});
    return count;
  }
  const api={target,apply,intervalMs};
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.ChatSitePresence=api;
})(typeof globalThis!=='undefined'?globalThis:this);