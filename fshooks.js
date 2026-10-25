// Hooks for the parallel multiplayer/i18n worker. Owned by the game, not net.js/i18n.js.
(function(){
  var chatCbs=[],remote=[];
  window.FS={
    getPlayerState:function(){try{var f=fa();return{name:(S.player&&S.player.name)||'',zone:S.zone,fauna:f?{name:f.name,genes:f.genes,lv:f.lv,x:f.x,y:f.y}:null};}catch(e){return null}},
    applyRemotePlayers:function(list){remote=Array.isArray(list)?list:[];window.FS.remote=remote;try{window.dispatchEvent(new CustomEvent('fs:remote',{detail:remote}))}catch(e){}},
    onChat:function(cb){if(typeof cb==='function')chatCbs.push(cb)},
    sendChat:function(text){text=String(text||'').slice(0,140);if(!text)return;chatCbs.forEach(function(c){try{c(text)}catch(e){}});try{var f=fa();if(f&&window.say)say(f,text)}catch(e){}},
    t:function(k){return (window.T?window.T(k):k)},
    remote:remote
  };
})();
