// Lightweight realtime listeners. Existing polling remains a reconnect fallback.
(function(){
  const root='https://chatsite-c1b34-default-rtdb.europe-west1.firebasedatabase.app/supportChats';
  const streams=new Map();
  window.csLive={
    watch(key,path,onChange){
      this.stop(key);
      if(!window.EventSource)return;
      const source=new EventSource(root+'/'+path+'.json');
      const refresh=()=>onChange();
      source.addEventListener('put',refresh);source.addEventListener('patch',refresh);
      source.addEventListener('cancel',()=>this.stop(key));
      source.addEventListener('auth_revoked',()=>this.stop(key));
      streams.set(key,source);
    },
    stop(key){const source=streams.get(key);if(source)source.close();streams.delete(key);}
  };
})();
