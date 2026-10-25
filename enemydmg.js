// Enemy damage tuning: every vile/Gassy/viley hit on the player's fauna goes through enemyDmg().
window.ENEMY_DMG_MULT=1.25;
window.enemyDmg=function(n){const d=n*(window.ENEMY_DMG_MULT||1);window.__lastHurt=d;return d};
