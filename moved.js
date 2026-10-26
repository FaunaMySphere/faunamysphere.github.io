// v7.4: one-time toast after the save moved from the old address
(function(){let r=null;try{r=sessionStorage.getItem('fs_moved');sessionStorage.removeItem('fs_moved')}catch(e){}if(!r||r==='none')return;
const es=()=>window.LANG==='es'||(window.I18N&&I18N.lang==='es'),m={ok:['Save moved to the new address 🎉','Partida movida a la nueva dirección 🎉'],kept:['You already had a better save here, so it was kept.','Ya tenías una partida mejor aquí, así que se conservó.'],err:['Could not move the save. Your old save is safe at the old address.','No se pudo mover la partida. Tu partida antigua sigue segura en la dirección anterior.']}[r];
if(m)setTimeout(()=>{try{toast(es()?m[1]:m[0])}catch(e){}},4000)})();
